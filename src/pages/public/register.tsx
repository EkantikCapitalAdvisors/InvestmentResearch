import { Hono } from 'hono'

type Bindings = { DB: D1Database }

const app = new Hono<{ Bindings: Bindings }>()

// ============================================================
// REGISTER — Free Trial Sign Up
// ============================================================
app.get('/register', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Start Free Trial — Ekantik Capital Advisors</title>
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
                <h1 class="text-2xl font-bold text-white">Start Your Free Trial</h1>
                <p class="text-gray-400 text-sm mt-1">Institutional-grade investment intelligence</p>
              </div>

              {/* Register card */}
              <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-8">
                <form id="register-form" onsubmit="return false;">
                  {/* Name field */}
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-300 mb-2" for="name">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Your name"
                      class="w-full px-4 py-3 bg-ekantik-bg border border-ekantik-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ekantik-gold/50 focus:ring-1 focus:ring-ekantik-gold/30 transition-colors text-sm"
                    />
                  </div>

                  {/* Email field */}
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-300 mb-2" for="email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      class="w-full px-4 py-3 bg-ekantik-bg border border-ekantik-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ekantik-gold/50 focus:ring-1 focus:ring-ekantik-gold/30 transition-colors text-sm"
                    />
                  </div>

                  {/* Error message */}
                  <div id="error-msg" class="hidden mt-1 mb-3 px-4 py-3 bg-ekantik-red/10 border border-ekantik-red/20 rounded-xl text-ekantik-red text-sm">
                  </div>

                  <button
                    type="submit"
                    id="submit-btn"
                    class="w-full mt-4 px-6 py-3 bg-ekantik-gold hover:bg-ekantik-gold-light text-ekantik-bg font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <i class="fas fa-rocket text-xs"></i>
                    <span id="btn-text">Start Free Trial</span>
                  </button>
                </form>

                {/* Benefits */}
                <div class="mt-6 pt-6 border-t border-ekantik-border">
                  <p class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">What you get</p>
                  <ul class="space-y-2.5">
                    <li class="flex items-center gap-3 text-sm text-gray-300">
                      <div class="w-5 h-5 rounded-full bg-ekantik-green/20 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-check text-ekantik-green text-[8px]"></i>
                      </div>
                      <span>60-day free trial</span>
                    </li>
                    <li class="flex items-center gap-3 text-sm text-gray-300">
                      <div class="w-5 h-5 rounded-full bg-ekantik-green/20 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-check text-ekantik-green text-[8px]"></i>
                      </div>
                      <span>Daily institutional-grade intelligence</span>
                    </li>
                    <li class="flex items-center gap-3 text-sm text-gray-300">
                      <div class="w-5 h-5 rounded-full bg-ekantik-green/20 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-check text-ekantik-green text-[8px]"></i>
                      </div>
                      <span>12 proprietary frameworks</span>
                    </li>
                    <li class="flex items-center gap-3 text-sm text-gray-300">
                      <div class="w-5 h-5 rounded-full bg-ekantik-green/20 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-check text-ekantik-green text-[8px]"></i>
                      </div>
                      <span>No credit card required</span>
                    </li>
                  </ul>
                </div>

                {/* Link to login */}
                <div class="mt-6 pt-6 border-t border-ekantik-border text-center">
                  <p class="text-gray-500 text-sm">
                    Already have an account?{' '}
                    <a href="/login" class="text-ekantik-gold hover:text-ekantik-gold-light transition-colors font-medium">
                      Sign in
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
            var form = document.getElementById('register-form');
            var nameInput = document.getElementById('name');
            var emailInput = document.getElementById('email');
            var submitBtn = document.getElementById('submit-btn');
            var btnText = document.getElementById('btn-text');
            var errorMsg = document.getElementById('error-msg');

            form.addEventListener('submit', async function(e) {
              e.preventDefault();
              var name = nameInput.value.trim();
              var email = emailInput.value.trim();
              if (!name || !email) return;

              // Reset messages
              errorMsg.classList.add('hidden');

              // Loading state
              submitBtn.disabled = true;
              btnText.textContent = 'Creating account...';
              submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

              try {
                var res = await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: name, email: email })
                });

                var data = await res.json();

                if (res.ok) {
                  // Redirect to verify page with email
                  window.location.href = '/verify?email=' + encodeURIComponent(email);
                } else {
                  var msg = data.error || data.message || 'Something went wrong. Please try again.';
                  if (res.status === 409) {
                    msg = 'An account with this email already exists. Please sign in instead.';
                  }
                  errorMsg.textContent = msg;
                  errorMsg.classList.remove('hidden');
                  submitBtn.disabled = false;
                  btnText.textContent = 'Start Free Trial';
                  submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
                }
              } catch (err) {
                errorMsg.textContent = 'Network error. Please check your connection and try again.';
                errorMsg.classList.remove('hidden');
                submitBtn.disabled = false;
                btnText.textContent = 'Start Free Trial';
                submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
              }
            });
          })();
        `}} />
      </body>
    </html>
  )
})

export { app as publicRegisterRoutes }
