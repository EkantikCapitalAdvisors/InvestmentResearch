import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const mag7Routes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// MAGNIFICENT 7 COMMAND CENTER
// ============================================================
mag7Routes.get('/mag7', (c) => {
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


export { mag7Routes }
