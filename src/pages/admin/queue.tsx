import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const queueRoutes = new Hono<{ Bindings: Bindings }>()

queueRoutes.get('/admin/queue', (c) => {
  return c.render(
    <Layout active="queue">
      <div class="fade-in">
        {/* Header */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Review <span class="text-ekantik-gold italic">Queue</span></h1>
            <p class="text-gray-400 text-sm mt-1">Manage drafts, review, schedule, and publish intelligence entries</p>
          </div>
          <a href="/admin/upload" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm font-semibold hover:border-ekantik-gold/50 hover:text-ekantik-gold transition-colors flex items-center gap-2">
            <i class="fas fa-cloud-upload-alt"></i> Upload Content
          </a>
        </div>

        {/* Stats Bar */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" id="stats-bar">
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 uppercase tracking-wider">Drafts</span>
              <span class="w-2 h-2 rounded-full bg-gray-400"></span>
            </div>
            <div class="text-2xl font-bold text-white mt-1" id="stat-draft">--</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 uppercase tracking-wider">Needs Review</span>
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
            <div class="text-2xl font-bold text-white mt-1" id="stat-needs_review">--</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 uppercase tracking-wider">Scheduled</span>
              <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>
            <div class="text-2xl font-bold text-white mt-1" id="stat-scheduled">--</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 uppercase tracking-wider">Published</span>
              <span class="w-2 h-2 rounded-full bg-green-400"></span>
            </div>
            <div class="text-2xl font-bold text-white mt-1" id="stat-published">--</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-4 mb-6">
          <div class="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div class="flex items-center gap-1 bg-ekantik-bg rounded-lg p-1" id="status-tabs">
              <button data-status="" class="queue-tab active px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">All</button>
              <button data-status="draft" class="queue-tab px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Draft</button>
              <button data-status="needs_review" class="queue-tab px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Needs Review</button>
              <button data-status="scheduled" class="queue-tab px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Scheduled</button>
              <button data-status="published" class="queue-tab px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Published</button>
              <button data-status="archived" class="queue-tab px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Archived</button>
            </div>

            <div class="w-px h-6 bg-ekantik-border hidden md:block"></div>

            {/* Category Filter */}
            <select id="filter-category" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
              <option value="">All Categories</option>
              <option value="daily_intelligence">Daily Intelligence</option>
              <option value="value_opportunity">Value Opportunity</option>
              <option value="multibagger_report">Multibagger Report</option>
              <option value="aomg_trend">AOMG Trend</option>
              <option value="market_commentary">Market Commentary</option>
              <option value="watchlist_update">Watchlist Update</option>
              <option value="avoid_list">Avoid List</option>
            </select>

            {/* Search */}
            <div class="relative flex-1 min-w-[200px]">
              <input id="filter-search" type="text" placeholder="Search by title or ticker..." class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-ekantik-gold/50 pr-8" />
              <i class="fas fa-search absolute right-2.5 top-2 text-gray-500 text-[10px]"></i>
            </div>

            {/* Bulk Actions */}
            <div class="flex items-center gap-2" id="bulk-actions" style="display:none;">
              <span class="text-xs text-gray-400" id="bulk-count">0 selected</span>
              <button onclick="bulkPublish()" class="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-600/30 transition-colors">
                <i class="fas fa-paper-plane mr-1"></i>Publish All
              </button>
              <button onclick="bulkArchive()" class="px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-600/30 transition-colors">
                <i class="fas fa-archive mr-1"></i>Archive All
              </button>
              <button onclick="clearSelection()" class="px-2 py-1.5 text-gray-400 hover:text-white text-xs">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div class="grid grid-cols-[32px_1fr_140px_100px_80px_80px_80px_100px_140px] gap-2 px-4 py-3 border-b border-ekantik-border text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
            <div class="flex items-center">
              <input type="checkbox" id="select-all" class="rounded border-ekantik-border bg-ekantik-bg" onchange="toggleSelectAll(this)" />
            </div>
            <div>Title</div>
            <div>Category</div>
            <div>Status</div>
            <div>Tickers</div>
            <div>Impact</div>
            <div>Conviction</div>
            <div>Created</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div id="queue-table-body">
            <div class="px-4 py-12 text-center text-gray-500 text-sm">
              <i class="fas fa-spinner fa-spin mr-2"></i>Loading queue...
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div id="empty-state" class="hidden mt-0">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-12 text-center">
            <i class="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
            <h3 class="text-lg text-gray-400 font-semibold mb-2">No entries found</h3>
            <p class="text-gray-500 text-sm mb-4">Try adjusting your filters or upload new content.</p>
            <a href="/admin/upload" class="inline-flex items-center gap-2 px-4 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors">
              <i class="fas fa-plus"></i> Upload Content
            </a>
          </div>
        </div>

        {/* Edit Modal */}
        <div id="edit-modal" class="fixed inset-0 z-50 flex items-center justify-center" style="display:none;">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeEditModal()"></div>
          <div class="relative bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl mx-4">
            <div class="flex items-center justify-between p-5 border-b border-ekantik-border sticky top-0 bg-ekantik-card rounded-t-2xl z-10">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-edit mr-2 text-ekantik-gold"></i>Edit Entry</h3>
              <button onclick="closeEditModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-5 space-y-4">
              <input type="hidden" id="edit-id" />
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Title</label>
                <input id="edit-title" type="text" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Category</label>
                  <select id="edit-category" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                    <option value="daily_intelligence">Daily Intelligence</option>
                    <option value="value_opportunity">Value Opportunity</option>
                    <option value="multibagger_report">Multibagger Report</option>
                    <option value="aomg_trend">AOMG Trend</option>
                    <option value="market_commentary">Market Commentary</option>
                    <option value="watchlist_update">Watchlist Update</option>
                    <option value="avoid_list">Avoid List</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Ticker(s)</label>
                  <input id="edit-tickers" type="text" placeholder="AAPL, MSFT" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Impact Score</label>
                  <select id="edit-impact" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Conviction</label>
                  <select id="edit-conviction" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Body (Markdown)</label>
                <textarea id="edit-body" rows={10} class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 font-mono focus:outline-none focus:border-ekantik-gold/50 resize-y"></textarea>
              </div>
            </div>
            <div class="p-5 border-t border-ekantik-border flex items-center justify-between sticky bottom-0 bg-ekantik-card rounded-b-2xl">
              <span id="edit-status-msg" class="text-xs text-gray-500"></span>
              <div class="flex gap-3">
                <button onclick="closeEditModal()" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm font-semibold hover:border-ekantik-gold/50 transition-colors">Cancel</button>
                <button onclick="saveEdit()" class="px-5 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors">
                  <i class="fas fa-save mr-1"></i>Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Modal */}
        <div id="schedule-modal" class="fixed inset-0 z-50 flex items-center justify-center" style="display:none;">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeScheduleModal()"></div>
          <div class="relative bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-md shadow-2xl mx-4">
            <div class="flex items-center justify-between p-5 border-b border-ekantik-border">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-calendar-alt mr-2 text-ekantik-gold"></i>Schedule Publish</h3>
              <button onclick="closeScheduleModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-5 space-y-4">
              <input type="hidden" id="schedule-id" />
              <p class="text-sm text-gray-400" id="schedule-entry-title"></p>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Publish Date &amp; Time</label>
                <input id="schedule-datetime" type="datetime-local" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
              </div>
            </div>
            <div class="p-5 border-t border-ekantik-border flex justify-end gap-3">
              <button onclick="closeScheduleModal()" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm font-semibold hover:border-ekantik-gold/50 transition-colors">Cancel</button>
              <button onclick="confirmSchedule()" class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors">
                <i class="fas fa-calendar-check mr-1"></i>Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Toast Container */}
        <div id="toast-container" class="fixed bottom-6 right-6 z-[60] flex flex-col gap-2"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: queueStyles }} />
      <script dangerouslySetInnerHTML={{ __html: queueScript }} />
    </Layout>,
    { title: 'Review Queue — Ekantik Capital' }
  )
})

const queueStyles = `
  .queue-tab {
    color: #6b7280;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .queue-tab:hover {
    color: #d4a843;
  }
  .queue-tab.active {
    background: #1f2937;
    color: #d4a843;
  }
  .queue-row {
    transition: background-color 0.15s ease;
  }
  .queue-row:hover {
    background-color: rgba(31, 41, 55, 0.5);
  }
  .preview-panel {
    animation: slideDown 0.2s ease-out;
  }
  @keyframes slideDown {
    from { opacity: 0; max-height: 0; }
    to { opacity: 1; max-height: 600px; }
  }
  .toast {
    animation: toastIn 0.3s ease-out, toastOut 0.3s ease-in 3.7s forwards;
    pointer-events: auto;
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
`

const queueScript = `
// ---- State ----
let _entries = [];
let _selectedIds = new Set();
let _currentStatus = '';
let _currentCategory = '';
let _currentSearch = '';
let _expandedPreview = null;
let _searchDebounce = null;

// ---- Category colors ----
const CATEGORY_COLORS = {
  value_opportunity: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  multibagger_report: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  aomg_trend: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  market_commentary: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  watchlist_update: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  avoid_list: { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
  daily_intelligence: { bg: 'rgba(212,168,67,0.15)', text: '#d4a843', border: 'rgba(212,168,67,0.3)' },
};

const CATEGORY_LABELS = {
  value_opportunity: 'Value Opportunity',
  multibagger_report: 'Multibagger',
  aomg_trend: 'AOMG Trend',
  market_commentary: 'Market Commentary',
  watchlist_update: 'Watchlist Update',
  avoid_list: 'Avoid List',
  daily_intelligence: 'Daily Intelligence',
};

const STATUS_COLORS = {
  draft: { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
  needs_review: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  scheduled: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  published: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  archived: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

const STATUS_LABELS = {
  draft: 'Draft',
  needs_review: 'Needs Review',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

// ---- Toast ----
function showToast(message, type) {
  const container = document.getElementById('toast-container');
  const colors = {
    success: 'border-green-500/40 bg-green-900/40 text-green-300',
    error: 'border-red-500/40 bg-red-900/40 text-red-300',
    info: 'border-blue-500/40 bg-blue-900/40 text-blue-300',
  };
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const el = document.createElement('div');
  el.className = 'toast border rounded-lg px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ' + (colors[type] || colors.info);
  el.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + ' mr-2"></i>' + message;
  container.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 4000);
}

// ---- Badge helpers ----
function categoryBadge(cat) {
  const c = CATEGORY_COLORS[cat] || CATEGORY_COLORS.daily_intelligence;
  const label = CATEGORY_LABELS[cat] || cat;
  return '<span style="background:' + c.bg + ';color:' + c.text + ';border:1px solid ' + c.border + ';" class="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap">' + escapeHtml(label) + '</span>';
}

function statusBadge(status) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const label = STATUS_LABELS[status] || status;
  return '<span style="background:' + c.bg + ';color:' + c.text + ';border:1px solid ' + c.border + ';" class="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap">' + escapeHtml(label) + '</span>';
}

function impactBadge(score) {
  if (!score) return '<span class="text-gray-600 text-[10px]">--</span>';
  const colors = { HIGH: '#f87171', MEDIUM: '#fbbf24', LOW: '#9ca3af' };
  const color = colors[score] || '#9ca3af';
  return '<span style="color:' + color + ';" class="text-[10px] font-bold">' + escapeHtml(score) + '</span>';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  } catch { return '--'; }
}

function formatTickers(tickers) {
  if (!tickers) return '';
  let arr = tickers;
  if (typeof tickers === 'string') {
    try { arr = JSON.parse(tickers); } catch { arr = tickers.split(',').map(t => t.trim()); }
  }
  if (!Array.isArray(arr)) return '';
  return arr.slice(0, 3).map(t => '<span class="text-ekantik-gold text-[10px] font-mono font-bold">' + escapeHtml(t) + '</span>').join(' ') + (arr.length > 3 ? ' <span class="text-gray-500 text-[10px]">+' + (arr.length - 3) + '</span>' : '');
}

// ---- Data fetching ----
async function fetchEntries() {
  const params = new URLSearchParams();
  if (_currentStatus) params.set('status', _currentStatus);
  if (_currentCategory) params.set('category', _currentCategory);
  if (_currentSearch) params.set('search', _currentSearch);

  try {
    const res = await fetch('/api/admin/content?' + params.toString());
    const data = await res.json();
    _entries = data.entries || data.results || data || [];
    if (!Array.isArray(_entries)) _entries = [];
    renderTable();
    updateStats();
  } catch (e) {
    console.error('Failed to fetch entries:', e);
    showToast('Failed to load entries: ' + e.message, 'error');
    document.getElementById('queue-table-body').innerHTML = '<div class="px-4 py-8 text-center text-red-400 text-sm"><i class="fas fa-exclamation-triangle mr-2"></i>Failed to load entries</div>';
  }
}

async function fetchStats() {
  try {
    const statuses = ['draft', 'needs_review', 'scheduled', 'published'];
    const promises = statuses.map(s =>
      fetch('/api/admin/content?status=' + s).then(r => r.json()).then(d => {
        const arr = d.entries || d.results || d || [];
        return { status: s, count: Array.isArray(arr) ? arr.length : 0 };
      }).catch(() => ({ status: s, count: 0 }))
    );
    const results = await Promise.all(promises);
    results.forEach(r => {
      const el = document.getElementById('stat-' + r.status);
      if (el) el.textContent = r.count;
    });
  } catch(e) {
    console.error('Stats fetch failed:', e);
  }
}

function updateStats() {
  // Update from local data if we have an "all" view
  if (!_currentStatus && !_currentCategory && !_currentSearch) {
    const counts = { draft: 0, needs_review: 0, scheduled: 0, published: 0 };
    _entries.forEach(e => { if (counts[e.status] !== undefined) counts[e.status]++; });
    Object.entries(counts).forEach(([k, v]) => {
      const el = document.getElementById('stat-' + k);
      if (el) el.textContent = v;
    });
  }
}

// ---- Render table ----
function renderTable() {
  const tbody = document.getElementById('queue-table-body');
  const emptyState = document.getElementById('empty-state');

  if (!_entries.length) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  let html = '';
  _entries.forEach(entry => {
    const id = entry.id;
    const checked = _selectedIds.has(id) ? 'checked' : '';
    const isExpanded = _expandedPreview === id;

    html += '<div class="queue-row border-b border-ekantik-border last:border-b-0">';
    html += '<div class="grid grid-cols-[32px_1fr_140px_100px_80px_80px_80px_100px_140px] gap-2 px-4 py-3 items-center">';

    // Checkbox
    html += '<div><input type="checkbox" data-id="' + id + '" ' + checked + ' onchange="toggleSelect(\\'' + id + '\\')" class="rounded border-ekantik-border bg-ekantik-bg" /></div>';

    // Title
    html += '<div class="truncate"><span class="text-sm text-white font-medium">' + escapeHtml(entry.title || 'Untitled') + '</span></div>';

    // Category
    html += '<div>' + categoryBadge(entry.category) + '</div>';

    // Status
    html += '<div>' + statusBadge(entry.status) + '</div>';

    // Tickers
    html += '<div>' + formatTickers(entry.ticker_symbols) + '</div>';

    // Impact
    html += '<div>' + impactBadge(entry.impact_score) + '</div>';

    // Conviction
    html += '<div>' + impactBadge(entry.conviction_level) + '</div>';

    // Created
    html += '<div class="text-[10px] text-gray-500">' + formatDate(entry.created_at) + '</div>';

    // Actions
    html += '<div class="flex items-center gap-1">';
    html += '<button onclick="togglePreview(\\'' + id + '\\')" class="p-1.5 rounded text-gray-400 hover:text-ekantik-gold hover:bg-ekantik-gold/10 transition-colors" title="Preview"><i class="fas fa-eye text-[10px]"></i></button>';
    html += '<button onclick="openEditModal(\\'' + id + '\\')" class="p-1.5 rounded text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title="Edit"><i class="fas fa-edit text-[10px]"></i></button>';

    if (entry.status !== 'published') {
      html += '<button onclick="publishEntry(\\'' + id + '\\')" class="p-1.5 rounded text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-colors" title="Publish Now"><i class="fas fa-paper-plane text-[10px]"></i></button>';
    }
    if (entry.status !== 'scheduled' && entry.status !== 'published') {
      html += '<button onclick="openScheduleModal(\\'' + id + '\\')" class="p-1.5 rounded text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title="Schedule"><i class="fas fa-calendar-alt text-[10px]"></i></button>';
    }
    if (entry.status !== 'archived') {
      html += '<button onclick="archiveEntry(\\'' + id + '\\')" class="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Archive"><i class="fas fa-trash text-[10px]"></i></button>';
    }
    html += '</div>';

    html += '</div>'; // end grid

    // Preview panel
    if (isExpanded) {
      html += '<div class="preview-panel px-4 pb-4">';
      html += '<div class="bg-ekantik-bg border border-ekantik-border rounded-xl p-5">';
      html += '<div class="flex items-center justify-between mb-3">';
      html += '<h4 class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Content Preview</h4>';
      html += '<div class="flex items-center gap-3 text-[10px] text-gray-500">';
      if (entry.scheduled_at) html += '<span><i class="fas fa-calendar mr-1"></i>Scheduled: ' + formatDate(entry.scheduled_at) + '</span>';
      if (entry.framework_source) html += '<span><i class="fas fa-flask mr-1"></i>' + escapeHtml(entry.framework_source) + '</span>';
      html += '</div></div>';
      html += '<div class="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">';
      html += renderMarkdownBasic(entry.body_markdown || entry.body_html || '<em class="text-gray-500">No content body available</em>');
      html += '</div></div></div>';
    }

    html += '</div>'; // end queue-row
  });

  tbody.innerHTML = html;
}

function renderMarkdownBasic(md) {
  if (!md) return '';
  // Very basic markdown-to-HTML for preview (no library dependency)
  let html = escapeHtml(md);
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-white font-semibold text-sm mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-white font-semibold text-base mt-4 mb-1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-white font-bold text-lg mt-4 mb-2">$1</h1>');
  // Bold / Italic
  html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong class="text-white">$1</strong>');
  html = html.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
  // Code
  html = html.replace(/\`([^\`]+)\`/g, '<code class="bg-ekantik-border/50 px-1 py-0.5 rounded text-xs text-ekantik-gold">$1</code>');
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-300 text-sm">$1</li>');
  // Line breaks
  html = html.replace(/\\n/g, '<br/>');
  return html;
}

// ---- Selection ----
function toggleSelect(id) {
  if (_selectedIds.has(id)) _selectedIds.delete(id);
  else _selectedIds.add(id);
  updateBulkUI();
}

function toggleSelectAll(checkbox) {
  if (checkbox.checked) {
    _entries.forEach(e => _selectedIds.add(e.id));
  } else {
    _selectedIds.clear();
  }
  renderTable();
  updateBulkUI();
}

function clearSelection() {
  _selectedIds.clear();
  document.getElementById('select-all').checked = false;
  renderTable();
  updateBulkUI();
}

function updateBulkUI() {
  const bulkActions = document.getElementById('bulk-actions');
  const bulkCount = document.getElementById('bulk-count');
  if (_selectedIds.size > 0) {
    bulkActions.style.display = 'flex';
    bulkCount.textContent = _selectedIds.size + ' selected';
  } else {
    bulkActions.style.display = 'none';
  }
}

// ---- Actions ----
async function publishEntry(id) {
  try {
    const res = await fetch('/api/admin/content/' + id + '/publish', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast('Entry published successfully', 'success');
      fetchEntries();
      fetchStats();
    } else {
      showToast('Publish failed: ' + (data.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    showToast('Error publishing: ' + e.message, 'error');
  }
}

async function archiveEntry(id) {
  if (!confirm('Archive this entry? It can be restored later.')) return;
  try {
    const res = await fetch('/api/admin/content/' + id, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Entry archived', 'success');
      fetchEntries();
      fetchStats();
    } else {
      showToast('Archive failed: ' + (data.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    showToast('Error archiving: ' + e.message, 'error');
  }
}

async function bulkPublish() {
  if (!_selectedIds.size) return;
  if (!confirm('Publish ' + _selectedIds.size + ' entries?')) return;
  let success = 0, fail = 0;
  for (const id of _selectedIds) {
    try {
      const res = await fetch('/api/admin/content/' + id + '/publish', { method: 'POST' });
      const data = await res.json();
      if (data.success) success++; else fail++;
    } catch { fail++; }
  }
  showToast('Published ' + success + ' entries' + (fail ? ', ' + fail + ' failed' : ''), fail ? 'error' : 'success');
  clearSelection();
  fetchEntries();
  fetchStats();
}

async function bulkArchive() {
  if (!_selectedIds.size) return;
  if (!confirm('Archive ' + _selectedIds.size + ' entries?')) return;
  let success = 0, fail = 0;
  for (const id of _selectedIds) {
    try {
      const res = await fetch('/api/admin/content/' + id, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) success++; else fail++;
    } catch { fail++; }
  }
  showToast('Archived ' + success + ' entries' + (fail ? ', ' + fail + ' failed' : ''), fail ? 'error' : 'success');
  clearSelection();
  fetchEntries();
  fetchStats();
}

// ---- Preview ----
function togglePreview(id) {
  _expandedPreview = _expandedPreview === id ? null : id;
  renderTable();
}

// ---- Edit Modal ----
function openEditModal(id) {
  const entry = _entries.find(e => e.id === id);
  if (!entry) return;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-title').value = entry.title || '';
  document.getElementById('edit-category').value = entry.category || 'daily_intelligence';
  document.getElementById('edit-impact').value = entry.impact_score || 'MEDIUM';
  document.getElementById('edit-conviction').value = entry.conviction_level || 'MEDIUM';
  document.getElementById('edit-body').value = entry.body_markdown || '';

  let tickers = entry.ticker_symbols || '';
  if (typeof tickers === 'string') {
    try { tickers = JSON.parse(tickers); } catch {}
  }
  if (Array.isArray(tickers)) tickers = tickers.join(', ');
  document.getElementById('edit-tickers').value = tickers;

  document.getElementById('edit-status-msg').textContent = '';
  document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function saveEdit() {
  const id = document.getElementById('edit-id').value;
  const payload = {
    title: document.getElementById('edit-title').value,
    category: document.getElementById('edit-category').value,
    impact_score: document.getElementById('edit-impact').value,
    conviction_level: document.getElementById('edit-conviction').value,
    body_markdown: document.getElementById('edit-body').value,
    ticker_symbols: document.getElementById('edit-tickers').value.split(',').map(t => t.trim().toUpperCase()).filter(Boolean),
  };

  try {
    document.getElementById('edit-status-msg').innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Saving...';
    const res = await fetch('/api/admin/content/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Entry updated successfully', 'success');
      closeEditModal();
      fetchEntries();
    } else {
      document.getElementById('edit-status-msg').innerHTML = '<span class="text-red-400">' + (data.error || 'Save failed') + '</span>';
    }
  } catch(e) {
    document.getElementById('edit-status-msg').innerHTML = '<span class="text-red-400">Error: ' + e.message + '</span>';
  }
}

// ---- Schedule Modal ----
function openScheduleModal(id) {
  const entry = _entries.find(e => e.id === id);
  if (!entry) return;
  document.getElementById('schedule-id').value = id;
  document.getElementById('schedule-entry-title').textContent = 'Scheduling: "' + (entry.title || 'Untitled') + '"';

  // Default to tomorrow 9am
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const iso = tomorrow.toISOString().slice(0, 16);
  document.getElementById('schedule-datetime').value = iso;

  document.getElementById('schedule-modal').style.display = 'flex';
}

function closeScheduleModal() {
  document.getElementById('schedule-modal').style.display = 'none';
}

async function confirmSchedule() {
  const id = document.getElementById('schedule-id').value;
  const datetime = document.getElementById('schedule-datetime').value;
  if (!datetime) { showToast('Please select a date and time', 'error'); return; }

  try {
    const res = await fetch('/api/admin/content/' + id + '/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at: new Date(datetime).toISOString() }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Entry scheduled for ' + new Date(datetime).toLocaleString(), 'success');
      closeScheduleModal();
      fetchEntries();
      fetchStats();
    } else {
      showToast('Schedule failed: ' + (data.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    showToast('Error scheduling: ' + e.message, 'error');
  }
}

// ---- Filter handlers ----
document.querySelectorAll('.queue-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.queue-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    _currentStatus = tab.getAttribute('data-status') || '';
    _expandedPreview = null;
    fetchEntries();
  });
});

document.getElementById('filter-category').addEventListener('change', (e) => {
  _currentCategory = e.target.value;
  _expandedPreview = null;
  fetchEntries();
});

document.getElementById('filter-search').addEventListener('input', (e) => {
  clearTimeout(_searchDebounce);
  _searchDebounce = setTimeout(() => {
    _currentSearch = e.target.value.trim();
    _expandedPreview = null;
    fetchEntries();
  }, 300);
});

// ---- Prevent global price refresh from reloading page ----
window._onPricesRefreshed = function() {};

// ---- Init ----
fetchEntries();
fetchStats();
`

export { queueRoutes }
