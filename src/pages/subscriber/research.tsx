import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberResearchRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — Multibagger Research Reports
// ============================================================
subscriberResearchRoutes.get('/research', (c) => {
  const user = c.get('user' as any) || null
  return c.html(
    <SubscriberLayout active="research" user={user}>
      <div class="fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">Multibagger <span class="text-[#d4a843] italic">Research Reports</span></h1>
          <p class="text-gray-400 text-sm mt-1">Deep-dive reports on companies with 100%+ appreciation potential</p>
        </div>

        {/* Filters */}
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <select id="filter-conviction" class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#d4a843]/50">
            <option value="">All Conviction</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
            <input id="filter-ticker" type="text" placeholder="Search ticker..." class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#d4a843]/50 w-48" />
          </div>
          <button onclick="clearResearchFilters()" class="text-xs text-gray-500 hover:text-[#d4a843] transition-colors">
            <i class="fas fa-times mr-1"></i>Clear
          </button>
        </div>

        <div id="research-container" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="col-span-full text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading research reports...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: researchScript }} />
    </SubscriberLayout>
  )
})


const researchScript = `
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  var now = new Date();
  var diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + ' min ago';
  if (diff < 86400) return Math.floor(diff/3600) + ' hr ago';
  if (diff < 604800) return Math.floor(diff/86400) + ' day' + (Math.floor(diff/86400) > 1 ? 's' : '') + ' ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

var allReports = [];

function renderReports() {
  var container = document.getElementById('research-container');
  var conviction = document.getElementById('filter-conviction').value;
  var tickerSearch = document.getElementById('filter-ticker').value.toUpperCase().trim();

  var filtered = allReports.filter(function(r) {
    if (conviction && r.conviction_level !== conviction) return false;
    if (tickerSearch) {
      var tickers = [];
      try { tickers = typeof r.ticker_symbols === 'string' ? JSON.parse(r.ticker_symbols) : (r.ticker_symbols || []); } catch(e) {}
      var tickerStr = (r.ticker || '') + ' ' + tickers.join(' ');
      if (tickerStr.toUpperCase().indexOf(tickerSearch) === -1) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500"><i class="fas fa-microscope text-3xl mb-3"></i><p>' + (allReports.length === 0 ? 'No research reports available yet. Check back soon.' : 'No reports match the selected filters.') + '</p></div>';
    return;
  }

  container.innerHTML = filtered.map(function(r, idx) {
    var tickers = [];
    try { tickers = typeof r.ticker_symbols === 'string' ? JSON.parse(r.ticker_symbols) : (r.ticker_symbols || []); } catch(e) {}
    var ticker = r.ticker || (tickers.length > 0 ? tickers[0] : '');

    var convColors = {
      HIGH: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      LOW: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };

    var impactColors = {
      H: 'bg-red-500/20 text-red-400 border-red-500/30',
      M: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      L: 'bg-green-500/20 text-green-400 border-green-500/30'
    };

    var convBadge = r.conviction_level ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ' + (convColors[r.conviction_level] || convColors.LOW) + '">' + escapeHtml(r.conviction_level) + '</span>' : '';
    var impactBadge = r.impact_score ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ' + (impactColors[r.impact_score] || impactColors.L) + '">Impact: ' + escapeHtml(r.impact_score) + '</span>' : '';

    var summary = r.summary || r.key_takeaway || '';
    var title = r.title || r.report_title || ('Research Report #' + (idx + 1));
    var fullText = r.raw_markdown || r.full_analysis || r.full_text || '';

    return '<div class="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden hover:border-[#d4a843]/30 transition-all">' +
      '<div class="p-5">' +
        '<div class="flex items-start justify-between mb-3">' +
          '<div class="flex-1">' +
            '<h3 class="text-base font-bold text-white leading-snug">' + escapeHtml(title) + '</h3>' +
            '<div class="flex items-center gap-2 mt-2 flex-wrap">' +
              (ticker ? '<span class="px-2.5 py-1 bg-[#0a0f1e] border border-[#1f2937] rounded-lg text-xs font-mono font-semibold text-white">' + escapeHtml(ticker) + '</span>' : '') +
              tickers.filter(function(t) { return t !== ticker; }).map(function(t) {
                return '<span class="px-2.5 py-1 bg-[#0a0f1e] border border-[#1f2937] rounded-lg text-xs font-mono font-semibold text-white">' + escapeHtml(t) + '</span>';
              }).join('') +
              convBadge +
              impactBadge +
            '</div>' +
          '</div>' +
          (r.ai_composite_score != null ? '<div class="text-right ml-4"><div class="text-[10px] text-gray-400 uppercase tracking-wider">AI Score</div><div class="text-[#d4a843] font-bold text-xl">' + r.ai_composite_score + '</div></div>' : '') +
        '</div>' +
        (summary ? '<p class="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">' + escapeHtml(summary) + '</p>' : '') +
        '<div class="flex items-center justify-between">' +
          '<span class="text-xs text-gray-500">' + getTimeAgo(r.created_at || r.published_at) + '</span>' +
          (fullText ? '<button onclick="toggleResearchDetail(this)" class="text-xs text-[#d4a843] hover:text-[#d4a843]/80 font-semibold flex items-center gap-1 transition-colors"><i class="fas fa-chevron-down text-[10px] detail-icon"></i> Read Full Report</button>' : '') +
        '</div>' +
        (fullText ? '<div class="research-detail hidden mt-4 pt-4 border-t border-[#1f2937]"><div class="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap text-xs leading-relaxed" style="max-height:500px;overflow-y:auto;">' + escapeHtml(fullText) + '</div></div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleResearchDetail(btn) {
  var card = btn.closest('.bg-\\\\[\\\\#111827\\\\]') || btn.closest('[class*="bg-"]');
  // Walk up to find the card container
  var el = btn;
  while (el && !el.querySelector('.research-detail')) { el = el.parentElement; }
  if (!el) return;
  var detail = el.querySelector('.research-detail');
  var icon = btn.querySelector('.detail-icon');
  if (detail.classList.contains('hidden')) {
    detail.classList.remove('hidden');
    if (icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
    btn.innerHTML = '<i class="fas fa-chevron-up text-[10px] detail-icon"></i> Collapse';
  } else {
    detail.classList.add('hidden');
    if (icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
    btn.innerHTML = '<i class="fas fa-chevron-down text-[10px] detail-icon"></i> Read Full Report';
  }
}

function clearResearchFilters() {
  document.getElementById('filter-conviction').value = '';
  document.getElementById('filter-ticker').value = '';
  renderReports();
}

document.getElementById('filter-conviction').addEventListener('change', renderReports);
document.getElementById('filter-ticker').addEventListener('input', renderReports);

(async function() {
  var container = document.getElementById('research-container');
  try {
    var res = await fetch('/api/subscriber/research');
    var data = await res.json();
    allReports = data.reports || data.research || [];
    renderReports();
  } catch(e) {
    console.error('Research load failed', e);
    container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500"><i class="fas fa-exclamation-triangle text-2xl mb-3"></i><p>Failed to load research reports. Please try again later.</p></div>';
  }
})();
`


export { subscriberResearchRoutes }
