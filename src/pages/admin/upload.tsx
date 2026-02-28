import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const uploadRoutes = new Hono<{ Bindings: Bindings }>()

uploadRoutes.get('/admin/upload', (c) => {
  return c.render(
    <Layout active="upload">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Upload <span class="text-ekantik-gold italic">Content</span></h1>
            <p class="text-gray-400 text-sm mt-1">Upload .md files with YAML frontmatter to publish intelligence</p>
          </div>
          <a href="/admin/queue" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm font-semibold hover:border-ekantik-gold/50 hover:text-ekantik-gold transition-colors flex items-center gap-2">
            <i class="fas fa-tasks"></i> Review Queue
          </a>
        </div>

        {/* Upload Zone */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-8 mb-6">
          <div id="upload-zone" class="border-2 border-dashed border-ekantik-border rounded-xl p-12 text-center hover:border-ekantik-gold/50 transition-colors cursor-pointer" onclick="document.getElementById('file-input').click()">
            <input type="file" id="file-input" class="hidden" accept=".md,.txt" onchange="handleFileUpload(this)" />
            <i class="fas fa-cloud-upload-alt text-4xl text-gray-500 mb-4"></i>
            <h3 class="text-lg text-white font-semibold mb-2">Drop a .md file here or click to browse</h3>
            <p class="text-gray-500 text-sm">Markdown with YAML frontmatter — parsed automatically</p>
            <p class="text-gray-600 text-[10px] mt-2">Supported: .md, .txt files with --- delimited YAML frontmatter</p>
          </div>
        </div>

        {/* Manual Entry */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 mb-6">
          <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-edit mr-2 text-ekantik-gold"></i>Manual Entry</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Ticker(s) *</label>
                <input id="manual-ticker" type="text" placeholder="CRWD" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Category *</label>
                <select id="manual-category" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
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
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Impact *</label>
                <select id="manual-impact" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Conviction *</label>
                <select id="manual-conviction" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Title *</label>
              <input id="manual-title" type="text" placeholder="CrowdStrike Dislocation: 35% Drop on Temporary Tariff Scare" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Framework Source</label>
                <select id="manual-framework" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                  <option value="">Select framework...</option>
                  <option value="material_events">Material Events Research</option>
                  <option value="dislocation">Stock Dislocation Detection</option>
                  <option value="doubler">Stock Doubler Identification</option>
                  <option value="episodic_pivot">Episodic Pivot Identification</option>
                  <option value="bias_mode">Bias Mode Detection</option>
                  <option value="disruption">Disruption & Superlative Detection</option>
                  <option value="ai_scorer">Earnings Architecture Intelligence</option>
                  <option value="social_sentiment">Social Sentiment Scanner</option>
                  <option value="mag7_monitor">Magnificent 7 Monitor</option>
                  <option value="aomg_scanner">AOMG Growth Scanner</option>
                  <option value="hot_macro">S&P Correction Estimation</option>
                  <option value="hot_micro">5-Phase Parabolic Lifecycle</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Catalyst Date</label>
                <input id="manual-catalyst-date" type="date" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Analysis Content * (Markdown)</label>
              <textarea id="manual-body" rows={12} placeholder="# Analysis&#10;&#10;Your full markdown analysis here..." class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 font-mono focus:outline-none focus:border-ekantik-gold/50 resize-y"></textarea>
            </div>
            <div class="flex items-center justify-between pt-2">
              <span id="manual-status" class="text-xs text-gray-500"></span>
              <div class="flex gap-3">
                <button onclick="saveAsDraft()" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm font-semibold hover:border-ekantik-gold/50 hover:text-ekantik-gold transition-colors">
                  <i class="fas fa-save mr-1"></i> Save Draft
                </button>
                <button onclick="publishNow()" class="px-5 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors">
                  <i class="fas fa-paper-plane mr-1"></i> Publish Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Convert from Existing Reports */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-exchange-alt mr-2 text-ekantik-gold"></i>Convert from Research Report</h3>
          <p class="text-gray-400 text-sm mb-4">Convert an existing internal research report to a subscriber-facing intelligence entry.</p>
          <div class="flex gap-3">
            <input id="convert-report-id" type="text" placeholder="Paste report ID..." class="flex-1 bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 font-mono focus:outline-none focus:border-ekantik-gold/50" />
            <button onclick="convertReport()" class="px-4 py-2 bg-ekantik-accent text-white rounded-lg text-sm font-semibold hover:bg-ekantik-accent/80 transition-colors">
              <i class="fas fa-exchange-alt mr-1"></i> Convert
            </button>
          </div>
          <div id="convert-status" class="mt-2 text-xs text-gray-500"></div>
        </div>

        {/* Upload Preview */}
        <div id="upload-preview" class="hidden mt-6 bg-ekantik-card border border-ekantik-border rounded-2xl overflow-hidden">
          <div class="flex items-center justify-between p-5 border-b border-ekantik-border">
            <h3 class="text-lg font-bold text-white"><i class="fas fa-eye mr-2 text-ekantik-gold"></i>Upload Preview</h3>
            <button onclick="clearPreview()" class="text-gray-400 hover:text-white text-sm"><i class="fas fa-times"></i></button>
          </div>
          <div class="grid grid-cols-2 divide-x divide-ekantik-border">
            <div class="p-5">
              <h4 class="text-xs text-gray-400 uppercase tracking-wider mb-3">Parsed Frontmatter</h4>
              <pre id="preview-frontmatter" class="text-xs text-gray-300 font-mono bg-ekantik-bg rounded-lg p-3 overflow-auto max-h-64"></pre>
            </div>
            <div class="p-5">
              <h4 class="text-xs text-gray-400 uppercase tracking-wider mb-3">Rendered Preview</h4>
              <div id="preview-body" class="prose prose-invert prose-sm max-w-none max-h-64 overflow-auto"></div>
            </div>
          </div>
          <div id="preview-errors" class="hidden px-5 py-3 bg-ekantik-red/10 border-t border-ekantik-red/20">
            <span class="text-ekantik-red text-xs font-semibold"><i class="fas fa-exclamation-triangle mr-1"></i>Validation Issues:</span>
            <span id="preview-errors-text" class="text-ekantik-red text-xs ml-2"></span>
          </div>
          <div class="p-5 border-t border-ekantik-border flex justify-end gap-3">
            <button onclick="sendToQueue()" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm font-semibold hover:border-ekantik-gold/50">
              <i class="fas fa-tasks mr-1"></i> Send to Queue
            </button>
            <button onclick="publishUploaded()" class="px-5 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light">
              <i class="fas fa-paper-plane mr-1"></i> Publish Now
            </button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: uploadScript }} />
    </Layout>,
    { title: 'Upload Content — Ekantik Capital' }
  )
})

const uploadScript = `
let _uploadedId = null;

async function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const text = await file.text();

  try {
    const res = await fetch('/api/admin/content/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, filename: file.name })
    });
    const data = await res.json();
    if (data.error) { alert('Upload error: ' + data.error); return; }

    _uploadedId = data.id;

    // Show preview
    document.getElementById('upload-preview').classList.remove('hidden');
    document.getElementById('preview-frontmatter').textContent = JSON.stringify(data.frontmatter || {}, null, 2);

    if (data.missingFields && data.missingFields.length > 0) {
      document.getElementById('preview-errors').classList.remove('hidden');
      document.getElementById('preview-errors-text').textContent = data.missingFields.join(', ');
    } else {
      document.getElementById('preview-errors').classList.add('hidden');
    }

    document.getElementById('preview-body').innerHTML = '<p class="text-gray-400 text-sm">Entry created as ' + data.status + '. ID: ' + data.id + '</p>';
  } catch(e) {
    alert('Upload failed: ' + e.message);
  }
  input.value = '';
}

function clearPreview() {
  document.getElementById('upload-preview').classList.add('hidden');
  _uploadedId = null;
}

async function publishUploaded() {
  if (!_uploadedId) return;
  try {
    const res = await fetch('/api/admin/content/' + _uploadedId + '/publish', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert('Published successfully!');
      clearPreview();
    } else {
      alert('Publish failed: ' + (data.error || 'Unknown error'));
    }
  } catch(e) { alert('Error: ' + e.message); }
}

async function sendToQueue() {
  if (!_uploadedId) return;
  alert('Entry is already in the review queue. Visit /admin/queue to manage it.');
  clearPreview();
}

async function saveAsDraft() {
  const title = document.getElementById('manual-title').value;
  const body_markdown = document.getElementById('manual-body').value;
  if (!title || !body_markdown) { alert('Title and content are required'); return; }

  const entry = {
    title,
    body_markdown,
    ticker_symbols: document.getElementById('manual-ticker').value.split(',').map(t => t.trim().toUpperCase()).filter(Boolean),
    category: document.getElementById('manual-category').value,
    impact_score: document.getElementById('manual-impact').value,
    conviction_level: document.getElementById('manual-conviction').value,
    framework_source: document.getElementById('manual-framework').value || null,
    catalyst_date: document.getElementById('manual-catalyst-date').value || null,
  };

  try {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('manual-status').innerHTML = '<span class="text-ekantik-green"><i class="fas fa-check mr-1"></i>Saved as draft (ID: ' + data.id + ')</span>';
      setTimeout(() => { document.getElementById('manual-status').textContent = ''; }, 5000);
    } else {
      document.getElementById('manual-status').innerHTML = '<span class="text-ekantik-red">' + (data.error || 'Failed') + '</span>';
    }
  } catch(e) {
    document.getElementById('manual-status').innerHTML = '<span class="text-ekantik-red">Error: ' + e.message + '</span>';
  }
}

async function publishNow() {
  const title = document.getElementById('manual-title').value;
  const body_markdown = document.getElementById('manual-body').value;
  if (!title || !body_markdown) { alert('Title and content are required'); return; }

  const entry = {
    title,
    body_markdown,
    ticker_symbols: document.getElementById('manual-ticker').value.split(',').map(t => t.trim().toUpperCase()).filter(Boolean),
    category: document.getElementById('manual-category').value,
    impact_score: document.getElementById('manual-impact').value,
    conviction_level: document.getElementById('manual-conviction').value,
    framework_source: document.getElementById('manual-framework').value || null,
    catalyst_date: document.getElementById('manual-catalyst-date').value || null,
  };

  try {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    const data = await res.json();
    if (data.success) {
      const pubRes = await fetch('/api/admin/content/' + data.id + '/publish', { method: 'POST' });
      const pubData = await pubRes.json();
      if (pubData.success) {
        document.getElementById('manual-status').innerHTML = '<span class="text-ekantik-green"><i class="fas fa-check mr-1"></i>Published! Visible on subscriber feed.</span>';
      }
    }
  } catch(e) {
    document.getElementById('manual-status').innerHTML = '<span class="text-ekantik-red">Error: ' + e.message + '</span>';
  }
}

async function convertReport() {
  const reportId = document.getElementById('convert-report-id').value.trim();
  if (!reportId) { alert('Enter a report ID'); return; }
  try {
    const res = await fetch('/api/admin/content/from-report/' + reportId, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      document.getElementById('convert-status').innerHTML = '<span class="text-ekantik-green"><i class="fas fa-check mr-1"></i>Converted! "' + data.title + '" — <a href="/admin/queue" class="underline">View in Queue</a></span>';
    } else {
      document.getElementById('convert-status').innerHTML = '<span class="text-ekantik-red">' + (data.error || 'Failed') + '</span>';
    }
  } catch(e) {
    document.getElementById('convert-status').innerHTML = '<span class="text-ekantik-red">Error: ' + e.message + '</span>';
  }
}
`

export { uploadRoutes }
