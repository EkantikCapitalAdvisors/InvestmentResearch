import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberFeedRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — Intelligence Feed (Home)
// ============================================================
subscriberFeedRoutes.get('/feed', (c) => {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return c.html(
    <SubscriberLayout active="feed">
      <div class="fade-in">

        {/* ── Header ─────────────────────────────────────────── */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">
              Intelligence <span class="text-ekantik-gold italic">Feed</span>
            </h1>
            <p class="text-gray-400 text-sm mt-1" id="feed-date">{todayStr}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-gray-500 uppercase tracking-widest" id="feed-last-updated"></span>
            <button
              onclick="loadStats(); loadFeed();"
              class="p-2 text-gray-400 hover:text-ekantik-gold transition-colors rounded-lg hover:bg-ekantik-gold/10"
              title="Refresh feed"
            >
              <i class="fas fa-sync-alt text-sm" id="refresh-icon"></i>
            </button>
          </div>
        </div>

        {/* ── Stats Bar ──────────────────────────────────────── */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" id="stats-bar">
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-[10px] uppercase tracking-wider">Today's Intelligence</span>
              <i class="fas fa-satellite-dish text-ekantik-gold/40 text-xs"></i>
            </div>
            <div class="text-2xl font-bold text-white mt-2" id="stat-today">&mdash;</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-[10px] uppercase tracking-wider">High Impact</span>
              <i class="fas fa-exclamation-triangle text-ekantik-red/40 text-xs"></i>
            </div>
            <div class="text-2xl font-bold text-ekantik-red mt-2" id="stat-high">&mdash;</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-[10px] uppercase tracking-wider">Watchlist Updates</span>
              <i class="fas fa-binoculars text-ekantik-amber/40 text-xs"></i>
            </div>
            <div class="text-2xl font-bold text-ekantik-amber mt-2" id="stat-watchlist">&mdash;</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-[10px] uppercase tracking-wider">Total Published</span>
              <i class="fas fa-archive text-ekantik-accent/40 text-xs"></i>
            </div>
            <div class="text-2xl font-bold text-ekantik-accent mt-2" id="stat-total">&mdash;</div>
          </div>
        </div>

        {/* ── Filters Row ────────────────────────────────────── */}
        <div class="flex flex-wrap items-center gap-3 mb-6 bg-ekantik-card border border-ekantik-border rounded-xl px-4 py-3">
          <div class="flex items-center gap-1.5 text-gray-400 text-xs">
            <i class="fas fa-filter text-[10px]"></i>
            <span class="hidden md:inline uppercase tracking-wider text-[10px] font-semibold">Filters</span>
          </div>

          {/* Category */}
          <select
            id="filter-category"
            class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-ekantik-gold/50"
          >
            <option value="">All Categories</option>
            <option value="value_opportunity">Value Opportunity</option>
            <option value="multibagger_report">Multibagger Report</option>
            <option value="aomg_trend">AOMG Trend</option>
            <option value="market_commentary">Market Commentary</option>
            <option value="watchlist_update">Watchlist Update</option>
            <option value="avoid_list">Avoid List</option>
            <option value="daily_intelligence">Daily Intelligence</option>
          </select>

          {/* Impact */}
          <select
            id="filter-impact"
            class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-ekantik-gold/50"
          >
            <option value="">All Impact</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          {/* Ticker */}
          <input
            id="filter-ticker"
            type="text"
            placeholder="Ticker (e.g. NVDA)"
            class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-ekantik-gold/50 w-32"
          />

          {/* Sort */}
          <select
            id="filter-sort"
            class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-ekantik-gold/50"
          >
            <option value="recent">Most Recent</option>
            <option value="impact">Highest Impact</option>
          </select>

          <button
            onclick="clearFilters()"
            class="ml-auto text-[10px] text-gray-500 hover:text-ekantik-gold transition-colors uppercase tracking-wider font-semibold"
          >
            Clear
          </button>
        </div>

        {/* ── Feed Container ─────────────────────────────────── */}
        <div id="feed-container" class="space-y-4">
          <div class="text-center py-16 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3 block"></i>
            <p class="text-sm">Loading intelligence feed...</p>
          </div>
        </div>

        {/* ── Load More ──────────────────────────────────────── */}
        <div id="load-more-wrap" class="hidden text-center py-6">
          <button
            id="load-more-btn"
            onclick="loadMore()"
            class="px-6 py-2.5 bg-ekantik-card border border-ekantik-border rounded-xl text-sm text-gray-300 font-semibold hover:border-ekantik-gold/50 hover:text-ekantik-gold transition-colors"
          >
            <i class="fas fa-arrow-down mr-2 text-xs"></i>Load More
          </button>
        </div>

      </div>

      <script dangerouslySetInnerHTML={{ __html: feedScript }} />
    </SubscriberLayout>
  )
})


// ────────────────────────────────────────────────────────────────
// Client-side JavaScript
// ────────────────────────────────────────────────────────────────
const feedScript = `
// ── Helpers ──────────────────────────────────────────────────
function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  var now = new Date();
  var diff = (now - d) / 1000;
  if (diff < 0) return 'just now';
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 7200) return '1 hour ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
  if (diff < 172800) return 'Yesterday';
  if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Basic Markdown-to-HTML renderer ─────────────────────────
function renderMarkdown(md) {
  if (!md) return '';
  var html = escapeHtml(md);

  // Code blocks (triple backtick — escaped since content is already HTML-escaped)
  html = html.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, function(m, code) {
    return '<pre class="bg-ekantik-bg border border-ekantik-border rounded-lg p-3 my-2 overflow-x-auto text-xs text-gray-300 font-mono">' + code.trim() + '</pre>';
  });

  // Inline code
  html = html.replace(/\`([^\`]+?)\`/g, '<code class="bg-ekantik-bg px-1.5 py-0.5 rounded text-xs text-ekantik-gold font-mono">$1</code>');

  // Headers (process longest first)
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-sm font-bold text-white mt-4 mb-1">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-ekantik-gold mt-4 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-white mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-ekantik-gold mt-4 mb-2">$1</h1>');

  // Bold
  html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong class="text-white font-semibold">$1</strong>');

  // Italic (single asterisk, but not inside bold)
  html = html.replace(/\\*(.+?)\\*/g, '<em class="text-gray-300 italic">$1</em>');

  // Blockquotes (after HTML escaping, > becomes &gt;)
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-ekantik-gold/40 pl-3 my-2 text-gray-400 italic text-xs">$1</blockquote>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300 text-xs list-disc">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\\/li>\\n?)+/g, function(m) {
    return '<ul class="my-2 space-y-0.5">' + m + '</ul>';
  });

  // Paragraphs (double newline)
  html = html.replace(/\\n\\n/g, '</p><p class="text-gray-300 text-xs leading-relaxed my-2">');
  html = '<p class="text-gray-300 text-xs leading-relaxed my-2">' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\\s*<\\/p>/g, '');

  return html;
}

// ── Category config ─────────────────────────────────────────
var CATEGORIES = {
  value_opportunity:   { label: 'VALUE OPPORTUNITY',   border: 'border-l-[#ef4444]',  badge: 'bg-red-500/20 text-red-400' },
  multibagger_report:  { label: 'MULTIBAGGER',         border: 'border-l-purple-500',  badge: 'bg-purple-500/20 text-purple-400' },
  aomg_trend:          { label: 'AOMG TREND',          border: 'border-l-[#10b981]',   badge: 'bg-emerald-500/20 text-emerald-400' },
  market_commentary:   { label: 'MARKET COMMENTARY',   border: 'border-l-[#3b82f6]',   badge: 'bg-blue-500/20 text-blue-400' },
  watchlist_update:    { label: 'WATCHLIST UPDATE',     border: 'border-l-[#f59e0b]',   badge: 'bg-amber-500/20 text-amber-400' },
  avoid_list:          { label: 'AVOID LIST',           border: 'border-l-gray-500',    badge: 'bg-gray-500/20 text-gray-400' },
  daily_intelligence:  { label: 'DAILY INTELLIGENCE',   border: 'border-l-[#d4a843]',   badge: 'bg-[#d4a843]/20 text-[#d4a843]' },
};

var IMPACT_BADGES = {
  HIGH:   'bg-red-500/20 text-red-400',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  LOW:    'bg-blue-500/20 text-blue-400',
};

var CONVICTION_STYLES = {
  HIGH:   'text-emerald-400',
  MEDIUM: 'text-amber-400',
  LOW:    'text-gray-400',
};

// ── State ───────────────────────────────────────────────────
var feedItems = [];
var feedOffset = 0;
var feedLimit = 20;
var feedHasMore = false;

// ── Load Stats ──────────────────────────────────────────────
async function loadStats() {
  try {
    var res = await fetch('/api/subscriber/stats');
    if (!res.ok) throw new Error('Stats API returned ' + res.status);
    var data = await res.json();
    document.getElementById('stat-today').textContent = data.todayCount != null ? data.todayCount : '0';
    document.getElementById('stat-high').textContent = data.highImpactCount != null ? data.highImpactCount : '0';
    document.getElementById('stat-watchlist').textContent = data.watchlistUpdates != null ? data.watchlistUpdates : '0';
    document.getElementById('stat-total').textContent = data.totalPublished != null ? data.totalPublished : '0';
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
}

// ── Build a single feed card ────────────────────────────────
function buildCard(item) {
  var cat = CATEGORIES[item.category] || { label: (item.category || 'UNKNOWN').toUpperCase(), border: 'border-l-gray-500', badge: 'bg-gray-500/20 text-gray-400' };
  var impactBadge = IMPACT_BADGES[item.impact] || '';
  var convictionStyle = CONVICTION_STYLES[item.conviction] || 'text-gray-500';
  var tickers = item.tickers || [];
  var time = relativeTime(item.published_at || item.created_at);
  var id = item.id || Math.random().toString(36).substr(2, 9);

  var tickerBadges = tickers.map(function(t) {
    return '<span class="px-2 py-0.5 bg-[#d4a843]/10 border border-[#d4a843]/30 rounded text-[10px] font-mono font-bold text-[#d4a843] uppercase">' + escapeHtml(t) + '</span>';
  }).join(' ');

  var impactHtml = '';
  if (item.impact) {
    impactHtml = '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ' + impactBadge + '">' + escapeHtml(item.impact) + '</span>';
  }

  var convictionHtml = '';
  if (item.conviction) {
    convictionHtml = '<span class="text-[10px] uppercase tracking-wider font-semibold ' + convictionStyle + '"><i class="fas fa-crosshairs mr-1 text-[8px]"></i>Conviction: ' + escapeHtml(item.conviction) + '</span>';
  }

  var summaryHtml = '';
  if (item.summary) {
    summaryHtml = '<p class="text-gray-400 text-xs leading-relaxed mt-2 line-clamp-3">' + escapeHtml(item.summary) + '</p>';
  }

  var frameworkHtml = '';
  if (item.framework_source) {
    frameworkHtml = '<span class="text-[10px] text-gray-600 italic"><i class="fas fa-microscope mr-1"></i>via ' + escapeHtml(item.framework_source) + '</span>';
  }

  return '<div class="feed-card bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden transition-all hover:border-[#d4a843]/40 hover:shadow-lg hover:shadow-[#d4a843]/5" data-id="' + id + '">' +
    '<div class="flex">' +
      '<div class="w-1 flex-shrink-0 ' + cat.border + '"></div>' +
      '<div class="flex-1 p-5">' +
        // Row 1: badges
        '<div class="flex flex-wrap items-center gap-2 mb-2">' +
          '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ' + cat.badge + '">' + cat.label + '</span>' +
          tickerBadges +
          impactHtml +
        '</div>' +
        // Row 2: Title
        '<h3 class="text-sm font-semibold text-white leading-snug cursor-pointer hover:text-[#d4a843] transition-colors" onclick="toggleExpand(\\'' + id + '\\')">' +
          escapeHtml(item.title || 'Untitled Intelligence') +
        '</h3>' +
        // Row 3: Meta
        '<div class="flex flex-wrap items-center gap-3 mt-2">' +
          convictionHtml +
          '<span class="text-[10px] text-gray-500"><i class="far fa-clock mr-1"></i>' + escapeHtml(time) + '</span>' +
          frameworkHtml +
        '</div>' +
        // Row 4: Summary
        summaryHtml +
        // Row 5: Expand button
        '<div class="mt-3">' +
          '<button class="expand-btn text-[10px] text-gray-500 hover:text-[#d4a843] transition-colors uppercase tracking-wider font-semibold flex items-center gap-1" onclick="toggleExpand(\\'' + id + '\\')">' +
            '<i class="fas fa-chevron-down text-[8px] expand-icon"></i> Read Full Analysis' +
          '</button>' +
        '</div>' +
        // Expandable body
        '<div class="expand-body hidden mt-4 pt-4 border-t border-[#1f2937]">' +
          '<div class="prose-content" style="max-height: 500px; overflow-y: auto;">' +
            renderMarkdown(item.body || item.raw_markdown || '') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// ── Load Feed ───────────────────────────────────────────────
async function loadFeed(append) {
  var container = document.getElementById('feed-container');
  var loadMoreWrap = document.getElementById('load-more-wrap');

  if (!append) {
    feedOffset = 0;
    feedItems = [];
    container.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fas fa-spinner fa-spin text-2xl mb-3 block"></i><p class="text-sm">Loading intelligence feed...</p></div>';
  }

  // Spin the refresh icon briefly
  var refreshIcon = document.getElementById('refresh-icon');
  if (refreshIcon && !append) refreshIcon.classList.add('fa-spin');

  try {
    var params = new URLSearchParams();
    var catFilter = document.getElementById('filter-category').value;
    var impFilter = document.getElementById('filter-impact').value;
    var tickerFilter = document.getElementById('filter-ticker').value.trim().toUpperCase();
    var sortFilter = document.getElementById('filter-sort').value;

    if (catFilter) params.set('category', catFilter);
    if (impFilter) params.set('impact', impFilter);
    if (tickerFilter) params.set('ticker', tickerFilter);
    if (sortFilter) params.set('sort', sortFilter);
    params.set('limit', feedLimit);
    params.set('offset', feedOffset);

    var qs = params.toString();
    var res = await fetch('/api/subscriber/feed' + (qs ? '?' + qs : ''));
    if (!res.ok) throw new Error('Feed API returned ' + res.status);
    var data = await res.json();

    var items = data.items || data.reports || data.feed || [];
    feedHasMore = items.length >= feedLimit;
    feedOffset += items.length;
    feedItems = feedItems.concat(items);

    if (!append) {
      if (items.length === 0) {
        var hasFilter = catFilter || impFilter || tickerFilter;
        container.innerHTML = '<div class="text-center py-16 text-gray-500">' +
          '<i class="fas fa-' + (hasFilter ? 'filter' : 'inbox') + ' text-3xl mb-3 block"></i>' +
          '<p class="text-sm">' + (hasFilter ? 'No results match your filters.' : 'No intelligence published yet. Check back soon.') + '</p>' +
          (hasFilter ? '<button onclick="clearFilters()" class="mt-3 px-4 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-xs text-gray-300 hover:border-[#d4a843]/50 transition-colors"><i class="fas fa-times mr-1"></i>Clear Filters</button>' : '') +
        '</div>';
        loadMoreWrap.classList.add('hidden');
        return;
      }
      container.innerHTML = items.map(buildCard).join('');
    } else {
      container.insertAdjacentHTML('beforeend', items.map(buildCard).join(''));
    }

    // Show or hide Load More
    if (feedHasMore) {
      loadMoreWrap.classList.remove('hidden');
    } else {
      loadMoreWrap.classList.add('hidden');
    }

    // Update last-updated timestamp
    var ts = document.getElementById('feed-last-updated');
    if (ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  } catch (e) {
    console.error('Feed load failed:', e);
    if (!append) {
      container.innerHTML = '<div class="text-center py-16 text-gray-500">' +
        '<i class="fas fa-exclamation-triangle text-2xl mb-3 block text-ekantik-red/60"></i>' +
        '<p class="text-sm">Failed to load intelligence feed.</p>' +
        '<button onclick="loadFeed()" class="mt-3 px-4 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-xs text-gray-300 hover:border-[#d4a843]/50 transition-colors"><i class="fas fa-redo mr-1"></i>Retry</button>' +
      '</div>';
    }
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('fa-spin');
  }
}

// ── Load More (pagination) ──────────────────────────────────
function loadMore() {
  var btn = document.getElementById('load-more-btn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2 text-xs"></i>Loading...';
  btn.disabled = true;
  loadFeed(true).then(function() {
    btn.innerHTML = '<i class="fas fa-arrow-down mr-2 text-xs"></i>Load More';
    btn.disabled = false;
  });
}

// ── Expand / Collapse ───────────────────────────────────────
function toggleExpand(id) {
  var card = document.querySelector('.feed-card[data-id="' + id + '"]');
  if (!card) return;
  var body = card.querySelector('.expand-body');
  var icon = card.querySelector('.expand-icon');
  var btn = card.querySelector('.expand-btn');
  if (!body) return;

  var isHidden = body.classList.contains('hidden');
  body.classList.toggle('hidden');

  if (icon) {
    icon.classList.toggle('fa-chevron-down', !isHidden);
    icon.classList.toggle('fa-chevron-up', isHidden);
  }
  if (btn) {
    var label = isHidden ? ' Collapse' : ' Read Full Analysis';
    btn.innerHTML = '<i class="fas fa-chevron-' + (isHidden ? 'up' : 'down') + ' text-[8px] expand-icon"></i>' + label;
  }
}

// ── Filter changes trigger re-fetch ─────────────────────────
document.getElementById('filter-category').addEventListener('change', function() { loadFeed(); });
document.getElementById('filter-impact').addEventListener('change', function() { loadFeed(); });
document.getElementById('filter-sort').addEventListener('change', function() { loadFeed(); });

// Debounce ticker input
var tickerTimeout = null;
document.getElementById('filter-ticker').addEventListener('input', function() {
  clearTimeout(tickerTimeout);
  tickerTimeout = setTimeout(function() { loadFeed(); }, 400);
});

// ── Clear Filters ───────────────────────────────────────────
function clearFilters() {
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-impact').value = '';
  document.getElementById('filter-ticker').value = '';
  document.getElementById('filter-sort').value = 'recent';
  loadFeed();
}

// ── Initial Load ────────────────────────────────────────────
(async function() {
  loadStats();
  loadFeed();
})();
`


export { subscriberFeedRoutes }
