import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const observationsRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// OBSERVATIONS
// ============================================================
observationsRoutes.get('/observations', (c) => {
  return c.render(
    <Layout active="observations">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Observation <span class="text-ekantik-gold italic">Log</span></h1>
            <p class="text-gray-400 text-sm mt-1">This Happened → Why It Matters → Watch Next</p>
          </div>
          <button onclick="openObsFilesModal()" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm font-semibold hover:border-teal-500/50 hover:text-teal-400 transition-colors flex items-center gap-2">
            <i class="fas fa-paperclip"></i> Reports &amp; Files <span id="obs-files-badge" class="hidden px-1.5 py-0.5 bg-teal-500/20 text-teal-400 rounded text-[10px] font-bold ml-1">0</span>
          </button>
        </div>
        {/* Files Modal */}
        <div id="obs-files-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick="if(event.target===this)closeObsFilesModal()">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-ekantik-border">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-paperclip mr-2 text-teal-400"></i>Observation Reports &amp; Files</h3>
              <button onclick="closeObsFilesModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Upload Zone */}
              <div id="obs-file-upload-zone" class="border-2 border-dashed border-ekantik-border rounded-xl p-5 text-center hover:border-teal-500/50 transition-colors cursor-pointer" onclick="document.getElementById('obs-file-input').click()">
                <i class="fas fa-cloud-upload-alt text-2xl text-gray-500 mb-2"></i>
                <p class="text-sm text-gray-400">Click to upload or drag &amp; drop</p>
                <p class="text-[10px] text-gray-500 mt-1">md, txt, csv, pdf, doc, docx, xls, xlsx — max 5MB</p>
                <input type="file" id="obs-file-input" accept=".md,.txt,.csv,.pdf,.doc,.docx,.xls,.xlsx" class="hidden" onchange="handleObsFileSelect(this)" />
              </div>
              <div id="obs-file-upload-form" class="hidden space-y-3">
                <div class="bg-ekantik-surface rounded-lg p-3 flex items-center gap-3">
                  <i class="fas fa-file text-teal-400"></i>
                  <div class="flex-1 min-w-0">
                    <p id="obs-file-selected-name" class="text-sm text-white truncate"></p>
                    <p id="obs-file-selected-size" class="text-[10px] text-gray-500"></p>
                  </div>
                  <button onclick="cancelObsFileSelect()" class="text-gray-400 hover:text-red-400"><i class="fas fa-times"></i></button>
                </div>
                <div class="flex gap-3">
                  <input id="obs-file-notes" type="text" placeholder="Notes (optional)" class="flex-1 bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300" />
                  <select id="obs-file-link" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300">
                    <option value="">General (no specific observation)</option>
                  </select>
                </div>
                <div class="flex justify-end gap-2">
                  <button onclick="cancelObsFileSelect()" class="px-3 py-1.5 text-sm text-gray-400 hover:text-white">Cancel</button>
                  <button onclick="uploadObsFile()" id="obs-file-upload-btn" class="px-4 py-1.5 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-400"><i class="fas fa-upload mr-1"></i>Upload</button>
                </div>
                <div id="obs-file-upload-progress" class="hidden h-1.5 bg-ekantik-bg rounded-full overflow-hidden">
                  <div id="obs-file-upload-bar" class="h-full bg-teal-500 rounded-full transition-all" style="width:0%"></div>
                </div>
                <p id="obs-file-upload-status" class="text-[10px] text-gray-500"></p>
              </div>
              {/* Files List */}
              <div id="obs-files-list" class="space-y-2">
                <div class="text-center py-4 text-gray-500 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>Loading files...</div>
              </div>
            </div>
          </div>
        </div>
        {/* File Preview Modal */}
        <div id="obs-file-preview-modal" class="hidden fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onclick="if(event.target===this)closeObsFilePreview()">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div class="flex items-center justify-between p-4 border-b border-ekantik-border">
              <h4 id="obs-preview-title" class="text-sm font-bold text-white truncate"></h4>
              <button onclick="closeObsFilePreview()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div id="obs-preview-body" class="p-5 overflow-y-auto flex-1 text-sm text-gray-300 font-mono whitespace-pre-wrap"></div>
          </div>
        </div>
        <div id="observations-container">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading observations...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: observationsScript }} />
    </Layout>,
    { title: 'Observations — Ekantik Capital' }
  )
})


const observationsScript = `
let _obsFiles = [];
let _obsSelectedFile = null;
let _obsObservations = [];

const pivotTypeOptions = [
  { value: '', label: 'Not a Pivot' },
  { value: 'earnings_surprise', label: 'Earnings Surprise' },
  { value: 'regulatory_shift', label: 'Regulatory Shift' },
  { value: 'management_change', label: 'Management Change' },
  { value: 'product_inflection', label: 'Product Inflection' },
  { value: 'macro_regime', label: 'Macro Regime' },
  { value: 'geopolitical', label: 'Geopolitical' },
  { value: 'narrative_collapse', label: 'Narrative Collapse' },
  { value: 'competitive_moat', label: 'Competitive Moat' },
  { value: 'capital_event', label: 'Capital Event' },
];
const pivotTypeIcons = {
  earnings_surprise: '<i class="fas fa-chart-line"></i>',
  regulatory_shift: '<i class="fas fa-landmark"></i>',
  management_change: '<i class="fas fa-user-tie"></i>',
  product_inflection: '<i class="fas fa-lightbulb"></i>',
  macro_regime: '<i class="fas fa-university"></i>',
  geopolitical: '<i class="fas fa-globe"></i>',
  narrative_collapse: '<i class="fas fa-exclamation-triangle"></i>',
  competitive_moat: '<i class="fas fa-shield-alt"></i>',
  capital_event: '<i class="fas fa-dollar-sign"></i>',
};
const pivotTypeLabels = {
  earnings_surprise: 'EARNINGS', regulatory_shift: 'REGULATORY',
  management_change: 'MGMT CHANGE', product_inflection: 'PRODUCT',
  macro_regime: 'MACRO', geopolitical: 'GEOPOLITICAL',
  narrative_collapse: 'NARRATIVE', competitive_moat: 'MOAT',
  capital_event: 'CAPITAL',
};

(async () => {
  try {
    const res = await fetch('/api/observations');
    const { observations } = await res.json();
    _obsObservations = observations || [];
    const container = document.getElementById('observations-container');

    container.innerHTML =
      // Quick add form
      '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-5 mb-6">' +
        '<h3 class="text-sm font-semibold text-white mb-3"><i class="fas fa-plus-circle mr-2 text-ekantik-gold"></i>Quick Add Observation</h3>' +
        '<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">' +
          '<div><label class="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">This Happened</label><textarea id="obs-happened" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 h-20 resize-none" placeholder="What did you observe?"></textarea></div>' +
          '<div><label class="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Why It Matters</label><textarea id="obs-why" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 h-20 resize-none" placeholder="Investment significance..."></textarea></div>' +
          '<div><label class="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Watch Next</label><textarea id="obs-watch" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 h-20 resize-none" placeholder="What to monitor going forward..."></textarea></div>' +
        '</div>' +
        '<div class="flex items-center gap-3 flex-wrap">' +
          '<input id="obs-tickers" type="text" placeholder="Tickers (comma-separated)" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 w-48" />' +
          '<select id="obs-category" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">' +
            '<option value="">Category</option>' +
            '<option value="technology">Technology</option>' +
            '<option value="consumer_behavior">Consumer Behavior</option>' +
            '<option value="regulatory">Regulatory</option>' +
            '<option value="macroeconomic">Macroeconomic</option>' +
            '<option value="competitive">Competitive</option>' +
          '</select>' +
          '<input id="obs-kpi" type="text" placeholder="KPI to track" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 flex-1" />' +
        '</div>' +
        // ── Episodic Pivot section ──
        '<div class="mt-3 pt-3 border-t border-ekantik-border/50">' +
          '<div class="flex items-center gap-2 mb-2">' +
            '<label class="flex items-center gap-2 cursor-pointer">' +
              '<input type="checkbox" id="obs-is-pivot" onchange="toggleObsPivotFields()" class="w-4 h-4 rounded border-ekantik-border bg-ekantik-bg text-amber-500 focus:ring-amber-500 cursor-pointer" />' +
              '<span class="text-xs font-semibold text-amber-400"><i class="fas fa-bolt mr-1"></i>Potential Episodic Pivot</span>' +
            '</label>' +
            '<span class="text-[10px] text-gray-500">— Mark if this observation represents a discrete reality-changing event</span>' +
          '</div>' +
          '<div id="obs-pivot-fields" class="hidden grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">' +
            '<div><label class="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Pivot Type</label>' +
              '<select id="obs-pivot-type" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50">' +
                pivotTypeOptions.map(o => '<option value="' + o.value + '">' + o.label + '</option>').join('') +
              '</select></div>' +
            '<div><label class="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Magnitude</label>' +
              '<select id="obs-pivot-magnitude" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50">' +
                '<option value="">—</option><option value="high">High (&gt;10% repricing)</option><option value="medium">Medium (5-10%)</option><option value="low">Low (&lt;5%)</option>' +
              '</select></div>' +
            '<div><label class="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Catalyst Date</label>' +
              '<input id="obs-catalyst-date" type="date" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50" /></div>' +
            '<div><label class="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Reality Change</label>' +
              '<input id="obs-reality-change" type="text" placeholder="What changed?" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50" /></div>' +
          '</div>' +
        '</div>' +
        '<div class="mt-3 flex justify-end">' +
          '<button onclick="submitObservation()" class="px-4 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-semibold hover:bg-ekantik-gold-light transition-colors"><i class="fas fa-plus mr-1"></i>Add Observation</button>' +
        '</div>' +
      '</div>' +

      // Observations list
      (observations.length > 0 ?
        '<div class="space-y-4">' + observations.map(obs => {
          const tickers = obs.ticker_symbols ? JSON.parse(obs.ticker_symbols) : [];
          const catColors = { technology: 'bg-blue-500/20 text-blue-400', consumer_behavior: 'bg-pink-500/20 text-pink-400', regulatory: 'bg-amber-500/20 text-amber-400', macroeconomic: 'bg-cyan-500/20 text-cyan-400', competitive: 'bg-purple-500/20 text-purple-400' };

          // Pivot badge for observations
          let pivotBadge = '';
          if (obs.is_potential_pivot) {
            const magClass = obs.pivot_magnitude === 'high' ? 'text-red-400 bg-red-500/20' : obs.pivot_magnitude === 'medium' ? 'text-amber-400 bg-amber-500/20' : 'text-green-400 bg-green-500/20';
            const icon = pivotTypeIcons[obs.pivot_type] || '<i class="fas fa-bolt"></i>';
            const label = pivotTypeLabels[obs.pivot_type] || 'PIVOT';
            pivotBadge =
              '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400">' +
                '<i class="fas fa-bolt text-amber-400"></i> PIVOT: ' + icon + ' ' + label +
              '</span>' +
              (obs.pivot_magnitude ? '<span class="px-2 py-0.5 rounded text-[10px] font-semibold ' + magClass + '">' + obs.pivot_magnitude.toUpperCase() + '</span>' : '') +
              (obs.catalyst_date ? '<span class="text-[10px] text-gray-500"><i class="fas fa-calendar mr-1"></i>' + obs.catalyst_date + '</span>' : '');
          }

          return '<div class="bg-ekantik-card border ' + (obs.is_potential_pivot ? 'border-amber-500/30' : 'border-ekantik-border') + ' rounded-xl p-5">' +
            '<div class="flex items-center gap-2 mb-3 flex-wrap">' +
              (obs.category ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ' + (catColors[obs.category] || 'bg-gray-500/20 text-gray-400') + '">' + obs.category.replace('_',' ') + '</span>' : '') +
              tickers.map(t => '<span class="px-2 py-0.5 bg-ekantik-bg rounded text-xs font-mono font-semibold text-white">' + t + '</span>').join('') +
              (obs.is_promoted ? '<span class="px-2 py-0.5 bg-ekantik-gold/20 text-ekantik-gold rounded text-[10px] font-bold"><i class="fas fa-arrow-up mr-1"></i>PROMOTED</span>' : '') +
              pivotBadge +
              '<span class="ml-auto text-xs text-gray-500">' + obs.created_at + '</span>' +
            '</div>' +
            (obs.is_potential_pivot && obs.reality_change ? '<p class="text-amber-400/80 text-xs italic mb-3 pl-1"><i class="fas fa-bolt mr-1 text-amber-500"></i>Reality Change: ' + obs.reality_change + '</p>' : '') +
            '<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">' +
              '<div class="border-l-2 border-ekantik-accent pl-3">' +
                '<h4 class="text-[10px] text-ekantik-accent uppercase tracking-wider font-bold mb-1">This Happened</h4>' +
                '<p class="text-gray-300 text-sm leading-relaxed">' + obs.happened_text + '</p>' +
              '</div>' +
              '<div class="border-l-2 border-ekantik-gold pl-3">' +
                '<h4 class="text-[10px] text-ekantik-gold uppercase tracking-wider font-bold mb-1">Why It Matters</h4>' +
                '<p class="text-gray-300 text-sm leading-relaxed">' + obs.why_matters + '</p>' +
              '</div>' +
              '<div class="border-l-2 border-ekantik-green pl-3">' +
                '<h4 class="text-[10px] text-ekantik-green uppercase tracking-wider font-bold mb-1">Watch Next</h4>' +
                '<p class="text-gray-300 text-sm leading-relaxed">' + obs.watch_next + '</p>' +
              '</div>' +
            '</div>' +
            (obs.kpi ? '<div class="mt-3 pt-3 border-t border-ekantik-border/50 text-xs text-gray-500"><i class="fas fa-chart-bar mr-1 text-ekantik-gold"></i>KPI: <span class="text-gray-300">' + obs.kpi + '</span></div>' : '') +
          '</div>';
        }).join('') + '</div>'
      : '<div class="text-center py-12 text-gray-500">No observations yet. Start logging your investment observations above.</div>');

  } catch(e) { console.error('Observations load failed', e); }
})();

function toggleObsPivotFields() {
  const isChecked = document.getElementById('obs-is-pivot').checked;
  document.getElementById('obs-pivot-fields').classList.toggle('hidden', !isChecked);
}

async function submitObservation() {
  const happened = document.getElementById('obs-happened').value;
  const why = document.getElementById('obs-why').value;
  const watch = document.getElementById('obs-watch').value;
  const tickersStr = document.getElementById('obs-tickers').value;
  const category = document.getElementById('obs-category').value;
  const kpi = document.getElementById('obs-kpi').value;

  if (!happened || !why || !watch) { alert('Please fill in all three observation fields'); return; }

  const tickers = tickersStr.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);

  // Pivot fields
  const isPivot = document.getElementById('obs-is-pivot').checked;
  const pivotType = isPivot ? document.getElementById('obs-pivot-type').value : null;
  const pivotMagnitude = isPivot ? document.getElementById('obs-pivot-magnitude').value : null;
  const catalystDate = isPivot ? document.getElementById('obs-catalyst-date').value : null;
  const realityChange = isPivot ? document.getElementById('obs-reality-change').value : null;

  try {
    await fetch('/api/observations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        happened_text: happened, why_matters: why, watch_next: watch,
        ticker_symbols: tickers, category, kpi,
        is_potential_pivot: isPivot,
        pivot_type: pivotType || undefined,
        pivot_magnitude: pivotMagnitude || undefined,
        catalyst_date: catalystDate || undefined,
        reality_change: realityChange || undefined,
      })
    });
    location.reload();
  } catch(e) { alert('Error saving observation'); }
}

// ── Observation Files Management ─────────────────────────

async function loadObsFiles() {
  try {
    const res = await fetch('/api/observations/files');
    const data = await res.json();
    _obsFiles = data.files || [];
    updateObsFilesBadge();
    renderObsFilesList();
    populateObsLinkDropdown();
  } catch(e) { console.error('Failed to load observation files', e); }
}

function updateObsFilesBadge() {
  var badge = document.getElementById('obs-files-badge');
  if (badge) {
    if (_obsFiles.length > 0) {
      badge.textContent = _obsFiles.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

function populateObsLinkDropdown() {
  var sel = document.getElementById('obs-file-link');
  if (!sel) return;
  var html = '<option value="">General (no specific observation)</option>';
  _obsObservations.forEach(function(obs) {
    var label = (obs.happened_text || '').substring(0, 60);
    var tickers = obs.ticker_symbols ? JSON.parse(obs.ticker_symbols) : [];
    var prefix = tickers.length > 0 ? '[' + tickers.join(',') + '] ' : '';
    html += '<option value="' + obs.id + '">' + prefix + label + (label.length >= 60 ? '...' : '') + '</option>';
  });
  sel.innerHTML = html;
}

function renderObsFilesList() {
  var container = document.getElementById('obs-files-list');
  if (!container) return;
  if (_obsFiles.length === 0) {
    container.innerHTML = '<div class="text-center py-6 text-gray-500 text-sm">No files uploaded yet. Upload research reports, analysis notes, or any supporting documents.</div>';
    return;
  }
  container.innerHTML = _obsFiles.map(function(f) {
    var isText = ['text/markdown','text/plain','text/csv','application/octet-stream'].includes(f.file_type) || /\\.(md|txt|csv)$/i.test(f.file_name);
    var sizeStr = f.file_size < 1024 ? f.file_size + ' B' : f.file_size < 1048576 ? (f.file_size/1024).toFixed(1) + ' KB' : (f.file_size/1048576).toFixed(1) + ' MB';
    var icon = /\\.pdf$/i.test(f.file_name) ? 'fa-file-pdf text-red-400' : /\\.(doc|docx)$/i.test(f.file_name) ? 'fa-file-word text-blue-400' : /\\.(xls|xlsx)$/i.test(f.file_name) ? 'fa-file-excel text-green-400' : /\\.csv$/i.test(f.file_name) ? 'fa-file-csv text-green-400' : 'fa-file-alt text-teal-400';
    var linkedLabel = '';
    if (f.observation_id) {
      var obs = _obsObservations.find(function(o) { return o.id === f.observation_id; });
      if (obs) {
        var tks = obs.ticker_symbols ? JSON.parse(obs.ticker_symbols) : [];
        linkedLabel = '<span class="text-[10px] text-amber-400"><i class="fas fa-link mr-1"></i>Linked to: ' + (tks.length > 0 ? tks.join(',') + ' — ' : '') + (obs.happened_text||'').substring(0,40) + '</span>';
      }
    }
    return '<div class="bg-ekantik-surface rounded-lg p-3 flex items-center gap-3">' +
      '<i class="fas ' + icon + ' text-lg"></i>' +
      '<div class="flex-1 min-w-0">' +
        '<p class="text-sm text-white truncate">' + f.file_name + '</p>' +
        '<div class="flex items-center gap-2 flex-wrap">' +
          '<span class="text-[10px] text-gray-500">' + sizeStr + '</span>' +
          (f.notes ? '<span class="text-[10px] text-gray-400">— ' + f.notes + '</span>' : '') +
          linkedLabel +
          '<span class="text-[10px] text-gray-600">' + (f.created_at || '') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="flex items-center gap-1">' +
        (isText ? '<button onclick="previewObsFile(' + f.id + ')" class="p-1.5 text-gray-400 hover:text-teal-400" title="Preview"><i class="fas fa-eye"></i></button>' : '') +
        '<a href="/api/observations/files/' + f.id + '/download" class="p-1.5 text-gray-400 hover:text-blue-400" title="Download"><i class="fas fa-download"></i></a>' +
        '<button onclick="deleteObsFile(' + f.id + ')" class="p-1.5 text-gray-400 hover:text-red-400" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function openObsFilesModal() {
  document.getElementById('obs-files-modal').classList.remove('hidden');
  document.getElementById('obs-files-modal').style.display = 'flex';
  loadObsFiles();
}

function closeObsFilesModal() {
  document.getElementById('obs-files-modal').classList.add('hidden');
  document.getElementById('obs-files-modal').style.display = '';
}

function handleObsFileSelect(input) {
  if (!input.files || !input.files[0]) return;
  _obsSelectedFile = input.files[0];
  document.getElementById('obs-file-selected-name').textContent = _obsSelectedFile.name;
  document.getElementById('obs-file-selected-size').textContent = (_obsSelectedFile.size < 1024 ? _obsSelectedFile.size + ' B' : (_obsSelectedFile.size / 1024).toFixed(1) + ' KB');
  document.getElementById('obs-file-upload-zone').classList.add('hidden');
  document.getElementById('obs-file-upload-form').classList.remove('hidden');
}

function cancelObsFileSelect() {
  _obsSelectedFile = null;
  document.getElementById('obs-file-input').value = '';
  document.getElementById('obs-file-upload-zone').classList.remove('hidden');
  document.getElementById('obs-file-upload-form').classList.add('hidden');
  document.getElementById('obs-file-upload-status').textContent = '';
}

async function uploadObsFile() {
  if (!_obsSelectedFile) return;
  var btn = document.getElementById('obs-file-upload-btn');
  var statusEl = document.getElementById('obs-file-upload-status');
  var progressBar = document.getElementById('obs-file-upload-bar');
  var progressDiv = document.getElementById('obs-file-upload-progress');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Uploading...';
  progressDiv.classList.remove('hidden');
  progressBar.style.width = '30%';
  statusEl.textContent = 'Uploading...';

  try {
    var formData = new FormData();
    formData.append('file', _obsSelectedFile);
    var notes = document.getElementById('obs-file-notes').value;
    if (notes) formData.append('notes', notes);
    var obsId = document.getElementById('obs-file-link').value;
    if (obsId) formData.append('observation_id', obsId);

    progressBar.style.width = '60%';
    var res = await fetch('/api/observations/files', { method: 'POST', body: formData });
    var data = await res.json();
    progressBar.style.width = '100%';

    if (data.error) {
      statusEl.textContent = 'Error: ' + data.error;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-upload mr-1"></i> Retry';
      return;
    }

    statusEl.textContent = 'Uploaded successfully!';
    setTimeout(function() {
      cancelObsFileSelect();
      loadObsFiles();
    }, 800);
  } catch(e) {
    statusEl.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-upload mr-1"></i> Retry';
    progressBar.style.width = '100%';
  }
}

async function deleteObsFile(fileId) {
  if (!confirm('Delete this file?')) return;
  try {
    await fetch('/api/observations/files/' + fileId, { method: 'DELETE' });
    loadObsFiles();
  } catch(e) { alert('Error deleting file'); }
}

async function previewObsFile(fileId) {
  try {
    var res = await fetch('/api/observations/files/' + fileId + '/preview');
    var data = await res.json();
    if (data.error) { alert(data.error); return; }
    document.getElementById('obs-preview-title').textContent = data.file_name;
    var body = document.getElementById('obs-preview-body');
    var text = data.preview || '';
    // Simple markdown-to-HTML
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    text = text.replace(new RegExp('^### (.+)$', 'gm'), '<h3 class="text-white font-bold text-sm mt-4 mb-1">$1</h3>');
    text = text.replace(new RegExp('^## (.+)$', 'gm'), '<h2 class="text-white font-bold text-base mt-5 mb-2">$1</h2>');
    text = text.replace(new RegExp('^# (.+)$', 'gm'), '<h1 class="text-white font-bold text-lg mt-5 mb-2">$1</h1>');
    text = text.replace(new RegExp('\\\\*\\\\*(.+?)\\\\*\\\\*', 'g'), '<strong class="text-white">$1</strong>');
    text = text.replace(new RegExp('^- (.+)$', 'gm'), '<li class="text-gray-300 text-sm ml-4">$1</li>');
    text = text.replace(new RegExp('^(\\\\d+)\\\\. (.+)$', 'gm'), '<li class="text-gray-300 text-sm ml-4">$1. $2</li>');
    text = text.replace(new RegExp('\\\\n{2,}', 'g'), '<br/><br/>');
    text = text.replace(new RegExp('\\\\n', 'g'), '<br/>');
    body.innerHTML = '<div class="prose prose-invert max-w-none">' + text + '</div>';
    document.getElementById('obs-file-preview-modal').classList.remove('hidden');
    document.getElementById('obs-file-preview-modal').style.display = 'flex';
  } catch(e) { alert('Failed to load preview'); }
}

function closeObsFilePreview() {
  document.getElementById('obs-file-preview-modal').classList.add('hidden');
  document.getElementById('obs-file-preview-modal').style.display = '';
}

// Load file count on page load
(async function() {
  try {
    var res = await fetch('/api/observations/files');
    var data = await res.json();
    _obsFiles = data.files || [];
    updateObsFilesBadge();
  } catch(e) {}
})();
`


export { observationsRoutes }
