import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const subscribersPageRoutes = new Hono<{ Bindings: Bindings }>()

subscribersPageRoutes.get('/admin/subscribers', (c) => {
  return c.render(
    <Layout active="subscribers">
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">Subscriber <span class="text-ekantik-gold italic">Management</span></h1>
            <p class="text-gray-400 text-sm mt-1">Manage subscriber accounts, trials, and access</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div class="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-white" id="stat-total">—</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-ekantik-amber" id="stat-trial">—</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Trial</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-ekantik-green" id="stat-active">—</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Active</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-red-400" id="stat-expired">—</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Expired</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-orange-400" id="stat-pastdue">—</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Past Due</div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-gray-400" id="stat-cancelled">—</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-4 mb-6">
          <div class="flex flex-wrap items-center gap-3">
            <select id="filter-plan" class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" onchange="loadSubscribers()">
              <option value="">All Plans</option>
              <option value="trial">Trial</option>
              <option value="active_monthly">Monthly</option>
              <option value="active_annual">Annual</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <input id="filter-search" type="text" placeholder="Search email or name..."
              class="bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 w-64 focus:outline-none focus:border-ekantik-gold/50"
              oninput="clearTimeout(window._searchTimer); window._searchTimer = setTimeout(loadSubscribers, 400)" />
            <button onclick="loadSubscribers()" class="px-3 py-2 bg-ekantik-gold/20 text-ekantik-gold rounded-lg text-sm font-semibold hover:bg-ekantik-gold/30 transition-colors">
              <i class="fas fa-search mr-1"></i> Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-ekantik-border text-[10px] text-gray-500 uppercase tracking-wider">
                  <th class="text-left px-4 py-3">Email</th>
                  <th class="text-left px-4 py-3">Name</th>
                  <th class="text-center px-4 py-3">Plan</th>
                  <th class="text-center px-4 py-3">Role</th>
                  <th class="text-center px-4 py-3">Trial End</th>
                  <th class="text-center px-4 py-3">Last Login</th>
                  <th class="text-center px-4 py-3">Joined</th>
                  <th class="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody id="subscribers-body">
                <tr><td colspan="8" class="text-center py-12 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</td></tr>
              </tbody>
            </table>
          </div>
          <div id="pagination" class="px-4 py-3 border-t border-ekantik-border flex items-center justify-between text-sm text-gray-400"></div>
        </div>

        {/* Extend Trial Modal */}
        <div id="extend-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-center justify-center hidden">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 w-96 max-w-[90vw]">
            <h3 class="text-lg font-semibold text-white mb-4">Extend Trial</h3>
            <p class="text-sm text-gray-400 mb-3">Subscriber: <span id="extend-email" class="text-white"></span></p>
            <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Additional Days</label>
            <input id="extend-days" type="number" min="1" max="365" value="30"
              class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 mb-4 focus:outline-none focus:border-ekantik-gold/50" />
            <div class="flex gap-3">
              <button onclick="submitExtend()" class="flex-1 px-4 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors">Extend</button>
              <button onclick="closeExtendModal()" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg text-sm hover:border-ekantik-gold/50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: subscribersScript }} />
    </Layout>
  )
})

export { subscribersPageRoutes }

const subscribersScript = `
let currentPage = 1;
let extendTargetId = null;

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function planBadge(plan) {
  const colors = {
    trial: 'bg-amber-500/20 text-amber-400',
    active_monthly: 'bg-emerald-500/20 text-emerald-400',
    active_annual: 'bg-emerald-500/20 text-emerald-400',
    past_due: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
    expired: 'bg-red-500/20 text-red-400',
  };
  const labels = {
    trial: 'Trial',
    active_monthly: 'Monthly',
    active_annual: 'Annual',
    past_due: 'Past Due',
    cancelled: 'Cancelled',
    expired: 'Expired',
  };
  const cls = colors[plan] || 'bg-gray-500/20 text-gray-400';
  return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ' + cls + '">' + (labels[plan] || plan) + '</span>';
}

function roleBadge(role) {
  if (role === 'admin') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">Admin</span>';
  if (role === 'subscriber') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">Subscriber</span>';
  if (role === 'trial') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">Trial</span>';
  return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400">' + escapeHtml(role) + '</span>';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function loadSubscribers() {
  const plan = document.getElementById('filter-plan').value;
  const search = document.getElementById('filter-search').value;
  const params = new URLSearchParams({ page: currentPage.toString(), limit: '50' });
  if (plan) params.set('plan', plan);
  if (search) params.set('search', search);

  try {
    const res = await fetch('/api/admin/subscribers?' + params);
    const data = await res.json();

    // Update stats
    if (data.stats) {
      document.getElementById('stat-total').textContent = data.stats.total || 0;
      document.getElementById('stat-trial').textContent = data.stats.trial_count || 0;
      document.getElementById('stat-active').textContent = data.stats.active_count || 0;
      document.getElementById('stat-expired').textContent = data.stats.expired_count || 0;
      document.getElementById('stat-pastdue').textContent = data.stats.past_due_count || 0;
      document.getElementById('stat-cancelled').textContent = data.stats.cancelled_count || 0;
    }

    const body = document.getElementById('subscribers-body');
    if (!data.subscribers || data.subscribers.length === 0) {
      body.innerHTML = '<tr><td colspan="8" class="text-center py-12 text-gray-500">No subscribers found</td></tr>';
      return;
    }

    body.innerHTML = data.subscribers.map(s => {
      const trialEnd = s.trial_end ? formatDate(s.trial_end) : '—';
      const trialExpired = s.trial_end && new Date(s.trial_end) < new Date();
      return '<tr class="border-b border-ekantik-border hover:bg-ekantik-bg/50 transition-colors">' +
        '<td class="px-4 py-3 text-sm text-white">' + escapeHtml(s.email) + '</td>' +
        '<td class="px-4 py-3 text-sm text-gray-400">' + escapeHtml(s.display_name || '—') + '</td>' +
        '<td class="px-4 py-3 text-center">' + planBadge(s.plan) + '</td>' +
        '<td class="px-4 py-3 text-center">' + roleBadge(s.role) + '</td>' +
        '<td class="px-4 py-3 text-center text-xs ' + (trialExpired ? 'text-red-400' : 'text-gray-400') + '">' + trialEnd + '</td>' +
        '<td class="px-4 py-3 text-center text-xs text-gray-400">' + formatDate(s.last_login) + '</td>' +
        '<td class="px-4 py-3 text-center text-xs text-gray-400">' + formatDate(s.created_at) + '</td>' +
        '<td class="px-4 py-3 text-center">' +
          '<div class="flex items-center justify-center gap-1">' +
            '<button onclick="openExtendModal(\\'' + s.id + '\\', \\'' + escapeHtml(s.email) + '\\')" class="p-1.5 text-gray-500 hover:text-ekantik-gold transition-colors" title="Extend trial"><i class="fas fa-clock text-xs"></i></button>' +
            '<button onclick="deactivate(\\'' + s.id + '\\')" class="p-1.5 text-gray-500 hover:text-red-400 transition-colors" title="Deactivate"><i class="fas fa-ban text-xs"></i></button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    // Pagination
    const totalPages = Math.ceil(data.total / data.limit);
    const pag = document.getElementById('pagination');
    pag.innerHTML = '<span>Showing ' + data.subscribers.length + ' of ' + data.total + '</span>' +
      '<div class="flex gap-2">' +
        (currentPage > 1 ? '<button onclick="goPage(' + (currentPage-1) + ')" class="px-3 py-1 bg-ekantik-bg border border-ekantik-border rounded text-xs hover:border-ekantik-gold/50">&laquo; Prev</button>' : '') +
        '<span class="px-3 py-1 text-xs">Page ' + currentPage + ' of ' + totalPages + '</span>' +
        (currentPage < totalPages ? '<button onclick="goPage(' + (currentPage+1) + ')" class="px-3 py-1 bg-ekantik-bg border border-ekantik-border rounded text-xs hover:border-ekantik-gold/50">Next &raquo;</button>' : '') +
      '</div>';
  } catch (e) {
    console.error('Failed to load subscribers:', e);
    document.getElementById('subscribers-body').innerHTML = '<tr><td colspan="8" class="text-center py-12 text-red-400">Failed to load</td></tr>';
  }
}

function goPage(p) { currentPage = p; loadSubscribers(); }

function openExtendModal(id, email) {
  extendTargetId = id;
  document.getElementById('extend-email').textContent = email;
  document.getElementById('extend-days').value = '30';
  const modal = document.getElementById('extend-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeExtendModal() {
  const modal = document.getElementById('extend-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  extendTargetId = null;
}

async function submitExtend() {
  if (!extendTargetId) return;
  const days = parseInt(document.getElementById('extend-days').value);
  if (!days || days < 1) return;

  try {
    const res = await fetch('/api/admin/subscribers/' + extendTargetId + '/extend-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days })
    });
    const data = await res.json();
    if (data.success) {
      closeExtendModal();
      loadSubscribers();
    } else {
      alert('Error: ' + (data.error || 'Unknown'));
    }
  } catch (e) {
    alert('Failed to extend trial');
  }
}

async function deactivate(id) {
  if (!confirm('Are you sure you want to deactivate this subscriber?')) return;
  try {
    const res = await fetch('/api/admin/subscribers/' + id + '/deactivate', { method: 'POST' });
    const data = await res.json();
    if (data.success) loadSubscribers();
    else alert('Error: ' + (data.error || 'Unknown'));
  } catch (e) {
    alert('Failed to deactivate');
  }
}

// Init
loadSubscribers();
`
