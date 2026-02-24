import { Hono } from 'hono'
import { Layout } from './components/layout'

type Bindings = { DB: D1Database }

export const pageRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// DASHBOARD — Intelligence Feed
// ============================================================
pageRoutes.get('/', (c) => {
  return c.render(
    <Layout active="dashboard">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Live <span class="text-ekantik-gold italic">Edge</span> Dashboard</h1>
            <p class="text-gray-400 text-sm mt-1">Real-time intelligence feed — all research outputs across agents</p>
          </div>
          <div class="flex items-center gap-3">
            <select id="filter-agent" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
              <option value="">All Agents</option>
              <option value="material_events">Material Events</option>
              <option value="bias_mode">Bias Mode</option>
              <option value="mag7_monitor">Mag 7 Monitor</option>
              <option value="aomg_scanner">AOMG Scanner</option>
              <option value="hot_micro">Hot Micro</option>
              <option value="hot_macro">Hot Macro</option>
              <option value="doubler">Doubler</option>
              <option value="ai_scorer">AI Scorer</option>
              <option value="social_sentiment">Social Sentiment</option>
              <option value="episodic_pivot">Episodic Pivot</option>
              <option value="disruption">Disruption</option>
              <option value="dislocation">Dislocation</option>
            </select>
            <select id="filter-impact" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
              <option value="">All Impact</option>
              <option value="H">High</option>
              <option value="M">Medium</option>
              <option value="L">Low</option>
            </select>
            <select id="filter-pivot" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
              <option value="">All Pivots</option>
              <option value="has_pivot">Has Pivot</option>
              <option value="no_pivot">No Pivot</option>
              <option value="earnings_surprise">Earnings Surprise</option>
              <option value="regulatory_shift">Regulatory Shift</option>
              <option value="management_change">Management Change</option>
              <option value="product_inflection">Product Inflection</option>
              <option value="macro_regime">Macro Regime</option>
              <option value="geopolitical">Geopolitical</option>
              <option value="narrative_collapse">Narrative Collapse</option>
              <option value="competitive_moat">Competitive Moat</option>
              <option value="capital_event">Capital Event</option>
            </select>
            <select id="filter-date" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range...</option>
            </select>
            {/* Custom date range inputs — hidden until "Custom Range" is selected */}
            <div id="custom-date-range" class="hidden flex items-center gap-2">
              <input id="filter-date-from" type="date" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-2 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
              <span class="text-gray-500 text-xs">to</span>
              <input id="filter-date-to" type="date" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-2 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
            </div>
            <button onclick="document.getElementById('research-modal').classList.remove('hidden')" class="px-4 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-semibold hover:bg-ekantik-gold-light transition-colors flex items-center gap-2">
              <i class="fas fa-bolt"></i> Run Research
            </button>
            <button onclick="document.getElementById('import-modal').classList.remove('hidden')" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm font-semibold hover:border-ekantik-gold/50 hover:text-ekantik-gold transition-colors flex items-center gap-2">
              <i class="fas fa-file-import"></i> Import
            </button>
          </div>
        </div>

        {/* Run Research Modal */}
        <div id="research-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-bolt mr-2 text-ekantik-gold"></i>Run Research</h3>
              <button onclick="document.getElementById('research-modal').classList.add('hidden')" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Agent</label>
                <select id="run-agent" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                  <option value="material_events">Material Events Intelligence</option>
                  <option value="bias_mode">Bias Mode Detection</option>
                  <option value="mag7_monitor">Magnificent 7 Scorecard</option>
                  <option value="ai_scorer">AI Scoring Framework</option>
                  <option value="hot_micro">Hot Micro Trend Pipeline</option>
                  <option value="hot_macro">Hot Macro Events</option>
                  <option value="doubler">Doubling Potential Analysis</option>
                  <option value="social_sentiment">Social Sentiment Scanner</option>
                  <option value="episodic_pivot">Episodic Pivot Scanner</option>
                  <option value="disruption">Disruption & Superlative Detection</option>
                  <option value="dislocation">Dislocation Detection</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Ticker(s) <span class="text-gray-500">(comma-separated, leave empty for Mag 7)</span></label>
                <input id="run-tickers" type="text" placeholder="NVDA, MSFT" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Additional Context <span class="text-gray-500">(optional)</span></label>
                <textarea id="run-context" rows={2} placeholder="Any specific focus or question..." class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 resize-none"></textarea>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-xs text-gray-500" id="run-status"></span>
                <button onclick="runResearch()" id="run-btn" class="px-5 py-2.5 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors flex items-center gap-2">
                  <i class="fas fa-play"></i> Execute Research
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Import Report Modal */}
        <div id="import-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-file-import mr-2 text-ekantik-gold"></i>Import External Research</h3>
              <button onclick="document.getElementById('import-modal').classList.add('hidden')" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <p class="text-xs text-gray-500 mb-4">Paste a research report from Claude Desktop or any other source. Tickers and agent type will be auto-detected if not specified.</p>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Agent Type <span class="text-gray-500">(auto-detected if empty)</span></label>
                  <select id="import-agent" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                    <option value="">Auto-detect</option>
                    <option value="material_events">Material Events Intelligence</option>
                    <option value="bias_mode">Bias Mode Detection</option>
                    <option value="mag7_monitor">Magnificent 7 Scorecard</option>
                    <option value="ai_scorer">AI Scoring Framework</option>
                    <option value="hot_micro">Hot Micro Trend Pipeline</option>
                    <option value="hot_macro">Hot Macro Events</option>
                    <option value="doubler">Doubling Potential Analysis</option>
                    <option value="aomg_scanner">AOMG Growth Scanner</option>
                    <option value="social_sentiment">Social Sentiment Scanner</option>
                    <option value="episodic_pivot">Episodic Pivot Scanner</option>
                    <option value="disruption">Disruption & Superlative Detection</option>
                    <option value="dislocation">Dislocation Detection</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Ticker(s) <span class="text-gray-500">(auto-detected if empty)</span></label>
                  <input id="import-tickers" type="text" placeholder="NVDA, MSFT" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Report Content <span class="text-red-400">*</span></label>
                <textarea id="import-content" rows={10} placeholder="Paste your Claude Desktop research report here...&#10;&#10;Supports markdown and JSON blocks. If the report contains a ```json block, it will be parsed for structured data automatically." class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 resize-y font-mono"></textarea>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-xs text-gray-500" id="import-status"></span>
                <button onclick="importReport()" id="import-btn" class="px-5 py-2.5 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors flex items-center gap-2">
                  <i class="fas fa-file-import"></i> Save to Portal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div class="grid grid-cols-5 gap-4 mb-6" id="stats-grid">
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs uppercase tracking-wide">Total Reports</span>
              <i class="fas fa-file-alt text-ekantik-gold/50"></i>
            </div>
            <div class="text-2xl font-bold text-white mt-2" id="stat-reports">—</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs uppercase tracking-wide">High Impact</span>
              <i class="fas fa-exclamation-triangle text-ekantik-red/50"></i>
            </div>
            <div class="text-2xl font-bold text-ekantik-red mt-2" id="stat-high">—</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs uppercase tracking-wide">Watchlist</span>
              <i class="fas fa-binoculars text-ekantik-accent/50"></i>
            </div>
            <div class="text-2xl font-bold text-ekantik-accent mt-2" id="stat-watchlist">—</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs uppercase tracking-wide">Active Signals</span>
              <i class="fas fa-signal text-ekantik-green/50"></i>
            </div>
            <div class="text-2xl font-bold text-ekantik-green mt-2" id="stat-signals">—</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs uppercase tracking-wide">Open Positions</span>
              <i class="fas fa-chart-line text-ekantik-amber/50"></i>
            </div>
            <div class="text-2xl font-bold text-ekantik-amber mt-2" id="stat-positions">—</div>
          </div>
        </div>

        {/* Research Feed */}
        <div id="research-feed" class="space-y-4">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading intelligence feed...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: dashboardScript }} />
    </Layout>,
    { title: 'Intelligence Feed — Ekantik Capital' }
  )
})

// ============================================================
// WATCHLIST
// ============================================================
pageRoutes.get('/watchlist', (c) => {
  return c.render(
    <Layout active="watchlist">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Watchlist <span class="text-ekantik-gold italic">Intelligence</span></h1>
            <p class="text-gray-400 text-sm mt-1">Active surveillance on all tracked tickers with AI scoring</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="document.getElementById('bulk-import-modal').classList.remove('hidden')" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border rounded-lg text-sm font-semibold text-gray-300 hover:border-ekantik-accent/50 hover:text-ekantik-accent transition-colors flex items-center gap-2">
              <i class="fas fa-file-import"></i> Bulk Import
            </button>
            <button onclick="document.getElementById('add-ticker-modal').classList.remove('hidden')" class="px-4 py-2 bg-ekantik-accent/20 text-ekantik-accent border border-ekantik-accent/30 rounded-lg text-sm font-semibold hover:bg-ekantik-accent/30 transition-colors flex items-center gap-2">
              <i class="fas fa-plus"></i> Add Ticker
            </button>
            <button onclick="document.getElementById('research-modal-wl').classList.remove('hidden')" class="px-4 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-semibold hover:bg-ekantik-gold-light transition-colors flex items-center gap-2">
              <i class="fas fa-bolt"></i> Run Research
            </button>
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
              <div id="lookup-result" class="hidden">
                {/* Filled dynamically by lookupTicker() */}
              </div>
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

        {/* Quick Research Modal for Watchlist */}
        <div id="research-modal-wl" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-bolt mr-2 text-ekantik-gold"></i>Quick Research</h3>
              <button onclick="document.getElementById('research-modal-wl').classList.add('hidden')" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Agent</label>
                <select id="wl-run-agent" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300">
                  <option value="material_events">Material Events Intelligence</option>
                  <option value="bias_mode">Bias Mode Detection</option>
                  <option value="ai_scorer">AI Scoring Framework</option>
                  <option value="doubler">Doubling Potential Analysis</option>
                  <option value="social_sentiment">Social Sentiment Scanner</option>
                  <option value="episodic_pivot">Episodic Pivot Scanner</option>
                  <option value="disruption">Disruption & Superlative Detection</option>
                  <option value="dislocation">Dislocation Detection</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Ticker</label>
                <input id="wl-run-ticker" type="text" placeholder="NVDA" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300" />
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-xs text-gray-500" id="wl-run-status"></span>
                <button onclick="runWlResearch()" id="wl-run-btn" class="px-5 py-2.5 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors"><i class="fas fa-play"></i> Execute</button>
              </div>
            </div>
          </div>
        </div>

        {/* Pivot Watch Modal */}
        <div id="pivot-watch-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden items-center justify-center" onclick="if(event.target===this)closePivotWatchModal()">
          <div class="bg-ekantik-card border border-amber-500/30 rounded-2xl w-full max-w-md mx-4">
            <div class="flex items-center justify-between p-5 border-b border-ekantik-border">
              <h3 class="text-lg font-bold text-white"><i class="fas fa-bolt mr-2 text-amber-400"></i>Pivot Watch — <span id="pw-symbol" class="text-amber-400"></span></h3>
              <button onclick="closePivotWatchModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-5 space-y-4">
              <p class="text-xs text-gray-400">Mark this ticker as being watched for a potential episodic pivot. You'll see it highlighted in the watchlist.</p>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Expected Pivot Type</label>
                <select id="pw-type" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="">Any / Unknown</option>
                  <option value="earnings_surprise">Earnings Surprise</option>
                  <option value="regulatory_shift">Regulatory Shift</option>
                  <option value="management_change">Management Change</option>
                  <option value="product_inflection">Product Inflection</option>
                  <option value="macro_regime">Macro Regime</option>
                  <option value="geopolitical">Geopolitical</option>
                  <option value="narrative_collapse">Narrative Collapse</option>
                  <option value="competitive_moat">Competitive Moat</option>
                  <option value="capital_event">Capital Event</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Notes (what are you watching for?)</label>
                <textarea id="pw-notes" rows={3} class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="e.g. Earnings next week, expecting beat on cloud growth..."></textarea>
              </div>
            </div>
            <div class="p-5 border-t border-ekantik-border flex justify-between gap-3">
              <button onclick="removePivotWatch()" id="pw-remove-btn" class="hidden px-4 py-2 bg-ekantik-bg text-gray-400 rounded-lg text-sm hover:text-ekantik-red hover:bg-red-500/10">Remove Watch</button>
              <div class="flex gap-3 ml-auto">
                <button onclick="closePivotWatchModal()" class="px-4 py-2 bg-ekantik-bg text-gray-400 rounded-lg text-sm hover:text-white">Cancel</button>
                <button onclick="savePivotWatch()" class="px-5 py-2 bg-amber-500 text-black rounded-lg text-sm font-semibold hover:bg-amber-400"><i class="fas fa-bolt mr-1"></i>Set Pivot Watch</button>
              </div>
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

// ============================================================
// TICKER DETAIL
// ============================================================
pageRoutes.get('/tickers/:id', (c) => {
  const id = c.req.param('id')
  return c.render(
    <Layout active="watchlist">
      <div class="fade-in" id="ticker-detail" data-ticker-id={id}>
        <div class="text-center py-12 text-gray-500">
          <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
          <p>Loading ticker intelligence...</p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: tickerDetailScript }} />
    </Layout>,
    { title: 'Ticker Detail — Ekantik Capital' }
  )
})

// ============================================================
// MAGNIFICENT 7 COMMAND CENTER
// ============================================================
pageRoutes.get('/mag7', (c) => {
  return c.render(
    <Layout active="mag7">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Magnificent 7 <span class="text-ekantik-gold italic">Command Center</span></h1>
            <p class="text-gray-400 text-sm mt-1">Weekly scorecard — monitoring the mega-cap AI leaders</p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-ekantik-green/30 text-ekantik-green text-xs">
            <i class="fas fa-sync-alt text-[10px]"></i>
            Weekly Scorecard
          </span>
        </div>
        <div id="mag7-grid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <div class="col-span-full text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading Magnificent 7 data...</p>
          </div>
        </div>
        <div id="mag7-table-container" class="mt-8"></div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: mag7Script }} />
    </Layout>,
    { title: 'Magnificent 7 — Ekantik Capital' }
  )
})

// ============================================================
// AOMG TRACKER
// ============================================================
pageRoutes.get('/aomg', (c) => {
  return c.render(
    <Layout active="aomg">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">AOMG <span class="text-ekantik-gold italic">Tracker</span></h1>
            <p class="text-gray-400 text-sm mt-1">Areas of Maximum Growth — quarterly deep scan intelligence</p>
          </div>
        </div>
        <div id="aomg-grid" class="space-y-6">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading AOMG themes...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: aomgScript }} />
    </Layout>,
    { title: 'AOMG Tracker — Ekantik Capital' }
  )
})

// ============================================================
// PORTFOLIO HEAT DASHBOARD
// ============================================================
pageRoutes.get('/heat', (c) => {
  return c.render(
    <Layout active="heat">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Portfolio <span class="text-ekantik-gold italic">Heat</span> Dashboard</h1>
            <p class="text-gray-400 text-sm mt-1">Risk exposure monitoring — total heat vs 20% ceiling</p>
          </div>
        </div>
        <div id="heat-dashboard">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading portfolio heat data...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: heatScript }} />
    </Layout>,
    { title: 'Portfolio Heat — Ekantik Capital' }
  )
})

// ============================================================
// OBSERVATIONS
// ============================================================
pageRoutes.get('/observations', (c) => {
  return c.render(
    <Layout active="observations">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Observation <span class="text-ekantik-gold italic">Log</span></h1>
            <p class="text-gray-400 text-sm mt-1">This Happened → Why It Matters → Watch Next</p>
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

// ============================================================
// TRADE JOURNAL
// ============================================================
pageRoutes.get('/journal', (c) => {
  return c.render(
    <Layout active="journal">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Trade <span class="text-ekantik-gold italic">Journal</span></h1>
            <p class="text-gray-400 text-sm mt-1">Position tracking, signals, and performance analytics</p>
          </div>
          <div class="flex gap-3">
            <button onclick="openAddSignalModal()" class="px-4 py-2 bg-ekantik-amber/20 text-ekantik-amber rounded-lg text-sm font-semibold hover:bg-ekantik-amber/30 transition-colors"><i class="fas fa-signal mr-2"></i>Add Signal</button>
            <button onclick="openAddPositionModal()" class="px-4 py-2 bg-ekantik-accent text-white rounded-lg text-sm font-semibold hover:bg-ekantik-accent/80 transition-colors"><i class="fas fa-plus mr-2"></i>Add Position</button>
          </div>
        </div>
        <div id="journal-container">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading trade journal...</p>
          </div>
        </div>
      </div>

      {/* ── Position Modal ── */}
      <div id="position-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden items-center justify-center" onclick="if(event.target===this)closePositionModal()">
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-5 border-b border-ekantik-border">
            <h3 id="pos-modal-title" class="text-lg font-bold text-white">Add Position</h3>
            <button onclick="closePositionModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-5 space-y-4">
            <input type="hidden" id="pos-edit-id" />
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-xs text-gray-400 mb-1">Ticker Symbol *</label><input id="pos-symbol" type="text" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="NVDA" /></div>
              <div><label class="block text-xs text-gray-400 mb-1">Engine *</label><select id="pos-engine" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm"><option value="stocks_leaps">Stocks / LEAPS</option><option value="options">Options</option></select></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-xs text-gray-400 mb-1">Entry Price *</label><input id="pos-entry-price" type="number" step="0.01" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="135.50" /></div>
              <div><label class="block text-xs text-gray-400 mb-1">Entry Date *</label><input id="pos-entry-date" type="date" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" /></div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div><label class="block text-xs text-gray-400 mb-1">Size % *</label><input id="pos-size" type="number" step="0.1" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="5.0" /></div>
              <div><label class="block text-xs text-gray-400 mb-1">Stop Price</label><input id="pos-stop" type="number" step="0.01" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="118.00" /></div>
              <div><label class="block text-xs text-gray-400 mb-1">Target Price</label><input id="pos-target" type="number" step="0.01" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="175.00" /></div>
            </div>
            <div><label class="block text-xs text-gray-400 mb-1">Thesis</label><textarea id="pos-thesis" rows={2} class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="Breakout above 200-day MA on volume..."></textarea></div>
            {/* ── Episodic Pivot Context ── */}
            <div class="border-t border-ekantik-border/50 pt-3">
              <label class="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" id="pos-has-pivot" class="w-4 h-4 rounded border-ekantik-border bg-ekantik-bg text-amber-500" />
                <span class="text-xs font-semibold text-amber-400"><i class="fas fa-bolt mr-1"></i>Episodic Pivot Entry</span>
              </label>
              <div id="pos-pivot-fields" class="hidden space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div><label class="block text-xs text-gray-400 mb-1">Pivot Type</label><select id="pos-pivot-type" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm"><option value="">—</option><option value="earnings_surprise">Earnings Surprise</option><option value="regulatory_shift">Regulatory Shift</option><option value="management_change">Management Change</option><option value="product_inflection">Product Inflection</option><option value="macro_regime">Macro Regime</option><option value="geopolitical">Geopolitical</option><option value="narrative_collapse">Narrative Collapse</option><option value="competitive_moat">Competitive Moat</option><option value="capital_event">Capital Event</option></select></div>
                  <div><label class="block text-xs text-gray-400 mb-1">Magnitude</label><select id="pos-pivot-magnitude" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm"><option value="">—</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                </div>
                <div><label class="block text-xs text-gray-400 mb-1">Pivot Event</label><input id="pos-pivot-event" type="text" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="e.g. Q4 earnings beat with Blackwell ramp confirmation" /></div>
                <div><label class="block text-xs text-gray-400 mb-1">Reality Change</label><input id="pos-pivot-reality" type="text" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="e.g. Market underpricing data-center demand durability" /></div>
              </div>
            </div>
          </div>
          <div class="p-5 border-t border-ekantik-border flex justify-end gap-3">
            <button onclick="closePositionModal()" class="px-4 py-2 bg-ekantik-bg text-gray-400 rounded-lg text-sm hover:text-white">Cancel</button>
            <button onclick="savePosition()" id="pos-save-btn" class="px-5 py-2 bg-ekantik-accent text-white rounded-lg text-sm font-semibold hover:bg-ekantik-accent/80">Save Position</button>
          </div>
        </div>
      </div>

      {/* ── Close Position Modal ── */}
      <div id="close-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden items-center justify-center" onclick="if(event.target===this)closeCloseModal()">
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-md mx-4">
          <div class="flex items-center justify-between p-5 border-b border-ekantik-border">
            <h3 class="text-lg font-bold text-white">Close Position — <span id="close-symbol" class="text-ekantik-gold"></span></h3>
            <button onclick="closeCloseModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-5 space-y-4">
            <input type="hidden" id="close-pos-id" />
            <div><label class="block text-xs text-gray-400 mb-1">Exit Price *</label><input id="close-exit-price" type="number" step="0.01" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" /></div>
            <div><label class="block text-xs text-gray-400 mb-1">Exit Reason</label><select id="close-reason" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm"><option value="manual_close">Manual Close</option><option value="target_hit">Target Hit</option><option value="stopped_out">Stopped Out</option><option value="thesis_invalidated">Thesis Invalidated</option><option value="rebalance">Rebalance</option></select></div>
          </div>
          <div class="p-5 border-t border-ekantik-border flex justify-end gap-3">
            <button onclick="closeCloseModal()" class="px-4 py-2 bg-ekantik-bg text-gray-400 rounded-lg text-sm hover:text-white">Cancel</button>
            <button onclick="submitClosePosition()" class="px-5 py-2 bg-ekantik-red text-white rounded-lg text-sm font-semibold hover:bg-ekantik-red/80">Close Position</button>
          </div>
        </div>
      </div>

      {/* ── Signal Modal ── */}
      <div id="signal-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden items-center justify-center" onclick="if(event.target===this)closeSignalModal()">
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-5 border-b border-ekantik-border">
            <h3 id="sig-modal-title" class="text-lg font-bold text-white">Add Signal</h3>
            <button onclick="closeSignalModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-5 space-y-4">
            <input type="hidden" id="sig-edit-id" />
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-xs text-gray-400 mb-1">Ticker Symbol *</label><input id="sig-symbol" type="text" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="NVDA" /></div>
              <div><label class="block text-xs text-gray-400 mb-1">Signal Type *</label><select id="sig-type" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm"><option value="breakout">Breakout</option><option value="dislocation">Dislocation</option><option value="reversal">Reversal</option><option value="consolidation">Consolidation</option><option value="episodic_pivot">Episodic Pivot</option></select></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-xs text-gray-400 mb-1">Engine *</label><select id="sig-engine" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm"><option value="stocks_leaps">Stocks / LEAPS</option><option value="options">Options</option></select></div>
              <div><label class="block text-xs text-gray-400 mb-1">Confidence (1-10)</label><input id="sig-confidence" type="number" step="0.1" min="1" max="10" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="7.5" /></div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div><label class="block text-xs text-gray-400 mb-1">Entry Price</label><input id="sig-entry" type="number" step="0.01" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" /></div>
              <div><label class="block text-xs text-gray-400 mb-1">Stop Price</label><input id="sig-stop" type="number" step="0.01" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" /></div>
              <div><label class="block text-xs text-gray-400 mb-1">Target Price</label><input id="sig-target" type="number" step="0.01" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" /></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-xs text-gray-400 mb-1">Position Size %</label><input id="sig-size" type="number" step="0.1" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="5.0" /></div>
              <div><label class="block text-xs text-gray-400 mb-1">Time Horizon</label><input id="sig-horizon" type="text" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="2-4 weeks" /></div>
            </div>
            <div><label class="block text-xs text-gray-400 mb-1">Thesis</label><textarea id="sig-thesis" rows={2} class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="Signal thesis..."></textarea></div>
            <div><label class="block text-xs text-gray-400 mb-1">Invalidation Criteria</label><input id="sig-invalidation" type="text" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm" placeholder="Break below 200-day MA" /></div>
            {/* ── Pivot Context (visible when signal_type = episodic_pivot) ── */}
            <div id="sig-pivot-fields" class="hidden border-t border-ekantik-border/50 pt-3 space-y-3">
              <h4 class="text-xs font-semibold text-amber-400"><i class="fas fa-bolt mr-1"></i>Episodic Pivot Details</h4>
              <div><label class="block text-xs text-gray-400 mb-1">Pivot Event</label><input id="sig-pivot-event" type="text" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="e.g. FDA approval for lead drug candidate" /></div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="block text-xs text-gray-400 mb-1">Magnitude</label><select id="sig-pivot-magnitude" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm"><option value="">—</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                <div><label class="block text-xs text-gray-400 mb-1">Reality Change</label><input id="sig-pivot-reality" type="text" class="w-full bg-ekantik-bg border border-amber-500/30 rounded-lg px-3 py-2 text-white text-sm" placeholder="What changed?" /></div>
              </div>
            </div>
          </div>
          <div class="p-5 border-t border-ekantik-border flex justify-end gap-3">
            <button onclick="closeSignalModal()" class="px-4 py-2 bg-ekantik-bg text-gray-400 rounded-lg text-sm hover:text-white">Cancel</button>
            <button onclick="saveSignal()" id="sig-save-btn" class="px-5 py-2 bg-ekantik-amber text-black rounded-lg text-sm font-semibold hover:bg-ekantik-amber/80">Save Signal</button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: journalScript }} />
    </Layout>,
    { title: 'Trade Journal — Ekantik Capital' }
  )
})

// ============================================================
// SETTINGS
// ============================================================
pageRoutes.get('/settings', (c) => {
  return c.render(
    <Layout active="settings">
      <div class="fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">System <span class="text-ekantik-gold italic">Settings</span></h1>
          <p class="text-gray-400 text-sm mt-1">Platform configuration and scheduled job management</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Slack Integration ── */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4"><i class="fab fa-slack mr-2 text-ekantik-gold"></i>Slack Integration</h3>
            <div id="slack-config-container">
              <div class="text-center py-4 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading Slack configuration...</div>
            </div>
          </div>

          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-sliders-h mr-2 text-ekantik-gold"></i>Portfolio Configuration</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between py-2 border-b border-ekantik-border">
                <span class="text-gray-400 text-sm">Market Mode</span>
                <span class="px-3 py-1 bg-ekantik-green/20 text-ekantik-green rounded-full text-xs font-semibold">BULL</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-ekantik-border">
                <span class="text-gray-400 text-sm">Portfolio Equity</span>
                <span class="text-white font-semibold">$100,000</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-ekantik-border">
                <span class="text-gray-400 text-sm">Heat Ceiling</span>
                <span class="text-white font-semibold">20%</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-ekantik-border">
                <span class="text-gray-400 text-sm">Stocks/LEAPS Risk Cap</span>
                <span class="text-white font-semibold">14%</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-400 text-sm">Options Risk Cap</span>
                <span class="text-white font-semibold">6%</span>
              </div>
            </div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-clock mr-2 text-ekantik-gold"></i>Scheduled Jobs</h3>
            <div class="space-y-3">
              {[
                { name: 'Daily Macro Scan', cron: 'Mon-Fri 7:00 AM CT', status: 'active' },
                { name: 'Daily Trigger Check', cron: 'Mon-Fri 6:00 PM CT', status: 'active' },
                { name: 'Saturday Weekly Research', cron: 'Sat 9:00 AM CT', status: 'active' },
                { name: 'Earnings Intensification', cron: 'Every 4hrs (earnings week)', status: 'standby' },
                { name: 'Quarterly AOMG Scan', cron: '1st Sat of Q start', status: 'active' },
                { name: 'Monthly Meta-Review', cron: 'Last Sunday of month', status: 'active' },
              ].map(job => (
                <div class="flex items-center justify-between py-2 border-b border-ekantik-border last:border-0">
                  <div>
                    <div class="text-white text-sm font-medium">{job.name}</div>
                    <div class="text-gray-500 text-xs">{job.cron}</div>
                  </div>
                  <span class={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    job.status === 'active' ? 'bg-ekantik-green/20 text-ekantik-green' : 'bg-gray-700 text-gray-400'
                  }`}>{job.status}</span>
                </div>
              ))}
            </div>
          </div>
          {/* ── Daily Digest ── */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-newspaper mr-2 text-ekantik-gold"></i>Daily Digest</h3>
            <p class="text-gray-400 text-sm mb-4">Post a summary of today's research, P&L movers, and portfolio snapshot to Slack.</p>
            <button onclick="sendDailyDigest(this)" class="px-5 py-2.5 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors flex items-center gap-2">
              <i class="fas fa-paper-plane"></i> Send Daily Digest Now
            </button>
            <div id="digest-status" class="mt-3 text-xs text-gray-500"></div>
          </div>
        </div>
        <div class="mt-6 bg-ekantik-card border border-ekantik-border rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-plug mr-2 text-ekantik-gold"></i>Integration Status</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="integration-grid">
            {[
              { name: 'Claude API', icon: 'fas fa-brain', status: 'Configure', color: 'amber' },
              { name: 'Slack Bot', icon: 'fab fa-slack', status: 'Configure', color: 'amber' },
              { name: 'Alpha Vantage', icon: 'fas fa-chart-area', status: 'Configure', color: 'amber' },
              { name: 'Finnhub', icon: 'fas fa-rss', status: 'Configure', color: 'amber' },
            ].map(svc => (
              <div class="bg-ekantik-bg rounded-lg p-4 border border-ekantik-border">
                <div class="flex items-center gap-3">
                  <i class={`${svc.icon} text-ekantik-${svc.color}`}></i>
                  <div>
                    <div class="text-white text-sm font-medium">{svc.name}</div>
                    <div class={`text-ekantik-${svc.color} text-xs`}>{svc.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
    </Layout>,
    { title: 'Settings — Ekantik Capital' }
  )
})

// ============================================================
// INLINE SCRIPTS
// ============================================================

const dashboardScript = `
// ── Shared constants for rendering ────────────────────────
const agentLabels = {
  material_events: 'MATERIAL EVENTS',
  bias_mode: 'BIAS MODE',
  mag7_monitor: 'MAG 7 MONITOR',
  aomg_scanner: 'AOMG SCANNER',
  hot_micro: 'HOT MICRO',
  hot_macro: 'HOT MACRO',
  doubler: 'DOUBLER',
  ai_scorer: 'AI SCORER',
  portfolio_heat: 'PORTFOLIO HEAT',
  social_sentiment: 'SOCIAL SENTIMENT',
  episodic_pivot: 'EPISODIC PIVOT',
  disruption: 'DISRUPTION',
  dislocation: 'DISLOCATION',
};
const agentColors = {
  material_events: 'bg-blue-500/20 text-blue-400',
  bias_mode: 'bg-purple-500/20 text-purple-400',
  mag7_monitor: 'bg-yellow-500/20 text-yellow-400',
  aomg_scanner: 'bg-green-500/20 text-green-400',
  hot_micro: 'bg-pink-500/20 text-pink-400',
  hot_macro: 'bg-cyan-500/20 text-cyan-400',
  doubler: 'bg-orange-500/20 text-orange-400',
  ai_scorer: 'bg-indigo-500/20 text-indigo-400',
  social_sentiment: 'bg-teal-500/20 text-teal-400',
  episodic_pivot: 'bg-amber-500/20 text-amber-400',
  disruption: 'bg-emerald-500/20 text-emerald-400',
  dislocation: 'bg-rose-500/20 text-rose-400',
};
const impactColors = { H: 'bg-red-500/20 text-red-400', M: 'bg-amber-500/20 text-amber-400', L: 'bg-green-500/20 text-green-400' };
const impactEmoji = { H: '<i class="fas fa-circle text-red-500 text-[8px]"></i>', M: '<i class="fas fa-circle text-amber-500 text-[8px]"></i>', L: '<i class="fas fa-circle text-green-500 text-[8px]"></i>' };
const triggerIcons = { slack: 'fab fa-slack', cron: 'fas fa-clock', event: 'fas fa-bolt', portal: 'fas fa-globe', manual: 'fas fa-user' };

// ── Resolve date filter to from/to ISO strings ──────────
function resolveDateRange(preset) {
  if (!preset || preset === 'custom') return { from: null, to: null };
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from = to;
  if (preset === 'today') {
    from = to;
  } else if (preset === '7d') {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    from = d.toISOString().split('T')[0];
  } else if (preset === '30d') {
    const d = new Date(now); d.setDate(d.getDate() - 30);
    from = d.toISOString().split('T')[0];
  } else if (preset === '90d') {
    const d = new Date(now); d.setDate(d.getDate() - 90);
    from = d.toISOString().split('T')[0];
  }
  return { from, to };
}

// ── Load feed with filters ────────────────────────────────
async function loadFeed() {
  const agentFilter = document.getElementById('filter-agent').value;
  const impactFilter = document.getElementById('filter-impact').value;
  const pivotFilter = document.getElementById('filter-pivot').value;
  const datePreset = document.getElementById('filter-date').value;
  const container = document.getElementById('research-feed');

  // Show loading state
  container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-spinner fa-spin text-2xl mb-3"></i><p>Loading intelligence feed...</p></div>';

  try {
    // Build query string from active filters
    const params = new URLSearchParams();
    if (agentFilter) params.set('agent', agentFilter);
    if (impactFilter) params.set('impact', impactFilter);
    if (pivotFilter) params.set('pivot', pivotFilter);

    // Date range
    if (datePreset === 'custom') {
      const fromVal = document.getElementById('filter-date-from').value;
      const toVal = document.getElementById('filter-date-to').value;
      if (fromVal) params.set('from', fromVal);
      if (toVal) params.set('to', toVal);
    } else if (datePreset) {
      const { from, to } = resolveDateRange(datePreset);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
    }

    params.set('limit', '50');
    const qs = params.toString();

    const feedRes = await fetch('/api/research/feed' + (qs ? '?' + qs : ''));
    const { reports } = await feedRes.json();

    if (!reports || reports.length === 0) {
      const filterActive = agentFilter || impactFilter || datePreset || pivotFilter;
      container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-' + (filterActive ? 'filter' : 'inbox') + ' text-3xl mb-3"></i><p>' + (filterActive ? 'No reports match the selected filters. Try adjusting or clearing the filter.' : 'No research reports yet. Reports will appear here as they are generated.') + '</p>' + (filterActive ? '<button onclick="clearFilters()" class="mt-3 px-4 py-2 bg-ekantik-surface border border-ekantik-border rounded-lg text-sm text-gray-300 hover:border-ekantik-gold/50 transition-colors"><i class="fas fa-times mr-1"></i>Clear Filters</button>' : '') + '</div>';
      return;
    }

    container.innerHTML = reports.map(r => {
      const tickers = JSON.parse(r.ticker_symbols || '[]');
      const structured = r.structured_json ? JSON.parse(r.structured_json) : {};
      const pivot = r.episodic_pivot_json ? JSON.parse(r.episodic_pivot_json) : (structured.episodic_pivot || null);
      const timeAgo = getTimeAgo(r.created_at);

      // Pivot badge rendering
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
      let pivotBadge = '';
      if (pivot && pivot.identified) {
        const magClass = pivot.magnitude === 'high' ? 'text-red-400 bg-red-500/20' : pivot.magnitude === 'medium' ? 'text-amber-400 bg-amber-500/20' : 'text-green-400 bg-green-500/20';
        const icon = pivotTypeIcons[pivot.pivot_type] || '<i class="fas fa-bolt"></i>';
        const label = pivotTypeLabels[pivot.pivot_type] || (pivot.pivot_type || 'PIVOT').toUpperCase();
        pivotBadge = '<div class=\"mt-2 flex items-center gap-2\">' +
          '<span class=\"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400\">' +
            '<i class=\"fas fa-bolt text-amber-400\"></i> PIVOT: ' + icon + ' ' + label +
          '</span>' +
          '<span class=\"px-2 py-0.5 rounded text-[10px] font-semibold ' + magClass + '\">' + (pivot.magnitude || '').toUpperCase() + '</span>' +
          (pivot.is_perceived ? '<span class=\"text-[10px] text-gray-500 italic\">perceived</span>' : '<span class=\"text-[10px] text-emerald-500 italic\">real</span>') +
          (pivot.pricing_status ? '<span class=\"text-[10px] text-gray-500\">' + pivot.pricing_status.replace('_', ' ') + '</span>' : '') +
        '</div>';
        if (pivot.reality_change) {
          pivotBadge += '<p class=\"mt-1 text-xs text-gray-400 italic line-clamp-1\">' + escapeHtml(pivot.reality_change) + '</p>';
        }
      } else if (r.agent_type === 'episodic_pivot') {
        pivotBadge = '<div class=\"mt-2\"><span class=\"inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-500/20 text-gray-400\"><i class=\"fas fa-times-circle\"></i> NO PIVOT DETECTED</span></div>';
      }

      return '<div class="report-card bg-ekantik-card border border-ekantik-border rounded-xl p-5 cursor-pointer" onclick="toggleReport(this)">' +
        '<div class="flex items-start justify-between">' +
          '<div class="flex items-center gap-2 flex-wrap">' +
            '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ' + (agentColors[r.agent_type] || 'bg-gray-500/20 text-gray-400') + '">' + (agentLabels[r.agent_type] || r.agent_type) + '</span>' +
            tickers.map(t => '<span class="px-2 py-0.5 bg-ekantik-bg rounded text-xs font-mono font-semibold text-white">' + t + '</span>').join('') +
          '</div>' +
          '<div class="flex items-center gap-3">' +
            (r.impact_score ? '<span class="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ' + (impactColors[r.impact_score] || '') + '">Impact: ' + (impactEmoji[r.impact_score] || '') + ' ' + r.impact_score + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="mt-3 flex items-center gap-4 text-xs text-gray-400">' +
          (r.ai_composite_score ? '<span class="font-semibold text-ekantik-gold">AI Score: ' + r.ai_composite_score + '/10</span>' : '') +
          (r.conviction_level ? '<span>Conviction: <span class="font-semibold text-white">' + r.conviction_level + '</span></span>' : '') +
          '<span>' + timeAgo + '</span>' +
        '</div>' +
        pivotBadge +
        (structured.key_takeaway ? '<p class=\"mt-3 text-gray-300 text-sm leading-relaxed line-clamp-2\">\"' + structured.key_takeaway + '\"</p>' : '') +
        '<div class="mt-3 flex items-center gap-3 text-xs text-gray-500">' +
          '<span class="flex items-center gap-1"><i class="' + (triggerIcons[r.trigger_source] || 'fas fa-question') + '"></i> via ' + r.trigger_source + '</span>' +
          (r.model_used ? '<span>' + r.model_used + '</span>' : '') +
          (r.cost_estimate ? '<span>$' + r.cost_estimate.toFixed(3) + '</span>' : '') +
        '</div>' +
        '<div class="mt-3 flex items-center gap-2">' +
          '<button onclick="event.stopPropagation();shareToSlack(\\'' + r.id + '\\', this)" class="text-gray-500 hover:text-ekantik-gold text-xs px-2 py-1 rounded border border-transparent hover:border-ekantik-gold/30 transition-all flex items-center gap-1.5" title="Share to Slack">' +
            '<i class="fab fa-slack"></i> Share to Slack' +
          '</button>' +
          (r.slack_channel_id ? '<span class="text-[10px] text-gray-600"><i class="fas fa-check-circle text-ekantik-green mr-1"></i>Posted to Slack</span>' : '') +
        '</div>' +
        '<div class="report-detail hidden mt-4 pt-4 border-t border-ekantik-border">' +
          '<div class="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap text-xs leading-relaxed" style="max-height:400px;overflow-y:auto;">' + escapeHtml(r.raw_markdown || '') + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch(e) { console.error('Feed load failed', e); }
}

// ── Clear all filters ─────────────────────────────────────
function clearFilters() {
  document.getElementById('filter-agent').value = '';
  document.getElementById('filter-impact').value = '';
  document.getElementById('filter-pivot').value = '';
  document.getElementById('filter-date').value = '';
  document.getElementById('filter-date-from').value = '';
  document.getElementById('filter-date-to').value = '';
  document.getElementById('custom-date-range').classList.add('hidden');
  loadFeed();
}

// ── Wire up filter dropdowns ──────────────────────────────
document.getElementById('filter-agent').addEventListener('change', loadFeed);
document.getElementById('filter-impact').addEventListener('change', loadFeed);
document.getElementById('filter-pivot').addEventListener('change', loadFeed);
document.getElementById('filter-date').addEventListener('change', function() {
  const customRange = document.getElementById('custom-date-range');
  if (this.value === 'custom') {
    customRange.classList.remove('hidden');
    // Don't auto-reload — wait for user to pick dates
  } else {
    customRange.classList.add('hidden');
    loadFeed();
  }
});
document.getElementById('filter-date-from').addEventListener('change', loadFeed);
document.getElementById('filter-date-to').addEventListener('change', loadFeed);

// ── Initial load ──────────────────────────────────────────
(async () => {
  // Load stats
  try {
    const statsRes = await fetch('/api/stats');
    const stats = await statsRes.json();
    document.getElementById('stat-reports').textContent = stats.totalReports;
    document.getElementById('stat-high').textContent = stats.highImpactReports;
    document.getElementById('stat-watchlist').textContent = stats.watchlistTickers;
    document.getElementById('stat-signals').textContent = stats.activeSignals;
    document.getElementById('stat-positions').textContent = stats.openPositions;
  } catch(e) { console.error('Stats load failed', e); }

  // Load feed (respects any pre-set filter values)
  await loadFeed();
})();

function toggleReport(el) {
  const detail = el.querySelector('.report-detail');
  detail.classList.toggle('hidden');
}

function getTimeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + ' min ago';
  if (diff < 86400) return Math.floor(diff/3600) + ' hr ago';
  return Math.floor(diff/86400) + ' day' + (Math.floor(diff/86400) > 1 ? 's' : '') + ' ago';
}

function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function runResearch() {
  const agent = document.getElementById('run-agent').value;
  const tickersStr = document.getElementById('run-tickers').value;
  const context = document.getElementById('run-context').value;
  const btn = document.getElementById('run-btn');
  const status = document.getElementById('run-status');

  const tickers = tickersStr.toUpperCase().split(/[\\s,]+/).filter(t => /^[A-Z]{1,5}$/.test(t));

  if (!agent) { alert('Please select an agent'); return; }
  if (['material_events','bias_mode','ai_scorer','doubler','disruption','dislocation'].includes(agent) && tickers.length === 0) {
    alert('This agent requires at least one ticker symbol'); return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Researching...';
  status.textContent = 'Claude is analyzing with web search — typically 30-90 seconds...';

  try {
    const res = await fetch('/api/research/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentType: agent, tickers, additionalContext: context || undefined })
    });
    const data = await res.json();

    if (data.error) {
      status.textContent = 'Error: ' + data.error;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-play"></i> Execute Research';
      return;
    }

    let msg = 'Research complete!';
    if (data.slackPosted) msg += ' Shared to Slack.';
    msg += ' Reloading feed...';
    status.textContent = msg;
    document.getElementById('research-modal').classList.add('hidden');
    setTimeout(() => location.reload(), 500);

  } catch(e) {
    status.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Execute Research';
  }
}

async function importReport() {
  const agentType = document.getElementById('import-agent').value;
  const tickersStr = document.getElementById('import-tickers').value;
  const content = document.getElementById('import-content').value;
  const btn = document.getElementById('import-btn');
  const status = document.getElementById('import-status');

  if (!content || content.trim().length < 10) {
    alert('Please paste a research report (minimum 10 characters)');
    return;
  }

  const tickers = tickersStr ? tickersStr.toUpperCase().split(/[\\s,]+/).filter(t => /^[A-Z]{1,5}$/.test(t)) : [];

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  status.textContent = 'Importing report to portal...';

  try {
    const res = await fetch('/api/research/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentType: agentType || undefined,
        tickers: tickers.length > 0 ? tickers : undefined,
        content: content,
        source: 'portal_import'
      })
    });
    const data = await res.json();

    if (data.error) {
      status.textContent = 'Error: ' + data.error;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-file-import"></i> Save to Portal';
      return;
    }

    status.textContent = 'Report saved! ID: ' + data.reportId + '. Reloading...';
    document.getElementById('import-modal').classList.add('hidden');
    setTimeout(() => location.reload(), 500);

  } catch(e) {
    status.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-file-import"></i> Save to Portal';
  }
}

async function shareToSlack(reportId, btnEl) {
  if (btnEl.disabled) return;
  btnEl.disabled = true;
  const origHtml = btnEl.innerHTML;
  btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
  try {
    const res = await fetch('/api/slack/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId })
    });
    const data = await res.json();
    if (data.success) {
      btnEl.innerHTML = '<i class="fas fa-check text-ekantik-green"></i> Shared!';
      btnEl.classList.add('text-ekantik-green', 'border-ekantik-green/30');
      setTimeout(() => { btnEl.innerHTML = '<i class="fab fa-slack"></i> Shared'; btnEl.disabled = false; }, 2000);
    } else {
      btnEl.innerHTML = '<i class="fas fa-exclamation-triangle text-ekantik-red"></i> ' + (data.error || 'Failed');
      setTimeout(() => { btnEl.innerHTML = origHtml; btnEl.disabled = false; }, 3000);
    }
  } catch(e) {
    btnEl.innerHTML = '<i class="fas fa-exclamation-triangle text-ekantik-red"></i> Error';
    setTimeout(() => { btnEl.innerHTML = origHtml; btnEl.disabled = false; }, 3000);
  }
}
`

const watchlistScript = `
(async () => {
  try {
    const res = await fetch('/api/watchlist');
    const { tickers } = await res.json();
    const container = document.getElementById('watchlist-table');

    if (!tickers || tickers.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500 p-6"><i class="fas fa-binoculars text-3xl mb-3"></i><p>No tickers in watchlist. Click <b>Add Ticker</b> to get started.</p></div>';
      return;
    }

    container.innerHTML = '<table class="w-full"><thead><tr class="border-b border-ekantik-border">' +
      '<th class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Ticker</th>' +
      '<th class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Name</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Pivot Watch</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Price</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Change</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">AI Score</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Conviction</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Impact</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Market Cap</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Tags</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest"></th>' +
    '</tr></thead><tbody>' +
    tickers.map(t => {
      const chgColor = (t.price_change_pct || 0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
      const chgSign = (t.price_change_pct || 0) >= 0 ? '+' : '';
      const impactColors = { H: 'bg-red-500/20 text-red-400', M: 'bg-amber-500/20 text-amber-400', L: 'bg-green-500/20 text-green-400' };
      const convColors = { HIGH: 'text-ekantik-green', MEDIUM: 'text-ekantik-amber', LOW: 'text-gray-400' };
      const mcap = t.market_cap ? (t.market_cap >= 1e12 ? (t.market_cap/1e12).toFixed(1)+'T' : (t.market_cap/1e9).toFixed(0)+'B') : '—';

      // Pivot watch badge + latest detected pivot
      const pivotWatchIcons = {
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
      let pivotCell = '';
      if (t.pivot_watch) {
        const pwType = t.pivot_watch_type ? (pivotWatchIcons[t.pivot_watch_type] || '') : '';
        pivotCell = '<div class="flex items-center justify-center gap-1">' +
          '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer" onclick="event.stopPropagation();openPivotWatchModal(\\'' + t.symbol + '\\', true, \\'' + (t.pivot_watch_notes||'').replace(/'/g, "\\\\'") + '\\', \\'' + (t.pivot_watch_type||'') + '\\')" title="' + (t.pivot_watch_notes||'Watching for pivot').replace(/"/g,'&quot;') + '">' +
            '<i class="fas fa-bolt"></i> ' + pwType + ' WATCHING' +
          '</span></div>';
      } else {
        // Check if latest_pivot_json has a detected pivot
        let latestPivot = null;
        try { latestPivot = t.latest_pivot_json ? JSON.parse(t.latest_pivot_json) : null; } catch(e) {}
        if (latestPivot && latestPivot.identified) {
          const magCls = latestPivot.magnitude === 'high' ? 'bg-red-500/20 text-red-400' : latestPivot.magnitude === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400';
          pivotCell = '<div class="flex items-center justify-center gap-1">' +
            '<span class="px-2 py-0.5 rounded text-[10px] font-semibold ' + magCls + '">' +
              '<i class="fas fa-bolt mr-1"></i>DETECTED' +
            '</span></div>';
        } else {
          pivotCell = '<button onclick="event.stopPropagation();openPivotWatchModal(\\'' + t.symbol + '\\', false, \\'\\', \\'\\')" class="text-gray-600 hover:text-amber-400 text-xs transition-colors" title="Set pivot watch"><i class="fas fa-eye"></i></button>';
        }
      }

      return '<tr class="border-b border-ekantik-border/50 hover:bg-ekantik-surface/30 group ' + (t.pivot_watch ? 'border-l-2 border-l-amber-500/50' : '') + '">' +
        '<td class="px-5 py-3 cursor-pointer" onclick="location.href=\\'/tickers/' + t.id + '\\'"><span class="font-mono font-bold text-white text-sm">' + t.symbol + '</span></td>' +
        '<td class="px-5 py-3 text-gray-300 text-sm cursor-pointer" onclick="location.href=\\'/tickers/' + t.id + '\\'">' + t.name + '</td>' +
        '<td class="px-5 py-3 text-center">' + pivotCell + '</td>' +
        '<td class="px-5 py-3 text-right text-white font-semibold text-sm">$' + (t.last_price||0).toFixed(2) + '</td>' +
        '<td class="px-5 py-3 text-right text-sm ' + chgColor + ' font-semibold">' + chgSign + (t.price_change_pct||0).toFixed(2) + '%</td>' +
        '<td class="px-5 py-3 text-right"><span class="text-ekantik-gold font-bold text-sm">' + (t.latest_ai_score ? t.latest_ai_score.toFixed(1) : '—') + '</span></td>' +
        '<td class="px-5 py-3 text-center text-xs font-semibold ' + (convColors[t.latest_conviction] || 'text-gray-500') + '">' + (t.latest_conviction || '—') + '</td>' +
        '<td class="px-5 py-3 text-center">' + (t.latest_impact ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold ' + (impactColors[t.latest_impact]||'') + '">' + t.latest_impact + '</span>' : '<span class="text-gray-500 text-xs">—</span>') + '</td>' +
        '<td class="px-5 py-3 text-right text-gray-300 text-sm">$' + mcap + '</td>' +
        '<td class="px-5 py-3 text-center">' + (t.is_mag7 ? '<span class="px-1.5 py-0.5 bg-ekantik-gold/20 text-ekantik-gold rounded text-[10px] font-bold">MAG7</span>' : '') + '</td>' +
        '<td class="px-5 py-3 text-center">' +
          '<button onclick="event.stopPropagation();removeTicker(\\'' + t.symbol + '\\')" class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-ekantik-red text-xs px-2 py-1 rounded hover:bg-ekantik-red/10" title="Remove from watchlist">' +
            '<i class="fas fa-times"></i>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('') + '</tbody></table>';
  } catch(e) { console.error('Watchlist load failed', e); }
})();

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
  if (!sym || !/^[A-Z]{1,5}$/.test(sym)) { alert('Enter a valid ticker symbol (1-5 letters)'); return; }

  const btn = document.getElementById('lookup-btn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  const resultDiv = document.getElementById('lookup-result');
  const statusDiv = document.getElementById('add-status');
  resultDiv.classList.add('hidden');
  statusDiv.textContent = 'Looking up ' + sym + ' on Yahoo Finance...';

  try {
    const res = await fetch('/api/watchlist/lookup/' + sym);
    const data = await res.json();

    if (!res.ok) {
      statusDiv.textContent = data.error || 'Ticker not found';
      btn.innerHTML = '<i class="fas fa-search"></i>';
      return;
    }

    statusDiv.textContent = '';
    const mcap = data.marketCap ? (data.marketCap >= 1e12 ? '$' + (data.marketCap/1e12).toFixed(2) + 'T' : '$' + (data.marketCap/1e9).toFixed(0) + 'B') : '—';
    const chgColor = (data.changePercent || 0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
    const chgSign = (data.changePercent || 0) >= 0 ? '+' : '';

    let actionHtml = '';
    if (data.isWatchlist) {
      actionHtml = '<div class="mt-3 text-center"><span class="text-ekantik-amber text-sm font-semibold"><i class="fas fa-check-circle mr-1"></i>Already on watchlist</span></div>';
    } else {
      actionHtml = '<div class="mt-3 text-center"><button onclick="addTicker(\\'' + data.symbol + '\\')" id="add-confirm-btn" class="px-5 py-2 bg-ekantik-green text-white rounded-lg text-sm font-bold hover:bg-ekantik-green/80 transition-colors"><i class="fas fa-plus mr-1"></i>Add ' + data.symbol + ' to Watchlist</button></div>';
    }

    resultDiv.innerHTML =
      '<div class="bg-ekantik-bg border border-ekantik-border rounded-lg p-4">' +
        '<div class="flex items-center justify-between mb-2">' +
          '<div>' +
            '<span class="font-mono font-bold text-white text-lg">' + data.symbol + '</span>' +
            '<span class="text-gray-400 text-sm ml-2">' + (data.name || '') + '</span>' +
          '</div>' +
          '<div class="text-right">' +
            '<div class="text-white font-bold">$' + (data.price||0).toFixed(2) + '</div>' +
            '<div class="text-xs font-semibold ' + chgColor + '">' + chgSign + (data.changePercent||0).toFixed(2) + '%</div>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-3 gap-3 text-xs">' +
          '<div><span class="text-gray-500 block">Sector</span><span class="text-gray-300">' + (data.sector || '—') + '</span></div>' +
          '<div><span class="text-gray-500 block">Market Cap</span><span class="text-gray-300">' + mcap + '</span></div>' +
          '<div><span class="text-gray-500 block">Fwd P/E</span><span class="text-gray-300">' + (data.forwardPE ? data.forwardPE.toFixed(1) + 'x' : '—') + '</span></div>' +
        '</div>' +
        actionHtml +
      '</div>';
    resultDiv.classList.remove('hidden');
  } catch(e) {
    statusDiv.textContent = 'Error: ' + e.message;
  }
  btn.innerHTML = '<i class="fas fa-search"></i>';
}

async function addTicker(symbol) {
  const btn = document.getElementById('add-confirm-btn');
  const statusDiv = document.getElementById('add-status');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Adding...';
  statusDiv.textContent = '';

  try {
    const res = await fetch('/api/watchlist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol })
    });
    const data = await res.json();

    if (!res.ok) {
      statusDiv.textContent = data.error || 'Failed to add';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-plus mr-1"></i>Add ' + symbol + ' to Watchlist';
      return;
    }

    btn.innerHTML = '<i class="fas fa-check mr-1"></i>Added!';
    btn.classList.remove('bg-ekantik-green');
    btn.classList.add('bg-ekantik-green/50');
    statusDiv.textContent = symbol + ' added to watchlist. Reloading...';
    setTimeout(() => { closeAddModal(); location.reload(); }, 800);
  } catch(e) {
    statusDiv.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus mr-1"></i>Add ' + symbol + ' to Watchlist';
  }
}

// ── Remove Ticker Function ──────────────────────────────────
async function removeTicker(symbol) {
  if (!confirm('Remove ' + symbol + ' from watchlist?')) return;
  try {
    const res = await fetch('/api/watchlist/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol })
    });
    const data = await res.json();
    if (res.ok) {
      location.reload();
    } else {
      alert(data.error || 'Failed to remove');
    }
  } catch(e) { alert('Error: ' + e.message); }
}

// ── Bulk Import Functions ──────────────────────────────────────
function parseBulkSymbols() {
  const raw = document.getElementById('bulk-import-input').value;
  const symbols = raw.split(/[,\\n\\r\\t;|\\s]+/).map(s => s.toUpperCase().replace(/[^A-Z]/g, '')).filter(s => s.length >= 1 && s.length <= 5);
  return [...new Set(symbols)];
}

function updateBulkCount() {
  const symbols = parseBulkSymbols();
  const countEl = document.getElementById('bulk-import-count');
  countEl.textContent = symbols.length + ' ticker' + (symbols.length !== 1 ? 's' : '') + ' detected';
  countEl.classList.toggle('text-ekantik-accent', symbols.length > 0);
  countEl.classList.toggle('text-gray-500', symbols.length === 0);
}

// Live counter on input
document.getElementById('bulk-import-input')?.addEventListener('input', updateBulkCount);

function closeBulkImportModal() {
  document.getElementById('bulk-import-modal').classList.add('hidden');
  document.getElementById('bulk-import-input').value = '';
  document.getElementById('bulk-import-progress').classList.add('hidden');
  document.getElementById('bulk-import-results').classList.add('hidden');
  document.getElementById('bulk-import-results').innerHTML = '';
  document.getElementById('bulk-import-status').textContent = '';
  document.getElementById('bulk-import-btn').disabled = false;
  document.getElementById('bulk-import-btn').innerHTML = '<i class="fas fa-upload mr-1"></i> Import All';
  updateBulkCount();
}

async function executeBulkImport() {
  const symbols = parseBulkSymbols();
  if (symbols.length === 0) {
    document.getElementById('bulk-import-status').textContent = 'No valid tickers to import';
    return;
  }
  if (symbols.length > 100) {
    document.getElementById('bulk-import-status').textContent = 'Maximum 100 tickers per import';
    return;
  }

  const btn = document.getElementById('bulk-import-btn');
  const statusEl = document.getElementById('bulk-import-status');
  const progressDiv = document.getElementById('bulk-import-progress');
  const progressBar = document.getElementById('bulk-progress-bar');
  const progressLabel = document.getElementById('bulk-progress-label');
  const progressPct = document.getElementById('bulk-progress-pct');
  const resultsDiv = document.getElementById('bulk-import-results');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Importing...';
  statusEl.textContent = '';
  progressDiv.classList.remove('hidden');
  resultsDiv.classList.add('hidden');
  progressBar.style.width = '10%';
  progressLabel.textContent = 'Importing ' + symbols.length + ' tickers...';
  progressPct.textContent = '0%';

  try {
    // Animate progress to ~40% while waiting
    progressBar.style.width = '40%';
    progressPct.textContent = '40%';

    const res = await fetch('/api/watchlist/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols })
    });

    progressBar.style.width = '80%';
    progressPct.textContent = '80%';

    const data = await res.json();

    progressBar.style.width = '100%';
    progressPct.textContent = '100%';
    progressLabel.textContent = 'Complete!';

    if (!res.ok) {
      statusEl.textContent = data.error || 'Import failed';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-upload mr-1"></i> Retry';
      return;
    }

    // Show results summary
    const s = data.summary;
    let html = '<div class="bg-ekantik-bg border border-ekantik-border rounded-lg p-4 space-y-3">';
    html += '<div class="grid grid-cols-3 gap-3 text-center">';
    html += '<div><div class="text-xl font-bold text-ekantik-green">' + s.added + '</div><div class="text-[10px] text-gray-500 uppercase">Added</div></div>';
    html += '<div><div class="text-xl font-bold text-ekantik-amber">' + s.already_on_watchlist + '</div><div class="text-[10px] text-gray-500 uppercase">Already</div></div>';
    html += '<div><div class="text-xl font-bold text-ekantik-red">' + s.failed + '</div><div class="text-[10px] text-gray-500 uppercase">Failed</div></div>';
    html += '</div>';

    // Show failures if any
    const failures = data.results.filter(function(r) { return r.status === 'failed'; });
    if (failures.length > 0) {
      html += '<div class="border-t border-ekantik-border pt-2">';
      html += '<p class="text-xs text-gray-400 mb-1">Failed tickers:</p>';
      html += '<div class="flex flex-wrap gap-1">';
      failures.forEach(function(f) {
        html += '<span class="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs font-mono" title="' + (f.error || '').replace(/"/g, '&quot;') + '">' + f.symbol + '</span>';
      });
      html += '</div></div>';
    }
    html += '</div>';

    resultsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');

    if (s.added > 0) {
      btn.innerHTML = '<i class="fas fa-check mr-1"></i> Done — Reloading...';
      btn.classList.remove('bg-ekantik-accent');
      btn.classList.add('bg-ekantik-green');
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

async function runWlResearch() {
  const agent = document.getElementById('wl-run-agent').value;
  const tickerStr = document.getElementById('wl-run-ticker').value;
  const btn = document.getElementById('wl-run-btn');
  const status = document.getElementById('wl-run-status');

  const tickers = tickerStr.toUpperCase().split(/[\\s,]+/).filter(t => /^[A-Z]{1,5}$/.test(t));
  if (tickers.length === 0) { alert('Please enter at least one ticker symbol'); return; }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Researching...';
  status.textContent = 'Claude is analyzing with web search — typically 30-90 seconds...';

  try {
    const res = await fetch('/api/research/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentType: agent, tickers })
    });
    const data = await res.json();
    if (data.error) {
      status.textContent = 'Error: ' + data.error;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-play"></i> Execute';
      return;
    }
    status.textContent = 'Research complete! Reloading...';
    document.getElementById('research-modal-wl').classList.add('hidden');
    setTimeout(() => location.reload(), 500);
  } catch(e) {
    status.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Execute';
  }
}

// ── Pivot Watch Functions ──────────────────────────────────────
let _pwSymbol = '';

function openPivotWatchModal(symbol, isWatching, notes, type) {
  _pwSymbol = symbol;
  document.getElementById('pw-symbol').textContent = symbol;
  document.getElementById('pw-type').value = type || '';
  document.getElementById('pw-notes').value = notes || '';
  document.getElementById('pw-remove-btn').classList.toggle('hidden', !isWatching);
  document.getElementById('pivot-watch-modal').classList.remove('hidden');
  document.getElementById('pivot-watch-modal').classList.add('flex');
}

function closePivotWatchModal() {
  document.getElementById('pivot-watch-modal').classList.add('hidden');
  document.getElementById('pivot-watch-modal').classList.remove('flex');
  _pwSymbol = '';
}

async function savePivotWatch() {
  if (!_pwSymbol) return;
  try {
    await fetch('/api/watchlist/pivot-watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: _pwSymbol,
        pivot_watch: true,
        pivot_watch_notes: document.getElementById('pw-notes').value.trim() || null,
        pivot_watch_type: document.getElementById('pw-type').value || null,
      })
    });
    closePivotWatchModal();
    location.reload();
  } catch(e) { alert('Error: ' + e.message); }
}

async function removePivotWatch() {
  if (!_pwSymbol) return;
  if (!confirm('Remove pivot watch from ' + _pwSymbol + '?')) return;
  try {
    await fetch('/api/watchlist/pivot-watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: _pwSymbol, pivot_watch: false })
    });
    closePivotWatchModal();
    location.reload();
  } catch(e) { alert('Error: ' + e.message); }
}
`

const tickerDetailScript = `
(async () => {
  const tickerId = document.getElementById('ticker-detail').dataset.tickerId;
  try {
    const res = await fetch('/api/tickers/' + tickerId);
    const data = await res.json();
    if (data.error) { document.getElementById('ticker-detail').innerHTML = '<div class="text-red-400 text-center py-12">Ticker not found</div>'; return; }

    const t = data.ticker;
    const latestScore = data.scores[0];
    const chgColor = (t.price_change_pct || 0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
    const chgSign = (t.price_change_pct || 0) >= 0 ? '+' : '';
    const mcap = t.market_cap ? (t.market_cap >= 1e12 ? '$' + (t.market_cap/1e12).toFixed(2)+'T' : '$' + (t.market_cap/1e9).toFixed(0)+'B') : '—';

    document.getElementById('ticker-detail').innerHTML =
      '<div class="mb-6">' +
        '<div class="flex items-center gap-4">' +
          '<a href="/watchlist" class="text-gray-400 hover:text-ekantik-gold"><i class="fas fa-arrow-left"></i></a>' +
          '<div>' +
            '<div class="flex items-center gap-3">' +
              '<h1 class="text-3xl font-bold text-white">' + t.symbol + '</h1>' +
              (t.is_mag7 ? '<span class="px-2 py-0.5 bg-ekantik-gold/20 text-ekantik-gold rounded text-xs font-bold">MAG 7</span>' : '') +
            '</div>' +
            '<p class="text-gray-400 text-sm">' + t.name + ' · ' + (t.sector || '') + ' · ' + (t.industry || '') + '</p>' +
          '</div>' +
          '<div class="ml-auto text-right">' +
            '<div class="text-3xl font-bold text-white">$' + (t.last_price||0).toFixed(2) + '</div>' +
            '<div class="text-sm font-semibold ' + chgColor + '">' + chgSign + (t.price_change_pct||0).toFixed(2) + '% · ' + mcap + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Score cards
      '<div class="grid grid-cols-5 gap-4 mb-6">' +
        (latestScore ? [
          { label: 'TAM', val: latestScore.tam_score, color: 'accent' },
          { label: 'Bias Formation', val: latestScore.bias_score, color: 'purple-400' },
          { label: 'Superlative', val: latestScore.superlative_score, color: 'green' },
          { label: 'Disruption', val: latestScore.disruption_score, color: 'amber' },
          { label: 'Composite', val: latestScore.composite, color: 'gold' },
        ].map(s => '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 text-center"><div class="text-gray-400 text-[10px] uppercase tracking-wider">' + s.label + '</div><div class="text-2xl font-bold text-ekantik-' + s.color + ' mt-1">' + s.val.toFixed(1) + '</div></div>').join('') : '<div class="col-span-5 text-center text-gray-500 py-4">No AI scores available</div>') +
      '</div>' +

      // Tabs
      '<div class="flex gap-1 mb-4 border-b border-ekantik-border">' +
        ['Timeline', 'Trade Signals', 'Bias Mode', 'Reports'].map((tab, i) =>
          '<button class="px-4 py-2.5 text-sm font-medium border-b-2 ' + (i === 0 ? 'border-ekantik-gold text-ekantik-gold' : 'border-transparent text-gray-400 hover:text-gray-200') + '" onclick="showTickerTab(this, ' + i + ')">' + tab + '</button>'
        ).join('') +
      '</div>' +

      '<div id="ticker-tab-0">' +
        (data.events.length > 0 ? '<div class="space-y-3">' + data.events.map(e => {
          const impColors = { H: 'border-red-500 bg-red-500/10', M: 'border-amber-500 bg-amber-500/10', L: 'border-green-500 bg-green-500/10' };
          return '<div class="border-l-4 ' + (impColors[e.impact_score] || 'border-gray-500') + ' rounded-r-lg p-4 bg-ekantik-card">' +
            '<div class="flex items-center justify-between">' +
              '<h4 class="text-white font-semibold text-sm">' + e.event_title + '</h4>' +
              '<span class="text-gray-400 text-xs">' + (e.event_date || 'N/A') + '</span>' +
            '</div>' +
            (e.event_description ? '<p class="text-gray-400 text-xs mt-1">' + e.event_description + '</p>' : '') +
            '<div class="flex gap-3 mt-2 text-[10px] text-gray-500">' +
              '<span class="uppercase">' + (e.event_category || '') + '</span>' +
              (e.earnings_impact_pct ? '<span>EPS Impact: <span class="font-semibold ' + (e.earnings_impact_pct >= 0 ? 'text-ekantik-green' : 'text-ekantik-red') + '">' + (e.earnings_impact_pct > 0 ? '+' : '') + e.earnings_impact_pct + '%</span></span>' : '') +
              (e.catalyst_timeline ? '<span>Timeline: ' + e.catalyst_timeline + '</span>' : '') +
            '</div>' +
          '</div>';
        }).join('') + '</div>' : '<div class="text-center py-8 text-gray-500">No material events recorded</div>') +
      '</div>' +

      '<div id="ticker-tab-1" class="hidden">' +
        (data.signals.length > 0 ? '<div class="space-y-3">' + data.signals.map(s => {
          const sigColors = { breakout: 'text-ekantik-green', dislocation: 'text-ekantik-red', reversal: 'text-ekantik-amber', consolidation: 'text-gray-400', episodic_pivot: 'text-purple-400' };
          return '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">' +
            '<div class="flex items-center justify-between">' +
              '<div class="flex items-center gap-2">' +
                '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ' + (sigColors[s.signal_type] || '') + ' bg-ekantik-surface">' + s.signal_type.replace('_',' ') + '</span>' +
                '<span class="text-xs text-gray-400">' + s.engine.replace('_', '/') + '</span>' +
                (s.is_active ? '<span class="px-1.5 py-0.5 bg-ekantik-green/20 text-ekantik-green text-[10px] rounded font-bold">ACTIVE</span>' : '') +
              '</div>' +
              '<span class="text-ekantik-gold text-sm font-semibold">Confidence: ' + (s.confidence||0).toFixed(1) + '/10</span>' +
            '</div>' +
            '<div class="grid grid-cols-4 gap-4 mt-3 text-xs">' +
              '<div><span class="text-gray-500">Entry</span><div class="text-white font-semibold">' + (s.entry_price ? '$'+s.entry_price.toFixed(2) : '—') + '</div></div>' +
              '<div><span class="text-gray-500">Stop</span><div class="text-ekantik-red font-semibold">' + (s.stop_price ? '$'+s.stop_price.toFixed(2) : '—') + '</div></div>' +
              '<div><span class="text-gray-500">Target</span><div class="text-ekantik-green font-semibold">' + (s.target_price ? '$'+s.target_price.toFixed(2) : '—') + '</div></div>' +
              '<div><span class="text-gray-500">R:R</span><div class="text-white font-semibold">' + (s.risk_reward_ratio ? s.risk_reward_ratio.toFixed(2) + ':1' : '—') + '</div></div>' +
            '</div>' +
            (s.thesis ? '<p class="text-gray-300 text-xs mt-2">' + s.thesis + '</p>' : '') +
          '</div>';
        }).join('') + '</div>' : '<div class="text-center py-8 text-gray-500">No trade signals</div>') +
      '</div>' +

      '<div id="ticker-tab-2" class="hidden">' +
        (data.biasChecks.length > 0 ? data.biasChecks.map(b => {
          const bars = [
            { label: 'Fundamental (35%)', val: b.fundamental_score, max: 10 },
            { label: 'Market (25%)', val: b.market_score, max: 10 },
            { label: 'Sentiment (25%)', val: b.sentiment_score, max: 10 },
            { label: 'Alt Data (15%)', val: b.alt_data_score, max: 10 },
          ];
          const resultColors = { false_positive: 'text-ekantik-green', genuine_deterioration: 'text-ekantik-red', inconclusive: 'text-ekantik-amber' };
          return '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-5">' +
            '<div class="flex items-center justify-between mb-4">' +
              '<div class="text-white font-semibold">Weighted Composite: <span class="text-ekantik-gold">' + b.weighted_composite.toFixed(1) + '/10</span></div>' +
              '<div class="text-sm">' +
                '<span class="text-gray-400">Triple Test: </span>' +
                '<span class="font-semibold ' + (resultColors[b.triple_test_result] || 'text-gray-400') + '">' + (b.triple_test_result || 'N/A').replace(/_/g, ' ').toUpperCase() + '</span>' +
              '</div>' +
            '</div>' +
            bars.map(bar => '<div class="mb-3"><div class="flex justify-between text-xs text-gray-400 mb-1"><span>' + bar.label + '</span><span class="text-white font-semibold">' + bar.val.toFixed(1) + '</span></div><div class="h-2 bg-ekantik-bg rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-ekantik-accent to-ekantik-gold rounded-full" style="width:' + (bar.val/bar.max*100) + '%"></div></div></div>').join('') +
            '<div class="text-xs text-gray-500 mt-2">Checked: ' + b.checked_at + '</div>' +
          '</div>';
        }).join('') : '<div class="text-center py-8 text-gray-500">No bias mode checks</div>') +
      '</div>' +

      '<div id="ticker-tab-3" class="hidden">' +
        (data.reports.length > 0 ? '<div class="space-y-3">' + data.reports.map(r => {
          const agentLabels = {material_events:'MATERIAL EVENTS',bias_mode:'BIAS MODE',mag7_monitor:'MAG 7',aomg_scanner:'AOMG',hot_micro:'HOT MICRO',hot_macro:'HOT MACRO',doubler:'DOUBLER',ai_scorer:'AI SCORER',social_sentiment:'SOCIAL SENTIMENT'};
          return '<div class="bg-ekantik-card border border-ekantik-border rounded-lg p-4 hover:border-ekantik-gold/30">' +
            '<div class="flex items-center gap-2">' +
              '<span class="px-2 py-0.5 bg-ekantik-surface text-xs font-bold text-ekantik-gold rounded">' + (agentLabels[r.agent_type]||r.agent_type) + '</span>' +
              (r.impact_score ? '<span class="text-xs ' + (r.impact_score==='H'?'text-red-400':r.impact_score==='M'?'text-amber-400':'text-green-400') + '">Impact: ' + r.impact_score + '</span>' : '') +
              '<span class="text-xs text-gray-500 ml-auto">' + r.created_at + '</span>' +
            '</div>' +
            '<div class="mt-2 flex items-center gap-2">' +
              '<button onclick="shareToSlack(\\'' + r.id + '\\', this)" class="text-gray-500 hover:text-ekantik-gold text-xs px-2 py-1 rounded border border-transparent hover:border-ekantik-gold/30 transition-all flex items-center gap-1" title="Share to Slack">' +
                '<i class="fab fa-slack"></i> Share' +
              '</button>' +
              (r.slack_channel_id ? '<span class="text-[10px] text-gray-600"><i class="fas fa-check-circle text-ekantik-green mr-1"></i>Shared</span>' : '') +
            '</div>' +
          '</div>';
        }).join('') + '</div>' : '<div class="text-center py-8 text-gray-500">No reports found</div>') +
      '</div>';

  } catch(e) {
    document.getElementById('ticker-detail').innerHTML = '<div class="text-red-400 text-center py-12">Error loading ticker data: ' + e.message + '</div>';
  }
})();

function showTickerTab(el, idx) {
  for (let i = 0; i < 4; i++) {
    const tab = document.getElementById('ticker-tab-' + i);
    if (tab) tab.classList.toggle('hidden', i !== idx);
  }
  el.parentElement.querySelectorAll('button').forEach((b, i) => {
    b.className = 'px-4 py-2.5 text-sm font-medium border-b-2 ' + (i === idx ? 'border-ekantik-gold text-ekantik-gold' : 'border-transparent text-gray-400 hover:text-gray-200');
  });
}

async function shareToSlack(reportId, btnEl) {
  if (btnEl.disabled) return;
  btnEl.disabled = true;
  const origHtml = btnEl.innerHTML;
  btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
  try {
    const res = await fetch('/api/slack/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId })
    });
    const data = await res.json();
    if (data.success) {
      btnEl.innerHTML = '<i class="fas fa-check text-ekantik-green"></i> Shared!';
      setTimeout(() => { btnEl.innerHTML = '<i class="fab fa-slack"></i> Shared'; btnEl.disabled = false; }, 2000);
    } else {
      alert(data.error || 'Failed to share');
      btnEl.innerHTML = origHtml;
      btnEl.disabled = false;
    }
  } catch(e) {
    alert('Error: ' + e.message);
    btnEl.innerHTML = origHtml;
    btnEl.disabled = false;
  }
}
`

const mag7Script = `
(async () => {
  try {
    const res = await fetch('/api/mag7/scorecard');
    const { tickers } = await res.json();
    const grid = document.getElementById('mag7-grid');
    const tableContainer = document.getElementById('mag7-table-container');

    grid.innerHTML = tickers.map(t => {
      const chgColor = (t.price_change_pct || 0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
      const chgSign = (t.price_change_pct || 0) >= 0 ? '+' : '';
      const sigColors = { breakout: 'bg-ekantik-green/20 text-ekantik-green', dislocation: 'bg-red-500/20 text-red-400', reversal: 'bg-amber-500/20 text-amber-400', consolidation: 'bg-gray-500/20 text-gray-400', episodic_pivot: 'bg-purple-500/20 text-purple-400' };
      const sigLabel = t.active_signal ? t.active_signal.replace('_', ' ') : 'none';
      const scores = [
        { label: 'TAM', val: t.tam_score || 0 },
        { label: 'Bias', val: t.bias_score || 0 },
        { label: 'Super', val: t.superlative_score || 0 },
        { label: 'Disrupt', val: t.disruption_score || 0 },
      ];

      return '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-5 hover:border-ekantik-gold/30 transition-all cursor-pointer" onclick="location.href=\\'/tickers/' + t.id + '\\'">' +
        '<div class="flex items-center justify-between mb-3">' +
          '<div class="flex items-center gap-2">' +
            '<span class="text-xl font-bold text-white">' + t.symbol + '</span>' +
            '<span class="px-1.5 py-0.5 bg-ekantik-gold/20 text-ekantik-gold rounded text-[10px] font-bold">MAG7</span>' +
          '</div>' +
          '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ' + (sigColors[t.active_signal] || 'bg-gray-500/20 text-gray-400') + '">' + sigLabel + '</span>' +
        '</div>' +
        '<div class="flex items-baseline justify-between mb-4">' +
          '<span class="text-2xl font-bold text-white">$' + (t.last_price||0).toFixed(2) + '</span>' +
          '<span class="text-sm font-semibold ' + chgColor + '">' + chgSign + (t.price_change_pct||0).toFixed(2) + '%</span>' +
        '</div>' +
        '<div class="flex items-center justify-between mb-3">' +
          '<span class="text-gray-400 text-xs">AI Composite</span>' +
          '<span class="text-ekantik-gold font-bold text-lg">' + (t.ai_score ? t.ai_score.toFixed(1) : '—') + '<span class="text-xs text-gray-400">/10</span></span>' +
        '</div>' +
        '<div class="space-y-2">' +
          scores.map(s => '<div><div class="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>' + s.label + '</span><span class="text-gray-300">' + s.val.toFixed(1) + '</span></div><div class="h-1.5 bg-ekantik-bg rounded-full overflow-hidden"><div class="h-full rounded-full" style="width:' + (s.val/10*100) + '%;background:linear-gradient(to right,#d4a843,#3b82f6)"></div></div></div>').join('') +
        '</div>' +
        '<div class="mt-3 pt-3 border-t border-ekantik-border/50 flex justify-between text-[10px] text-gray-500">' +
          '<span>P/E: ' + (t.forward_pe ? t.forward_pe.toFixed(1) + 'x' : '—') + '</span>' +
          '<span>Conviction: <span class="font-semibold ' + (t.conviction === 'HIGH' ? 'text-ekantik-green' : t.conviction === 'MEDIUM' ? 'text-ekantik-amber' : 'text-gray-400') + '">' + (t.conviction || '—') + '</span></span>' +
        '</div>' +
      '</div>';
    }).join('');

    // Summary table
    tableContainer.innerHTML = '<div class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden">' +
      '<div class="px-5 py-3 border-b border-ekantik-border"><h3 class="text-white font-semibold text-sm"><i class="fas fa-table mr-2 text-ekantik-gold"></i>Weekly Scorecard Summary</h3></div>' +
      '<table class="w-full"><thead><tr class="border-b border-ekantik-border">' +
        '<th class="text-left px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Ticker</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Price</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Chg%</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">AI Score</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">TAM</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Bias</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Super</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Disrupt</th>' +
        '<th class="text-center px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Signal</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Fwd P/E</th>' +
      '</tr></thead><tbody>' +
      tickers.map(t => {
        const chgColor = (t.price_change_pct||0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
        return '<tr class="border-b border-ekantik-border/30 hover:bg-ekantik-surface/20">' +
          '<td class="px-5 py-2.5 font-mono font-bold text-white text-sm">' + t.symbol + '</td>' +
          '<td class="px-5 py-2.5 text-right text-white text-sm">$' + (t.last_price||0).toFixed(2) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-sm font-semibold ' + chgColor + '">' + ((t.price_change_pct||0)>=0?'+':'') + (t.price_change_pct||0).toFixed(2) + '%</td>' +
          '<td class="px-5 py-2.5 text-right text-ekantik-gold font-bold text-sm">' + (t.ai_score?t.ai_score.toFixed(1):'—') + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.tam_score||0).toFixed(1) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.bias_score||0).toFixed(1) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.superlative_score||0).toFixed(1) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.disruption_score||0).toFixed(1) + '</td>' +
          '<td class="px-5 py-2.5 text-center text-xs">' + (t.active_signal ? '<span class="px-2 py-0.5 rounded bg-ekantik-surface text-ekantik-gold font-semibold">' + t.active_signal.replace('_',' ') + '</span>' : '<span class="text-gray-500">—</span>') + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.forward_pe?t.forward_pe.toFixed(1)+'x':'—') + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>';

  } catch(e) { console.error('Mag7 load failed', e); }
})();
`

const aomgScript = `
(async () => {
  try {
    const res = await fetch('/api/aomg/themes');
    const { themes } = await res.json();
    const container = document.getElementById('aomg-grid');

    if (!themes || themes.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500">No AOMG themes found.</div>';
      return;
    }

    container.innerHTML = themes.map(theme => {
      const drivers = theme.sentiment_drivers ? JSON.parse(theme.sentiment_drivers) : [];
      const constraints = theme.sentiment_constraints ? JSON.parse(theme.sentiment_constraints) : [];
      const catalysts = theme.key_catalysts ? JSON.parse(theme.key_catalysts) : [];
      const statusColors = { active: 'bg-ekantik-green/20 text-ekantik-green', monitoring: 'bg-ekantik-amber/20 text-ekantik-amber', archived: 'bg-gray-500/20 text-gray-400' };
      const tam = theme.tam_estimate ? (theme.tam_estimate >= 1e12 ? '$' + (theme.tam_estimate/1e12).toFixed(1) + 'T' : '$' + (theme.tam_estimate/1e9).toFixed(0) + 'B') : '—';
      const sam = theme.sam_estimate ? (theme.sam_estimate >= 1e12 ? '$' + (theme.sam_estimate/1e12).toFixed(1) + 'T' : '$' + (theme.sam_estimate/1e9).toFixed(0) + 'B') : '—';
      const som = theme.som_estimate ? (theme.som_estimate >= 1e12 ? '$' + (theme.som_estimate/1e12).toFixed(1) + 'T' : '$' + (theme.som_estimate/1e9).toFixed(0) + 'B') : '—';

      return '<div class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden">' +
        '<div class="p-6">' +
          '<div class="flex items-start justify-between mb-4">' +
            '<div>' +
              '<h3 class="text-lg font-bold text-white">' + theme.name + '</h3>' +
              '<p class="text-gray-400 text-sm mt-1">' + theme.quarter + ' ' + theme.year + '</p>' +
            '</div>' +
            '<div class="flex items-center gap-3">' +
              '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ' + (statusColors[theme.status] || '') + '">' + theme.status + '</span>' +
              '<div class="text-right">' +
                '<div class="text-[10px] text-gray-400 uppercase">AI Score</div>' +
                '<div class="text-ekantik-gold font-bold text-xl">' + (theme.ai_score_composite || '—') + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          (theme.description ? '<p class="text-gray-300 text-sm mb-5 leading-relaxed">' + theme.description + '</p>' : '') +

          // TAM Funnel
          '<div class="mb-5">' +
            '<h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Market Sizing Funnel</h4>' +
            '<div class="space-y-2">' +
              '<div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">TAM (Total Addressable)</span><span class="text-white font-semibold">' + tam + '</span></div><div class="h-3 bg-ekantik-bg rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-ekantik-accent to-blue-400 rounded-full" style="width:100%"></div></div></div>' +
              '<div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">SAM (Serviceable)</span><span class="text-white font-semibold">' + sam + '</span></div><div class="h-3 bg-ekantik-bg rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-ekantik-gold to-amber-400 rounded-full" style="width:' + (theme.sam_estimate && theme.tam_estimate ? (theme.sam_estimate/theme.tam_estimate*100) : 0) + '%"></div></div></div>' +
              '<div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">SOM (Obtainable)</span><span class="text-white font-semibold">' + som + '</span></div><div class="h-3 bg-ekantik-bg rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-ekantik-green to-emerald-400 rounded-full" style="width:' + (theme.som_estimate && theme.tam_estimate ? (theme.som_estimate/theme.tam_estimate*100) : 0) + '%"></div></div></div>' +
            '</div>' +
          '</div>' +

          // Drivers & Constraints
          '<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">' +
            '<div>' +
              '<h4 class="text-[10px] font-semibold text-ekantik-green uppercase tracking-widest mb-2"><i class="fas fa-arrow-up mr-1"></i>Drivers</h4>' +
              '<ul class="space-y-1">' + drivers.map(d => '<li class="text-xs text-gray-300 flex items-start gap-1.5"><span class="text-ekantik-green mt-1">+</span>' + d + '</li>').join('') + '</ul>' +
            '</div>' +
            '<div>' +
              '<h4 class="text-[10px] font-semibold text-ekantik-red uppercase tracking-widest mb-2"><i class="fas fa-arrow-down mr-1"></i>Constraints</h4>' +
              '<ul class="space-y-1">' + constraints.map(c => '<li class="text-xs text-gray-300 flex items-start gap-1.5"><span class="text-ekantik-red mt-1">-</span>' + c + '</li>').join('') + '</ul>' +
            '</div>' +
            '<div>' +
              '<h4 class="text-[10px] font-semibold text-ekantik-amber uppercase tracking-widest mb-2"><i class="fas fa-bolt mr-1"></i>Key Catalysts</h4>' +
              '<ul class="space-y-1">' + catalysts.map(c => '<li class="text-xs text-gray-300 flex items-start gap-1.5"><span class="text-ekantik-amber mt-1">*</span>' + c + '</li>').join('') + '</ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

  } catch(e) { console.error('AOMG load failed', e); }
})();
`

const heatScript = `
(async () => {
  try {
    const res = await fetch('/api/portfolio/heat');
    const { positions, heat } = await res.json();
    const container = document.getElementById('heat-dashboard');

    const heatPct = heat.utilization;
    const heatColor = heatPct > 90 ? 'text-ekantik-red' : heatPct > 70 ? 'text-ekantik-amber' : 'text-ekantik-green';
    const barColor = heatPct > 90 ? 'from-red-600 to-red-400' : heatPct > 70 ? 'from-amber-600 to-amber-400' : 'from-green-600 to-green-400';

    container.innerHTML =
      // Heat gauge
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">' +
        '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6 text-center">' +
          '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Total Portfolio Heat</div>' +
          '<div class="text-5xl font-bold ' + heatColor + '">' + heat.totalHeat.toFixed(1) + '%</div>' +
          '<div class="text-gray-400 text-sm mt-1">of ' + heat.heatCeiling + '% ceiling</div>' +
          '<div class="mt-4 h-4 bg-ekantik-bg rounded-full overflow-hidden">' +
            '<div class="h-full bg-gradient-to-r ' + barColor + ' rounded-full heat-bar" style="width:' + Math.min(heatPct, 100) + '%"></div>' +
          '</div>' +
          '<div class="text-xs text-gray-500 mt-2">Utilization: ' + heatPct.toFixed(1) + '%</div>' +
        '</div>' +
        '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">' +
          '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Stocks / LEAPS Sleeve</div>' +
          '<div class="text-3xl font-bold text-white">' + heat.stocksLeapsHeat.toFixed(2) + '%</div>' +
          '<div class="text-gray-400 text-sm">of ' + heat.stocksLeapsCap + '% cap</div>' +
          '<div class="mt-3 h-3 bg-ekantik-bg rounded-full overflow-hidden">' +
            '<div class="h-full bg-gradient-to-r from-ekantik-accent to-blue-400 rounded-full heat-bar" style="width:' + (heat.stocksLeapsHeat/heat.stocksLeapsCap*100) + '%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">' +
          '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Options Sleeve</div>' +
          '<div class="text-3xl font-bold text-white">' + heat.optionsHeat.toFixed(2) + '%</div>' +
          '<div class="text-gray-400 text-sm">of ' + heat.optionsCap + '% cap</div>' +
          '<div class="mt-3 h-3 bg-ekantik-bg rounded-full overflow-hidden">' +
            '<div class="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full heat-bar" style="width:' + (heat.optionsHeat/heat.optionsCap*100) + '%"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Market mode + equity
      '<div class="grid grid-cols-2 gap-4 mb-6">' +
        '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 flex items-center justify-between">' +
          '<span class="text-gray-400 text-sm"><i class="fas fa-chart-line mr-2 text-ekantik-gold"></i>Market Mode</span>' +
          '<span class="px-3 py-1 bg-ekantik-green/20 text-ekantik-green rounded-full text-xs font-bold uppercase">' + heat.marketMode + '</span>' +
        '</div>' +
        '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 flex items-center justify-between">' +
          '<span class="text-gray-400 text-sm"><i class="fas fa-wallet mr-2 text-ekantik-gold"></i>Portfolio Equity</span>' +
          '<span class="text-white font-bold">$' + heat.portfolioEquity.toLocaleString() + '</span>' +
        '</div>' +
      '</div>' +

      // Position table
      '<div class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden">' +
        '<div class="px-5 py-3 border-b border-ekantik-border flex items-center justify-between">' +
          '<h3 class="text-white font-semibold text-sm"><i class="fas fa-layer-group mr-2 text-ekantik-gold"></i>Open Positions — Risk Contribution</h3>' +
          '<span class="text-gray-400 text-xs">' + positions.length + ' positions</span>' +
        '</div>' +
        '<table class="w-full"><thead><tr class="border-b border-ekantik-border">' +
          '<th class="text-left px-5 py-2.5 text-[10px] text-gray-500 uppercase">Ticker</th>' +
          '<th class="text-center px-5 py-2.5 text-[10px] text-gray-500 uppercase">Engine</th>' +
          '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">Entry</th>' +
          '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">Current</th>' +
          '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">Size%</th>' +
          '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">Stop%</th>' +
          '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">Heat</th>' +
          '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">P&L%</th>' +
          '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">R-Multiple</th>' +
          '<th class="px-5 py-2.5 text-[10px] text-gray-500 uppercase">Heat Bar</th>' +
        '</tr></thead><tbody>' +
        positions.map(p => {
          const pnlColor = (p.pnl_pct||0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
          const heatBarWidth = (p.heat_contribution / heat.heatCeiling * 100);
          const engineLabel = p.engine === 'stocks_leaps' ? 'Stocks/LEAPS' : 'Options';
          const engineColor = p.engine === 'stocks_leaps' ? 'bg-ekantik-accent/20 text-ekantik-accent' : 'bg-purple-500/20 text-purple-400';
          return '<tr class="border-b border-ekantik-border/30 hover:bg-ekantik-surface/20">' +
            '<td class="px-5 py-3"><span class="font-mono font-bold text-white">' + p.symbol + '</span><div class="text-[10px] text-gray-500">' + (p.name||'').substring(0,20) + '</div></td>' +
            '<td class="px-5 py-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ' + engineColor + '">' + engineLabel + '</span></td>' +
            '<td class="px-5 py-3 text-right text-gray-300 text-sm">$' + (p.entry_price||0).toFixed(2) + '</td>' +
            '<td class="px-5 py-3 text-right text-white font-semibold text-sm">$' + (p.current_price||0).toFixed(2) + '</td>' +
            '<td class="px-5 py-3 text-right text-gray-300 text-sm">' + (p.size_pct||0).toFixed(1) + '%</td>' +
            '<td class="px-5 py-3 text-right text-gray-300 text-sm">' + (p.stop_distance_pct||0).toFixed(1) + '%</td>' +
            '<td class="px-5 py-3 text-right text-ekantik-amber font-semibold text-sm">' + (p.heat_contribution||0).toFixed(2) + '%</td>' +
            '<td class="px-5 py-3 text-right font-semibold text-sm ' + pnlColor + '">' + ((p.pnl_pct||0)>=0?'+':'') + (p.pnl_pct||0).toFixed(2) + '%</td>' +
            '<td class="px-5 py-3 text-right text-gray-300 text-sm">' + (p.r_multiple||0).toFixed(2) + 'R</td>' +
            '<td class="px-5 py-3"><div class="w-24 h-2 bg-ekantik-bg rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-ekantik-amber to-red-400 rounded-full" style="width:' + Math.min(heatBarWidth, 100) + '%"></div></div></td>' +
          '</tr>';
        }).join('') +
        '</tbody></table>' +
      '</div>';

    // Update sidebar heat badge
    const badge = document.getElementById('heat-badge');
    if (badge) badge.textContent = heat.totalHeat.toFixed(1) + '% / ' + heat.heatCeiling + '%';

  } catch(e) { console.error('Heat load failed', e); }
})();
`

const observationsScript = `
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
`

const journalScript = `
let _positions = [];
let _signals = [];

// ── Load Data ──
async function loadJournal() {
  try {
    const res = await fetch('/api/journal');
    const data = await res.json();
    _positions = data.positions || [];
    _signals = data.signals || [];
    renderJournal();
  } catch(e) { console.error('Journal load failed', e); }
}

function renderJournal() {
  const container = document.getElementById('journal-container');
  const openPos = _positions.filter(p => p.status === 'open');
  const closedPos = _positions.filter(p => p.status !== 'open');
  const activeSignals = _signals.filter(s => s.is_active);
  const inactiveSignals = _signals.filter(s => !s.is_active);

  const pivotTypeLabels = {
    earnings_surprise: 'EARNINGS', regulatory_shift: 'REGULATORY',
    management_change: 'MGMT CHANGE', product_inflection: 'PRODUCT',
    macro_regime: 'MACRO', geopolitical: 'GEOPOLITICAL',
    narrative_collapse: 'NARRATIVE', competitive_moat: 'MOAT',
    capital_event: 'CAPITAL',
  };

  container.innerHTML =
    // ── Open Positions ──
    '<div class="mb-8">' +
      '<h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-chart-line mr-2 text-ekantik-green"></i>Open Positions (' + openPos.length + ')</h3>' +
      (openPos.length > 0 ?
        '<div class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden">' +
          '<table class="w-full"><thead><tr class="border-b border-ekantik-border">' +
            '<th class="text-left px-4 py-2.5 text-[10px] text-gray-500 uppercase">Ticker</th>' +
            '<th class="text-center px-3 py-2.5 text-[10px] text-gray-500 uppercase">Engine</th>' +
            '<th class="text-center px-3 py-2.5 text-[10px] text-gray-500 uppercase">Pivot</th>' +
            '<th class="text-right px-3 py-2.5 text-[10px] text-gray-500 uppercase">Entry</th>' +
            '<th class="text-left px-3 py-2.5 text-[10px] text-gray-500 uppercase">Date</th>' +
            '<th class="text-right px-3 py-2.5 text-[10px] text-gray-500 uppercase">Current</th>' +
            '<th class="text-right px-3 py-2.5 text-[10px] text-gray-500 uppercase">P&L%</th>' +
            '<th class="text-right px-3 py-2.5 text-[10px] text-gray-500 uppercase">Size%</th>' +
            '<th class="text-right px-3 py-2.5 text-[10px] text-gray-500 uppercase">Heat</th>' +
            '<th class="text-left px-3 py-2.5 text-[10px] text-gray-500 uppercase">Thesis</th>' +
            '<th class="text-center px-3 py-2.5 text-[10px] text-gray-500 uppercase">Actions</th>' +
          '</tr></thead><tbody>' +
          openPos.map(p => {
            const pnlColor = (p.pnl_pct||0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
            const engColor = p.engine === 'stocks_leaps' ? 'bg-ekantik-accent/20 text-ekantik-accent' : 'bg-purple-500/20 text-purple-400';
            // Pivot badge
            let pivotBadge = '<span class="text-gray-600 text-[10px]">—</span>';
            try {
              const pivot = p.episodic_pivot_json ? JSON.parse(p.episodic_pivot_json) : null;
              if (pivot && pivot.pivot_type) {
                const magCls = pivot.magnitude === 'high' ? 'bg-red-500/20 text-red-400' : pivot.magnitude === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400';
                pivotBadge = '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-400" title="' + (pivot.event||'').replace(/"/g, '&quot;') + '"><i class="fas fa-bolt"></i> ' + (pivotTypeLabels[pivot.pivot_type] || pivot.pivot_type) + '</span>';
              }
            } catch(e) {}
            return '<tr class="border-b border-ekantik-border/30 hover:bg-ekantik-surface/20 group">' +
              '<td class="px-4 py-3 font-mono font-bold text-white">' + p.symbol + '</td>' +
              '<td class="px-3 py-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ' + engColor + '">' + (p.engine==='stocks_leaps'?'Stocks':'Options') + '</span></td>' +
              '<td class="px-3 py-3 text-center">' + pivotBadge + '</td>' +
              '<td class="px-3 py-3 text-right text-gray-300 text-sm">$' + (p.entry_price||0).toFixed(2) + '</td>' +
              '<td class="px-3 py-3 text-gray-400 text-sm">' + (p.entry_date||'').substring(0,10) + '</td>' +
              '<td class="px-3 py-3 text-right text-white font-semibold text-sm">$' + (p.current_price||0).toFixed(2) + '</td>' +
              '<td class="px-3 py-3 text-right font-semibold text-sm ' + pnlColor + '">' + ((p.pnl_pct||0)>=0?'+':'') + (p.pnl_pct||0).toFixed(2) + '%</td>' +
              '<td class="px-3 py-3 text-right text-gray-300 text-sm">' + (p.size_pct||0).toFixed(1) + '%</td>' +
              '<td class="px-3 py-3 text-right text-ekantik-amber text-sm">' + (p.heat_contribution||0).toFixed(2) + '%</td>' +
              '<td class="px-3 py-3 text-gray-400 text-xs max-w-[180px] truncate" title="' + (p.thesis||'').replace(/"/g,'&quot;') + '">' + (p.thesis||'—') + '</td>' +
              '<td class="px-3 py-3 text-center whitespace-nowrap">' +
                '<button onclick="editPosition(\\'' + p.id + '\\')" class="text-gray-500 hover:text-ekantik-accent text-xs px-1" title="Edit"><i class="fas fa-pen"></i></button>' +
                '<button onclick="openClosePositionModal(\\'' + p.id + '\\', \\'' + p.symbol + '\\', ' + (p.current_price||0) + ')" class="text-gray-500 hover:text-ekantik-red text-xs px-1 ml-1" title="Close"><i class="fas fa-times-circle"></i></button>' +
                '<button onclick="deletePosition(\\'' + p.id + '\\', \\'' + p.symbol + '\\')" class="text-gray-500 hover:text-red-400 text-xs px-1 ml-1" title="Delete"><i class="fas fa-trash"></i></button>' +
              '</td>' +
            '</tr>';
          }).join('') +
          '</tbody></table></div>'
      : '<div class="text-center py-8 text-gray-500 bg-ekantik-card border border-ekantik-border rounded-xl">No open positions — click <b>Add Position</b> to start tracking.</div>') +
    '</div>' +

    // ── Active Signals ──
    '<div class="mb-8">' +
      '<h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-signal mr-2 text-ekantik-amber"></i>Active Signals (' + activeSignals.length + ')</h3>' +
      (activeSignals.length > 0 ?
        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">' +
        activeSignals.map(s => {
          const sigColors = { breakout: 'text-ekantik-green border-ekantik-green/50', dislocation: 'text-ekantik-red border-red-500/50', reversal: 'text-ekantik-amber border-amber-500/50', consolidation: 'text-gray-400 border-gray-500/50', episodic_pivot: 'text-purple-400 border-purple-500/50' };
          const col = sigColors[s.signal_type] || 'text-gray-400 border-gray-500/50';
          const rr = s.risk_reward_ratio ? s.risk_reward_ratio.toFixed(1) + ':1' : '—';
          // Pivot context on signal cards
          let pivotInfo = '';
          try {
            const pv = s.episodic_pivot_json ? JSON.parse(s.episodic_pivot_json) : null;
            if (pv && pv.event) {
              const magCls = pv.magnitude === 'high' ? 'text-red-400' : pv.magnitude === 'medium' ? 'text-amber-400' : 'text-green-400';
              pivotInfo = '<div class="mt-2 pt-2 border-t border-ekantik-border/30">' +
                '<div class="flex items-center gap-2 mb-1">' +
                  '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"><i class="fas fa-bolt"></i> ' + (pivotTypeLabels[pv.pivot_type] || 'PIVOT') + '</span>' +
                  '<span class="text-[10px] font-semibold ' + magCls + '">' + (pv.magnitude||'').toUpperCase() + '</span>' +
                '</div>' +
                '<p class="text-[10px] text-gray-400">' + pv.event + '</p>' +
                (pv.reality_change ? '<p class="text-[10px] text-gray-500 italic mt-0.5">' + pv.reality_change + '</p>' : '') +
              '</div>';
            }
          } catch(e) {}
          return '<div class="bg-ekantik-card border ' + (s.signal_type === 'episodic_pivot' ? 'border-amber-500/30' : 'border-ekantik-border') + ' rounded-xl p-4 group">' +
            '<div class="flex items-center justify-between mb-2">' +
              '<div class="flex items-center gap-2">' +
                '<span class="font-mono font-bold text-white text-lg">' + s.symbol + '</span>' +
                '<span class="px-2 py-0.5 rounded border text-[10px] font-bold uppercase ' + col + '">' + s.signal_type.replace('_',' ') + '</span>' +
                '<span class="px-2 py-0.5 rounded text-[10px] font-semibold ' + (s.engine==='stocks_leaps'?'bg-ekantik-accent/20 text-ekantik-accent':'bg-purple-500/20 text-purple-400') + '">' + (s.engine==='stocks_leaps'?'Stocks':'Options') + '</span>' +
              '</div>' +
              '<div class="flex items-center gap-2">' +
                '<span class="text-ekantik-gold font-bold text-sm">' + (s.confidence||0).toFixed(1) + '/10</span>' +
                '<button onclick="editSignal(\\'' + s.id + '\\')" class="text-gray-500 hover:text-ekantik-accent text-xs" title="Edit"><i class="fas fa-pen"></i></button>' +
                '<button onclick="deactivateSignal(\\'' + s.id + '\\', \\'' + s.symbol + '\\')" class="text-gray-500 hover:text-ekantik-red text-xs" title="Deactivate"><i class="fas fa-ban"></i></button>' +
              '</div>' +
            '</div>' +
            '<div class="grid grid-cols-4 gap-2 text-xs mb-2">' +
              '<div class="bg-ekantik-bg rounded px-2 py-1.5"><span class="text-gray-500 block">Entry</span><span class="text-white font-semibold">' + (s.entry_price?'$'+s.entry_price.toFixed(2):'—') + '</span></div>' +
              '<div class="bg-ekantik-bg rounded px-2 py-1.5"><span class="text-gray-500 block">Stop</span><span class="text-ekantik-red font-semibold">' + (s.stop_price?'$'+s.stop_price.toFixed(2):'—') + '</span></div>' +
              '<div class="bg-ekantik-bg rounded px-2 py-1.5"><span class="text-gray-500 block">Target</span><span class="text-ekantik-green font-semibold">' + (s.target_price?'$'+s.target_price.toFixed(2):'—') + '</span></div>' +
              '<div class="bg-ekantik-bg rounded px-2 py-1.5"><span class="text-gray-500 block">R:R</span><span class="text-white font-semibold">' + rr + '</span></div>' +
            '</div>' +
            (s.thesis ? '<p class="text-gray-400 text-xs mb-1">' + s.thesis + '</p>' : '') +
            (s.time_horizon ? '<span class="text-[10px] text-gray-500"><i class="fas fa-clock mr-1"></i>' + s.time_horizon + '</span>' : '') +
            pivotInfo +
          '</div>';
        }).join('') + '</div>'
      : '<div class="text-center py-8 text-gray-500 bg-ekantik-card border border-ekantik-border rounded-xl">No active signals — click <b>Add Signal</b> to create one.</div>') +
    '</div>' +

    // ── Closed Trades ──
    (closedPos.length > 0 ?
      '<div class="mb-8">' +
        '<h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-check-circle mr-2 text-gray-400"></i>Closed Trades (' + closedPos.length + ')</h3>' +
        '<div class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden">' +
          '<table class="w-full"><thead><tr class="border-b border-ekantik-border">' +
            '<th class="text-left px-4 py-2 text-[10px] text-gray-500 uppercase">Ticker</th>' +
            '<th class="text-right px-3 py-2 text-[10px] text-gray-500 uppercase">Entry</th>' +
            '<th class="text-right px-3 py-2 text-[10px] text-gray-500 uppercase">Exit</th>' +
            '<th class="text-right px-3 py-2 text-[10px] text-gray-500 uppercase">P&L%</th>' +
            '<th class="text-left px-3 py-2 text-[10px] text-gray-500 uppercase">Reason</th>' +
            '<th class="text-left px-3 py-2 text-[10px] text-gray-500 uppercase">Date</th>' +
          '</tr></thead><tbody>' +
          closedPos.map(p => {
            const pnlColor = (p.pnl_pct||0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
            return '<tr class="border-b border-ekantik-border/30">' +
              '<td class="px-4 py-2.5 font-mono font-bold text-gray-400">' + p.symbol + '</td>' +
              '<td class="px-3 py-2.5 text-right text-gray-500 text-sm">$' + (p.entry_price||0).toFixed(2) + '</td>' +
              '<td class="px-3 py-2.5 text-right text-gray-300 text-sm">$' + (p.exit_price||0).toFixed(2) + '</td>' +
              '<td class="px-3 py-2.5 text-right font-semibold text-sm ' + pnlColor + '">' + ((p.pnl_pct||0)>=0?'+':'') + (p.pnl_pct||0).toFixed(2) + '%</td>' +
              '<td class="px-3 py-2.5 text-gray-500 text-xs">' + (p.exit_reason||'closed').replace(/_/g, ' ') + '</td>' +
              '<td class="px-3 py-2.5 text-gray-500 text-xs">' + (p.exit_date||'').substring(0,10) + '</td>' +
            '</tr>';
          }).join('') +
          '</tbody></table></div>' +
      '</div>'
    : '') +

    // ── Inactive Signals ──
    (inactiveSignals.length > 0 ?
      '<div>' +
        '<h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-ban mr-2 text-gray-500"></i>Inactive Signals (' + inactiveSignals.length + ')</h3>' +
        '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">' +
          '<div class="flex flex-wrap gap-3">' +
          inactiveSignals.map(s =>
            '<span class="px-3 py-1 rounded-full bg-ekantik-bg text-gray-500 text-xs">' + s.symbol + ' — ' + s.signal_type.replace('_',' ') +
            ' <button onclick="deleteSignal(\\'' + s.id + '\\')" class="ml-1 hover:text-red-400"><i class="fas fa-trash text-[10px]"></i></button></span>'
          ).join('') +
          '</div>' +
        '</div>' +
      '</div>'
    : '');
}

// ── Position CRUD ──
function openAddPositionModal() {
  document.getElementById('pos-modal-title').textContent = 'Add Position';
  document.getElementById('pos-edit-id').value = '';
  document.getElementById('pos-symbol').value = '';
  document.getElementById('pos-symbol').disabled = false;
  document.getElementById('pos-engine').value = 'stocks_leaps';
  document.getElementById('pos-entry-price').value = '';
  document.getElementById('pos-entry-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('pos-size').value = '';
  document.getElementById('pos-stop').value = '';
  document.getElementById('pos-target').value = '';
  document.getElementById('pos-thesis').value = '';
  // Reset pivot fields
  document.getElementById('pos-has-pivot').checked = false;
  document.getElementById('pos-pivot-fields').classList.add('hidden');
  document.getElementById('pos-pivot-type').value = '';
  document.getElementById('pos-pivot-magnitude').value = '';
  document.getElementById('pos-pivot-event').value = '';
  document.getElementById('pos-pivot-reality').value = '';
  document.getElementById('pos-save-btn').textContent = 'Add Position';
  document.getElementById('position-modal').classList.remove('hidden');
  document.getElementById('position-modal').classList.add('flex');
}

// Toggle pivot fields in position modal
document.addEventListener('change', function(e) {
  if (e.target.id === 'pos-has-pivot') {
    document.getElementById('pos-pivot-fields').classList.toggle('hidden', !e.target.checked);
  }
  // Toggle signal pivot fields when signal_type changes
  if (e.target.id === 'sig-type') {
    document.getElementById('sig-pivot-fields').classList.toggle('hidden', e.target.value !== 'episodic_pivot');
  }
});

function editPosition(id) {
  const p = _positions.find(x => x.id === id);
  if (!p) return;
  document.getElementById('pos-modal-title').textContent = 'Edit Position — ' + p.symbol;
  document.getElementById('pos-edit-id').value = p.id;
  document.getElementById('pos-symbol').value = p.symbol;
  document.getElementById('pos-symbol').disabled = true;
  document.getElementById('pos-engine').value = p.engine;
  document.getElementById('pos-entry-price').value = p.entry_price;
  document.getElementById('pos-entry-date').value = (p.entry_date||'').substring(0,10);
  document.getElementById('pos-size').value = p.size_pct;
  document.getElementById('pos-stop').value = p.stop_price || '';
  document.getElementById('pos-target').value = p.target_price || '';
  document.getElementById('pos-thesis').value = p.thesis || '';
  // Load pivot data
  let pivot = null;
  try { pivot = p.episodic_pivot_json ? JSON.parse(p.episodic_pivot_json) : null; } catch(e) {}
  const hasPivot = pivot && pivot.pivot_type;
  document.getElementById('pos-has-pivot').checked = !!hasPivot;
  document.getElementById('pos-pivot-fields').classList.toggle('hidden', !hasPivot);
  document.getElementById('pos-pivot-type').value = (pivot && pivot.pivot_type) || '';
  document.getElementById('pos-pivot-magnitude').value = (pivot && pivot.magnitude) || '';
  document.getElementById('pos-pivot-event').value = (pivot && pivot.event) || '';
  document.getElementById('pos-pivot-reality').value = (pivot && pivot.reality_change) || '';
  document.getElementById('pos-save-btn').textContent = 'Save Changes';
  document.getElementById('position-modal').classList.remove('hidden');
  document.getElementById('position-modal').classList.add('flex');
}

function closePositionModal() {
  document.getElementById('position-modal').classList.add('hidden');
  document.getElementById('position-modal').classList.remove('flex');
}

async function savePosition() {
  const editId = document.getElementById('pos-edit-id').value;
  const hasPivot = document.getElementById('pos-has-pivot').checked;
  const payload = {
    symbol: document.getElementById('pos-symbol').value.trim().toUpperCase(),
    engine: document.getElementById('pos-engine').value,
    entry_price: parseFloat(document.getElementById('pos-entry-price').value),
    entry_date: document.getElementById('pos-entry-date').value,
    size_pct: parseFloat(document.getElementById('pos-size').value),
    stop_price: parseFloat(document.getElementById('pos-stop').value) || null,
    target_price: parseFloat(document.getElementById('pos-target').value) || null,
    thesis: document.getElementById('pos-thesis').value.trim() || null,
    episodic_pivot: hasPivot ? {
      pivot_type: document.getElementById('pos-pivot-type').value || null,
      magnitude: document.getElementById('pos-pivot-magnitude').value || null,
      event: document.getElementById('pos-pivot-event').value.trim() || null,
      reality_change: document.getElementById('pos-pivot-reality').value.trim() || null,
    } : null,
  };
  if (!payload.symbol || !payload.entry_price || !payload.entry_date || !payload.size_pct) {
    alert('Please fill in required fields (symbol, entry price, date, size %)');
    return;
  }
  try {
    const url = editId ? '/api/journal/positions/' + editId : '/api/journal/positions';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed to save'); return; }
    closePositionModal();
    loadJournal();
  } catch(e) { alert('Error: ' + e.message); }
}

function openClosePositionModal(id, symbol, currentPrice) {
  document.getElementById('close-pos-id').value = id;
  document.getElementById('close-symbol').textContent = symbol;
  document.getElementById('close-exit-price').value = currentPrice || '';
  document.getElementById('close-reason').value = 'manual_close';
  document.getElementById('close-modal').classList.remove('hidden');
  document.getElementById('close-modal').classList.add('flex');
}

function closeCloseModal() {
  document.getElementById('close-modal').classList.add('hidden');
  document.getElementById('close-modal').classList.remove('flex');
}

async function submitClosePosition() {
  const id = document.getElementById('close-pos-id').value;
  const exit_price = parseFloat(document.getElementById('close-exit-price').value);
  const exit_reason = document.getElementById('close-reason').value;
  if (!exit_price) { alert('Enter exit price'); return; }
  try {
    const res = await fetch('/api/journal/positions/' + id + '/close', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exit_price, exit_reason })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed'); return; }
    closeCloseModal();
    loadJournal();
  } catch(e) { alert('Error: ' + e.message); }
}

async function deletePosition(id, symbol) {
  if (!confirm('Delete ' + symbol + ' position permanently? This cannot be undone.')) return;
  try {
    await fetch('/api/journal/positions/' + id, { method: 'DELETE' });
    loadJournal();
  } catch(e) { alert('Error: ' + e.message); }
}

// ── Signal CRUD ──
function openAddSignalModal() {
  document.getElementById('sig-modal-title').textContent = 'Add Signal';
  document.getElementById('sig-edit-id').value = '';
  document.getElementById('sig-symbol').value = '';
  document.getElementById('sig-symbol').disabled = false;
  document.getElementById('sig-type').value = 'breakout';
  document.getElementById('sig-engine').value = 'stocks_leaps';
  document.getElementById('sig-confidence').value = '';
  document.getElementById('sig-entry').value = '';
  document.getElementById('sig-stop').value = '';
  document.getElementById('sig-target').value = '';
  document.getElementById('sig-size').value = '';
  document.getElementById('sig-horizon').value = '';
  document.getElementById('sig-thesis').value = '';
  document.getElementById('sig-invalidation').value = '';
  // Reset pivot fields
  document.getElementById('sig-pivot-fields').classList.add('hidden');
  document.getElementById('sig-pivot-event').value = '';
  document.getElementById('sig-pivot-magnitude').value = '';
  document.getElementById('sig-pivot-reality').value = '';
  document.getElementById('sig-save-btn').textContent = 'Add Signal';
  document.getElementById('signal-modal').classList.remove('hidden');
  document.getElementById('signal-modal').classList.add('flex');
}

function editSignal(id) {
  const s = _signals.find(x => x.id === id);
  if (!s) return;
  document.getElementById('sig-modal-title').textContent = 'Edit Signal — ' + s.symbol;
  document.getElementById('sig-edit-id').value = s.id;
  document.getElementById('sig-symbol').value = s.symbol;
  document.getElementById('sig-symbol').disabled = true;
  document.getElementById('sig-type').value = s.signal_type;
  document.getElementById('sig-engine').value = s.engine;
  document.getElementById('sig-confidence').value = s.confidence || '';
  document.getElementById('sig-entry').value = s.entry_price || '';
  document.getElementById('sig-stop').value = s.stop_price || '';
  document.getElementById('sig-target').value = s.target_price || '';
  document.getElementById('sig-size').value = s.position_size_pct || '';
  document.getElementById('sig-horizon').value = s.time_horizon || '';
  document.getElementById('sig-thesis').value = s.thesis || '';
  document.getElementById('sig-invalidation').value = s.invalidation_criteria || '';
  // Load pivot data
  let pivot = null;
  try { pivot = s.episodic_pivot_json ? JSON.parse(s.episodic_pivot_json) : null; } catch(e) {}
  const isPivotSignal = s.signal_type === 'episodic_pivot';
  document.getElementById('sig-pivot-fields').classList.toggle('hidden', !isPivotSignal);
  document.getElementById('sig-pivot-event').value = (pivot && pivot.event) || '';
  document.getElementById('sig-pivot-magnitude').value = (pivot && pivot.magnitude) || '';
  document.getElementById('sig-pivot-reality').value = (pivot && pivot.reality_change) || '';
  document.getElementById('sig-save-btn').textContent = 'Save Changes';
  document.getElementById('signal-modal').classList.remove('hidden');
  document.getElementById('signal-modal').classList.add('flex');
}

function closeSignalModal() {
  document.getElementById('signal-modal').classList.add('hidden');
  document.getElementById('signal-modal').classList.remove('flex');
}

async function saveSignal() {
  const editId = document.getElementById('sig-edit-id').value;
  const sigType = document.getElementById('sig-type').value;
  const payload = {
    symbol: document.getElementById('sig-symbol').value.trim().toUpperCase(),
    signal_type: sigType,
    engine: document.getElementById('sig-engine').value,
    confidence: parseFloat(document.getElementById('sig-confidence').value) || null,
    entry_price: parseFloat(document.getElementById('sig-entry').value) || null,
    stop_price: parseFloat(document.getElementById('sig-stop').value) || null,
    target_price: parseFloat(document.getElementById('sig-target').value) || null,
    position_size_pct: parseFloat(document.getElementById('sig-size').value) || null,
    time_horizon: document.getElementById('sig-horizon').value.trim() || null,
    thesis: document.getElementById('sig-thesis').value.trim() || null,
    invalidation_criteria: document.getElementById('sig-invalidation').value.trim() || null,
    episodic_pivot: sigType === 'episodic_pivot' ? {
      event: document.getElementById('sig-pivot-event').value.trim() || null,
      magnitude: document.getElementById('sig-pivot-magnitude').value || null,
      reality_change: document.getElementById('sig-pivot-reality').value.trim() || null,
      pivot_type: 'episodic_pivot',
    } : null,
  };
  if (!payload.symbol || !payload.signal_type || !payload.engine) {
    alert('Please fill in required fields (symbol, signal type, engine)');
    return;
  }
  try {
    const url = editId ? '/api/journal/signals/' + editId : '/api/journal/signals';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed to save'); return; }
    closeSignalModal();
    loadJournal();
  } catch(e) { alert('Error: ' + e.message); }
}

async function deactivateSignal(id, symbol) {
  if (!confirm('Deactivate ' + symbol + ' signal?')) return;
  try {
    await fetch('/api/journal/signals/' + id + '/deactivate', { method: 'POST' });
    loadJournal();
  } catch(e) { alert('Error: ' + e.message); }
}

async function deleteSignal(id) {
  if (!confirm('Delete this signal permanently?')) return;
  try {
    await fetch('/api/journal/signals/' + id, { method: 'DELETE' });
    loadJournal();
  } catch(e) { alert('Error: ' + e.message); }
}

// ── Init ──
loadJournal();
`

const settingsScript = `
let _slackChannels = [];
let _slackConfig = {};

(async () => {
  try {
    const configRes = await fetch('/api/slack/config');
    _slackConfig = await configRes.json();
    renderSlackConfig();
  } catch(e) { 
    document.getElementById('slack-config-container').innerHTML = '<div class="text-red-400 text-sm">Failed to load Slack config: ' + e.message + '</div>'; 
  }

  // Update integration status based on slack config
  try {
    const diagRes = await fetch('/api/diag/claude');
    const diag = await diagRes.json();
    updateIntegrationStatus('Claude API', diag.ok ? 'Connected' : 'Error', diag.ok ? 'green' : 'red');
  } catch(e) {}
  if (_slackConfig.botConfigured) {
    updateIntegrationStatus('Slack Bot', _slackConfig.channelId ? 'Connected' : 'Configured', _slackConfig.channelId ? 'green' : 'amber');
  }
})();

function updateIntegrationStatus(name, status, color) {
  const grid = document.getElementById('integration-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.bg-ekantik-bg');
  for (const card of cards) {
    if (card.textContent.includes(name)) {
      const statusEl = card.querySelector('div > div:last-child > div:last-child');
      if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = 'text-ekantik-' + color + ' text-xs';
      }
    }
  }
}

function renderSlackConfig() {
  const container = document.getElementById('slack-config-container');
  if (!_slackConfig.botConfigured) {
    container.innerHTML = 
      '<div class="bg-ekantik-bg border border-ekantik-border rounded-lg p-4">' +
        '<div class="flex items-center gap-3 mb-2">' +
          '<i class="fas fa-exclamation-triangle text-ekantik-amber"></i>' +
          '<span class="text-white text-sm font-semibold">Slack Bot Token Not Set</span>' +
        '</div>' +
        '<p class="text-gray-400 text-xs">Set <code class="bg-ekantik-surface px-1 rounded">SLACK_BOT_TOKEN</code> in Cloudflare Pages secrets to enable Portal → Slack integration.</p>' +
        '<p class="text-gray-500 text-xs mt-2">Required scopes: <code class="bg-ekantik-surface px-1 rounded">chat:write</code>, <code class="bg-ekantik-surface px-1 rounded">channels:read</code></p>' +
      '</div>';
    return;
  }

  const channelInfo = _slackConfig.channelId
    ? '<span class="text-ekantik-green text-xs font-semibold"><i class="fas fa-check-circle mr-1"></i>#' + (_slackConfig.channelName || _slackConfig.channelId) + '</span>'
    : '<span class="text-gray-500 text-xs">Not configured</span>';

  container.innerHTML = 
    '<div class="space-y-4">' +
      // Current channel
      '<div class="flex items-center justify-between py-2 border-b border-ekantik-border">' +
        '<span class="text-gray-400 text-sm">Posting Channel</span>' +
        channelInfo +
      '</div>' +
      // Auto-post toggle
      '<div class="flex items-center justify-between py-2 border-b border-ekantik-border">' +
        '<div>' +
          '<span class="text-gray-400 text-sm">Auto-post portal research</span>' +
          '<div class="text-gray-500 text-xs">Automatically post all portal research results to Slack</div>' +
        '</div>' +
        '<button onclick="toggleAutoPost(this)" class="px-3 py-1 rounded-full text-xs font-semibold transition-colors ' +
          (_slackConfig.autoPost ? 'bg-ekantik-green/20 text-ekantik-green' : 'bg-gray-700 text-gray-400') + '">' +
          (_slackConfig.autoPost ? 'ENABLED' : 'DISABLED') +
        '</button>' +
      '</div>' +
      // Channel picker
      '<div>' +
        '<label class="text-xs text-gray-400 uppercase tracking-wider block mb-2">Slack Channel</label>' +
        '<div class="flex gap-2">' +
          '<div class="flex-1">' +
            '<select id="slack-channel-select" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 hidden">' +
              '<option value="">Loading channels...</option>' +
            '</select>' +
            '<input id="slack-channel-input" type="text" placeholder="Channel ID (e.g. C0AH7FWP2JU)" value="' + (_slackConfig.channelId || '') + '" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />' +
          '</div>' +
          '<button onclick="saveSlackChannel()" class="px-4 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-semibold hover:bg-ekantik-gold-light">Save</button>' +
        '</div>' +
        '<p class="text-gray-500 text-[10px] mt-1.5">Find channel ID: open Slack channel → click channel name in header → scroll to bottom of popup</p>' +
        '<div id="slack-save-status" class="mt-2 text-xs text-gray-500"></div>' +
      '</div>' +
      // Test message
      '<div class="pt-2">' +
        '<button onclick="testSlackPost(this)" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border rounded-lg text-sm text-gray-300 hover:border-ekantik-gold/50 flex items-center gap-2">' +
          '<i class="fab fa-slack"></i> Send Test Message' +
        '</button>' +
      '</div>' +
    '</div>';

  loadChannels();
}

async function loadChannels() {
  const select = document.getElementById('slack-channel-select');
  const input = document.getElementById('slack-channel-input');
  try {
    const res = await fetch('/api/slack/channels');
    const data = await res.json();
    if (data.ok && data.channels && data.channels.length > 0) {
      _slackChannels = data.channels.filter(ch => ch.is_member);
      if (_slackChannels.length > 0) {
        // Show dropdown, hide input
        select.classList.remove('hidden');
        input.classList.add('hidden');
        select.innerHTML = '<option value="">— Select a channel —</option>' +
          _slackChannels.map(ch => 
            '<option value="' + ch.id + '"' + (ch.id === _slackConfig.channelId ? ' selected' : '') + '>' +
              (ch.is_private ? ':lock: ' : '#') + ch.name + ' (' + ch.num_members + ' members)' +
            '</option>'
          ).join('');
        return;
      }
    }
    // Fallback: keep manual input visible
  } catch(e) {
    // Fallback: keep manual input visible
  }
}

async function saveSlackChannel() {
  const select = document.getElementById('slack-channel-select');
  const input = document.getElementById('slack-channel-input');
  // Use dropdown if visible, otherwise use text input
  const channelId = !select.classList.contains('hidden') ? select.value : input.value.trim();
  if (!channelId) { alert('Enter a channel ID'); return; }

  const channel = _slackChannels.find(ch => ch.id === channelId);
  const channelName = channel ? channel.name : channelId;

  const status = document.getElementById('slack-save-status');
  status.textContent = 'Saving...';

  try {
    const res = await fetch('/api/slack/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, channelName, autoPost: _slackConfig.autoPost })
    });
    const data = await res.json();
    if (data.success) {
      _slackConfig.channelId = channelId;
      _slackConfig.channelName = channelName;
      status.innerHTML = '<span class="text-ekantik-green"><i class="fas fa-check mr-1"></i>Saved! Channel set to #' + channelName + '</span>';
      renderSlackConfig();
    } else {
      status.innerHTML = '<span class="text-ekantik-red">Error saving</span>';
    }
  } catch(e) {
    status.innerHTML = '<span class="text-ekantik-red">Error: ' + e.message + '</span>';
  }
}

async function toggleAutoPost(btn) {
  const newVal = !_slackConfig.autoPost;
  try {
    const res = await fetch('/api/slack/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoPost: newVal })
    });
    const data = await res.json();
    if (data.success) {
      _slackConfig.autoPost = newVal;
      btn.textContent = newVal ? 'ENABLED' : 'DISABLED';
      btn.className = 'px-3 py-1 rounded-full text-xs font-semibold transition-colors ' +
        (newVal ? 'bg-ekantik-green/20 text-ekantik-green' : 'bg-gray-700 text-gray-400');
    }
  } catch(e) { alert('Error: ' + e.message); }
}

async function testSlackPost(btn) {
  if (!_slackConfig.channelId) { alert('Configure a Slack channel first'); return; }
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  try {
    // Get the latest report and share it
    const feedRes = await fetch('/api/research/feed?limit=1');
    const { reports } = await feedRes.json();
    if (!reports || reports.length === 0) {
      alert('No research reports to share. Run a research first.');
      btn.disabled = false;
      btn.innerHTML = '<i class="fab fa-slack"></i> Send Test Message';
      return;
    }
    const res = await fetch('/api/slack/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: reports[0].id, channelId: _slackConfig.channelId })
    });
    const data = await res.json();
    if (data.success) {
      btn.innerHTML = '<i class="fas fa-check text-ekantik-green"></i> Sent!';
    } else {
      btn.innerHTML = '<i class="fas fa-times text-ekantik-red"></i> ' + (data.error || 'Failed');
    }
  } catch(e) {
    btn.innerHTML = '<i class="fas fa-times text-ekantik-red"></i> Error';
  }
  setTimeout(() => { btn.innerHTML = '<i class="fab fa-slack"></i> Send Test Message'; btn.disabled = false; }, 3000);
}

async function sendDailyDigest(btn) {
  if (!_slackConfig.channelId) {
    alert('Configure a Slack channel in Slack Integration settings first');
    return;
  }
  btn.disabled = true;
  const origHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating digest...';
  const status = document.getElementById('digest-status');
  status.textContent = 'Compiling daily summary...';

  try {
    const res = await fetch('/api/slack/digest', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      status.innerHTML = '<span class="text-ekantik-green"><i class="fas fa-check-circle mr-1"></i>Daily digest sent! ' + data.reportCount + ' reports summarized for ' + data.date + '</span>';
      btn.innerHTML = '<i class="fas fa-check text-ekantik-green mr-2"></i> Digest Sent';
    } else {
      status.innerHTML = '<span class="text-ekantik-red"><i class="fas fa-exclamation-circle mr-1"></i>' + (data.error || 'Failed to send') + '</span>';
      btn.innerHTML = origHtml;
    }
  } catch(e) {
    status.innerHTML = '<span class="text-ekantik-red">Error: ' + e.message + '</span>';
    btn.innerHTML = origHtml;
  }
  btn.disabled = false;
  setTimeout(() => { btn.innerHTML = origHtml; }, 5000);
}
`
