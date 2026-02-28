import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const journalRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// TRADE JOURNAL
// ============================================================
journalRoutes.get('/journal', (c) => {
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


export { journalRoutes }
