import { Hono } from 'hono'

type Bindings = { DB: D1Database }

const app = new Hono<{ Bindings: Bindings }>()

// ============================================================
// VERIFY — Check Your Email
// ============================================================
app.get('/verify', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Check Your Email — Ekantik Capital Advisors</title>
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
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .float { animation: float 3s ease-in-out infinite; }
          @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
          .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        `}} />
      </head>
      <body class="font-inter antialiased">
        <div class="min-h-screen bg-ekantik-bg flex flex-col">
          {/* Top accent gradient */}
          <div class="h-1 w-full bg-gradient-to-r from-ekantik-gold/0 via-ekantik-gold to-ekantik-gold/0"></div>

          {/* Main content */}
          <div class="flex-1 flex items-center justify-center px-4 py-12">
            <div class="w-full max-w-md fade-in">
              {/* Logo */}
              <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-ekantik-gold rounded-2xl shadow-lg shadow-ekantik-gold/20 mb-4">
                  <span class="text-ekantik-bg font-bold text-xl tracking-tight">ECA</span>
                </div>
              </div>

              {/* Verify card */}
              <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-8 text-center">
                {/* Mail icon with pulse */}
                <div class="relative inline-flex items-center justify-center mb-6">
                  <div class="absolute w-20 h-20 rounded-full bg-ekantik-gold/10 pulse-ring"></div>
                  <div class="relative w-20 h-20 rounded-full bg-ekantik-gold/20 flex items-center justify-center float">
                    <i class="fas fa-envelope text-ekantik-gold text-3xl"></i>
                  </div>
                </div>

                <h1 class="text-2xl font-bold text-white mb-2">Check Your Email</h1>
                <p class="text-gray-400 text-sm mb-1">We've sent a magic link to</p>
                <p class="text-white font-medium text-sm mb-4" id="display-email">your email</p>
                <p class="text-gray-500 text-sm">Click the link in your email to continue</p>

                {/* Divider */}
                <div class="my-6 border-t border-ekantik-border"></div>

                {/* Resend section */}
                <div id="resend-section">
                  <p class="text-gray-500 text-sm mb-3">Didn't receive it?</p>
                  <button
                    id="resend-btn"
                    class="px-6 py-2.5 bg-ekantik-surface border border-ekantik-border hover:border-ekantik-gold/30 text-gray-300 hover:text-white font-medium rounded-xl transition-colors text-sm inline-flex items-center gap-2"
                  >
                    <i class="fas fa-redo text-xs"></i>
                    <span id="resend-text">Resend Magic Link</span>
                  </button>
                </div>

                {/* Success message (hidden by default) */}
                <div id="resend-success" class="hidden mt-4 px-4 py-3 bg-ekantik-green/10 border border-ekantik-green/20 rounded-xl text-ekantik-green text-sm">
                  <div class="flex items-center justify-center gap-2">
                    <i class="fas fa-check-circle"></i>
                    <span>A new link has been sent to your email</span>
                  </div>
                </div>

                {/* Error message (hidden by default) */}
                <div id="resend-error" class="hidden mt-4 px-4 py-3 bg-ekantik-red/10 border border-ekantik-red/20 rounded-xl text-ekantik-red text-sm">
                </div>

                {/* Countdown display */}
                <div id="countdown-display" class="hidden mt-3 text-gray-500 text-xs">
                  Resend available in <span id="countdown-timer" class="text-ekantik-gold font-medium">60</span>s
                </div>
              </div>

              {/* Back to login */}
              <div class="text-center mt-6">
                <a href="/login" class="text-gray-500 hover:text-gray-300 transition-colors text-sm inline-flex items-center gap-2">
                  <i class="fas fa-arrow-left text-xs"></i>
                  <span>Back to sign in</span>
                </a>
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
            var displayEmail = document.getElementById('display-email');
            var resendBtn = document.getElementById('resend-btn');
            var resendText = document.getElementById('resend-text');
            var resendSuccess = document.getElementById('resend-success');
            var resendError = document.getElementById('resend-error');
            var countdownDisplay = document.getElementById('countdown-display');
            var countdownTimer = document.getElementById('countdown-timer');

            // Read email from URL query param
            var params = new URLSearchParams(window.location.search);
            var email = params.get('email') || '';

            if (email) {
              displayEmail.textContent = email;
            } else {
              displayEmail.textContent = 'your email address';
            }

            var cooldown = 0;
            var timer = null;

            function startCooldown() {
              cooldown = 60;
              resendBtn.disabled = true;
              resendBtn.classList.add('opacity-50', 'cursor-not-allowed');
              countdownDisplay.classList.remove('hidden');

              timer = setInterval(function() {
                cooldown--;
                countdownTimer.textContent = cooldown;

                if (cooldown <= 0) {
                  clearInterval(timer);
                  resendBtn.disabled = false;
                  resendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                  countdownDisplay.classList.add('hidden');
                  resendText.textContent = 'Resend Magic Link';
                }
              }, 1000);
            }

            resendBtn.addEventListener('click', async function() {
              if (!email) {
                resendError.textContent = 'No email address found. Please go back and try again.';
                resendError.classList.remove('hidden');
                return;
              }

              // Reset messages
              resendSuccess.classList.add('hidden');
              resendError.classList.add('hidden');

              resendText.textContent = 'Sending...';
              resendBtn.disabled = true;

              try {
                var res = await fetch('/api/auth/magic-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email })
                });

                var data = await res.json();

                if (res.ok) {
                  resendSuccess.classList.remove('hidden');
                  startCooldown();
                } else {
                  resendError.textContent = data.error || data.message || 'Failed to resend. Please try again.';
                  resendError.classList.remove('hidden');
                  resendBtn.disabled = false;
                  resendText.textContent = 'Resend Magic Link';
                }
              } catch (err) {
                resendError.textContent = 'Network error. Please try again.';
                resendError.classList.remove('hidden');
                resendBtn.disabled = false;
                resendText.textContent = 'Resend Magic Link';
              }
            });
          })();
        `}} />
      </body>
    </html>
  )
})

export { app as publicVerifyRoutes }
