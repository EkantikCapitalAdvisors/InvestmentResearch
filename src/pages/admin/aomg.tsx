import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const aomgRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// AOMG TRACKER
// ============================================================
aomgRoutes.get('/aomg', (c) => {
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


export { aomgRoutes }
