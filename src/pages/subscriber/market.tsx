import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberMarketRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — Market Commentary & Risk Assessments
// ============================================================
subscriberMarketRoutes.get('/market', (c) => {
  const user = c.get('user' as any) || null
  return c.html(
    <SubscriberLayout active="market" user={user}>
      <div class="fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">Market Commentary & <span class="text-[#d4a843] italic">Risk Assessments</span></h1>
          <p class="text-gray-400 text-sm mt-1">Institutional-grade macro analysis, risk flags, and market regime updates</p>
        </div>
        <div id="market-container" class="space-y-4">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
            <p>Loading market commentary...</p>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: marketScript }} />
    </SubscriberLayout>
  )
})


const marketScript = `
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  var now = new Date();
  var diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + ' min ago';
  if (diff < 86400) return Math.floor(diff/3600) + ' hr ago';
  if (diff < 604800) return Math.floor(diff/86400) + ' day' + (Math.floor(diff/86400) > 1 ? 's' : '') + ' ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toggleMarketDetail(btn) {
  var el = btn;
  while (el && !el.querySelector('.market-detail')) { el = el.parentElement; }
  if (!el) return;
  var detail = el.querySelector('.market-detail');
  var icon = btn.querySelector('.detail-icon');
  if (detail.classList.contains('hidden')) {
    detail.classList.remove('hidden');
    btn.innerHTML = '<i class="fas fa-chevron-up text-[10px] detail-icon"></i> Collapse';
  } else {
    detail.classList.add('hidden');
    btn.innerHTML = '<i class="fas fa-chevron-down text-[10px] detail-icon"></i> Read Full Analysis';
  }
}

(async function() {
  var container = document.getElementById('market-container');
  try {
    var res = await fetch('/api/subscriber/market');
    var data = await res.json();
    var entries = data.entries || data.commentary || data.reports || [];

    if (!entries || entries.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-chart-bar text-3xl mb-3"></i><p>No market commentary available yet. Check back soon.</p></div>';
      return;
    }

    container.innerHTML = entries.map(function(entry) {
      var impactColors = {
        H: 'bg-red-500/20 text-red-400 border-red-500/30',
        M: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        L: 'bg-green-500/20 text-green-400 border-green-500/30',
        HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
        MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        LOW: 'bg-green-500/20 text-green-400 border-green-500/30'
      };

      var impact = entry.impact_score || entry.impact || '';
      var impactBadge = impact ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ' + (impactColors[impact] || impactColors.M) + '">Impact: ' + escapeHtml(impact) + '</span>' : '';

      var title = entry.title || entry.headline || 'Market Update';
      var summary = entry.summary || entry.key_takeaway || '';
      var fullText = entry.full_analysis || entry.raw_markdown || entry.full_text || '';
      var category = entry.category || entry.agent_type || 'market_commentary';

      var categoryLabel = category.replace(/_/g, ' ').toUpperCase();

      return '<div class="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden border-l-4 border-l-blue-500">' +
        '<div class="p-5">' +
          '<div class="flex items-start justify-between mb-3">' +
            '<div class="flex-1">' +
              '<div class="flex items-center gap-2 mb-2">' +
                '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400">' + escapeHtml(categoryLabel) + '</span>' +
                impactBadge +
              '</div>' +
              '<h3 class="text-base font-bold text-white leading-snug">' + escapeHtml(title) + '</h3>' +
            '</div>' +
            '<span class="text-xs text-gray-500 ml-4 whitespace-nowrap">' + getTimeAgo(entry.created_at || entry.published_at) + '</span>' +
          '</div>' +
          (summary ? '<p class="text-gray-300 text-sm leading-relaxed mb-3">' + escapeHtml(summary) + '</p>' : '') +
          (fullText ? '<div class="flex items-center"><button onclick="toggleMarketDetail(this)" class="text-xs text-[#d4a843] hover:text-[#d4a843]/80 font-semibold flex items-center gap-1 transition-colors"><i class="fas fa-chevron-down text-[10px] detail-icon"></i> Read Full Analysis</button></div>' : '') +
          (fullText ? '<div class="market-detail hidden mt-4 pt-4 border-t border-[#1f2937]"><div class="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap text-xs leading-relaxed" style="max-height:500px;overflow-y:auto;">' + escapeHtml(fullText) + '</div></div>' : '') +
        '</div>' +
      '</div>';
    }).join('');

  } catch(e) {
    console.error('Market commentary load failed', e);
    container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-exclamation-triangle text-2xl mb-3"></i><p>Failed to load market commentary. Please try again later.</p></div>';
  }
})();
`


export { subscriberMarketRoutes }
