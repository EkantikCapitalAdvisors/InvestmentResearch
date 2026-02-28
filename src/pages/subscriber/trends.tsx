import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberTrendsRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — AOMG Trend Radar
// ============================================================
subscriberTrendsRoutes.get('/trends', (c) => {
  const user = c.get('user' as any) || null
  return c.html(
    <SubscriberLayout active="trends" user={user}>
      <div class="fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">AOMG <span class="text-[#d4a843] italic">Trend Radar</span></h1>
          <p class="text-gray-400 text-sm mt-1">Areas of Maximum Growth — tracking the hottest macro and sector themes</p>
        </div>
        <div id="trends-container" class="space-y-6">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading trend themes...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: trendsScript }} />
    </SubscriberLayout>
  )
})


const trendsScript = `
function formatMarketSize(val) {
  if (!val) return '—';
  if (val >= 1e12) return '$' + (val / 1e12).toFixed(1) + 'T';
  if (val >= 1e9) return '$' + (val / 1e9).toFixed(0) + 'B';
  if (val >= 1e6) return '$' + (val / 1e6).toFixed(0) + 'M';
  return '$' + val.toLocaleString();
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

(async () => {
  const container = document.getElementById('trends-container');
  try {
    const res = await fetch('/api/subscriber/trends');
    const data = await res.json();
    const themes = data.themes || data.trends || [];

    if (!themes || themes.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-bullseye text-3xl mb-3"></i><p>No trend themes available yet. Check back soon.</p></div>';
      return;
    }

    container.innerHTML = themes.map(function(theme) {
      var drivers = [];
      var constraints = [];
      var catalysts = [];
      try { drivers = typeof theme.sentiment_drivers === 'string' ? JSON.parse(theme.sentiment_drivers) : (theme.sentiment_drivers || []); } catch(e) {}
      try { constraints = typeof theme.sentiment_constraints === 'string' ? JSON.parse(theme.sentiment_constraints) : (theme.sentiment_constraints || []); } catch(e) {}
      try { catalysts = typeof theme.key_catalysts === 'string' ? JSON.parse(theme.key_catalysts) : (theme.key_catalysts || []); } catch(e) {}

      var beneficiaries = [];
      try { beneficiaries = typeof theme.key_beneficiaries === 'string' ? JSON.parse(theme.key_beneficiaries) : (theme.key_beneficiaries || []); } catch(e) {}

      var statusColors = {
        active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        monitoring: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        emerging: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      };

      var tam = formatMarketSize(theme.tam_estimate);
      var sam = formatMarketSize(theme.sam_estimate);
      var som = formatMarketSize(theme.som_estimate);

      var samPct = theme.sam_estimate && theme.tam_estimate ? (theme.sam_estimate / theme.tam_estimate * 100) : 0;
      var somPct = theme.som_estimate && theme.tam_estimate ? (theme.som_estimate / theme.tam_estimate * 100) : 0;

      var disruptionBadge = '';
      if (theme.disruption_score != null) {
        var dColor = theme.disruption_score >= 8 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                     theme.disruption_score >= 5 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                     'bg-green-500/20 text-green-400 border-green-500/30';
        disruptionBadge = '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ' + dColor + '"><i class="fas fa-bolt mr-1"></i>Disruption: ' + theme.disruption_score + '/10</span>';
      }

      return '<div class="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">' +
        '<div class="p-6">' +
          // Header row
          '<div class="flex items-start justify-between mb-4">' +
            '<div class="flex-1">' +
              '<h3 class="text-lg font-bold text-white">' + escapeHtml(theme.name || theme.theme_name || '') + '</h3>' +
              '<div class="flex items-center gap-2 mt-2">' +
                '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#d4a843]/20 text-[#d4a843] border border-[#d4a843]/30">' + escapeHtml((theme.quarter || '') + ' ' + (theme.year || '')) + '</span>' +
                '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ' + (statusColors[theme.status] || statusColors.monitoring) + '">' + escapeHtml(theme.status || 'monitoring') + '</span>' +
                disruptionBadge +
              '</div>' +
            '</div>' +
            '<div class="text-right ml-4">' +
              '<div class="text-[10px] text-gray-400 uppercase tracking-wider">AI Score</div>' +
              '<div class="text-[#d4a843] font-bold text-2xl">' + (theme.ai_score_composite != null ? theme.ai_score_composite : '—') + '</div>' +
            '</div>' +
          '</div>' +

          // Description / Thesis
          (theme.description || theme.thesis ? '<p class="text-gray-300 text-sm mb-5 leading-relaxed">' + escapeHtml(theme.description || theme.thesis) + '</p>' : '') +

          // TAM / SAM / SOM funnel
          '<div class="mb-5">' +
            '<h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3"><i class="fas fa-chart-bar mr-1"></i>Market Sizing Funnel</h4>' +
            '<div class="space-y-2">' +
              '<div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">TAM (Total Addressable)</span><span class="text-white font-semibold">' + tam + '</span></div><div class="h-3 bg-[#0a0f1e] rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style="width:100%"></div></div></div>' +
              '<div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">SAM (Serviceable)</span><span class="text-white font-semibold">' + sam + '</span></div><div class="h-3 bg-[#0a0f1e] rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-[#d4a843] to-amber-400 rounded-full" style="width:' + samPct + '%"></div></div></div>' +
              '<div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">SOM (Obtainable)</span><span class="text-white font-semibold">' + som + '</span></div><div class="h-3 bg-[#0a0f1e] rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style="width:' + somPct + '%"></div></div></div>' +
            '</div>' +
          '</div>' +

          // Key Beneficiaries
          (beneficiaries.length > 0 ? '<div class="mb-5">' +
            '<h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3"><i class="fas fa-users mr-1"></i>Key Beneficiaries</h4>' +
            '<div class="flex flex-wrap gap-2">' +
              beneficiaries.map(function(b) {
                var ticker = typeof b === 'string' ? b : (b.ticker || b.symbol || b.name || '');
                var phase = typeof b === 'object' && b.lifecycle_phase ? b.lifecycle_phase : '';
                var phaseColors = {
                  early: 'border-blue-500/40 text-blue-400',
                  growth: 'border-emerald-500/40 text-emerald-400',
                  mature: 'border-amber-500/40 text-amber-400',
                  declining: 'border-red-500/40 text-red-400'
                };
                return '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f1e] border ' + (phaseColors[phase] || 'border-[#1f2937] text-white') + ' rounded-lg text-xs font-mono font-semibold">' +
                  escapeHtml(ticker) +
                  (phase ? '<span class="text-[9px] opacity-70 uppercase">' + escapeHtml(phase) + '</span>' : '') +
                '</span>';
              }).join('') +
            '</div>' +
          '</div>' : '') +

          // Drivers / Constraints / Catalysts
          '<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">' +
            '<div>' +
              '<h4 class="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest mb-2"><i class="fas fa-arrow-up mr-1"></i>Drivers</h4>' +
              '<ul class="space-y-1">' + drivers.map(function(d) { return '<li class="text-xs text-gray-300 flex items-start gap-1.5"><span class="text-emerald-400 mt-0.5 flex-shrink-0">+</span><span>' + escapeHtml(d) + '</span></li>'; }).join('') + '</ul>' +
            '</div>' +
            '<div>' +
              '<h4 class="text-[10px] font-semibold text-red-400 uppercase tracking-widest mb-2"><i class="fas fa-arrow-down mr-1"></i>Constraints</h4>' +
              '<ul class="space-y-1">' + constraints.map(function(c) { return '<li class="text-xs text-gray-300 flex items-start gap-1.5"><span class="text-red-400 mt-0.5 flex-shrink-0">-</span><span>' + escapeHtml(c) + '</span></li>'; }).join('') + '</ul>' +
            '</div>' +
            '<div>' +
              '<h4 class="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2"><i class="fas fa-bolt mr-1"></i>Key Catalysts</h4>' +
              '<ul class="space-y-1">' + catalysts.map(function(c) { return '<li class="text-xs text-gray-300 flex items-start gap-1.5"><span class="text-amber-400 mt-0.5 flex-shrink-0">*</span><span>' + escapeHtml(c) + '</span></li>'; }).join('') + '</ul>' +
            '</div>' +
          '</div>' +

          // Investment Implication
          (theme.investment_implication ? '<div class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg p-4 mb-2">' +
            '<h4 class="text-[10px] font-semibold text-[#d4a843] uppercase tracking-widest mb-2"><i class="fas fa-lightbulb mr-1"></i>Investment Implication</h4>' +
            '<p class="text-gray-300 text-sm leading-relaxed">' + escapeHtml(theme.investment_implication) + '</p>' +
          '</div>' : '') +

        '</div>' +
      '</div>';
    }).join('');

  } catch(e) {
    console.error('Trends load failed', e);
    container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-exclamation-triangle text-2xl mb-3"></i><p>Failed to load trend data. Please try again later.</p></div>';
  }
})();
`


export { subscriberTrendsRoutes }
