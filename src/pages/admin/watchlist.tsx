import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const watchlistRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// WATCHLIST
// ============================================================
watchlistRoutes.get('/watchlist', (c) => {
  return c.render(
    <Layout active="watchlist">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Watchlist <span class="text-ekantik-gold italic">Intelligence</span></h1>
            <p class="text-gray-400 text-sm mt-1">Run Pivot, Bias, and Material agents — individually or in bulk</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="document.getElementById('bulk-import-modal').classList.remove('hidden')" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border rounded-lg text-sm font-semibold text-gray-300 hover:border-ekantik-accent/50 hover:text-ekantik-accent transition-colors flex items-center gap-2">
              <i class="fas fa-file-import"></i> Bulk Import
            </button>
            <button onclick="document.getElementById('add-ticker-modal').classList.remove('hidden')" class="px-4 py-2 bg-ekantik-accent/20 text-ekantik-accent border border-ekantik-accent/30 rounded-lg text-sm font-semibold hover:bg-ekantik-accent/30 transition-colors flex items-center gap-2">
              <i class="fas fa-plus"></i> Add Ticker
            </button>
          </div>
        </div>

        {/* Bulk Run Controls */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider font-semibold">
              <i class="fas fa-bolt text-ekantik-gold"></i> Bulk Run Across All Watchlist
            </div>
            <div class="flex items-center gap-2">
              <button onclick="bulkRunAgent('episodic_pivot')" id="bulk-run-pivot-btn" class="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-colors flex items-center gap-1.5">
                <i class="fas fa-bolt"></i> Run All Pivot
              </button>
              <button onclick="bulkRunAgent('bias_mode')" id="bulk-run-bias-btn" class="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-1.5">
                <i class="fas fa-brain"></i> Run All Bias
              </button>
              <button onclick="bulkRunAgent('material_events')" id="bulk-run-material-btn" class="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-1.5">
                <i class="fas fa-newspaper"></i> Run All Material
              </button>
            </div>
          </div>
          <div id="bulk-run-progress" class="hidden mt-3">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-gray-400" id="bulk-run-label">Running...</span>
              <span class="text-gray-400" id="bulk-run-pct">0/0</span>
            </div>
            <div class="w-full bg-ekantik-bg rounded-full h-1.5 overflow-hidden">
              <div id="bulk-run-bar" class="bg-ekantik-gold h-full rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
        </div>

        {/* Add Ticker Modal */}
        <div id="add-ticker-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-plus-circle mr-2 text-ekantik-accent"></i>Add to Watchlist</h3>
              <button onclick="closeAddModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Ticker Symbol</label>
                <div class="flex gap-2">
                  <input id="add-ticker-input" type="text" placeholder="e.g. GOOG, SQ, SHOP" maxLength={5} class="flex-1 bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 uppercase focus:outline-none focus:border-ekantik-gold/50" onkeydown="if(event.key==='Enter')lookupTicker()" />
                  <button onclick="lookupTicker()" id="lookup-btn" class="px-4 py-2.5 bg-ekantik-surface border border-ekantik-border rounded-lg text-sm text-gray-300 hover:border-ekantik-gold/50 transition-colors">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div id="lookup-result" class="hidden"></div>
              <div id="add-status" class="text-xs text-gray-500"></div>
            </div>
          </div>
        </div>

        {/* Bulk Import Modal */}
        <div id="bulk-import-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick="if(event.target===this)closeBulkImportModal()">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-file-import mr-2 text-ekantik-accent"></i>Bulk Import Watchlist</h3>
              <button onclick="closeBulkImportModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-2">Ticker Symbols</label>
                <textarea id="bulk-import-input" rows={6} placeholder={"Paste tickers separated by commas, spaces, or new lines.\n\nExamples:\nNVDA, AAPL, MSFT, GOOG, AMZN\n\nor one per line:\nNVDA\nAAPL\nMSFT"} class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 uppercase font-mono focus:outline-none focus:border-ekantik-gold/50 resize-none"></textarea>
                <div class="flex items-center justify-between mt-1">
                  <span id="bulk-import-count" class="text-xs text-gray-500">0 tickers detected</span>
                  <button onclick="document.getElementById('bulk-import-input').value='';updateBulkCount()" class="text-xs text-gray-500 hover:text-gray-300"><i class="fas fa-eraser mr-1"></i>Clear</button>
                </div>
              </div>
              <div id="bulk-import-progress" class="hidden space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-400" id="bulk-progress-label">Importing...</span>
                  <span class="text-gray-400" id="bulk-progress-pct">0%</span>
                </div>
                <div class="w-full bg-ekantik-bg rounded-full h-2 overflow-hidden">
                  <div id="bulk-progress-bar" class="bg-ekantik-accent h-full rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
              </div>
              <div id="bulk-import-results" class="hidden"></div>
              <div class="flex items-center justify-between pt-2">
                <span id="bulk-import-status" class="text-xs text-gray-500"></span>
                <button onclick="executeBulkImport()" id="bulk-import-btn" class="px-5 py-2.5 bg-ekantik-accent text-white rounded-lg text-sm font-bold hover:bg-ekantik-accent/80 transition-colors flex items-center gap-2">
                  <i class="fas fa-upload"></i> Import All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Detail Modal */}
        <div id="report-detail-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick="if(event.target===this)closeReportDetailModal()">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col mx-4">
            <div class="flex items-center justify-between p-5 border-b border-ekantik-border shrink-0">
              <h3 class="text-lg font-bold text-white" id="report-detail-title">Report</h3>
              <button onclick="closeReportDetailModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-5 overflow-y-auto prose prose-invert prose-sm max-w-none" id="report-detail-body">
            </div>
          </div>
        </div>

        {/* Files Management Modal */}
        <div id="files-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick="if(event.target===this)closeFilesModal()">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col mx-4">
            <div class="flex items-center justify-between p-5 border-b border-ekantik-border shrink-0">
              <h3 class="text-lg font-bold text-white" id="files-modal-title"><i class="fas fa-paperclip mr-2 text-teal-400"></i>Files</h3>
              <button onclick="closeFilesModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-5 overflow-y-auto flex-1">
              {/* Upload area */}
              <div class="mb-5">
                <div id="files-upload-zone" class="border-2 border-dashed border-ekantik-border rounded-xl p-5 text-center hover:border-teal-500/50 transition-colors cursor-pointer relative" onclick="document.getElementById('files-input').click()">
                  <input type="file" id="files-input" class="hidden" accept=".md,.txt,.csv,.pdf,.doc,.docx,.xls,.xlsx" onchange="handleFileSelect(this)" />
                  <i class="fas fa-cloud-upload-alt text-2xl text-gray-500 mb-2"></i>
                  <p class="text-sm text-gray-400">Click to upload or drag a file</p>
                  <p class="text-[10px] text-gray-600 mt-1">Supported: .md, .txt, .csv, .pdf, .doc, .docx, .xls, .xlsx (max 5 MB)</p>
                </div>
                <div id="files-upload-preview" class="hidden mt-3 bg-ekantik-surface rounded-lg p-3 border border-ekantik-border">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-file text-teal-400"></i>
                      <span id="files-selected-name" class="text-sm text-white font-semibold truncate max-w-xs"></span>
                      <span id="files-selected-size" class="text-[10px] text-gray-500"></span>
                    </div>
                    <button onclick="clearFileSelection()" class="text-gray-500 hover:text-white text-xs"><i class="fas fa-times"></i></button>
                  </div>
                  <div class="flex items-center gap-2">
                    <input id="files-notes-input" type="text" placeholder="Optional notes..." class="flex-1 bg-ekantik-bg border border-ekantik-border rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-teal-500/50" />
                    <button onclick="uploadFile()" id="files-upload-btn" class="px-4 py-1.5 bg-teal-500 text-white rounded text-xs font-bold hover:bg-teal-600 transition-colors flex items-center gap-1.5">
                      <i class="fas fa-upload"></i> Upload
                    </button>
                  </div>
                </div>
                <div id="files-upload-status" class="text-xs mt-2"></div>
              </div>
              {/* File list */}
              <div id="files-list" class="space-y-2">
                <div class="text-center py-4 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>Loading files...</div>
              </div>
            </div>
          </div>
        </div>

        {/* File Preview Modal */}
        <div id="file-preview-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick="if(event.target===this)closeFilePreview()">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col mx-4">
            <div class="flex items-center justify-between p-5 border-b border-ekantik-border shrink-0">
              <h3 class="text-lg font-bold text-white" id="file-preview-title"><i class="fas fa-file-alt mr-2 text-teal-400"></i>Preview</h3>
              <button onclick="closeFilePreview()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-5 overflow-y-auto prose prose-invert prose-sm max-w-none" id="file-preview-body">
            </div>
          </div>
        </div>

        <div id="watchlist-table" class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading watchlist...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: watchlistScript }} />
    </Layout>,
    { title: 'Watchlist — Ekantik Capital' }
  )
})


const watchlistScript = `
// Store watchlist data globally for re-rendering
let _wlData = [];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}

function renderReportBlob(report, agentType, symbol) {
  if (!report) {
    // No report — show run button
    return '<div class="flex flex-col items-center gap-1">' +
      '<span class="text-gray-600 text-[10px]">No data</span>' +
      '<button onclick="event.stopPropagation();runSingleAgent(&#39;' + agentType + '&#39;,&#39;' + symbol + '&#39;,this)" ' +
        'class="px-2 py-0.5 text-[10px] font-semibold rounded border border-gray-600 text-gray-500 hover:text-white hover:border-gray-400 transition-colors">' +
        '<i class="fas fa-play mr-1"></i>Run</button></div>';
  }

  // Parse structured JSON for key_takeaway
  let takeaway = '';
  let impactBadge = '';
  let scoreBadge = '';
  try {
    const j = typeof report.json === 'string' ? JSON.parse(report.json) : report.json;
    if (j && j.key_takeaway) takeaway = j.key_takeaway.substring(0, 100) + (j.key_takeaway.length > 100 ? '...' : '');
  } catch(e) {}

  const impactColors = { H: 'bg-red-500/20 text-red-400', M: 'bg-amber-500/20 text-amber-400', L: 'bg-green-500/20 text-green-400' };
  if (report.impact) {
    impactBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold ' + (impactColors[report.impact]||'') + '">' + report.impact + '</span>';
  }
  if (report.score) {
    scoreBadge = '<span class="text-ekantik-gold text-[10px] font-bold">' + Number(report.score).toFixed(1) + '</span>';
  }

  const age = timeAgo(report.created_at);

  return '<div class="cursor-pointer hover:bg-ekantik-surface/30 rounded px-1.5 py-1 -mx-1.5 transition-colors" onclick="event.stopPropagation();showReportDetail(&#39;' + report.id + '&#39;, &#39;' + agentType + '&#39;, &#39;' + symbol + '&#39;)">' +
    '<div class="flex items-center gap-1.5 mb-0.5">' +
      impactBadge + scoreBadge +
      '<span class="text-gray-500 text-[9px] ml-auto">' + age + '</span>' +
    '</div>' +
    (takeaway ? '<p class="text-[10px] text-gray-400 leading-tight line-clamp-2">' + takeaway.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p>' : '') +
    '<div class="flex items-center gap-1.5 mt-1">' +
      '<button onclick="event.stopPropagation();runSingleAgent(&#39;' + agentType + '&#39;,&#39;' + symbol + '&#39;,this)" class="px-1.5 py-0.5 text-[9px] font-semibold rounded border border-gray-700 text-gray-500 hover:text-white hover:border-gray-400 transition-colors"><i class="fas fa-redo mr-0.5"></i>Rerun</button>' +
    '</div></div>';
}

function renderWatchlistTable() {
  const container = document.getElementById('watchlist-table');
  const tickers = _wlData;

  if (!tickers || tickers.length === 0) {
    container.innerHTML = '<div class="text-center py-12 text-gray-500 p-6"><i class="fas fa-binoculars text-3xl mb-3"></i><p>No tickers in watchlist. Click <b>Add Ticker</b> to get started.</p></div>';
    return;
  }

  container.innerHTML = '<div class="overflow-x-auto"><table class="w-full"><thead><tr class="border-b border-ekantik-border">' +
    '<th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest w-20">Ticker</th>' +
    '<th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest w-40">Name</th>' +
    '<th class="text-right px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest w-24">Last Price</th>' +
    '<th class="px-4 py-3 text-[10px] font-semibold text-amber-400/70 uppercase tracking-widest w-56"><i class="fas fa-bolt mr-1"></i>Pivot</th>' +
    '<th class="px-4 py-3 text-[10px] font-semibold text-purple-400/70 uppercase tracking-widest w-56"><i class="fas fa-brain mr-1"></i>Bias</th>' +
    '<th class="px-4 py-3 text-[10px] font-semibold text-blue-400/70 uppercase tracking-widest w-56"><i class="fas fa-newspaper mr-1"></i>Material</th>' +
    '<th class="px-3 py-3 text-[10px] font-semibold text-teal-400/70 uppercase tracking-widest w-24 text-center"><i class="fas fa-paperclip mr-1"></i>Files</th>' +
    '<th class="text-center px-2 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest w-12"></th>' +
  '</tr></thead><tbody>' +
  tickers.map(function(t) {
    const chgColor = (t.price_change_pct || 0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
    const chgSign = (t.price_change_pct || 0) >= 0 ? '+' : '';
    const priceStr = t.last_price ? '\$' + t.last_price.toFixed(2) : '—';
    const chgStr = t.price_change_pct != null ? chgSign + t.price_change_pct.toFixed(2) + '%' : '';

    return '<tr class="border-b border-ekantik-border/50 hover:bg-ekantik-surface/20 group align-top">' +
      '<td class="px-4 py-3 cursor-pointer" onclick="location.href=&#39;/tickers/' + t.id + '&#39;">' +
        '<span class="font-mono font-bold text-white text-sm">' + t.symbol + '</span>' +
        (t.is_mag7 ? '<span class="ml-1 px-1 py-0.5 bg-ekantik-gold/20 text-ekantik-gold rounded text-[8px] font-bold">M7</span>' : '') +
      '</td>' +
      '<td class="px-4 py-3 text-gray-300 text-sm cursor-pointer" onclick="location.href=&#39;/tickers/' + t.id + '&#39;">' + (t.name || '') + '</td>' +
      '<td class="px-4 py-3 text-right">' +
        '<div class="text-white font-semibold text-sm">' + priceStr + '</div>' +
        (chgStr ? '<div class="text-[10px] ' + chgColor + ' font-semibold">' + chgStr + '</div>' : '') +
      '</td>' +
      '<td class="px-4 py-3">' + renderReportBlob(t.pivot_report, 'episodic_pivot', t.symbol) + '</td>' +
      '<td class="px-4 py-3">' + renderReportBlob(t.bias_report, 'bias_mode', t.symbol) + '</td>' +
      '<td class="px-4 py-3">' + renderReportBlob(t.material_report, 'material_events', t.symbol) + '</td>' +
      '<td class="px-3 py-3 text-center">' +
        '<button onclick="event.stopPropagation();openFilesModal(&#39;' + t.symbol + '&#39;)" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ' + (t.uploaded_file_count > 0 ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 hover:bg-teal-500/25' : 'bg-ekantik-surface text-gray-500 border border-ekantik-border hover:text-gray-300 hover:border-gray-500') + '">' +
          '<i class="fas fa-paperclip"></i>' +
          (t.uploaded_file_count > 0 ? ' <span>' + t.uploaded_file_count + '</span>' : '') +
        '</button>' +
      '</td>' +
      '<td class="px-2 py-3 text-center">' +
        '<button onclick="event.stopPropagation();removeTicker(&#39;' + t.symbol + '&#39;)" class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-ekantik-red text-xs px-2 py-1 rounded hover:bg-ekantik-red/10" title="Remove">' +
          '<i class="fas fa-times"></i></button>' +
      '</td>' +
    '</tr>';
  }).join('') + '</tbody></table></div>';
}

// Initial load
(async () => {
  try {
    const res = await fetch('/api/watchlist');
    const { tickers } = await res.json();
    _wlData = tickers || [];
    renderWatchlistTable();
  } catch(e) { console.error('Watchlist load failed', e); }
})();

// ── Report Detail Modal ──────────────────────────────────
function showReportDetail(reportId, agentType, symbol) {
  const agentLabels = { episodic_pivot: 'Episodic Pivot', bias_mode: 'Bias Mode', material_events: 'Material Events' };
  document.getElementById('report-detail-title').innerHTML = '<i class="fas fa-file-alt mr-2 text-ekantik-gold"></i>' + (agentLabels[agentType] || agentType) + ' — ' + symbol;

  // Find report in cached data
  const agentKey = agentType === 'episodic_pivot' ? 'pivot_report' : agentType === 'bias_mode' ? 'bias_report' : 'material_report';
  const ticker = _wlData.find(function(t) { return t.symbol === symbol; });
  const report = ticker ? ticker[agentKey] : null;

  if (report && report.markdown) {
    // Simple markdown-to-html: headers, bold, lists, code blocks
    let html = report.markdown
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(new RegExp('^### (.+)$', 'gm'), '<h3 class="text-white font-bold text-sm mt-4 mb-1">$1</h3>')
      .replace(new RegExp('^## (.+)$', 'gm'), '<h2 class="text-white font-bold text-base mt-5 mb-2">$1</h2>')
      .replace(new RegExp('^# (.+)$', 'gm'), '<h1 class="text-white font-bold text-lg mt-5 mb-2">$1</h1>')
      .replace(new RegExp('\\*\\*(.+?)\\*\\*', 'g'), '<strong class="text-white">$1</strong>')
      .replace(new RegExp('^- (.+)$', 'gm'), '<li class="text-gray-300 text-sm ml-4">$1</li>')
      .replace(new RegExp('^(\\d+)\\. (.+)$', 'gm'), '<li class="text-gray-300 text-sm ml-4">$1. $2</li>')
      .replace(new RegExp('\\n{2,}', 'g'), '<br/><br/>')
      .replace(new RegExp('\\n', 'g'), '<br/>');
    document.getElementById('report-detail-body').innerHTML = '<div class="text-gray-300 text-sm leading-relaxed">' + html + '</div>';
  } else {
    document.getElementById('report-detail-body').innerHTML = '<p class="text-gray-500">No report content available.</p>';
  }
  document.getElementById('report-detail-modal').classList.remove('hidden');
}

function closeReportDetailModal() {
  document.getElementById('report-detail-modal').classList.add('hidden');
}

// ── Run Single Agent ──────────────────────────────────────
async function runSingleAgent(agentType, symbol, btnEl) {
  const origHtml = btnEl.innerHTML;

  // Passcode gate
  var pHeaders = await withPasscode({ 'Content-Type': 'application/json' });
  if (pHeaders === null) return;

  btnEl.disabled = true;
  btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  btnEl.title = 'Running... (30-90s)';

  try {
    const res = await fetch('/api/watchlist/run-agent', {
      method: 'POST',
      headers: pHeaders,
      body: JSON.stringify({ agentType, symbol })
    });
    const data = await res.json();
    if (handlePasscodeError(data)) {
      alert('Passcode error — please try again.');
      btnEl.disabled = false;
      btnEl.innerHTML = origHtml;
      return;
    }
    if (data.error) {
      alert('Error: ' + data.error);
      btnEl.disabled = false;
      btnEl.innerHTML = origHtml;
      return;
    }
    // Update cached data and re-render
    const agentKey = agentType === 'episodic_pivot' ? 'pivot_report' : agentType === 'bias_mode' ? 'bias_report' : 'material_report';
    const ticker = _wlData.find(function(t) { return t.symbol === symbol; });
    if (ticker && data.report) {
      ticker[agentKey] = {
        id: data.report.id,
        created_at: data.report.created_at,
        impact: data.report.impact_score,
        conviction: data.report.conviction_level,
        score: data.report.ai_composite_score,
        json: data.report.structured_json,
        markdown: data.report.raw_markdown,
      };
    }
    renderWatchlistTable();
  } catch(e) {
    alert('Error: ' + e.message);
    btnEl.disabled = false;
    btnEl.innerHTML = origHtml;
  }
}

// ── Bulk Run Agent ──────────────────────────────────────
let _bulkRunning = false;

async function bulkRunAgent(agentType) {
  if (_bulkRunning) { alert('A bulk run is already in progress'); return; }
  const symbols = _wlData.map(function(t) { return t.symbol; });
  if (symbols.length === 0) { alert('No tickers in watchlist'); return; }

  const agentLabels = { episodic_pivot: 'Pivot', bias_mode: 'Bias', material_events: 'Material' };
  if (!confirm('Run ' + (agentLabels[agentType]||agentType) + ' agent on all ' + symbols.length + ' watchlist tickers?\\n\\nThis will take ~30-90 seconds per ticker.')) return;

  // Passcode gate — prompt once for the entire bulk run
  var pHeaders = await withPasscode({ 'Content-Type': 'application/json' });
  if (pHeaders === null) return;

  _bulkRunning = true;
  const progressDiv = document.getElementById('bulk-run-progress');
  const labelEl = document.getElementById('bulk-run-label');
  const pctEl = document.getElementById('bulk-run-pct');
  const barEl = document.getElementById('bulk-run-bar');
  progressDiv.classList.remove('hidden');

  // Disable all bulk run buttons
  ['pivot','bias','material'].forEach(function(k) {
    const b = document.getElementById('bulk-run-' + k + '-btn');
    if (b) b.disabled = true;
  });

  const agentKey = agentType === 'episodic_pivot' ? 'pivot_report' : agentType === 'bias_mode' ? 'bias_report' : 'material_report';
  let completed = 0;
  let failed = 0;

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    labelEl.textContent = (agentLabels[agentType]||agentType) + ': ' + sym + '...';
    pctEl.textContent = (i+1) + '/' + symbols.length;
    barEl.style.width = ((i / symbols.length) * 100) + '%';

    try {
      const res = await fetch('/api/watchlist/run-agent', {
        method: 'POST',
        headers: pHeaders,
        body: JSON.stringify({ agentType, symbol: sym })
      });
      const data = await res.json();
      if (handlePasscodeError(data)) {
        // Passcode became invalid mid-run — abort
        labelEl.textContent = 'Passcode error — run aborted.';
        break;
      }
      if (data.error) {
        failed++;
      } else {
        completed++;
        const ticker = _wlData.find(function(t) { return t.symbol === sym; });
        if (ticker && data.report) {
          ticker[agentKey] = {
            id: data.report.id,
            created_at: data.report.created_at,
            impact: data.report.impact_score,
            conviction: data.report.conviction_level,
            score: data.report.ai_composite_score,
            json: data.report.structured_json,
            markdown: data.report.raw_markdown,
          };
        }
        renderWatchlistTable();
      }
    } catch(e) {
      failed++;
    }
  }

  barEl.style.width = '100%';
  labelEl.textContent = 'Done: ' + completed + ' completed, ' + failed + ' failed';
  pctEl.textContent = symbols.length + '/' + symbols.length;

  // Re-enable buttons
  ['pivot','bias','material'].forEach(function(k) {
    const b = document.getElementById('bulk-run-' + k + '-btn');
    if (b) b.disabled = false;
  });
  _bulkRunning = false;

  setTimeout(function() { progressDiv.classList.add('hidden'); }, 5000);
}

// ── Add Ticker Functions ────────────────────────────────────
function closeAddModal() {
  document.getElementById('add-ticker-modal').classList.add('hidden');
  document.getElementById('add-ticker-input').value = '';
  document.getElementById('lookup-result').classList.add('hidden');
  document.getElementById('lookup-result').innerHTML = '';
  document.getElementById('add-status').textContent = '';
}

async function lookupTicker() {
  const input = document.getElementById('add-ticker-input');
  const sym = input.value.toUpperCase().trim();
  if (!sym || !/^[A-Z]{1,5}\$/.test(sym)) { alert('Enter a valid ticker symbol (1-5 letters)'); return; }

  const btn = document.getElementById('lookup-btn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  const resultDiv = document.getElementById('lookup-result');
  const statusDiv = document.getElementById('add-status');
  resultDiv.classList.add('hidden');
  statusDiv.textContent = 'Looking up ' + sym + '...';

  try {
    const res = await fetch('/api/watchlist/lookup/' + sym);
    const data = await res.json();
    btn.innerHTML = '<i class="fas fa-search"></i>';
    if (data.error) { statusDiv.textContent = data.error; return; }
    statusDiv.textContent = '';
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML =
      '<div class="bg-ekantik-surface border border-ekantik-border rounded-lg p-3">' +
        '<div class="flex items-center justify-between mb-2">' +
          '<span class="font-mono font-bold text-white">' + data.symbol + '</span>' +
          '<span class="text-gray-400 text-xs">' + (data.sector||'') + '</span>' +
        '</div>' +
        '<p class="text-gray-300 text-sm mb-2">' + (data.name||data.symbol) + '</p>' +
        '<button onclick="addTicker(&#39;' + data.symbol + '&#39;)" class="w-full py-2 bg-ekantik-accent text-white rounded-lg text-sm font-bold hover:bg-ekantik-accent/80">Add to Watchlist</button>' +
      '</div>';
  } catch(e) {
    btn.innerHTML = '<i class="fas fa-search"></i>';
    statusDiv.textContent = 'Error: ' + e.message;
  }
}

async function addTicker(sym) {
  const statusDiv = document.getElementById('add-status');
  statusDiv.textContent = 'Adding ' + sym + '...';
  try {
    const res = await fetch('/api/watchlist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: sym })
    });
    const data = await res.json();
    if (data.error) { statusDiv.textContent = data.error; return; }
    closeAddModal();
    location.reload();
  } catch(e) { statusDiv.textContent = 'Error: ' + e.message; }
}

async function removeTicker(sym) {
  if (!confirm('Remove ' + sym + ' from watchlist?')) return;
  try {
    const res = await fetch('/api/watchlist/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: sym })
    });
    const data = await res.json();
    if (data.success) {
      _wlData = _wlData.filter(function(t) { return t.symbol !== sym; });
      renderWatchlistTable();
    }
  } catch(e) { alert('Error: ' + e.message); }
}

// ── Bulk Import Functions ────────────────────────────────────
function parseBulkSymbols() {
  const raw = document.getElementById('bulk-import-input').value;
  return [...new Set(raw.toUpperCase().split(/[,\\n\\r\\t; |]+/).map(function(s) { return s.replace(/[^A-Z]/g, ''); }).filter(function(s) { return s.length >= 1 && s.length <= 5; }))];
}

function updateBulkCount() {
  const syms = parseBulkSymbols();
  const el = document.getElementById('bulk-import-count');
  el.textContent = syms.length + ' ticker' + (syms.length !== 1 ? 's' : '') + ' detected';
  el.className = syms.length > 0 ? 'text-xs text-ekantik-accent font-semibold' : 'text-xs text-gray-500';
}
document.getElementById('bulk-import-input').addEventListener('input', updateBulkCount);

function closeBulkImportModal() {
  document.getElementById('bulk-import-modal').classList.add('hidden');
  document.getElementById('bulk-import-input').value = '';
  document.getElementById('bulk-import-progress').classList.add('hidden');
  document.getElementById('bulk-import-results').classList.add('hidden');
  document.getElementById('bulk-import-results').innerHTML = '';
  document.getElementById('bulk-import-status').textContent = '';
  const btn = document.getElementById('bulk-import-btn');
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-upload"></i> Import All';
  updateBulkCount();
}

async function executeBulkImport() {
  const symbols = parseBulkSymbols();
  if (symbols.length === 0) { alert('No valid tickers to import'); return; }
  if (symbols.length > 100) { alert('Maximum 100 tickers per import'); return; }

  const btn = document.getElementById('bulk-import-btn');
  const statusEl = document.getElementById('bulk-import-status');
  const progressDiv = document.getElementById('bulk-import-progress');
  const progressBar = document.getElementById('bulk-progress-bar');
  const progressPct = document.getElementById('bulk-progress-pct');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
  progressDiv.classList.remove('hidden');
  progressBar.style.width = '10%';
  progressPct.textContent = '10%';

  try {
    setTimeout(function() { progressBar.style.width = '40%'; progressPct.textContent = '40%'; }, 500);
    const res = await fetch('/api/watchlist/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols })
    });
    progressBar.style.width = '80%'; progressPct.textContent = '80%';
    const data = await res.json();
    progressBar.style.width = '100%'; progressPct.textContent = '100%';

    if (data.error) { statusEl.textContent = data.error; btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Retry'; return; }

    const resultsDiv = document.getElementById('bulk-import-results');
    resultsDiv.classList.remove('hidden');
    const s = data.summary;
    let html = '<div class="bg-ekantik-surface rounded-lg p-3 text-xs space-y-1">' +
      '<div class="flex justify-between"><span class="text-green-400">Added:</span><span class="text-white font-bold">' + s.added + '</span></div>' +
      '<div class="flex justify-between"><span class="text-gray-400">Already on watchlist:</span><span class="text-white">' + s.already_on_watchlist + '</span></div>' +
      '<div class="flex justify-between"><span class="text-red-400">Failed:</span><span class="text-white">' + s.failed + '</span></div></div>';
    resultsDiv.innerHTML = html;

    if (s.added > 0) {
      btn.innerHTML = '<i class="fas fa-check"></i> Done — Reloading...';
      setTimeout(function() { closeBulkImportModal(); location.reload(); }, 1500);
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-upload mr-1"></i> Import All';
      statusEl.textContent = 'No new tickers were added';
    }
  } catch(e) {
    statusEl.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-upload mr-1"></i> Retry';
    progressBar.style.width = '100%';
    progressBar.classList.remove('bg-ekantik-accent');
    progressBar.classList.add('bg-red-500');
  }
}

// ── File Management Functions ──────────────────────────────
let _filesCurrentSymbol = '';
let _filesSelectedFile = null;

function openFilesModal(symbol) {
  _filesCurrentSymbol = symbol;
  _filesSelectedFile = null;
  document.getElementById('files-modal-title').innerHTML = '<i class="fas fa-paperclip mr-2 text-teal-400"></i>Files — ' + symbol;
  document.getElementById('files-modal').classList.remove('hidden');
  clearFileSelection();
  loadFiles(symbol);
}

function closeFilesModal() {
  document.getElementById('files-modal').classList.add('hidden');
  _filesCurrentSymbol = '';
  _filesSelectedFile = null;
  clearFileSelection();
}

function clearFileSelection() {
  _filesSelectedFile = null;
  document.getElementById('files-input').value = '';
  document.getElementById('files-upload-preview').classList.add('hidden');
  document.getElementById('files-upload-status').textContent = '';
  document.getElementById('files-notes-input').value = '';
}

function handleFileSelect(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('File too large (max 5 MB)');
    input.value = '';
    return;
  }
  _filesSelectedFile = file;
  document.getElementById('files-selected-name').textContent = file.name;
  var sizeKb = (file.size / 1024).toFixed(1);
  document.getElementById('files-selected-size').textContent = sizeKb + ' KB';
  document.getElementById('files-upload-preview').classList.remove('hidden');
}

async function uploadFile() {
  if (!_filesSelectedFile || !_filesCurrentSymbol) return;
  var btn = document.getElementById('files-upload-btn');
  var statusEl = document.getElementById('files-upload-status');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
  statusEl.textContent = '';

  var fd = new FormData();
  fd.append('file', _filesSelectedFile);
  var notes = document.getElementById('files-notes-input').value.trim();
  if (notes) fd.append('notes', notes);

  try {
    var res = await fetch('/api/watchlist/' + _filesCurrentSymbol + '/files', {
      method: 'POST',
      body: fd
    });
    var data = await res.json();
    if (data.error) {
      statusEl.innerHTML = '<span class="text-red-400">' + data.error + '</span>';
    } else {
      statusEl.innerHTML = '<span class="text-teal-400"><i class="fas fa-check mr-1"></i>Uploaded!</span>';
      clearFileSelection();
      loadFiles(_filesCurrentSymbol);
      // Update file count in cached data
      var ticker = _wlData.find(function(t) { return t.symbol === _filesCurrentSymbol; });
      if (ticker) { ticker.uploaded_file_count = (ticker.uploaded_file_count || 0) + 1; renderWatchlistTable(); }
    }
  } catch(e) {
    statusEl.innerHTML = '<span class="text-red-400">Upload failed: ' + e.message + '</span>';
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-upload"></i> Upload';
}

async function loadFiles(symbol) {
  var listEl = document.getElementById('files-list');
  listEl.innerHTML = '<div class="text-center py-4 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</div>';

  try {
    var res = await fetch('/api/watchlist/' + symbol + '/files');
    var data = await res.json();
    var files = data.files || [];

    if (files.length === 0) {
      listEl.innerHTML = '<div class="text-center py-6 text-gray-600"><i class="fas fa-folder-open text-2xl mb-2"></i><p class="text-sm">No files uploaded yet</p></div>';
      return;
    }

    var fileTypeIcons = {
      'application/pdf': 'fa-file-pdf text-red-400',
      'text/markdown': 'fa-file-code text-blue-400',
      'text/plain': 'fa-file-alt text-gray-400',
      'text/csv': 'fa-file-csv text-green-400',
      'application/msword': 'fa-file-word text-blue-500',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word text-blue-500',
      'application/vnd.ms-excel': 'fa-file-excel text-green-500',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-file-excel text-green-500',
    };

    listEl.innerHTML = files.map(function(f) {
      var icon = fileTypeIcons[f.file_type] || 'fa-file text-gray-400';
      var sizeStr = f.file_size < 1024 ? f.file_size + ' B' : (f.file_size / 1024).toFixed(1) + ' KB';
      var isPreviewable = f.file_type && (f.file_type.startsWith('text/') || f.file_name.endsWith('.md') || f.file_name.endsWith('.txt') || f.file_name.endsWith('.csv'));
      var age = timeAgo(f.created_at);

      return '<div class="flex items-center gap-3 bg-ekantik-surface border border-ekantik-border rounded-lg p-3 hover:border-teal-500/30 transition-colors">' +
        '<i class="fas ' + icon + ' text-lg w-6 text-center shrink-0"></i>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="flex items-center gap-2">' +
            '<span class="text-sm text-white font-semibold truncate">' + f.file_name + '</span>' +
            '<span class="text-[10px] text-gray-500 shrink-0">' + sizeStr + '</span>' +
          '</div>' +
          (f.notes ? '<p class="text-[10px] text-gray-500 truncate mt-0.5">' + f.notes.replace(/</g, '&lt;') + '</p>' : '') +
          '<span class="text-[9px] text-gray-600">' + age + '</span>' +
        '</div>' +
        '<div class="flex items-center gap-1 shrink-0">' +
          (isPreviewable ? '<button onclick="previewFile(' + f.id + ')" class="p-1.5 text-gray-500 hover:text-teal-400 transition-colors" title="Preview"><i class="fas fa-eye"></i></button>' : '') +
          '<a href="/api/watchlist/files/' + f.id + '/download" class="p-1.5 text-gray-500 hover:text-white transition-colors" title="Download"><i class="fas fa-download"></i></a>' +
          '<button onclick="deleteFile(' + f.id + ',&#39;' + f.file_name.replace(/'/g, '') + '&#39;)" class="p-1.5 text-gray-500 hover:text-red-400 transition-colors" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch(e) {
    listEl.innerHTML = '<div class="text-center py-4 text-red-400 text-sm">Failed to load files</div>';
  }
}

async function deleteFile(fileId, fileName) {
  if (!confirm('Delete file "' + fileName + '"? This cannot be undone.')) return;
  try {
    var res = await fetch('/api/watchlist/files/' + fileId, { method: 'DELETE' });
    var data = await res.json();
    if (data.error) { alert('Error: ' + data.error); return; }
    loadFiles(_filesCurrentSymbol);
    // Update file count in cached data
    var ticker = _wlData.find(function(t) { return t.symbol === _filesCurrentSymbol; });
    if (ticker && ticker.uploaded_file_count > 0) { ticker.uploaded_file_count--; renderWatchlistTable(); }
  } catch(e) { alert('Delete failed: ' + e.message); }
}

async function previewFile(fileId) {
  document.getElementById('file-preview-body').innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-spinner fa-spin text-xl mb-2"></i><p>Loading preview...</p></div>';
  document.getElementById('file-preview-modal').classList.remove('hidden');

  try {
    var res = await fetch('/api/watchlist/files/' + fileId + '/preview');
    var data = await res.json();

    document.getElementById('file-preview-title').innerHTML = '<i class="fas fa-file-alt mr-2 text-teal-400"></i>' + (data.file_name || 'Preview');

    if (!data.preview) {
      document.getElementById('file-preview-body').innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-file text-3xl mb-3"></i><p>' + (data.message || 'Cannot preview this file type') + '</p><a href="/api/watchlist/files/' + fileId + '/download" class="mt-3 inline-block px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-bold hover:bg-teal-600">Download</a></div>';
      return;
    }

    // Render text/markdown as formatted HTML
    var html = data.preview
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(new RegExp('^### (.+)$', 'gm'), '<h3 class="text-white font-bold text-sm mt-4 mb-1">$1</h3>')
      .replace(new RegExp('^## (.+)$', 'gm'), '<h2 class="text-white font-bold text-base mt-5 mb-2">$1</h2>')
      .replace(new RegExp('^# (.+)$', 'gm'), '<h1 class="text-white font-bold text-lg mt-5 mb-2">$1</h1>')
      .replace(new RegExp('\\*\\*(.+?)\\*\\*', 'g'), '<strong class="text-white">$1</strong>')
      .replace(new RegExp('^- (.+)$', 'gm'), '<li class="text-gray-300 text-sm ml-4">$1</li>')
      .replace(new RegExp('^(\\d+)\\. (.+)$', 'gm'), '<li class="text-gray-300 text-sm ml-4">$1. $2</li>')
      .replace(new RegExp('\\n{2,}', 'g'), '<br/><br/>')
      .replace(new RegExp('\\n', 'g'), '<br/>');

    document.getElementById('file-preview-body').innerHTML = '<div class="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">' + html + '</div>';
  } catch(e) {
    document.getElementById('file-preview-body').innerHTML = '<div class="text-center py-8 text-red-400"><p>Preview failed: ' + e.message + '</p></div>';
  }
}

function closeFilePreview() {
  document.getElementById('file-preview-modal').classList.add('hidden');
}

// Drag & drop support on upload zone
(function() {
  var zone = document.getElementById('files-upload-zone');
  if (!zone) return;
  zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('border-teal-500/50', 'bg-teal-500/5'); });
  zone.addEventListener('dragleave', function(e) { e.preventDefault(); zone.classList.remove('border-teal-500/50', 'bg-teal-500/5'); });
  zone.addEventListener('drop', function(e) {
    e.preventDefault();
    zone.classList.remove('border-teal-500/50', 'bg-teal-500/5');
    var files = e.dataTransfer.files;
    if (files && files.length > 0) {
      var input = document.getElementById('files-input');
      input.files = files;
      handleFileSelect(input);
    }
  });
})();

`


export { watchlistRoutes }
