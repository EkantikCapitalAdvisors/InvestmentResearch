import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberAvoidRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — Avoid List
// ============================================================
subscriberAvoidRoutes.get('/avoid', (c) => {
  const user = c.get('user' as any) || null
  return c.html(
    <SubscriberLayout active="avoid" user={user}>
      <div class="fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">Avoid <span class="text-[#d4a843] italic">List</span></h1>
          <p class="text-gray-400 text-sm mt-1">Companies whose core revenue is being structurally destroyed</p>
        </div>
        <div id="avoid-container" class="space-y-4">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading avoid list...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: avoidScript }} />
    </SubscriberLayout>
  )
})


const avoidScript = `
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function toggleAvoidDetail(btn) {
  var el = btn;
  while (el && !el.querySelector('.avoid-detail')) { el = el.parentElement; }
  if (!el) return;
  var detail = el.querySelector('.avoid-detail');
  if (detail.classList.contains('hidden')) {
    detail.classList.remove('hidden');
    btn.innerHTML = '<i class="fas fa-chevron-up text-[10px]"></i> Collapse';
  } else {
    detail.classList.add('hidden');
    btn.innerHTML = '<i class="fas fa-chevron-down text-[10px]"></i> Full Analysis';
  }
}

(async function() {
  var container = document.getElementById('avoid-container');
  try {
    var res = await fetch('/api/subscriber/avoid');
    var data = await res.json();
    var entries = data.entries || data.avoid_list || data.companies || [];

    if (!entries || entries.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-ban text-3xl mb-3"></i><p>No avoid list entries available yet. Check back soon.</p></div>';
      return;
    }

    var threatColors = {
      ai_displacement: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', accent: 'border-l-purple-500' },
      tech_obsolescence: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', accent: 'border-l-gray-500' },
      regulatory: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', accent: 'border-l-red-500' },
      platform_disintermediation: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', accent: 'border-l-blue-500' },
      demand_destruction: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', accent: 'border-l-amber-500' },
      commoditization: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', accent: 'border-l-green-500' }
    };

    var statusColors = {
      active: 'bg-red-500/20 text-red-400 border-red-500/30',
      monitoring: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      removed: 'bg-green-500/20 text-green-400 border-green-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };

    container.innerHTML = entries.map(function(entry) {
      var threat = entry.threat_category || entry.category || 'tech_obsolescence';
      var tc = threatColors[threat] || threatColors.tech_obsolescence;
      var threatLabel = threat.replace(/_/g, ' ').toUpperCase();

      var obsolescence = entry.obsolescence_score || entry.risk_score || 0;
      var revenueAtRisk = entry.revenue_at_risk_pct || entry.revenue_at_risk || 0;
      var timeline = entry.decline_timeline || entry.timeline || '';
      var status = entry.status || 'active';

      var ticker = entry.ticker || entry.symbol || '';
      var company = entry.company || entry.company_name || '';
      var summary = entry.summary || entry.key_takeaway || '';
      var fullAnalysis = entry.full_analysis || entry.raw_markdown || entry.seven_pillar_analysis || '';

      // Gauge color based on obsolescence score
      var gaugeColor = obsolescence >= 8 ? 'from-red-500 to-red-400' :
                       obsolescence >= 5 ? 'from-amber-500 to-amber-400' :
                       'from-green-500 to-green-400';

      return '<div class="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden border-l-4 ' + tc.accent + '">' +
        '<div class="p-5">' +
          // Header
          '<div class="flex items-start justify-between mb-4">' +
            '<div class="flex-1">' +
              '<div class="flex items-center gap-3">' +
                (ticker ? '<span class="text-lg font-bold font-mono text-white">' + escapeHtml(ticker) + '</span>' : '') +
                (company ? '<span class="text-sm text-gray-400">' + escapeHtml(company) + '</span>' : '') +
              '</div>' +
              '<div class="flex items-center gap-2 mt-2 flex-wrap">' +
                '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ' + tc.bg + ' ' + tc.text + ' ' + tc.border + '">' + escapeHtml(threatLabel) + '</span>' +
                '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ' + (statusColors[status] || statusColors.monitoring) + '">' + escapeHtml(status) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // Metrics row
          '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">' +
            // Obsolescence Score gauge
            '<div class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg p-3">' +
              '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Obsolescence Score</div>' +
              '<div class="flex items-center gap-3">' +
                '<div class="flex-1 h-3 bg-[#1f2937] rounded-full overflow-hidden">' +
                  '<div class="h-full bg-gradient-to-r ' + gaugeColor + ' rounded-full transition-all" style="width:' + (obsolescence * 10) + '%"></div>' +
                '</div>' +
                '<span class="text-white font-bold text-lg">' + obsolescence + '<span class="text-xs text-gray-500">/10</span></span>' +
              '</div>' +
            '</div>' +
            // Revenue at Risk
            '<div class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg p-3">' +
              '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Revenue at Risk</div>' +
              '<div class="flex items-center gap-3">' +
                '<div class="flex-1 h-3 bg-[#1f2937] rounded-full overflow-hidden">' +
                  '<div class="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all" style="width:' + revenueAtRisk + '%"></div>' +
                '</div>' +
                '<span class="text-red-400 font-bold text-lg">' + revenueAtRisk + '<span class="text-xs text-gray-500">%</span></span>' +
              '</div>' +
            '</div>' +
            // Decline Timeline
            '<div class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg p-3">' +
              '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Decline Timeline</div>' +
              '<div class="text-white font-semibold text-sm">' + escapeHtml(timeline || '—') + '</div>' +
            '</div>' +
          '</div>' +

          // Summary
          (summary ? '<p class="text-gray-300 text-sm leading-relaxed mb-3">' + escapeHtml(summary) + '</p>' : '') +

          // Expand full analysis
          (fullAnalysis ? '<div class="flex items-center"><button onclick="toggleAvoidDetail(this)" class="text-xs text-[#d4a843] hover:text-[#d4a843]/80 font-semibold flex items-center gap-1 transition-colors"><i class="fas fa-chevron-down text-[10px]"></i> Full Analysis</button></div>' : '') +
          (fullAnalysis ? '<div class="avoid-detail hidden mt-4 pt-4 border-t border-[#1f2937]"><div class="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap text-xs leading-relaxed" style="max-height:500px;overflow-y:auto;">' + escapeHtml(fullAnalysis) + '</div></div>' : '') +
        '</div>' +
      '</div>';
    }).join('');

  } catch(e) {
    console.error('Avoid list load failed', e);
    container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-exclamation-triangle text-2xl mb-3"></i><p>Failed to load avoid list. Please try again later.</p></div>';
  }
})();
`


export { subscriberAvoidRoutes }
