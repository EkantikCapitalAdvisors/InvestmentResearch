import { Hono } from 'hono'
import { SubscriberLayout } from '../../components/subscriber-layout'

type Bindings = { DB: D1Database }

const subscriberSubscribeRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SUBSCRIBER — Choose Your Plan (Subscribe / Billing)
// ============================================================
subscriberSubscribeRoutes.get('/account/subscribe', (c) => {
  const user = c.get('user' as any) || null
  return c.html(
    <SubscriberLayout active="account" user={user}>
      <div class="fade-in">

        {/* ── Header ─────────────────────────────────────────── */}
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white">
            Choose Your <span class="text-[#d4a843] italic">Plan</span>
          </h1>
          <p class="text-gray-400 text-sm mt-2 max-w-xl mx-auto">
            Unlock institutional-grade intelligence. Every plan includes full access to all 12 proprietary frameworks,
            daily intelligence, and research reports.
          </p>
        </div>

        {/* ── Pricing Cards ────────────────────────────────── */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">

          {/* ── Monthly Plan ──────────────────────────────── */}
          <div class="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden hover:border-[#d4a843]/30 transition-all" id="plan-card-monthly">
            <div class="p-6">
              {/* Plan header */}
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold text-white">Monthly</h3>
                  <p class="text-gray-500 text-xs">Flexible access, cancel anytime</p>
                </div>
                <div class="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <i class="fas fa-calendar-alt text-gray-400"></i>
                </div>
              </div>

              {/* Price */}
              <div class="mb-6">
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-black text-white">$149</span>
                  <span class="text-gray-500 text-sm">/month</span>
                </div>
              </div>

              {/* Current plan indicator */}
              <div id="monthly-current-badge" class="hidden mb-4">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <i class="fas fa-check-circle"></i>Current Plan
                </span>
              </div>

              {/* Features */}
              <ul class="space-y-3 mb-6">
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Daily Intelligence Feed</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>12 Proprietary Frameworks</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Active Watchlist Access</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Multibagger Reports</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>AOMG Trend Radar</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Market Commentary</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Avoid List</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Email &amp; Push Notifications</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Magnificent 7 Scorecard</span>
                </li>
              </ul>

              {/* CTA */}
              <button
                id="btn-subscribe-monthly"
                onclick="handleSubscribe('monthly')"
                class="w-full py-3 bg-[#0a0f1e] border border-[#1f2937] text-white rounded-xl text-sm font-bold hover:border-[#d4a843]/50 hover:text-[#d4a843] transition-all"
              >
                Subscribe Monthly
              </button>
            </div>
          </div>

          {/* ── Annual Plan (Recommended) ─────────────────── */}
          <div class="bg-[#111827] border-2 border-[#d4a843]/60 rounded-2xl overflow-hidden relative shadow-lg shadow-[#d4a843]/5" id="plan-card-annual">
            {/* Recommended badge */}
            <div class="bg-gradient-to-r from-[#d4a843] to-[#e0b85c] py-1.5 text-center">
              <span class="text-[#0a0f1e] text-[10px] font-black uppercase tracking-widest">Recommended</span>
            </div>

            <div class="p-6">
              {/* Plan header */}
              <div class="flex items-center justify-between mb-4">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-white">Annual</h3>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a843]/20 text-[#d4a843] border border-[#d4a843]/30">
                      Committed Investor
                    </span>
                  </div>
                  <p class="text-gray-500 text-xs mt-0.5">Best value for serious investors</p>
                </div>
                <div class="w-10 h-10 bg-[#d4a843]/20 rounded-lg flex items-center justify-center">
                  <i class="fas fa-crown text-[#d4a843]"></i>
                </div>
              </div>

              {/* Price */}
              <div class="mb-2">
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-black text-white">$999</span>
                  <span class="text-gray-500 text-sm">/year</span>
                </div>
              </div>

              {/* Savings callout */}
              <div class="mb-6">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <i class="fas fa-tag text-[10px]"></i>
                  Save $789 vs monthly
                </span>
              </div>

              {/* Current plan indicator */}
              <div id="annual-current-badge" class="hidden mb-4">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <i class="fas fa-check-circle"></i>Current Plan
                </span>
              </div>

              {/* Features */}
              <ul class="space-y-3 mb-6">
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Daily Intelligence Feed</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>12 Proprietary Frameworks</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Active Watchlist Access</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Multibagger Reports</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>AOMG Trend Radar</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Market Commentary</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Avoid List</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Email &amp; Push Notifications</span>
                </li>
                <li class="flex items-start gap-2.5 text-sm text-gray-300">
                  <i class="fas fa-check text-[#d4a843] text-xs mt-1 flex-shrink-0"></i>
                  <span>Magnificent 7 Scorecard</span>
                </li>
              </ul>

              {/* CTA */}
              <button
                id="btn-subscribe-annual"
                onclick="handleSubscribe('annual')"
                class="w-full py-3 bg-[#d4a843] text-[#0a0f1e] rounded-xl text-sm font-black hover:bg-[#e0b85c] transition-all shadow-md shadow-[#d4a843]/20"
              >
                Subscribe Annual
              </button>
            </div>
          </div>

        </div>

        {/* ── FAQ / Trust Section ──────────────────────────── */}
        <div class="max-w-4xl mx-auto">
          <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div class="w-10 h-10 bg-[#d4a843]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-shield-alt text-[#d4a843]"></i>
                </div>
                <h4 class="text-sm font-bold text-white mb-1">Secure Payments</h4>
                <p class="text-xs text-gray-500">Processed securely via Stripe. We never store your card details.</p>
              </div>
              <div>
                <div class="w-10 h-10 bg-[#d4a843]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-undo text-[#d4a843]"></i>
                </div>
                <h4 class="text-sm font-bold text-white mb-1">Cancel Anytime</h4>
                <p class="text-xs text-gray-500">No lock-in contracts. Cancel your subscription at any time with one click.</p>
              </div>
              <div>
                <div class="w-10 h-10 bg-[#d4a843]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-headset text-[#d4a843]"></i>
                </div>
                <h4 class="text-sm font-bold text-white mb-1">Priority Support</h4>
                <p class="text-xs text-gray-500">Direct access to our research team for questions and support.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Back to Account ──────────────────────────────── */}
        <div class="text-center mt-6">
          <a href="/account" class="text-xs text-gray-500 hover:text-[#d4a843] transition-colors">
            <i class="fas fa-arrow-left mr-1"></i>Back to My Subscription
          </a>
        </div>

      </div>

      <script dangerouslySetInnerHTML={{ __html: subscribeScript }} />
    </SubscriberLayout>
  )
})


// ────────────────────────────────────────────────────────────────
// Client-side JavaScript
// ────────────────────────────────────────────────────────────────
const subscribeScript = `
// ── State ──────────────────────────────────────────────────
var currentUser = null;

// ── Load user to show current plan badge ───────────────────
async function loadCurrentPlan() {
  try {
    var res = await fetch('/api/auth/me');
    if (!res.ok) return;
    var data = await res.json();
    currentUser = data.user || data;
    var plan = currentUser.plan || '';

    // Show "Current Plan" badge on the active plan
    if (plan === 'active_monthly') {
      var badge = document.getElementById('monthly-current-badge');
      if (badge) badge.classList.remove('hidden');

      // Update monthly button
      var btn = document.getElementById('btn-subscribe-monthly');
      if (btn) {
        btn.textContent = 'Current Plan';
        btn.disabled = true;
        btn.className = 'w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold cursor-not-allowed';
      }
    }

    if (plan === 'active_annual') {
      var badge = document.getElementById('annual-current-badge');
      if (badge) badge.classList.remove('hidden');

      // Update annual button
      var btn = document.getElementById('btn-subscribe-annual');
      if (btn) {
        btn.textContent = 'Current Plan';
        btn.disabled = true;
        btn.className = 'w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold cursor-not-allowed';
      }
    }
  } catch (e) {
    console.warn('Could not load current plan:', e);
  }
}

// ── Subscribe handler ──────────────────────────────────────
async function handleSubscribe(priceType) {
  var btnId = priceType === 'monthly' ? 'btn-subscribe-monthly' : 'btn-subscribe-annual';
  var btn = document.getElementById(btnId);

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2 text-xs"></i>Redirecting to checkout...';
  }

  try {
    var res = await fetch('/api/billing/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_type: priceType })
    });

    if (res.ok) {
      var data = await res.json();
      if (data.checkout_url || data.url) {
        window.location.href = data.checkout_url || data.url;
        return;
      }
    }

    // If the billing API is not yet available
    if (res.status === 404) {
      showCheckoutUnavailable(btn, btnId, priceType);
      return;
    }

    // Other error
    var errData = {};
    try { errData = await res.json(); } catch(e) {}
    showCheckoutError(btn, btnId, priceType, errData.error || 'Checkout failed. Please try again.');

  } catch (e) {
    console.error('Subscribe failed:', e);
    showCheckoutUnavailable(btn, btnId, priceType);
  }
}

function showCheckoutUnavailable(btn, btnId, priceType) {
  if (btn) {
    btn.innerHTML = '<i class="fas fa-clock mr-2 text-xs"></i>Coming Soon';
    btn.className = btn.className.replace('bg-[#d4a843]', 'bg-amber-500/20').replace('bg-[#0a0f1e]', 'bg-amber-500/20');
    btn.classList.add('text-amber-400', 'border-amber-500/30', 'cursor-not-allowed');
    btn.disabled = true;

    setTimeout(function() {
      resetButton(btn, btnId, priceType);
    }, 5000);
  }
}

function showCheckoutError(btn, btnId, priceType, message) {
  if (btn) {
    btn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2 text-xs"></i>' + message;
    btn.classList.add('text-red-400', 'border-red-500/30');
    btn.disabled = true;

    setTimeout(function() {
      resetButton(btn, btnId, priceType);
    }, 4000);
  }
}

function resetButton(btn, btnId, priceType) {
  if (!btn) return;
  btn.disabled = false;
  if (priceType === 'monthly') {
    btn.className = 'w-full py-3 bg-[#0a0f1e] border border-[#1f2937] text-white rounded-xl text-sm font-bold hover:border-[#d4a843]/50 hover:text-[#d4a843] transition-all';
    btn.textContent = 'Subscribe Monthly';
  } else {
    btn.className = 'w-full py-3 bg-[#d4a843] text-[#0a0f1e] rounded-xl text-sm font-black hover:bg-[#e0b85c] transition-all shadow-md shadow-[#d4a843]/20';
    btn.textContent = 'Subscribe Annual';
  }
}

// ── Initial Load ──────────────────────────────────────────
(async function() {
  await loadCurrentPlan();
})();
`


export { subscriberSubscribeRoutes }
