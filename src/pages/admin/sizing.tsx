import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const sizingRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// OPTION SIZING CALCULATOR
// Translates a directional stock position into the delta-matched option.
// ============================================================
sizingRoutes.get('/sizing', (c) => {
  return c.render(
    <Layout active="sizing">
      <div class="fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">Option <span class="text-ekantik-gold italic">Sizing</span> Calculator</h1>
          <p class="text-gray-400 text-sm mt-1">
            Match delta, not dollars — translate a directional stock position into the equivalent call
          </p>
        </div>

        <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-5 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label class="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Symbol</label>
              <input id="sz-symbol" type="text" value="SPY" maxlength={10}
                class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm uppercase focus:border-ekantik-gold focus:outline-none" />
            </div>
            <div>
              <label class="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Position size</label>
              <select id="sz-exposure"
                class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm focus:border-ekantik-gold focus:outline-none">
                <option value="0.25">25% of equity</option>
                <option value="0.50">50% of equity</option>
                <option value="0.75">75% of equity</option>
                <option value="1.00" selected>100% of equity</option>
                <option value="1.50">150% of equity</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Thesis window</label>
              <select id="sz-days"
                class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm focus:border-ekantik-gold focus:outline-none">
                <option value="3">3 days</option>
                <option value="5" selected>1 week</option>
                <option value="10">2 weeks</option>
                <option value="21">1 month</option>
                <option value="42">2 months</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Equity (blank = book)</label>
              <input id="sz-equity" type="number" placeholder="100000" min="1000" step="1000"
                class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-white text-sm focus:border-ekantik-gold focus:outline-none" />
            </div>
            <div class="flex items-end">
              <button id="sz-run"
                class="w-full bg-ekantik-gold text-ekantik-bg font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity">
                <i class="fas fa-calculator mr-2"></i>Size it
              </button>
            </div>
          </div>
          <p class="text-[11px] text-gray-500 mt-3">
            Expiry is searched at 2&ndash;6x the thesis window, never the window itself. Strikes are filtered on
            open interest and quoted spread before delta, because quoted IV on thinly traded in-the-money
            strikes is not a real price.
          </p>
        </div>

        <div id="sz-out"></div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: sizingScript }} />
    </Layout>,
    { title: 'Option Sizing — Ekantik Capital' }
  )
})

const sizingScript = `
(() => {
  const $ = (id) => document.getElementById(id);
  const out = $('sz-out');

  const usd = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const pct = (n, d) => (n * 100).toFixed(d === undefined ? 1 : d) + '%';
  const signed = (n) => (n >= 0 ? '+' : '') + pct(n);
  const tone = (n) => n >= 0 ? 'text-ekantik-green' : 'text-ekantik-red';
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

  function card(label, value, sub, valueClass) {
    return '<div class="bg-ekantik-card border border-ekantik-border rounded-xl p-5">' +
      '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">' + label + '</div>' +
      '<div class="text-2xl font-bold ' + (valueClass || 'text-white') + '">' + value + '</div>' +
      (sub ? '<div class="text-gray-400 text-xs mt-1">' + sub + '</div>' : '') +
    '</div>';
  }

  function renderRecommended(d) {
    const r = d.recommended;
    if (!r) return '';
    const capFit = r.premiumPctEquity * 100 <= d.optionsRiskCapPct;
    return '<div class="bg-ekantik-card border border-ekantik-gold/40 rounded-xl p-6 mb-6">' +
      '<div class="flex items-center gap-2 mb-1">' +
        '<i class="fas fa-star text-ekantik-gold text-xs"></i>' +
        '<span class="text-[10px] text-ekantik-gold uppercase tracking-widest">Tightest delta match</span>' +
      '</div>' +
      '<div class="text-xl font-bold text-white mb-1">' +
        esc(d.symbol) + ' ' + esc(r.expiry) + ' ' + r.strike + ' call &times; ' + r.contracts +
      '</div>' +
      '<div class="text-gray-400 text-sm mb-5">' +
        usd(r.premium) + ' premium &middot; ' + r.bid.toFixed(2) + ' / ' + r.ask.toFixed(2) +
        ' &middot; OI ' + r.openInterest.toLocaleString() + ' &middot; IV ' + pct(r.iv) +
      '</div>' +
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">' +
        '<div><div class="text-[10px] text-gray-500 uppercase tracking-widest">Position delta</div>' +
          '<div class="text-white font-semibold">' + Math.round(r.positionDelta) + ' sh</div>' +
          '<div class="text-xs ' + tone(-Math.abs(r.deltaErrorPct)) + '">' + signed(r.deltaErrorPct) + ' vs ' + Math.round(d.shares) + ' needed</div></div>' +
        '<div><div class="text-[10px] text-gray-500 uppercase tracking-widest">Capital</div>' +
          '<div class="text-white font-semibold">' + pct(r.premiumPctEquity) + ' of equity</div>' +
          '<div class="text-xs text-gray-400">vs ' + usd(d.notional) + ' in stock</div></div>' +
        '<div><div class="text-[10px] text-gray-500 uppercase tracking-widest">Theta, ' + d.windowDays + 'd</div>' +
          '<div class="text-white font-semibold">' + usd(r.thetaWindow) + '</div>' +
          '<div class="text-xs text-gray-400">' + r.dte + ' dte, ' + (r.dte / d.windowDays).toFixed(1) + 'x buffer</div></div>' +
        '<div><div class="text-[10px] text-gray-500 uppercase tracking-widest">Breakeven</div>' +
          '<div class="text-white font-semibold">' + (r.breakevenMove === null ? 'n/a' : signed(r.breakevenMove)) + '</div>' +
          '<div class="text-xs text-gray-400">max loss ' + usd(r.premium) + '</div></div>' +
      '</div>' +
      '<div class="mt-4 pt-4 border-t border-ekantik-border text-xs ' + (capFit ? 'text-ekantik-green' : 'text-ekantik-amber') + '">' +
        '<i class="fas ' + (capFit ? 'fa-check' : 'fa-triangle-exclamation') + ' mr-1"></i>' +
        'Premium is ' + pct(r.premiumPctEquity) + ' of equity against the ' + d.optionsRiskCapPct + '% options sleeve cap' +
        (capFit ? ' — fits.' : ' — over the cap, size down.') +
      '</div>' +
    '</div>';
  }

  function renderTable(d) {
    const moves = d.scenarioMoves;
    let h = '<div class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden mb-6">' +
      '<div class="px-5 py-3 border-b border-ekantik-border flex items-center justify-between">' +
        '<span class="text-sm font-semibold text-white">Tradeable strikes</span>' +
        '<span class="text-[11px] text-gray-500">' + d.candidates.length + ' pass the liquidity filter &middot; ' +
          d.rejectedIlliquid.toLocaleString() + ' rejected</span>' +
      '</div>' +
      '<div class="overflow-x-auto"><table class="w-full text-xs">' +
      '<thead class="bg-ekantik-bg text-gray-500 uppercase tracking-widest text-[10px]"><tr>' +
        '<th class="px-3 py-2 text-left">Expiry</th><th class="px-3 py-2 text-right">DTE</th>' +
        '<th class="px-3 py-2 text-right">Strike</th><th class="px-3 py-2 text-right">IV</th>' +
        '<th class="px-3 py-2 text-right">Delta</th><th class="px-3 py-2 text-right">Ctr</th>' +
        '<th class="px-3 py-2 text-right">Pos &Delta;</th><th class="px-3 py-2 text-right">Miss</th>' +
        '<th class="px-3 py-2 text-right">Premium</th><th class="px-3 py-2 text-right">Theta</th>' +
        '<th class="px-3 py-2 text-right">BE</th>' +
        moves.map((m) => '<th class="px-3 py-2 text-right">' + signed(m) + '</th>').join('') +
        '<th class="px-3 py-2 text-right">Track</th><th class="px-3 py-2 text-right">OI</th>' +
      '</tr></thead><tbody>';

    for (const c of d.candidates) {
      const isRec = d.recommended && c.expiry === d.recommended.expiry && c.strike === d.recommended.strike;
      h += '<tr class="border-t border-ekantik-border ' + (isRec ? 'bg-ekantik-gold/10' : '') + '">' +
        '<td class="px-3 py-2 text-gray-300">' + esc(c.expiry) + '</td>' +
        '<td class="px-3 py-2 text-right text-gray-400">' + c.dte + '</td>' +
        '<td class="px-3 py-2 text-right text-white font-semibold">' + c.strike + '</td>' +
        '<td class="px-3 py-2 text-right text-gray-400">' + pct(c.iv) + '</td>' +
        '<td class="px-3 py-2 text-right text-gray-300">' + c.delta.toFixed(2) + '</td>' +
        '<td class="px-3 py-2 text-right text-gray-300">' + c.contracts + '</td>' +
        '<td class="px-3 py-2 text-right text-gray-300">' + Math.round(c.positionDelta) + '</td>' +
        '<td class="px-3 py-2 text-right ' + (Math.abs(c.deltaErrorPct) <= 0.05 ? 'text-ekantik-green' : 'text-gray-400') + '">' + signed(c.deltaErrorPct) + '</td>' +
        '<td class="px-3 py-2 text-right text-white">' + usd(c.premium) + '</td>' +
        '<td class="px-3 py-2 text-right text-ekantik-red">' + usd(c.thetaWindow) + '</td>' +
        '<td class="px-3 py-2 text-right text-gray-400">' + (c.breakevenMove === null ? 'n/a' : signed(c.breakevenMove)) + '</td>' +
        moves.map((m) => {
          const v = c.pnlAtMove[m.toFixed(3)];
          return '<td class="px-3 py-2 text-right ' + tone(v) + '">' + usd(v) + '</td>';
        }).join('') +
        '<td class="px-3 py-2 text-right text-gray-300">' + Math.round(c.trackingAt2Pct * 100) + '%</td>' +
        '<td class="px-3 py-2 text-right text-gray-500">' + c.openInterest.toLocaleString() + '</td>' +
      '</tr>';
    }

    h += '<tr class="border-t-2 border-ekantik-gold/30 bg-ekantik-bg/50">' +
      '<td class="px-3 py-2 text-ekantik-gold font-semibold" colspan="8">Stock, ' + usd(d.notional) + '</td>' +
      '<td class="px-3 py-2 text-right text-white">' + usd(d.notional) + '</td>' +
      '<td class="px-3 py-2 text-right text-gray-500">$0</td>' +
      '<td class="px-3 py-2 text-right text-gray-500">0.0%</td>' +
      moves.map((m) => '<td class="px-3 py-2 text-right ' + tone(m) + '">' + usd(d.notional * m) + '</td>').join('') +
      '<td class="px-3 py-2 text-right text-gray-400">100%</td><td class="px-3 py-2"></td>' +
    '</tr></tbody></table></div>' +
    '<div class="px-5 py-3 border-t border-ekantik-border text-[11px] text-gray-500">' +
      'P&amp;L columns assume the move lands at day ' + d.windowDays + ' with IV unchanged. ' +
      '&ldquo;Track&rdquo; is the option&rsquo;s P&amp;L as a share of the stock&rsquo;s on a +2% move. ' +
      '&ldquo;Miss&rdquo; is the exposure error forced by whole-contract rounding.' +
    '</div></div>';
    return h;
  }

  async function run() {
    const symbol = ($('sz-symbol').value || 'SPY').trim().toUpperCase();
    const exposure = $('sz-exposure').value;
    const days = $('sz-days').value;
    const equity = $('sz-equity').value;
    const btn = $('sz-run');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Pricing';
    out.innerHTML = '<div class="text-center py-12 text-gray-500">' +
      '<i class="fas fa-spinner fa-spin text-2xl mb-3"></i><p>Fetching live chain for ' + esc(symbol) + '…</p></div>';

    try {
      const qs = new URLSearchParams({ symbol: symbol, exposure: exposure, days: days });
      if (equity) qs.set('equity', equity);
      const res = await fetch('/api/options/size?' + qs.toString());
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Request failed');

      if (!d.candidates.length) {
        out.innerHTML = '<div class="bg-ekantik-card border border-ekantik-amber/40 rounded-xl p-6 text-ekantik-amber text-sm">' +
          '<i class="fas fa-triangle-exclamation mr-2"></i>No strike in ' + esc(d.symbol) +
          ' clears the liquidity filter for that tenor. Widen the thesis window or pick a more liquid underlying.</div>';
        return;
      }

      out.innerHTML =
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">' +
          card('Spot', '$' + d.spot.toFixed(2), esc(d.symbol) + ' &middot; close ' + esc(d.asof)) +
          card('Stock position', usd(d.notional), pct(d.exposure, 0) + ' of ' + usd(d.equity)) +
          card('Shares', d.shares.toFixed(1), 'delta to replicate') +
          card('Thesis window', d.windowDays + ' days', 'expiry searched at 2&ndash;6x') +
        '</div>' +
        renderRecommended(d) +
        renderTable(d);
    } catch (err) {
      out.innerHTML = '<div class="bg-ekantik-card border border-ekantik-red/40 rounded-xl p-6 text-ekantik-red text-sm">' +
        '<i class="fas fa-circle-exclamation mr-2"></i>' + esc(err.message) + '</div>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-calculator mr-2"></i>Size it';
    }
  }

  $('sz-run').addEventListener('click', run);
  $('sz-symbol').addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  run();
})();
`

export { sizingRoutes }
