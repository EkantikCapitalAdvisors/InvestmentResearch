import { Hono } from 'hono'

type Bindings = { DB: D1Database }

const app = new Hono<{ Bindings: Bindings }>()

// ============================================================
// LOGIN — Magic Link Sign In
// ============================================================
app.get('/login', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sign In — Ekantik Capital Advisors</title>
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
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          .shimmer { background: linear-gradient(90deg, transparent 25%, rgba(212,168,67,0.08) 50%, transparent 75%); background-size: 200% 100%; animation: shimmer 3s infinite; }
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
                <h1 class="text-2xl font-bold text-white">Welcome Back</h1>
                <p class="text-gray-400 text-sm mt-1">Ekantik Capital Advisors Research Portal</p>
              </div>

              {/* Login card */}
              <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-8">
                <form id="login-form" onsubmit="return false;">
                  <label class="block text-sm font-medium text-gray-300 mb-2" for="email">
                    Enter your email to sign in
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    class="w-full px-4 py-3 bg-ekantik-bg border border-ekantik-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ekantik-gold/50 focus:ring-1 focus:ring-ekantik-gold/30 transition-colors text-sm"
                  />

                  {/* Error message */}
                  <div id="error-msg" class="hidden mt-3 px-4 py-3 bg-ekantik-red/10 border border-ekantik-red/20 rounded-xl text-ekantik-red text-sm">
                  </div>

                  {/* Success message */}
                  <div id="success-msg" class="hidden mt-3 px-4 py-3 bg-ekantik-green/10 border border-ekantik-green/20 rounded-xl text-ekantik-green text-sm">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-check-circle"></i>
                      <span>Check your email for the login link</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="submit-btn"
                    class="w-full mt-6 px-6 py-3 bg-ekantik-gold hover:bg-ekantik-gold-light text-ekantik-bg font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <i class="fas fa-paper-plane text-xs"></i>
                    <span id="btn-text">Send Magic Link</span>
                  </button>
                </form>

                {/* Divider */}
                <div class="mt-6 pt-6 border-t border-ekantik-border text-center">
                  <p class="text-gray-500 text-sm">
                    Don't have an account?{' '}
                    <a href="/register" class="text-ekantik-gold hover:text-ekantik-gold-light transition-colors font-medium">
                      Start your free trial
                    </a>
                  </p>
                </div>
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
            var form = document.getElementById('login-form');
            var emailInput = document.getElementById('email');
            var submitBtn = document.getElementById('submit-btn');
            var btnText = document.getElementById('btn-text');
            var errorMsg = document.getElementById('error-msg');
            var successMsg = document.getElementById('success-msg');

            form.addEventListener('submit', async function(e) {
              e.preventDefault();
              var email = emailInput.value.trim();
              if (!email) return;

              // Reset messages
              errorMsg.classList.add('hidden');
              successMsg.classList.add('hidden');

              // Loading state
              submitBtn.disabled = true;
              btnText.textContent = 'Sending...';
              submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

              try {
                var res = await fetch('/api/auth/magic-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email })
                });

                var data = await res.json();

                if (res.ok) {
                  successMsg.classList.remove('hidden');
                  emailInput.disabled = true;
                  btnText.textContent = 'Link Sent';
                } else {
                  errorMsg.textContent = data.error || data.message || 'Something went wrong. Please try again.';
                  errorMsg.classList.remove('hidden');
                  submitBtn.disabled = false;
                  btnText.textContent = 'Send Magic Link';
                  submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
                }
              } catch (err) {
                errorMsg.textContent = 'Network error. Please check your connection and try again.';
                errorMsg.classList.remove('hidden');
                submitBtn.disabled = false;
                btnText.textContent = 'Send Magic Link';
                submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
              }
            });
          })();
        `}} />
      </body>
    </html>
  )
})

export { app as publicLoginRoutes }
