import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberAccountRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — My Subscription (Account)
// ============================================================
subscriberAccountRoutes.get('/account', (c) => {
  const user = c.get('user' as any) || null
  return c.html(
    <SubscriberLayout active="account" user={user}>
      <div class="fade-in">

        {/* ── Header ─────────────────────────────────────────── */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">
              My <span class="text-[#d4a843] italic">Subscription</span>
            </h1>
            <p class="text-gray-400 text-sm mt-1">Manage your plan, preferences, and account details</p>
          </div>
        </div>

        {/* ── Subscription Status Card ─────────────────────── */}
        <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-[#d4a843]/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-shield-alt text-[#d4a843]"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Subscription Status</h2>
              <p class="text-gray-500 text-xs">Your current plan and billing status</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Plan */}
            <div class="bg-[#0a0f1e] rounded-lg p-4">
              <div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Current Plan</div>
              <div id="account-plan-badge" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-700/50 text-gray-400">
                <i class="fas fa-spinner fa-spin text-[10px]"></i>
                Loading...
              </div>
            </div>

            {/* Trial Countdown / Next Billing */}
            <div class="bg-[#0a0f1e] rounded-lg p-4">
              <div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2" id="account-date-label">Status</div>
              <div id="account-date-value" class="text-sm text-gray-300 font-semibold">&mdash;</div>
              <div id="account-trial-bar-wrap" class="hidden mt-3">
                <div class="w-full bg-[#1f2937] rounded-full h-1.5">
                  <div id="account-trial-bar" class="bg-[#d4a843] h-1.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-[10px] text-gray-600">Start</span>
                  <span class="text-[10px] text-gray-600" id="account-trial-remaining"></span>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div class="bg-[#0a0f1e] rounded-lg p-4">
              <div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Member Since</div>
              <div id="account-member-since" class="text-sm text-gray-300 font-semibold">&mdash;</div>
            </div>
          </div>
        </div>

        {/* ── Plan Details / CTA ───────────────────────────── */}
        <div id="account-plan-details" class="bg-[#111827] border border-[#1f2937] rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-[#d4a843]/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-credit-card text-[#d4a843]"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Plan Details</h2>
              <p class="text-gray-500 text-xs">Billing and upgrade options</p>
            </div>
          </div>
          <div id="account-plan-content" class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-xl mb-3 block"></i>
            <p class="text-sm">Loading plan details...</p>
          </div>
        </div>

        {/* ── Notification Preferences ─────────────────────── */}
        <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-6 mb-6" id="notifications-section">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 bg-[#d4a843]/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-bell text-[#d4a843]"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Notification Preferences</h2>
              <p class="text-gray-500 text-xs">Choose how you want to receive updates</p>
            </div>
          </div>

          <div class="space-y-0">
            {/* Daily Intelligence Digest */}
            <div class="flex items-center justify-between py-4 border-b border-[#1f2937]">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#d4a843]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-satellite-dish text-[#d4a843] text-xs"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-white">Daily Intelligence Digest</div>
                  <div class="text-xs text-gray-500">Morning summary of all intelligence items via email</div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" id="notif-daily-digest" data-key="daily_digest" onchange="toggleNotification(this)" />
                <div class="w-11 h-6 bg-[#1f2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a843] peer-checked:after:bg-[#0a0f1e]"></div>
              </label>
            </div>

            {/* High Impact Alerts */}
            <div class="flex items-center justify-between py-4 border-b border-[#1f2937]">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-exclamation-triangle text-red-400 text-xs"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-white">High Impact Alerts</div>
                  <div class="text-xs text-gray-500">Immediate notification for high-impact intelligence via email &amp; push</div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" id="notif-high-impact" data-key="high_impact_alerts" onchange="toggleNotification(this)" />
                <div class="w-11 h-6 bg-[#1f2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a843] peer-checked:after:bg-[#0a0f1e]"></div>
              </label>
            </div>

            {/* Weekly Roundup */}
            <div class="flex items-center justify-between py-4 border-b border-[#1f2937]">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-calendar-week text-blue-400 text-xs"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-white">Weekly Roundup</div>
                  <div class="text-xs text-gray-500">End-of-week summary of top research and market moves via email</div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" id="notif-weekly-roundup" data-key="weekly_roundup" onchange="toggleNotification(this)" />
                <div class="w-11 h-6 bg-[#1f2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a843] peer-checked:after:bg-[#0a0f1e]"></div>
              </label>
            </div>

            {/* Watchlist Changes */}
            <div class="flex items-center justify-between py-4 border-b border-[#1f2937]">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-binoculars text-amber-400 text-xs"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-white">Watchlist Changes</div>
                  <div class="text-xs text-gray-500">Push notification when a watchlist ticker status changes</div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" id="notif-watchlist-changes" data-key="watchlist_changes" onchange="toggleNotification(this)" />
                <div class="w-11 h-6 bg-[#1f2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a843] peer-checked:after:bg-[#0a0f1e]"></div>
              </label>
            </div>

            {/* New Research Reports */}
            <div class="flex items-center justify-between py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-microscope text-purple-400 text-xs"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-white">New Research Reports</div>
                  <div class="text-xs text-gray-500">Push notification when a new multibagger report is published</div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" id="notif-new-research" data-key="new_research" onchange="toggleNotification(this)" />
                <div class="w-11 h-6 bg-[#1f2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a843] peer-checked:after:bg-[#0a0f1e]"></div>
              </label>
            </div>
          </div>

          {/* Save status indicator */}
          <div id="notif-save-status" class="hidden mt-4 text-center">
            <span class="text-xs text-[#d4a843]"><i class="fas fa-check mr-1"></i>Preferences saved</span>
          </div>
        </div>

        {/* ── Account Info ─────────────────────────────────── */}
        <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 bg-[#d4a843]/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-user text-[#d4a843]"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Account Info</h2>
              <p class="text-gray-500 text-xs">Your profile details</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Display Name</label>
              <div class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg px-4 py-2.5 text-sm text-white" id="account-display-name">&mdash;</div>
            </div>
            <div>
              <label class="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <div class="bg-[#0a0f1e] border border-[#1f2937] rounded-lg px-4 py-2.5 text-sm text-gray-400 flex items-center gap-2" id="account-email">
                <i class="fas fa-lock text-[10px] text-gray-600"></i>
                <span>&mdash;</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────── */}
        <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 bg-[#d4a843]/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-cog text-[#d4a843]"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Actions</h2>
              <p class="text-gray-500 text-xs">Manage billing and session</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <a
              href="/account/subscribe"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4a843] text-[#0a0f1e] rounded-lg text-sm font-bold hover:bg-[#e0b85c] transition-colors"
            >
              <i class="fas fa-credit-card text-xs"></i>
              Manage Billing
            </a>
            <button
              onclick="handleLogout()"
              id="logout-btn"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a0f1e] border border-[#1f2937] text-gray-400 rounded-lg text-sm font-semibold hover:border-red-500/50 hover:text-red-400 transition-colors"
            >
              <i class="fas fa-sign-out-alt text-xs"></i>
              Logout
            </button>
          </div>
        </div>

      </div>

      <script dangerouslySetInnerHTML={{ __html: accountScript }} />
    </SubscriberLayout>
  )
})

// Redirect /account/notifications to /account (it's a section on the same page)
subscriberAccountRoutes.get('/account/notifications', (c) => {
  return c.redirect('/account#notifications-section')
})


// ────────────────────────────────────────────────────────────────
// Client-side JavaScript
// ────────────────────────────────────────────────────────────────
const accountScript = `
// ── State ──────────────────────────────────────────────────
var currentUser = null;
var notificationPrefs = {};

// ── Helpers ────────────────────────────────────────────────
function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Plan badge rendering ───────────────────────────────────
function getPlanBadge(plan) {
  var configs = {
    trial:          { label: 'Free Trial',         icon: 'fas fa-flask',          bg: 'bg-amber-500/20 text-amber-400' },
    active_monthly: { label: 'Monthly Subscriber', icon: 'fas fa-check-circle',   bg: 'bg-emerald-500/20 text-emerald-400' },
    active_annual:  { label: 'Annual Subscriber',  icon: 'fas fa-crown',          bg: 'bg-[#d4a843]/20 text-[#d4a843]' },
    past_due:       { label: 'Payment Past Due',   icon: 'fas fa-exclamation-circle', bg: 'bg-red-500/20 text-red-400' },
    cancelled:      { label: 'Cancelled',          icon: 'fas fa-times-circle',   bg: 'bg-gray-500/20 text-gray-400' },
    expired:        { label: 'Expired',            icon: 'fas fa-clock',          bg: 'bg-red-500/20 text-red-400' }
  };
  var cfg = configs[plan] || { label: plan || 'Unknown', icon: 'fas fa-question-circle', bg: 'bg-gray-500/20 text-gray-400' };
  return '<span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ' + cfg.bg + '">' +
    '<i class="' + cfg.icon + ' text-[10px]"></i>' + escapeHtml(cfg.label) +
  '</span>';
}

// ── Render plan details section ────────────────────────────
function renderPlanDetails(user) {
  var el = document.getElementById('account-plan-content');
  if (!el) return;

  var plan = user.plan || 'trial';

  if (plan === 'trial') {
    var daysLeft = user.trialDaysRemaining != null ? user.trialDaysRemaining : '?';
    el.innerHTML =
      '<div class="bg-amber-500/5 border border-amber-500/20 rounded-lg p-5 text-left">' +
        '<div class="flex items-start gap-4">' +
          '<div class="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">' +
            '<i class="fas fa-flask text-amber-400 text-lg"></i>' +
          '</div>' +
          '<div class="flex-1">' +
            '<h3 class="text-white font-bold text-sm mb-1">You are on a Free Trial</h3>' +
            '<p class="text-gray-400 text-xs leading-relaxed mb-4">' +
              'You have <strong class="text-amber-400">' + daysLeft + ' days</strong> remaining in your free trial. ' +
              'Upgrade now to lock in your rate and ensure uninterrupted access to institutional-grade intelligence.' +
            '</p>' +
            '<a href="/account/subscribe" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4a843] text-[#0a0f1e] rounded-lg text-sm font-bold hover:bg-[#e0b85c] transition-colors">' +
              '<i class="fas fa-rocket text-xs"></i>Upgrade Now' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  if (plan === 'active_monthly' || plan === 'active_annual') {
    var planLabel = plan === 'active_monthly' ? 'Monthly ($149/mo)' : 'Annual ($999/yr)';
    var nextBilling = user.currentPeriodEnd ? formatDate(user.currentPeriodEnd) : 'Contact support';
    el.innerHTML =
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
        '<div class="bg-[#0a0f1e] rounded-lg p-4">' +
          '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Plan Type</div>' +
          '<div class="text-sm text-white font-semibold">' + escapeHtml(planLabel) + '</div>' +
        '</div>' +
        '<div class="bg-[#0a0f1e] rounded-lg p-4">' +
          '<div class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Next Billing Date</div>' +
          '<div class="text-sm text-white font-semibold">' + escapeHtml(nextBilling) + '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  if (plan === 'expired' || plan === 'cancelled') {
    el.innerHTML =
      '<div class="bg-red-500/5 border border-red-500/20 rounded-lg p-5 text-left">' +
        '<div class="flex items-start gap-4">' +
          '<div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">' +
            '<i class="fas fa-lock text-red-400 text-lg"></i>' +
          '</div>' +
          '<div class="flex-1">' +
            '<h3 class="text-white font-bold text-sm mb-1">Your Subscription Has ' + (plan === 'expired' ? 'Expired' : 'Been Cancelled') + '</h3>' +
            '<p class="text-gray-400 text-xs leading-relaxed mb-4">' +
              'Reactivate your subscription to regain full access to daily intelligence, research reports, and all premium features.' +
            '</p>' +
            '<a href="/account/subscribe" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4a843] text-[#0a0f1e] rounded-lg text-sm font-bold hover:bg-[#e0b85c] transition-colors">' +
              '<i class="fas fa-redo text-xs"></i>Reactivate Now' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  if (plan === 'past_due') {
    el.innerHTML =
      '<div class="bg-red-500/5 border border-red-500/20 rounded-lg p-5 text-left">' +
        '<div class="flex items-start gap-4">' +
          '<div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">' +
            '<i class="fas fa-exclamation-circle text-red-400 text-lg"></i>' +
          '</div>' +
          '<div class="flex-1">' +
            '<h3 class="text-white font-bold text-sm mb-1">Payment Past Due</h3>' +
            '<p class="text-gray-400 text-xs leading-relaxed mb-4">' +
              'Your last payment failed. Please update your payment method to continue uninterrupted access.' +
            '</p>' +
            '<a href="/account/subscribe" class="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">' +
              '<i class="fas fa-credit-card text-xs"></i>Update Payment' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  // Fallback
  el.innerHTML = '<p class="text-gray-500 text-sm">Plan details unavailable.</p>';
}

// ── Load user info from API ────────────────────────────────
async function loadAccount() {
  try {
    var res = await fetch('/api/auth/me');
    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      throw new Error('Auth API returned ' + res.status);
    }
    var data = await res.json();
    currentUser = data.user || data;

    // ── Subscription Status Card ──
    var planBadgeEl = document.getElementById('account-plan-badge');
    if (planBadgeEl) planBadgeEl.innerHTML = getPlanBadge(currentUser.plan);

    // Date label & value
    var dateLabel = document.getElementById('account-date-label');
    var dateValue = document.getElementById('account-date-value');
    var trialBarWrap = document.getElementById('account-trial-bar-wrap');
    var trialBar = document.getElementById('account-trial-bar');
    var trialRemaining = document.getElementById('account-trial-remaining');

    if (currentUser.plan === 'trial' && currentUser.trialDaysRemaining != null) {
      if (dateLabel) dateLabel.textContent = 'Trial Countdown';
      if (dateValue) dateValue.innerHTML = '<span class="text-amber-400">' + currentUser.trialDaysRemaining + ' days remaining</span>';

      // Show trial progress bar (assuming 45 days total trial)
      var totalDays = 45;
      var elapsed = totalDays - currentUser.trialDaysRemaining;
      var pct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
      if (trialBarWrap) trialBarWrap.classList.remove('hidden');
      if (trialBar) trialBar.style.width = pct + '%';
      if (trialRemaining) trialRemaining.textContent = currentUser.trialDaysRemaining + ' of ' + totalDays + ' days left';
    } else if (currentUser.plan === 'active_monthly' || currentUser.plan === 'active_annual') {
      if (dateLabel) dateLabel.textContent = 'Next Billing';
      if (dateValue) dateValue.textContent = currentUser.currentPeriodEnd ? formatDate(currentUser.currentPeriodEnd) : 'Active';
    } else if (currentUser.plan === 'expired') {
      if (dateLabel) dateLabel.textContent = 'Expired';
      if (dateValue) dateValue.innerHTML = '<span class="text-red-400">Subscription ended</span>';
    } else if (currentUser.plan === 'cancelled') {
      if (dateLabel) dateLabel.textContent = 'Status';
      if (dateValue) dateValue.innerHTML = '<span class="text-gray-400">Cancelling at period end</span>';
    } else if (currentUser.plan === 'past_due') {
      if (dateLabel) dateLabel.textContent = 'Status';
      if (dateValue) dateValue.innerHTML = '<span class="text-red-400">Payment failed</span>';
    }

    // Member since
    var memberSince = document.getElementById('account-member-since');
    if (memberSince) memberSince.textContent = formatDate(currentUser.createdAt || currentUser.created_at);

    // ── Plan Details ──
    renderPlanDetails(currentUser);

    // ── Account Info ──
    var displayNameEl = document.getElementById('account-display-name');
    if (displayNameEl) displayNameEl.textContent = currentUser.displayName || currentUser.display_name || '—';

    var emailEl = document.getElementById('account-email');
    if (emailEl) {
      emailEl.innerHTML = '<i class="fas fa-lock text-[10px] text-gray-600"></i><span>' + escapeHtml(currentUser.email || '—') + '</span>';
    }

  } catch (e) {
    console.error('Failed to load account:', e);
  }
}

// ── Notification Preferences ───────────────────────────────
async function loadNotificationPrefs() {
  try {
    var res = await fetch('/api/auth/notifications');
    if (res.ok) {
      var data = await res.json();
      notificationPrefs = data.preferences || data || {};
    }
  } catch (e) {
    console.warn('Notification prefs not available:', e);
    // Default all to on if API not available
    notificationPrefs = {
      daily_digest: true,
      high_impact_alerts: true,
      weekly_roundup: true,
      watchlist_changes: true,
      new_research: true
    };
  }

  // Apply prefs to toggles
  var keys = ['daily_digest', 'high_impact_alerts', 'weekly_roundup', 'watchlist_changes', 'new_research'];
  keys.forEach(function(key) {
    var toggle = document.querySelector('[data-key="' + key + '"]');
    if (toggle) toggle.checked = !!notificationPrefs[key];
  });
}

function toggleNotification(el) {
  var key = el.getAttribute('data-key');
  var enabled = el.checked;
  notificationPrefs[key] = enabled;
  saveNotificationPrefs();
}

var saveTimeout = null;
function saveNotificationPrefs() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async function() {
    try {
      var res = await fetch('/api/auth/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: notificationPrefs })
      });

      var statusEl = document.getElementById('notif-save-status');
      if (statusEl) {
        statusEl.classList.remove('hidden');
        if (res.ok) {
          statusEl.innerHTML = '<span class="text-xs text-[#d4a843]"><i class="fas fa-check mr-1"></i>Preferences saved</span>';
        } else {
          statusEl.innerHTML = '<span class="text-xs text-red-400"><i class="fas fa-times mr-1"></i>Failed to save preferences</span>';
        }
        setTimeout(function() {
          statusEl.classList.add('hidden');
        }, 3000);
      }
    } catch (e) {
      console.error('Failed to save notification prefs:', e);
      var statusEl = document.getElementById('notif-save-status');
      if (statusEl) {
        statusEl.classList.remove('hidden');
        statusEl.innerHTML = '<span class="text-xs text-red-400"><i class="fas fa-times mr-1"></i>Failed to save preferences</span>';
        setTimeout(function() {
          statusEl.classList.add('hidden');
        }, 3000);
      }
    }
  }, 500);
}

// ── Logout ─────────────────────────────────────────────────
async function handleLogout() {
  var btn = document.getElementById('logout-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs mr-2"></i>Logging out...';
  }

  try {
    var res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok || res.status === 302 || res.status === 401) {
      window.location.href = '/login';
    } else {
      // Try redirecting anyway
      window.location.href = '/login';
    }
  } catch (e) {
    console.error('Logout failed:', e);
    window.location.href = '/login';
  }
}

// ── Scroll to notifications if hash present ────────────────
function checkHash() {
  if (window.location.hash === '#notifications-section') {
    var el = document.getElementById('notifications-section');
    if (el) {
      setTimeout(function() {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }
}

// ── Initial Load ──────────────────────────────────────────
(async function() {
  await loadAccount();
  await loadNotificationPrefs();
  checkHash();
})();
`


export { subscriberAccountRoutes }
