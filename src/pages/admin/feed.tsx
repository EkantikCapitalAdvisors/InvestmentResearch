import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const feedRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// DASHBOARD — Intelligence Feed
// ============================================================
feedRoutes.get('/feed', (c) => {
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
                <select id="run-agent" onchange="onAgentChange()" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
                  <optgroup label="&#x1F3AF; Ticker-Specific (requires tickers)">
                    <option value="material_events">Material Events Intelligence</option>
                    <option value="bias_mode">Bias Mode Detection</option>
                    <option value="ai_scorer">AI Scoring Framework</option>
                    <option value="doubler">Doubling Potential Analysis</option>
                    <option value="episodic_pivot">Episodic Pivot Scanner</option>
                    <option value="disruption">Disruption &amp; Superlative Detection</option>
                    <option value="dislocation">Dislocation Detection</option>
                  </optgroup>
                  <optgroup label="&#x1F30D; Market-Wide (no tickers needed)">
                    <option value="mag7_monitor">Magnificent 7 Scorecard</option>
                    <option value="hot_micro">Hot Micro Trend Pipeline</option>
                    <option value="hot_macro">Hot Macro Events</option>
                  </optgroup>
                  <optgroup label="&#x1F504; Hybrid (tickers optional, uses watchlist)">
                    <option value="social_sentiment">Social Sentiment Scanner</option>
                    <option value="aomg_scanner">AOMG Growth Scanner</option>
                  </optgroup>
                </select>
                <p id="agent-desc" class="text-[10px] text-gray-500 mt-1.5 leading-relaxed"></p>
              </div>
              <div id="ticker-section">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs text-gray-400 uppercase tracking-wider">Ticker(s)</label>
                  <button type="button" onclick="fillWatchlistTickers()" id="use-watchlist-btn" class="text-[10px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"><i class="fas fa-list-ul"></i> Use Watchlist</button>
                </div>
                <input id="run-tickers" type="text" placeholder="NVDA, MSFT, AAPL" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
                <p id="ticker-hint" class="text-[10px] text-gray-500 mt-1"></p>
              </div>
              <div id="no-ticker-section" class="hidden">
                <div class="bg-ekantik-surface border border-ekantik-border rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <i class="fas fa-globe text-ekantik-gold"></i>
                  <span id="no-ticker-msg" class="text-sm text-gray-400">Scans market-wide — no tickers needed</span>
                </div>
              </div>
              <div id="hybrid-ticker-section" class="hidden">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs text-gray-400 uppercase tracking-wider">Ticker(s) <span class="text-gray-500">(optional)</span></label>
                  <button type="button" onclick="fillWatchlistTickers()" class="text-[10px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"><i class="fas fa-list-ul"></i> Use Watchlist</button>
                </div>
                <input id="run-tickers-hybrid" type="text" placeholder="Leave empty to scan broadly, or enter NVDA, MSFT..." class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />
                <p id="hybrid-ticker-hint" class="text-[10px] text-gray-500 mt-1">Optional — provide tickers to focus the scan, or leave empty for market-wide analysis.</p>
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

// ── Agent configuration for Run Research modal ──────────
// mode: 'ticker' = requires tickers, 'market' = no tickers, 'hybrid' = tickers optional
const AGENT_CONFIG = {
  material_events: { mode: 'ticker',  desc: 'Detects material events affecting specific stocks — earnings surprises, M&A, FDA, legal.' },
  bias_mode:       { mode: 'ticker',  desc: 'Triple-test bias detection on a specific ticker — genuine vs. misleading signals.' },
  ai_scorer:       { mode: 'ticker',  desc: 'Six-dimension AI scoring framework for individual stock analysis.' },
  doubler:         { mode: 'ticker',  desc: 'Screens specific tickers for 2x potential over 12-24 months.' },
  episodic_pivot:  { mode: 'ticker',  desc: 'Detects episodic pivot events that fundamentally change a stock\\'s trajectory.' },
  disruption:      { mode: 'ticker',  desc: 'Identifies disruptive or superlative products that create competitive moats.' },
  dislocation:     { mode: 'ticker',  desc: 'Flags 15-50%+ price drops from temporary catalysts — potential buying opportunities.' },
  mag7_monitor:    { mode: 'market',  desc: 'Scorecard analysis across all Magnificent 7 stocks (AAPL, MSFT, GOOG, AMZN, NVDA, META, TSLA).' },
  hot_micro:       { mode: 'market',  desc: 'Scans market-wide for trending micro-cap themes and momentum shifts.' },
  hot_macro:       { mode: 'market',  desc: 'Scans global macro events — Fed, geopolitics, trade policy, sector rotations.' },
  social_sentiment:{ mode: 'hybrid',  desc: 'Scans social media, Reddit, X for sentiment shifts. Optionally focus on specific tickers or your watchlist.' },
  aomg_scanner:    { mode: 'hybrid',  desc: 'AOMG Growth Scanner — optionally narrow to specific tickers, or scan broadly across market themes.' },
};

function onAgentChange() {
  var agent = document.getElementById('run-agent').value;
  var cfg = AGENT_CONFIG[agent] || { mode: 'ticker', desc: '' };

  // Update description
  document.getElementById('agent-desc').textContent = cfg.desc;

  // Toggle sections based on agent mode
  var tickerSec = document.getElementById('ticker-section');
  var noTickerSec = document.getElementById('no-ticker-section');
  var hybridSec = document.getElementById('hybrid-ticker-section');
  var tickerHint = document.getElementById('ticker-hint');

  tickerSec.classList.add('hidden');
  noTickerSec.classList.add('hidden');
  hybridSec.classList.add('hidden');

  if (cfg.mode === 'ticker') {
    tickerSec.classList.remove('hidden');
    tickerHint.textContent = 'Required — comma-separated. Click "Use Watchlist" to auto-fill.';
  } else if (cfg.mode === 'market') {
    noTickerSec.classList.remove('hidden');
  } else if (cfg.mode === 'hybrid') {
    hybridSec.classList.remove('hidden');
  }
}

// Auto-fill tickers from watchlist (works for both ticker-required and hybrid inputs)
async function fillWatchlistTickers() {
  // Find whichever "Use Watchlist" button was clicked
  var btn = document.getElementById('use-watchlist-btn');
  if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  try {
    var res = await fetch('/api/watchlist');
    var data = await res.json();
    var symbols = (data.tickers || []).map(function(t) { return t.symbol; });
    if (symbols.length === 0) {
      alert('Your watchlist is empty. Add tickers to the Watchlist page first.');
    } else {
      // Fill whichever ticker input is visible
      var tickerInput = document.getElementById('run-tickers');
      var hybridInput = document.getElementById('run-tickers-hybrid');
      var tickerHint = document.getElementById('ticker-hint');
      var hybridHint = document.getElementById('hybrid-ticker-hint');
      if (tickerInput && !tickerInput.closest('.hidden')) {
        tickerInput.value = symbols.join(', ');
        if (tickerHint) tickerHint.innerHTML = '<span class="text-teal-400">' + symbols.length + ' tickers loaded from watchlist</span>';
      }
      if (hybridInput && !hybridInput.closest('.hidden')) {
        hybridInput.value = symbols.join(', ');
        if (hybridHint) hybridHint.innerHTML = '<span class="text-teal-400">' + symbols.length + ' tickers loaded from watchlist</span>';
      }
    }
  } catch(e) {
    alert('Failed to load watchlist: ' + e.message);
  }
  if (btn) btn.innerHTML = '<i class="fas fa-list-ul"></i> Use Watchlist';
}

// Initialize on page load
(function() { onAgentChange(); })();

async function runResearch() {
  const agent = document.getElementById('run-agent').value;
  const context = document.getElementById('run-context').value;
  const btn = document.getElementById('run-btn');
  const status = document.getElementById('run-status');
  const cfg = AGENT_CONFIG[agent] || { mode: 'ticker' };

  if (!agent) { alert('Please select an agent'); return; }

  // Collect tickers based on agent mode
  var tickers = [];
  if (cfg.mode === 'ticker') {
    var tickersStr = document.getElementById('run-tickers').value;
    tickers = tickersStr.toUpperCase().split(/[\\s,]+/).filter(t => /^[A-Z]{1,5}$/.test(t));
    if (tickers.length === 0) {
      alert('This agent requires at least one ticker symbol. Enter tickers or click "Use Watchlist".');
      return;
    }
  } else if (cfg.mode === 'hybrid') {
    var hybridStr = (document.getElementById('run-tickers-hybrid').value || '');
    tickers = hybridStr.toUpperCase().split(/[\\s,]+/).filter(t => /^[A-Z]{1,5}$/.test(t));
    // Hybrid agents accept empty tickers — they run market-wide if no tickers given
  }
  // mode === 'market' — no tickers, that's fine

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Researching...';
  status.textContent = '';

  // Passcode gate
  const pHeaders = await withPasscode({ 'Content-Type': 'application/json' });
  if (pHeaders === null) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Execute Research';
    return;
  }

  status.textContent = cfg.mode === 'market'
    ? 'Claude is running market-wide scan — typically 30-90 seconds...'
    : tickers.length > 0
      ? 'Claude is analyzing ' + tickers.length + ' ticker(s) — typically 30-90 seconds...'
      : 'Claude is scanning broadly — typically 30-90 seconds...';

  try {
    const res = await fetch('/api/research/run', {
      method: 'POST',
      headers: pHeaders,
      body: JSON.stringify({ agentType: agent, tickers, additionalContext: context || undefined })
    });
    const data = await res.json();

    if (handlePasscodeError(data)) {
      status.textContent = 'Passcode error — please try again.';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-play"></i> Execute Research';
      return;
    }

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


export { feedRoutes }
