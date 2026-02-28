import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const tickerDetailRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// TICKER DETAIL
// ============================================================
tickerDetailRoutes.get('/tickers/:id', (c) => {
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


export { tickerDetailRoutes }
