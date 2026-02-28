import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const heatRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// PORTFOLIO HEAT DASHBOARD
// ============================================================
heatRoutes.get('/heat', (c) => {
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


export { heatRoutes }
