import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberMag7Routes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — Magnificent 7 Scorecard
// ============================================================
subscriberMag7Routes.get('/mag7', (c) => {
  const user = c.get('user' as any) || null
  return c.html(
    <SubscriberLayout active="mag7" user={user}>
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Magnificent 7 <span class="text-[#d4a843] italic">Scorecard</span></h1>
            <p class="text-gray-400 text-sm mt-1">Weekly monitoring of mega-cap AI leaders</p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-xs">
            <i class="fas fa-sync-alt text-[10px]"></i>
            Weekly Scorecard
          </span>
        </div>
        <div id="mag7-summary" class="mb-6"></div>
        <div id="mag7-grid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <div class="col-span-full text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading Magnificent 7 data...</p>
          </div>
        </div>
        <div id="mag7-table-container" class="mt-8"></div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: mag7Script }} />
    </SubscriberLayout>
  )
})


const mag7Script = `
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

(async function() {
  var grid = document.getElementById('mag7-grid');
  var tableContainer = document.getElementById('mag7-table-container');
  var summaryContainer = document.getElementById('mag7-summary');

  try {
    var res = await fetch('/api/subscriber/mag7');
    var data = await res.json();
    var tickers = data.tickers || data.scorecard || [];
    var weeklySummary = data.weekly_summary || data.summary || '';

    // Weekly summary banner
    if (weeklySummary) {
      summaryContainer.innerHTML = '<div class="bg-[#111827] border border-[#1f2937] rounded-xl p-5 mb-2">' +
        '<div class="flex items-center gap-2 mb-2">' +
          '<i class="fas fa-crown text-[#d4a843]"></i>' +
          '<h3 class="text-sm font-semibold text-[#d4a843] uppercase tracking-wider">Weekly Summary</h3>' +
        '</div>' +
        '<p class="text-gray-300 text-sm leading-relaxed">' + escapeHtml(weeklySummary) + '</p>' +
      '</div>';
    }

    if (!tickers || tickers.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500"><i class="fas fa-crown text-3xl mb-3"></i><p>No Magnificent 7 data available yet. Check back soon.</p></div>';
      return;
    }

    // Scorecard grid cards (read-only, no run buttons)
    grid.innerHTML = tickers.map(function(t) {
      var chgColor = (t.price_change_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
      var chgSign = (t.price_change_pct || 0) >= 0 ? '+' : '';

      var scores = [
        { label: 'TAM', val: t.tam_score || 0 },
        { label: 'Bias', val: t.bias_score || 0 },
        { label: 'Super', val: t.superlative_score || 0 },
        { label: 'Disrupt', val: t.disruption_score || 0 }
      ];

      var convColors = {
        HIGH: 'text-emerald-400',
        MEDIUM: 'text-amber-400',
        LOW: 'text-gray-400'
      };

      return '<div class="bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-[#d4a843]/30 transition-all">' +
        '<div class="flex items-center justify-between mb-3">' +
          '<div class="flex items-center gap-2">' +
            '<span class="text-xl font-bold text-white">' + escapeHtml(t.symbol || t.ticker || '') + '</span>' +
            '<span class="px-1.5 py-0.5 bg-[#d4a843]/20 text-[#d4a843] rounded text-[10px] font-bold">MAG7</span>' +
          '</div>' +
        '</div>' +

        // Price and change
        '<div class="flex items-baseline justify-between mb-4">' +
          '<span class="text-2xl font-bold text-white">' + (t.last_price != null ? '$' + Number(t.last_price).toFixed(2) : '—') + '</span>' +
          '<span class="text-sm font-semibold ' + chgColor + '">' + chgSign + (t.price_change_pct || 0).toFixed(2) + '%</span>' +
        '</div>' +

        // AI Composite Score
        '<div class="flex items-center justify-between mb-3">' +
          '<span class="text-gray-400 text-xs">AI Composite</span>' +
          '<span class="text-[#d4a843] font-bold text-lg">' + (t.ai_score != null ? Number(t.ai_score).toFixed(1) : (t.ai_composite_score != null ? Number(t.ai_composite_score).toFixed(1) : '—')) + '<span class="text-xs text-gray-400">/10</span></span>' +
        '</div>' +

        // Sub-scores mini bars
        '<div class="space-y-2">' +
          scores.map(function(s) {
            return '<div>' +
              '<div class="flex justify-between text-[10px] text-gray-500 mb-0.5">' +
                '<span>' + s.label + '</span>' +
                '<span class="text-gray-300">' + s.val.toFixed(1) + '</span>' +
              '</div>' +
              '<div class="h-1.5 bg-[#0a0f1e] rounded-full overflow-hidden">' +
                '<div class="h-full rounded-full" style="width:' + (s.val / 10 * 100) + '%;background:linear-gradient(to right,#d4a843,#3b82f6)"></div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        // Footer — P/E + Conviction
        '<div class="mt-3 pt-3 border-t border-[#1f2937]/50 flex justify-between text-[10px] text-gray-500">' +
          '<span>P/E: ' + (t.forward_pe ? Number(t.forward_pe).toFixed(1) + 'x' : '—') + '</span>' +
          '<span>Conviction: <span class="font-semibold ' + (convColors[t.conviction] || convColors[t.conviction_level] || 'text-gray-400') + '">' + escapeHtml(t.conviction || t.conviction_level || '—') + '</span></span>' +
        '</div>' +
      '</div>';
    }).join('');

    // Summary table
    tableContainer.innerHTML = '<div class="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">' +
      '<div class="px-5 py-3 border-b border-[#1f2937]"><h3 class="text-white font-semibold text-sm"><i class="fas fa-table mr-2 text-[#d4a843]"></i>Weekly Scorecard Summary</h3></div>' +
      '<div class="overflow-x-auto">' +
      '<table class="w-full"><thead><tr class="border-b border-[#1f2937]">' +
        '<th class="text-left px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Ticker</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Price</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Chg%</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">AI Score</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">TAM</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Bias</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Super</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Disrupt</th>' +
        '<th class="text-right px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Fwd P/E</th>' +
        '<th class="text-center px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-widest">Conviction</th>' +
      '</tr></thead><tbody>' +
      tickers.map(function(t) {
        var chgColor = (t.price_change_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
        var convColors = { HIGH: 'text-emerald-400', MEDIUM: 'text-amber-400', LOW: 'text-gray-400' };
        var conv = t.conviction || t.conviction_level || '—';
        return '<tr class="border-b border-[#1f2937]/30 hover:bg-[#0a0f1e]/50">' +
          '<td class="px-5 py-2.5 font-mono font-bold text-white text-sm">' + escapeHtml(t.symbol || t.ticker || '') + '</td>' +
          '<td class="px-5 py-2.5 text-right text-white text-sm">' + (t.last_price != null ? '$' + Number(t.last_price).toFixed(2) : '—') + '</td>' +
          '<td class="px-5 py-2.5 text-right text-sm font-semibold ' + chgColor + '">' + ((t.price_change_pct || 0) >= 0 ? '+' : '') + (t.price_change_pct || 0).toFixed(2) + '%</td>' +
          '<td class="px-5 py-2.5 text-right text-[#d4a843] font-bold text-sm">' + (t.ai_score != null ? Number(t.ai_score).toFixed(1) : (t.ai_composite_score != null ? Number(t.ai_composite_score).toFixed(1) : '—')) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.tam_score || 0).toFixed(1) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.bias_score || 0).toFixed(1) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.superlative_score || 0).toFixed(1) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.disruption_score || 0).toFixed(1) + '</td>' +
          '<td class="px-5 py-2.5 text-right text-gray-300 text-sm">' + (t.forward_pe ? Number(t.forward_pe).toFixed(1) + 'x' : '—') + '</td>' +
          '<td class="px-5 py-2.5 text-center text-xs font-semibold ' + (convColors[conv] || 'text-gray-400') + '">' + escapeHtml(conv) + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table>' +
      '</div></div>';

  } catch(e) {
    console.error('Mag7 load failed', e);
    grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500"><i class="fas fa-exclamation-triangle text-2xl mb-3"></i><p>Failed to load Magnificent 7 data. Please try again later.</p></div>';
  }
})();
`


export { subscriberMag7Routes }
