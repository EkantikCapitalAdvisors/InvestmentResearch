import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberWatchlistRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — Active Watchlist
// ============================================================
subscriberWatchlistRoutes.get('/watchlist', (c) => {
  const user = c.get('user' as any) || null
  return c.html(
    <SubscriberLayout active="watchlist" user={user}>
      <div class="fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">Active <span class="text-[#d4a843] italic">Watchlist</span></h1>
          <p class="text-gray-400 text-sm mt-1">High-conviction opportunities under active surveillance</p>
        </div>

        {/* Sort controls */}
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Sort by</span>
            <button onclick="sortWatchlist('conviction')" id="sort-conviction" class="px-3 py-1 rounded-lg text-xs font-semibold bg-[#d4a843]/20 text-[#d4a843] border border-[#d4a843]/30 transition-colors">Conviction</button>
            <button onclick="sortWatchlist('ticker')" id="sort-ticker" class="px-3 py-1 rounded-lg text-xs font-semibold bg-[#111827] text-gray-400 border border-[#1f2937] hover:border-[#d4a843]/30 hover:text-[#d4a843] transition-colors">Ticker</button>
            <button onclick="sortWatchlist('status')" id="sort-status" class="px-3 py-1 rounded-lg text-xs font-semibold bg-[#111827] text-gray-400 border border-[#1f2937] hover:border-[#d4a843]/30 hover:text-[#d4a843] transition-colors">Status</button>
          </div>
          <div class="text-xs text-gray-500" id="watchlist-count"></div>
        </div>

        {/* Desktop table (>=768px) */}
        <div class="hidden md:block" id="watchlist-table-container">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading watchlist...</p>
          </div>
        </div>

        {/* Mobile cards (<768px) */}
        <div class="md:hidden" id="watchlist-cards-container">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading watchlist...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: watchlistScript }} />
    </SubscriberLayout>
  )
})


const watchlistScript = `
var allEntries = [];
var currentSort = 'conviction';
var expandedRows = {};

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function calcCountdown(dateStr) {
  if (!dateStr) return null;
  var now = new Date();
  var target = new Date(dateStr);
  var diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function countdownLabel(dateStr) {
  var days = calcCountdown(dateStr);
  if (days === null) return '';
  if (days < 0) return '<span class="text-gray-500 text-xs">' + Math.abs(days) + 'd ago</span>';
  if (days === 0) return '<span class="text-[#d4a843] text-xs font-bold"><i class="fas fa-bolt mr-1"></i>Today</span>';
  if (days <= 7) return '<span class="text-amber-400 text-xs font-bold"><i class="fas fa-clock mr-1"></i>' + days + ' days away</span>';
  return '<span class="text-gray-400 text-xs">' + days + ' days away</span>';
}

function categoryPill(cat) {
  var colors = {
    value_opportunity: 'bg-red-500/15 text-red-400 border-red-500/30',
    aomg_play: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    multibagger_candidate: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    episodic_pivot: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    counter_trend: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  };
  var labels = {
    value_opportunity: 'Value',
    aomg_play: 'AOMG',
    multibagger_candidate: 'Multibagger',
    episodic_pivot: 'Episodic Pivot',
    counter_trend: 'Counter-Trend'
  };
  var c = colors[cat] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  var l = labels[cat] || (cat || '').replace(/_/g,' ');
  return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ' + c + '">' + escapeHtml(l) + '</span>';
}

function statusPill(status) {
  var colors = {
    monitoring: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    approaching_entry: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    closed_hit: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    closed_invalidated: 'bg-red-500/15 text-red-400 border-red-500/30'
  };
  var labels = {
    monitoring: 'Monitoring',
    approaching_entry: 'Approaching',
    active: 'Active',
    closed_hit: 'Closed (Hit)',
    closed_invalidated: 'Invalidated'
  };
  var c = colors[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  var l = labels[status] || (status || '').replace(/_/g,' ');
  return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ' + c + '">' + escapeHtml(l) + '</span>';
}

function convictionBadge(level) {
  var colors = {
    HIGH: 'text-emerald-400',
    MEDIUM: 'text-amber-400',
    LOW: 'text-gray-400'
  };
  var c = colors[level] || 'text-gray-400';
  return '<span class="font-bold text-sm ' + c + '">' + escapeHtml(level || '—') + '</span>';
}

function parseFramework(ef) {
  if (!ef) return {};
  if (typeof ef === 'string') {
    try { return JSON.parse(ef); } catch(e) { return {}; }
  }
  return ef;
}

function toggleRow(id) {
  expandedRows[id] = !expandedRows[id];
  var el = document.getElementById('detail-' + id);
  var icon = document.getElementById('icon-' + id);
  if (el) {
    if (expandedRows[id]) {
      el.classList.remove('hidden');
      if (icon) icon.classList.add('rotate-180');
    } else {
      el.classList.add('hidden');
      if (icon) icon.classList.remove('rotate-180');
    }
  }
}

function toggleCard(id) {
  expandedRows[id] = !expandedRows[id];
  var el = document.getElementById('card-detail-' + id);
  var icon = document.getElementById('card-icon-' + id);
  if (el) {
    if (expandedRows[id]) {
      el.classList.remove('hidden');
      if (icon) icon.classList.add('rotate-180');
    } else {
      el.classList.add('hidden');
      if (icon) icon.classList.remove('rotate-180');
    }
  }
}

function sortEntries(entries, by) {
  var convOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  var statusOrder = { active: 0, approaching_entry: 1, monitoring: 2, closed_hit: 3, closed_invalidated: 4 };
  return entries.slice().sort(function(a, b) {
    if (by === 'conviction') {
      var ca = convOrder[a.conviction_level] != null ? convOrder[a.conviction_level] : 99;
      var cb = convOrder[b.conviction_level] != null ? convOrder[b.conviction_level] : 99;
      return ca - cb;
    }
    if (by === 'ticker') {
      return (a.ticker_symbol || '').localeCompare(b.ticker_symbol || '');
    }
    if (by === 'status') {
      var sa = statusOrder[a.status] != null ? statusOrder[a.status] : 99;
      var sb = statusOrder[b.status] != null ? statusOrder[b.status] : 99;
      return sa - sb;
    }
    return 0;
  });
}

function sortWatchlist(by) {
  currentSort = by;
  ['conviction','ticker','status'].forEach(function(s) {
    var btn = document.getElementById('sort-' + s);
    if (btn) {
      if (s === by) {
        btn.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-[#d4a843]/20 text-[#d4a843] border border-[#d4a843]/30 transition-colors';
      } else {
        btn.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-[#111827] text-gray-400 border border-[#1f2937] hover:border-[#d4a843]/30 hover:text-[#d4a843] transition-colors';
      }
    }
  });
  renderAll(sortEntries(allEntries, by));
}

function renderFrameworkBlock(ef) {
  var fw = parseFramework(ef);
  var entry = fw.entry_price || fw.entry || fw.price;
  var stop = fw.stop_loss || fw.stop || fw.stop_price;
  var target = fw.target_price || fw.target;
  var rr = fw.risk_reward || fw.rr || fw.risk_reward_ratio;
  return '<div class="grid grid-cols-4 gap-3 text-xs">' +
    '<div><span class="text-gray-500 block mb-0.5">Entry</span><span class="text-white font-semibold">' + (entry ? '$' + Number(entry).toFixed(2) : '—') + '</span></div>' +
    '<div><span class="text-gray-500 block mb-0.5">Stop</span><span class="text-red-400 font-semibold">' + (stop ? '$' + Number(stop).toFixed(2) : '—') + '</span></div>' +
    '<div><span class="text-gray-500 block mb-0.5">Target</span><span class="text-emerald-400 font-semibold">' + (target ? '$' + Number(target).toFixed(2) : '—') + '</span></div>' +
    '<div><span class="text-gray-500 block mb-0.5">R:R</span><span class="text-white font-semibold">' + (rr ? Number(rr).toFixed(1) + ':1' : '—') + '</span></div>' +
  '</div>';
}

function renderDesktopTable(entries) {
  if (!entries || entries.length === 0) {
    return '<div class="bg-[#111827] border border-[#1f2937] rounded-xl p-12 text-center text-gray-500">' +
      '<i class="fas fa-binoculars text-3xl mb-3"></i>' +
      '<p>No watchlist entries yet. Check back soon.</p>' +
    '</div>';
  }
  var html = '<div class="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">' +
    '<table class="w-full text-sm">' +
    '<thead><tr class="border-b border-[#1f2937] text-[10px] text-gray-500 uppercase tracking-widest">' +
      '<th class="px-4 py-3 text-left">Ticker</th>' +
      '<th class="px-4 py-3 text-left">Category</th>' +
      '<th class="px-4 py-3 text-center">Conviction</th>' +
      '<th class="px-4 py-3 text-left">Key Catalyst</th>' +
      '<th class="px-4 py-3 text-center">Status</th>' +
      '<th class="px-4 py-3 text-center w-10"></th>' +
    '</tr></thead><tbody>';

  entries.forEach(function(e) {
    var id = e.id || e.ticker_symbol;
    var expanded = expandedRows[id] ? '' : 'hidden';
    var rotated = expandedRows[id] ? 'rotate-180' : '';
    var fw = parseFramework(e.entry_framework);

    html += '<tr class="border-b border-[#1f2937]/50 hover:bg-[#0a0f1e]/50 cursor-pointer transition-colors" onclick="toggleRow(\'' + escapeHtml(id) + '\')">' +
      '<td class="px-4 py-3">' +
        '<div class="font-mono font-bold text-white text-sm">' + escapeHtml(e.ticker_symbol) + '</div>' +
        '<div class="text-gray-500 text-xs mt-0.5">' + escapeHtml(e.company_name || '') + '</div>' +
      '</td>' +
      '<td class="px-4 py-3">' + categoryPill(e.watchlist_category) + '</td>' +
      '<td class="px-4 py-3 text-center">' + convictionBadge(e.conviction_level) + '</td>' +
      '<td class="px-4 py-3">' +
        '<div class="text-gray-300 text-xs leading-relaxed max-w-xs truncate">' + escapeHtml(e.key_catalyst || '') + '</div>' +
        '<div class="mt-0.5">' + countdownLabel(e.catalyst_date) + '</div>' +
      '</td>' +
      '<td class="px-4 py-3 text-center">' + statusPill(e.status) + '</td>' +
      '<td class="px-4 py-3 text-center">' +
        '<i id="icon-' + escapeHtml(id) + '" class="fas fa-chevron-down text-gray-500 text-xs transition-transform duration-200 ' + rotated + '"></i>' +
      '</td>' +
    '</tr>';

    // Expanded detail row
    html += '<tr id="detail-' + escapeHtml(id) + '" class="' + expanded + '">' +
      '<td colspan="6" class="px-4 py-0">' +
        '<div class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg p-4 mb-3 mt-1 space-y-4">' +
          // Thesis summary
          (e.thesis_summary ? '<div>' +
            '<h4 class="text-[10px] font-semibold text-[#d4a843] uppercase tracking-widest mb-1.5"><i class="fas fa-lightbulb mr-1"></i>Thesis Summary</h4>' +
            '<p class="text-gray-300 text-xs leading-relaxed">' + escapeHtml(e.thesis_summary) + '</p>' +
          '</div>' : '') +

          // Entry framework
          '<div>' +
            '<h4 class="text-[10px] font-semibold text-[#d4a843] uppercase tracking-widest mb-2"><i class="fas fa-crosshairs mr-1"></i>Entry Framework</h4>' +
            renderFrameworkBlock(e.entry_framework) +
          '</div>' +

          // Invalidation criteria
          (e.invalidation_criteria ? '<div>' +
            '<h4 class="text-[10px] font-semibold text-red-400 uppercase tracking-widest mb-1.5"><i class="fas fa-exclamation-triangle mr-1"></i>Invalidation Criteria</h4>' +
            '<p class="text-gray-400 text-xs leading-relaxed">' + escapeHtml(e.invalidation_criteria) + '</p>' +
          '</div>' : '') +
        '</div>' +
      '</td>' +
    '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

function renderMobileCards(entries) {
  if (!entries || entries.length === 0) {
    return '<div class="bg-[#111827] border border-[#1f2937] rounded-xl p-12 text-center text-gray-500">' +
      '<i class="fas fa-binoculars text-3xl mb-3"></i>' +
      '<p>No watchlist entries yet. Check back soon.</p>' +
    '</div>';
  }
  return entries.map(function(e) {
    var id = e.id || e.ticker_symbol;
    var expanded = expandedRows[id] ? '' : 'hidden';
    var rotated = expandedRows[id] ? 'rotate-180' : '';

    return '<div class="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden mb-3">' +
      '<div class="p-4 cursor-pointer" onclick="toggleCard(\'' + escapeHtml(id) + '\')">' +
        // Top row: ticker + conviction + expand
        '<div class="flex items-start justify-between mb-2">' +
          '<div class="flex items-center gap-3">' +
            '<div class="font-mono font-bold text-white text-lg">' + escapeHtml(e.ticker_symbol) + '</div>' +
            convictionBadge(e.conviction_level) +
          '</div>' +
          '<i id="card-icon-' + escapeHtml(id) + '" class="fas fa-chevron-down text-gray-500 text-xs transition-transform duration-200 mt-1.5 ' + rotated + '"></i>' +
        '</div>' +
        // Company name
        (e.company_name ? '<div class="text-gray-500 text-xs mb-2">' + escapeHtml(e.company_name) + '</div>' : '') +
        // Pills row
        '<div class="flex items-center flex-wrap gap-2 mb-2">' +
          categoryPill(e.watchlist_category) +
          statusPill(e.status) +
        '</div>' +
        // Catalyst + countdown
        (e.key_catalyst ? '<div class="text-gray-400 text-xs leading-relaxed mb-1">' + escapeHtml(e.key_catalyst) + '</div>' : '') +
        '<div>' + countdownLabel(e.catalyst_date) + '</div>' +
      '</div>' +

      // Expanded detail
      '<div id="card-detail-' + escapeHtml(id) + '" class="' + expanded + ' border-t border-[#1f2937]">' +
        '<div class="p-4 space-y-4">' +
          // Thesis
          (e.thesis_summary ? '<div>' +
            '<h4 class="text-[10px] font-semibold text-[#d4a843] uppercase tracking-widest mb-1.5"><i class="fas fa-lightbulb mr-1"></i>Thesis Summary</h4>' +
            '<p class="text-gray-300 text-xs leading-relaxed">' + escapeHtml(e.thesis_summary) + '</p>' +
          '</div>' : '') +

          // Entry framework
          '<div>' +
            '<h4 class="text-[10px] font-semibold text-[#d4a843] uppercase tracking-widest mb-2"><i class="fas fa-crosshairs mr-1"></i>Entry Framework</h4>' +
            renderFrameworkBlock(e.entry_framework) +
          '</div>' +

          // Invalidation
          (e.invalidation_criteria ? '<div>' +
            '<h4 class="text-[10px] font-semibold text-red-400 uppercase tracking-widest mb-1.5"><i class="fas fa-exclamation-triangle mr-1"></i>Invalidation Criteria</h4>' +
            '<p class="text-gray-400 text-xs leading-relaxed">' + escapeHtml(e.invalidation_criteria) + '</p>' +
          '</div>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderAll(entries) {
  var tableContainer = document.getElementById('watchlist-table-container');
  var cardsContainer = document.getElementById('watchlist-cards-container');
  if (tableContainer) tableContainer.innerHTML = renderDesktopTable(entries);
  if (cardsContainer) cardsContainer.innerHTML = renderMobileCards(entries);
}

(async function() {
  try {
    var res = await fetch('/api/subscriber/watchlist');
    var data = await res.json();
    allEntries = data.entries || [];

    var countEl = document.getElementById('watchlist-count');
    if (countEl) countEl.textContent = allEntries.length + ' ticker' + (allEntries.length !== 1 ? 's' : '') + ' under surveillance';

    var sorted = sortEntries(allEntries, currentSort);
    renderAll(sorted);
  } catch(e) {
    console.error('Watchlist load failed', e);
    var tableContainer = document.getElementById('watchlist-table-container');
    var cardsContainer = document.getElementById('watchlist-cards-container');
    var errHtml = '<div class="bg-[#111827] border border-[#1f2937] rounded-xl p-12 text-center text-gray-500">' +
      '<i class="fas fa-exclamation-triangle text-2xl mb-3"></i>' +
      '<p>Failed to load watchlist. Please try again later.</p>' +
    '</div>';
    if (tableContainer) tableContainer.innerHTML = errHtml;
    if (cardsContainer) cardsContainer.innerHTML = errHtml;
  }
})();
`


export { subscriberWatchlistRoutes }
