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
            </select>
            <select id="filter-impact" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50">
              <option value="">All Impact</option>
              <option value="H">High</option>
              <option value="M">Medium</option>
              <option value="L">Low</option>
            </select>
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
        </div>
        <div id="journal-container">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading trade journal...</p>
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
        </div>
        <div class="mt-6 bg-ekantik-card border border-ekantik-border rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-plug mr-2 text-ekantik-gold"></i>Integration Status</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    </Layout>,
    { title: 'Settings — Ekantik Capital' }
  )
})

// ============================================================
// INLINE SCRIPTS
// ============================================================

const dashboardScript = `
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

  // Load feed
  try {
    const feedRes = await fetch('/api/research/feed');
    const { reports } = await feedRes.json();
    const container = document.getElementById('research-feed');

    if (!reports || reports.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-inbox text-3xl mb-3"></i><p>No research reports yet. Reports will appear here as they are generated.</p></div>';
      return;
    }

    container.innerHTML = reports.map(r => {
      const tickers = JSON.parse(r.ticker_symbols || '[]');
      const structured = r.structured_json ? JSON.parse(r.structured_json) : {};
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
      };
      const impactColors = { H: 'bg-red-500/20 text-red-400', M: 'bg-amber-500/20 text-amber-400', L: 'bg-green-500/20 text-green-400' };
      const impactEmoji = { H: '<i class="fas fa-circle text-red-500 text-[8px]"></i>', M: '<i class="fas fa-circle text-amber-500 text-[8px]"></i>', L: '<i class="fas fa-circle text-green-500 text-[8px]"></i>' };
      const triggerIcons = { slack: 'fab fa-slack', cron: 'fas fa-clock', event: 'fas fa-bolt', portal: 'fas fa-globe', manual: 'fas fa-user' };
      const timeAgo = getTimeAgo(r.created_at);

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
        (structured.key_takeaway ? '<p class="mt-3 text-gray-300 text-sm leading-relaxed line-clamp-2">"' + structured.key_takeaway + '"</p>' : '') +
        '<div class="mt-3 flex items-center gap-3 text-xs text-gray-500">' +
          '<span class="flex items-center gap-1"><i class="' + (triggerIcons[r.trigger_source] || 'fas fa-question') + '"></i> via ' + r.trigger_source + '</span>' +
          (r.model_used ? '<span>' + r.model_used + '</span>' : '') +
          (r.cost_estimate ? '<span>$' + r.cost_estimate.toFixed(3) + '</span>' : '') +
        '</div>' +
        '<div class="report-detail hidden mt-4 pt-4 border-t border-ekantik-border">' +
          '<div class="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap text-xs leading-relaxed" style="max-height:400px;overflow-y:auto;">' + escapeHtml(r.raw_markdown || '') + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch(e) { console.error('Feed load failed', e); }
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
`

const watchlistScript = `
(async () => {
  try {
    const res = await fetch('/api/watchlist');
    const { tickers } = await res.json();
    const container = document.getElementById('watchlist-table');

    if (!tickers || tickers.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500 p-6">No tickers in watchlist.</div>';
      return;
    }

    container.innerHTML = '<table class="w-full"><thead><tr class="border-b border-ekantik-border">' +
      '<th class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Ticker</th>' +
      '<th class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Name</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Price</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Change</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">AI Score</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Conviction</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Impact</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Market Cap</th>' +
      '<th class="text-right px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Fwd P/E</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Earnings</th>' +
      '<th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Tags</th>' +
    '</tr></thead><tbody>' +
    tickers.map(t => {
      const chgColor = (t.price_change_pct || 0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
      const chgSign = (t.price_change_pct || 0) >= 0 ? '+' : '';
      const impactColors = { H: 'bg-red-500/20 text-red-400', M: 'bg-amber-500/20 text-amber-400', L: 'bg-green-500/20 text-green-400' };
      const convColors = { HIGH: 'text-ekantik-green', MEDIUM: 'text-ekantik-amber', LOW: 'text-gray-400' };
      const mcap = t.market_cap ? (t.market_cap >= 1e12 ? (t.market_cap/1e12).toFixed(1)+'T' : (t.market_cap/1e9).toFixed(0)+'B') : '—';
      const earningsDate = t.earnings_date ? new Date(t.earnings_date) : null;
      const daysUntil = earningsDate ? Math.ceil((earningsDate - new Date()) / 86400000) : null;

      return '<tr class="border-b border-ekantik-border/50 hover:bg-ekantik-surface/30 cursor-pointer" onclick="location.href=\\'/tickers/' + t.id + '\\'">' +
        '<td class="px-5 py-3"><span class="font-mono font-bold text-white text-sm">' + t.symbol + '</span></td>' +
        '<td class="px-5 py-3 text-gray-300 text-sm">' + t.name + '</td>' +
        '<td class="px-5 py-3 text-right text-white font-semibold text-sm">$' + (t.last_price||0).toFixed(2) + '</td>' +
        '<td class="px-5 py-3 text-right text-sm ' + chgColor + ' font-semibold">' + chgSign + (t.price_change_pct||0).toFixed(2) + '%</td>' +
        '<td class="px-5 py-3 text-right"><span class="text-ekantik-gold font-bold text-sm">' + (t.latest_ai_score ? t.latest_ai_score.toFixed(1) : '—') + '</span></td>' +
        '<td class="px-5 py-3 text-center text-xs font-semibold ' + (convColors[t.latest_conviction] || 'text-gray-500') + '">' + (t.latest_conviction || '—') + '</td>' +
        '<td class="px-5 py-3 text-center">' + (t.latest_impact ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold ' + (impactColors[t.latest_impact]||'') + '">' + t.latest_impact + '</span>' : '<span class="text-gray-500 text-xs">—</span>') + '</td>' +
        '<td class="px-5 py-3 text-right text-gray-300 text-sm">$' + mcap + '</td>' +
        '<td class="px-5 py-3 text-right text-gray-300 text-sm">' + (t.forward_pe ? t.forward_pe.toFixed(1) + 'x' : '—') + '</td>' +
        '<td class="px-5 py-3 text-center text-xs">' + (daysUntil !== null ? (daysUntil <= 7 ? '<span class="text-ekantik-red font-semibold">T-' + daysUntil + '</span>' : '<span class="text-gray-400">T-' + daysUntil + '</span>') : '<span class="text-gray-500">—</span>') + '</td>' +
        '<td class="px-5 py-3 text-center">' + (t.is_mag7 ? '<span class="px-1.5 py-0.5 bg-ekantik-gold/20 text-ekantik-gold rounded text-[10px] font-bold">MAG7</span>' : '') + '</td>' +
      '</tr>';
    }).join('') + '</tbody></table>';
  } catch(e) { console.error('Watchlist load failed', e); }
})();
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
          const agentLabels = {material_events:'MATERIAL EVENTS',bias_mode:'BIAS MODE',mag7_monitor:'MAG 7',aomg_scanner:'AOMG',hot_micro:'HOT MICRO',hot_macro:'HOT MACRO',doubler:'DOUBLER',ai_scorer:'AI SCORER'};
          return '<a href="javascript:void(0)" class="block bg-ekantik-card border border-ekantik-border rounded-lg p-4 hover:border-ekantik-gold/30">' +
            '<div class="flex items-center gap-2">' +
              '<span class="px-2 py-0.5 bg-ekantik-surface text-xs font-bold text-ekantik-gold rounded">' + (agentLabels[r.agent_type]||r.agent_type) + '</span>' +
              (r.impact_score ? '<span class="text-xs ' + (r.impact_score==='H'?'text-red-400':r.impact_score==='M'?'text-amber-400':'text-green-400') + '">Impact: ' + r.impact_score + '</span>' : '') +
              '<span class="text-xs text-gray-500 ml-auto">' + r.created_at + '</span>' +
            '</div>' +
          '</a>';
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
        '<div class="flex items-center gap-3">' +
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
          '<button onclick="submitObservation()" class="px-4 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-semibold hover:bg-ekantik-gold-light transition-colors"><i class="fas fa-plus mr-1"></i>Add</button>' +
        '</div>' +
      '</div>' +

      // Observations list
      (observations.length > 0 ?
        '<div class="space-y-4">' + observations.map(obs => {
          const tickers = obs.ticker_symbols ? JSON.parse(obs.ticker_symbols) : [];
          const catColors = { technology: 'bg-blue-500/20 text-blue-400', consumer_behavior: 'bg-pink-500/20 text-pink-400', regulatory: 'bg-amber-500/20 text-amber-400', macroeconomic: 'bg-cyan-500/20 text-cyan-400', competitive: 'bg-purple-500/20 text-purple-400' };
          return '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-5">' +
            '<div class="flex items-center gap-2 mb-3 flex-wrap">' +
              (obs.category ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ' + (catColors[obs.category] || 'bg-gray-500/20 text-gray-400') + '">' + obs.category.replace('_',' ') + '</span>' : '') +
              tickers.map(t => '<span class="px-2 py-0.5 bg-ekantik-bg rounded text-xs font-mono font-semibold text-white">' + t + '</span>').join('') +
              (obs.is_promoted ? '<span class="px-2 py-0.5 bg-ekantik-gold/20 text-ekantik-gold rounded text-[10px] font-bold"><i class="fas fa-arrow-up mr-1"></i>PROMOTED</span>' : '') +
              '<span class="ml-auto text-xs text-gray-500">' + obs.created_at + '</span>' +
            '</div>' +
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

async function submitObservation() {
  const happened = document.getElementById('obs-happened').value;
  const why = document.getElementById('obs-why').value;
  const watch = document.getElementById('obs-watch').value;
  const tickersStr = document.getElementById('obs-tickers').value;
  const category = document.getElementById('obs-category').value;
  const kpi = document.getElementById('obs-kpi').value;

  if (!happened || !why || !watch) { alert('Please fill in all three observation fields'); return; }

  const tickers = tickersStr.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);

  try {
    await fetch('/api/observations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ happened_text: happened, why_matters: why, watch_next: watch, ticker_symbols: tickers, category, kpi })
    });
    location.reload();
  } catch(e) { alert('Error saving observation'); }
}
`

const journalScript = `
(async () => {
  try {
    const res = await fetch('/api/journal');
    const { positions, signals } = await res.json();
    const container = document.getElementById('journal-container');

    // Separate open and closed
    const openPos = positions.filter(p => p.status === 'open');
    const closedPos = positions.filter(p => p.status !== 'open');

    container.innerHTML =
      // Active positions
      '<div class="mb-8">' +
        '<h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-chart-line mr-2 text-ekantik-green"></i>Open Positions (' + openPos.length + ')</h3>' +
        (openPos.length > 0 ?
          '<div class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden">' +
            '<table class="w-full"><thead><tr class="border-b border-ekantik-border">' +
              '<th class="text-left px-5 py-2.5 text-[10px] text-gray-500 uppercase">Ticker</th>' +
              '<th class="text-center px-5 py-2.5 text-[10px] text-gray-500 uppercase">Engine</th>' +
              '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">Entry</th>' +
              '<th class="text-left px-5 py-2.5 text-[10px] text-gray-500 uppercase">Entry Date</th>' +
              '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">Current</th>' +
              '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">P&L%</th>' +
              '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">P&L $</th>' +
              '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase">R-Mult</th>' +
              '<th class="text-left px-5 py-2.5 text-[10px] text-gray-500 uppercase">Thesis</th>' +
            '</tr></thead><tbody>' +
            openPos.map(p => {
              const pnlColor = (p.pnl_pct||0) >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
              const engColor = p.engine === 'stocks_leaps' ? 'bg-ekantik-accent/20 text-ekantik-accent' : 'bg-purple-500/20 text-purple-400';
              return '<tr class="border-b border-ekantik-border/30 hover:bg-ekantik-surface/20">' +
                '<td class="px-5 py-3 font-mono font-bold text-white">' + p.symbol + '</td>' +
                '<td class="px-5 py-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ' + engColor + '">' + (p.engine==='stocks_leaps'?'Stocks':'Options') + '</span></td>' +
                '<td class="px-5 py-3 text-right text-gray-300 text-sm">$' + (p.entry_price||0).toFixed(2) + '</td>' +
                '<td class="px-5 py-3 text-gray-400 text-sm">' + (p.entry_date||'') + '</td>' +
                '<td class="px-5 py-3 text-right text-white font-semibold text-sm">$' + (p.current_price||0).toFixed(2) + '</td>' +
                '<td class="px-5 py-3 text-right font-semibold text-sm ' + pnlColor + '">' + ((p.pnl_pct||0)>=0?'+':'') + (p.pnl_pct||0).toFixed(2) + '%</td>' +
                '<td class="px-5 py-3 text-right font-semibold text-sm ' + pnlColor + '">' + ((p.pnl_usd||0)>=0?'+$':'-$') + Math.abs(p.pnl_usd||0).toFixed(0) + '</td>' +
                '<td class="px-5 py-3 text-right text-gray-300 text-sm">' + (p.r_multiple||0).toFixed(2) + 'R</td>' +
                '<td class="px-5 py-3 text-gray-400 text-xs max-w-xs truncate">' + (p.thesis||'—') + '</td>' +
              '</tr>';
            }).join('') +
            '</tbody></table></div>'
        : '<div class="text-center py-8 text-gray-500 bg-ekantik-card border border-ekantik-border rounded-xl">No open positions</div>') +
      '</div>' +

      // Active signals
      '<div class="mb-8">' +
        '<h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-signal mr-2 text-ekantik-amber"></i>Active Trade Signals</h3>' +
        (signals.length > 0 ?
          '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">' +
          signals.filter(s => s.is_active).map(s => {
            const sigColors = { breakout: 'text-ekantik-green border-ekantik-green', dislocation: 'text-ekantik-red border-red-500', reversal: 'text-ekantik-amber border-amber-500', consolidation: 'text-gray-400 border-gray-500', episodic_pivot: 'text-purple-400 border-purple-500' };
            const col = sigColors[s.signal_type] || 'text-gray-400 border-gray-500';
            return '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4">' +
              '<div class="flex items-center justify-between mb-2">' +
                '<div class="flex items-center gap-2">' +
                  '<span class="font-mono font-bold text-white text-lg">' + s.symbol + '</span>' +
                  '<span class="px-2 py-0.5 rounded border text-[10px] font-bold uppercase ' + col + '">' + s.signal_type.replace('_',' ') + '</span>' +
                '</div>' +
                '<span class="text-ekantik-gold font-bold">' + (s.confidence||0).toFixed(1) + '/10</span>' +
              '</div>' +
              '<div class="grid grid-cols-3 gap-3 text-xs mb-2">' +
                '<div class="bg-ekantik-bg rounded px-2 py-1.5"><span class="text-gray-500 block">Entry</span><span class="text-white font-semibold">' + (s.entry_price?'$'+s.entry_price.toFixed(2):'—') + '</span></div>' +
                '<div class="bg-ekantik-bg rounded px-2 py-1.5"><span class="text-gray-500 block">Stop</span><span class="text-ekantik-red font-semibold">' + (s.stop_price?'$'+s.stop_price.toFixed(2):'—') + '</span></div>' +
                '<div class="bg-ekantik-bg rounded px-2 py-1.5"><span class="text-gray-500 block">Target</span><span class="text-ekantik-green font-semibold">' + (s.target_price?'$'+s.target_price.toFixed(2):'—') + '</span></div>' +
              '</div>' +
              (s.thesis ? '<p class="text-gray-400 text-xs">' + s.thesis + '</p>' : '') +
            '</div>';
          }).join('') + '</div>'
        : '<div class="text-center py-8 text-gray-500 bg-ekantik-card border border-ekantik-border rounded-xl">No active signals</div>') +
      '</div>' +

      // Closed trades  
      (closedPos.length > 0 ?
        '<div>' +
          '<h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-check-circle mr-2 text-gray-400"></i>Closed Trades (' + closedPos.length + ')</h3>' +
          '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-5 text-center text-gray-500 text-sm">Trade history will appear here when positions are closed.</div>' +
        '</div>'
      : '');

  } catch(e) { console.error('Journal load failed', e); }
})();
`
