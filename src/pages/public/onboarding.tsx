import { Hono } from 'hono'

type Bindings = { DB: D1Database }

const app = new Hono<{ Bindings: Bindings }>()

// ============================================================
// ONBOARDING — Welcome & Setup
// ============================================================
app.get('/onboarding', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome — Ekantik Capital Advisors</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: { 'inter': ['Inter', 'sans-serif'] },
                colors: {
                  ekantik: {
                    bg: '#0a0f1e',
                    card: '#111827',
                    surface: '#1a2332',
                    border: '#1f2937',
                    gold: '#d4a843',
                    'gold-light': '#e8c36a',
                    accent: '#3b82f6',
                    green: '#10b981',
                    red: '#ef4444',
                    amber: '#f59e0b',
                  }
                }
              }
            }
          }
        `}} />
        <style dangerouslySetInnerHTML={{ __html: `
          * { font-family: 'Inter', sans-serif; }
          body { background: #0a0f1e; color: #f9fafb; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          .category-card { transition: all 0.2s; }
          .category-card:hover { border-color: rgba(212,168,67,0.3); transform: translateY(-2px); }
          .toggle-track { transition: background-color 0.2s; }
          .toggle-thumb { transition: transform 0.2s; }
        `}} />
      </head>
      <body class="font-inter antialiased">
        <div class="min-h-screen bg-ekantik-bg flex flex-col">
          {/* Top accent gradient */}
          <div class="h-1 w-full bg-gradient-to-r from-ekantik-gold/0 via-ekantik-gold to-ekantik-gold/0"></div>

          {/* Main content */}
          <div class="flex-1 px-4 py-12">
            <div class="max-w-3xl mx-auto fade-in">

              {/* Header */}
              <div class="text-center mb-10">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-ekantik-gold rounded-2xl shadow-lg shadow-ekantik-gold/20 mb-4">
                  <span class="text-ekantik-bg font-bold text-xl tracking-tight">ECA</span>
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">
                  Welcome to Ekantik <span class="text-ekantik-gold italic">Intelligence</span>
                </h1>
                <p class="text-gray-400 text-sm max-w-lg mx-auto">
                  Your portal for institutional-grade investment research. Here's what you'll have access to.
                </p>
              </div>

              {/* ── Content Categories Grid ──────────────────────── */}
              <div class="mb-10">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-6 h-6 bg-ekantik-gold/20 rounded-lg flex items-center justify-center">
                    <i class="fas fa-th-large text-ekantik-gold text-[10px]"></i>
                  </div>
                  <h2 class="text-sm font-semibold text-white uppercase tracking-wider">Intelligence Categories</h2>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Daily Intelligence */}
                  <div class="category-card bg-ekantik-card border border-ekantik-border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-ekantik-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-satellite-dish text-ekantik-gold text-sm"></i>
                      </div>
                      <div>
                        <h3 class="text-sm font-semibold text-white">Daily Intelligence</h3>
                        <p class="text-gray-500 text-xs mt-1 leading-relaxed">AI-curated market signals and overnight developments delivered every morning.</p>
                      </div>
                    </div>
                  </div>

                  {/* Value Opportunities */}
                  <div class="category-card bg-ekantik-card border border-ekantik-border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-gem text-purple-400 text-sm"></i>
                      </div>
                      <div>
                        <h3 class="text-sm font-semibold text-white">Value Opportunities</h3>
                        <p class="text-gray-500 text-xs mt-1 leading-relaxed">Deep-value picks identified through proprietary fundamental screens.</p>
                      </div>
                    </div>
                  </div>

                  {/* Multibagger Reports */}
                  <div class="category-card bg-ekantik-card border border-ekantik-border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-ekantik-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-rocket text-ekantik-green text-sm"></i>
                      </div>
                      <div>
                        <h3 class="text-sm font-semibold text-white">Multibagger Reports</h3>
                        <p class="text-gray-500 text-xs mt-1 leading-relaxed">High-conviction thesis write-ups on potential multi-bagger stocks.</p>
                      </div>
                    </div>
                  </div>

                  {/* AOMG Trends */}
                  <div class="category-card bg-ekantik-card border border-ekantik-border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-ekantik-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-bullseye text-ekantik-red text-sm"></i>
                      </div>
                      <div>
                        <h3 class="text-sm font-semibold text-white">AOMG Trends</h3>
                        <p class="text-gray-500 text-xs mt-1 leading-relaxed">Actionable observations on macro and growth trends shaping markets.</p>
                      </div>
                    </div>
                  </div>

                  {/* Market Commentary */}
                  <div class="category-card bg-ekantik-card border border-ekantik-border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-chart-bar text-blue-400 text-sm"></i>
                      </div>
                      <div>
                        <h3 class="text-sm font-semibold text-white">Market Commentary</h3>
                        <p class="text-gray-500 text-xs mt-1 leading-relaxed">Weekly analysis of market regime, sector rotation, and risk appetite.</p>
                      </div>
                    </div>
                  </div>

                  {/* Watchlist */}
                  <div class="category-card bg-ekantik-card border border-ekantik-border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-ekantik-amber/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-binoculars text-ekantik-amber text-sm"></i>
                      </div>
                      <div>
                        <h3 class="text-sm font-semibold text-white">Watchlist</h3>
                        <p class="text-gray-500 text-xs mt-1 leading-relaxed">Curated list of stocks approaching key inflection points.</p>
                      </div>
                    </div>
                  </div>

                  {/* Avoid List — full-width on its own row */}
                  <div class="category-card bg-ekantik-card border border-ekantik-border rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-ban text-gray-400 text-sm"></i>
                      </div>
                      <div>
                        <h3 class="text-sm font-semibold text-white">Avoid List</h3>
                        <p class="text-gray-500 text-xs mt-1 leading-relaxed">Stocks with structural headwinds or broken theses to steer clear of.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Notification Preferences ─────────────────────── */}
              <div class="mb-10">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-6 h-6 bg-ekantik-gold/20 rounded-lg flex items-center justify-center">
                    <i class="fas fa-bell text-ekantik-gold text-[10px]"></i>
                  </div>
                  <h2 class="text-sm font-semibold text-white uppercase tracking-wider">Notification Preferences</h2>
                </div>

                <div class="bg-ekantik-card border border-ekantik-border rounded-2xl divide-y divide-ekantik-border">
                  {/* Email Digest */}
                  <div class="flex items-center justify-between p-5">
                    <div>
                      <h3 class="text-sm font-medium text-white">Daily Email Digest</h3>
                      <p class="text-gray-500 text-xs mt-0.5">Morning summary of all new intelligence published</p>
                    </div>
                    <button
                      class="toggle-btn relative w-11 h-6 rounded-full bg-ekantik-border cursor-pointer flex-shrink-0"
                      data-key="email_digest"
                      data-enabled="true"
                      onclick="togglePref(this)"
                    >
                      <span class="toggle-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform translate-x-5"></span>
                    </button>
                  </div>

                  {/* High Impact Alerts */}
                  <div class="flex items-center justify-between p-5">
                    <div>
                      <h3 class="text-sm font-medium text-white">High Impact Alerts</h3>
                      <p class="text-gray-500 text-xs mt-0.5">Instant notification for critical market events and signals</p>
                    </div>
                    <button
                      class="toggle-btn relative w-11 h-6 rounded-full bg-ekantik-border cursor-pointer flex-shrink-0"
                      data-key="high_impact_alerts"
                      data-enabled="true"
                      onclick="togglePref(this)"
                    >
                      <span class="toggle-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform translate-x-5"></span>
                    </button>
                  </div>

                  {/* Weekly Roundup */}
                  <div class="flex items-center justify-between p-5">
                    <div>
                      <h3 class="text-sm font-medium text-white">Weekly Roundup</h3>
                      <p class="text-gray-500 text-xs mt-0.5">End-of-week recap with top movers and key takeaways</p>
                    </div>
                    <button
                      class="toggle-btn relative w-11 h-6 rounded-full bg-ekantik-border cursor-pointer flex-shrink-0"
                      data-key="weekly_roundup"
                      data-enabled="false"
                      onclick="togglePref(this)"
                    >
                      <span class="toggle-thumb absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"></span>
                    </button>
                  </div>
                </div>

                {/* Save status */}
                <div id="pref-status" class="hidden mt-3 text-xs text-ekantik-green text-center">
                  <i class="fas fa-check-circle mr-1"></i> Preferences saved
                </div>
              </div>

              {/* ── PWA Install Prompt ────────────────────────────── */}
              <div id="pwa-section" class="mb-10 hidden">
                <div class="bg-gradient-to-r from-ekantik-gold/10 to-ekantik-gold/5 border border-ekantik-gold/20 rounded-2xl p-6">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-ekantik-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i class="fas fa-mobile-alt text-ekantik-gold text-lg"></i>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-base font-semibold text-white mb-1">Add to Home Screen</h3>
                      <p class="text-gray-400 text-sm mb-4">Get the best experience with quick access, push notifications, and offline support.</p>
                      <button
                        id="pwa-install-btn"
                        class="px-5 py-2.5 bg-ekantik-gold hover:bg-ekantik-gold-light text-ekantik-bg font-semibold rounded-xl transition-colors text-sm inline-flex items-center gap-2"
                      >
                        <i class="fas fa-download text-xs"></i>
                        <span>Install App</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CTA Button ────────────────────────────────────── */}
              <div class="text-center">
                <a
                  href="/feed"
                  class="inline-flex items-center gap-3 px-8 py-4 bg-ekantik-gold hover:bg-ekantik-gold-light text-ekantik-bg font-semibold rounded-2xl transition-colors text-sm shadow-lg shadow-ekantik-gold/20"
                >
                  <i class="fas fa-satellite-dish"></i>
                  <span>Go to Intelligence Feed</span>
                  <i class="fas fa-arrow-right text-xs"></i>
                </a>
                <p class="text-gray-600 text-xs mt-3">You can always update your preferences later in Settings</p>
              </div>

            </div>
          </div>

          {/* Footer */}
          <footer class="py-6 text-center">
            <p class="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Ekantik Capital Advisors. All rights reserved.</p>
          </footer>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // ── Toggle initialization ──────────────────────────
            var toggles = document.querySelectorAll('.toggle-btn');
            toggles.forEach(function(btn) {
              var enabled = btn.getAttribute('data-enabled') === 'true';
              updateToggleVisual(btn, enabled);
            });

            function updateToggleVisual(btn, enabled) {
              var thumb = btn.querySelector('.toggle-thumb');
              if (enabled) {
                btn.style.backgroundColor = '#d4a843';
                thumb.style.transform = 'translateX(20px)';
              } else {
                btn.style.backgroundColor = '#1f2937';
                thumb.style.transform = 'translateX(0)';
              }
              btn.setAttribute('data-enabled', enabled ? 'true' : 'false');
            }

            // Exposed globally for onclick
            window.togglePref = async function(btn) {
              var currentEnabled = btn.getAttribute('data-enabled') === 'true';
              var newEnabled = !currentEnabled;
              var key = btn.getAttribute('data-key');

              // Update visual immediately
              updateToggleVisual(btn, newEnabled);

              // Build preferences object from all toggles
              var prefs = {};
              toggles.forEach(function(t) {
                prefs[t.getAttribute('data-key')] = t.getAttribute('data-enabled') === 'true';
              });

              // Save to server
              try {
                var res = await fetch('/api/auth/me', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ notifications: prefs })
                });

                if (res.ok) {
                  var status = document.getElementById('pref-status');
                  status.classList.remove('hidden');
                  setTimeout(function() { status.classList.add('hidden'); }, 2000);
                }
              } catch (err) {
                // Revert on error
                updateToggleVisual(btn, currentEnabled);
              }
            };

            // ── PWA Install Prompt ─────────────────────────────
            var deferredPrompt = null;
            var pwaSection = document.getElementById('pwa-section');
            var pwaInstallBtn = document.getElementById('pwa-install-btn');

            window.addEventListener('beforeinstallprompt', function(e) {
              e.preventDefault();
              deferredPrompt = e;
              pwaSection.classList.remove('hidden');
            });

            pwaInstallBtn.addEventListener('click', async function() {
              if (!deferredPrompt) return;
              deferredPrompt.prompt();
              var result = await deferredPrompt.userChoice;
              if (result.outcome === 'accepted') {
                pwaSection.classList.add('hidden');
              }
              deferredPrompt = null;
            });

            // Show PWA section on iOS Safari too (manual instruction)
            var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
            if (isIOS && !isStandalone) {
              pwaSection.classList.remove('hidden');
              pwaInstallBtn.innerHTML = '<i class="fas fa-share-square text-xs"></i> <span>Tap Share then "Add to Home Screen"</span>';
              pwaInstallBtn.addEventListener('click', function() {
                alert('To install: tap the Share button in Safari, then select "Add to Home Screen".');
              });
            }
          })();
        `}} />
      </body>
    </html>
  )
})

export { app as publicOnboardingRoutes }
