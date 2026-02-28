import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Ekantik Capital Advisors — Research Portal'}</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0f1e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ekantik Intelligence" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
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
        <script dangerouslySetInnerHTML={{ __html: `
          // ── Research Passcode Gate ──────────────────────────────
          // Stored in sessionStorage; cleared when tab closes.
          window._passcodeRequired = null; // cached flag

          async function isPasscodeRequired() {
            if (window._passcodeRequired !== null) return window._passcodeRequired;
            try {
              var r = await fetch('/api/auth/passcode-required');
              var d = await r.json();
              window._passcodeRequired = !!d.required;
            } catch(e) { window._passcodeRequired = false; }
            return window._passcodeRequired;
          }

          function getStoredPasscode() {
            return sessionStorage.getItem('ekantik_passcode') || '';
          }

          // Prompt user for passcode, verify it server-side, store in session.
          // Returns the valid passcode string or null if cancelled/failed.
          async function promptPasscode() {
            var stored = getStoredPasscode();
            if (stored) return stored;

            var required = await isPasscodeRequired();
            if (!required) return '__NONE__';

            var code = prompt('Enter research passcode to run AI agents:');
            if (!code) return null;

            try {
              var r = await fetch('/api/auth/verify-passcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode: code })
              });
              var d = await r.json();
              if (d.valid) {
                sessionStorage.setItem('ekantik_passcode', code);
                return code;
              } else {
                alert('Invalid passcode. Please try again.');
                return null;
              }
            } catch(e) {
              alert('Could not verify passcode: ' + e.message);
              return null;
            }
          }

          // Returns headers object with passcode (for use in fetch calls).
          // Call with await — prompts if needed. Returns null if user cancels.
          async function passcodeHeaders() {
            var code = await promptPasscode();
            if (code === null) return null;
            if (code === '__NONE__') return {};
            return { 'X-Research-Passcode': code };
          }

          // Convenience: merge passcode header into an existing headers object.
          async function withPasscode(existingHeaders) {
            var ph = await passcodeHeaders();
            if (ph === null) return null;
            return Object.assign({}, existingHeaders || {}, ph);
          }

          // On 401/403 with PASSCODE codes, clear stored passcode so user is re-prompted.
          function handlePasscodeError(data) {
            if (data && (data.code === 'PASSCODE_REQUIRED' || data.code === 'PASSCODE_INVALID')) {
              sessionStorage.removeItem('ekantik_passcode');
              return true;
            }
            return false;
          }
        `}} />
        <style dangerouslySetInnerHTML={{ __html: `
          * { font-family: 'Inter', sans-serif; }
          body { background: #0a0f1e; color: #f9fafb; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #111827; }
          ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
          .sidebar-link { transition: all 0.2s; }
          .sidebar-link:hover, .sidebar-link.active { background: rgba(212,168,67,0.1); color: #d4a843; border-left: 3px solid #d4a843; }
          .report-card { transition: all 0.2s; }
          .report-card:hover { border-color: #d4a843; transform: translateY(-1px); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.3s ease-out; }
          @keyframes pulse-gold { 0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,67,0.4); } 70% { box-shadow: 0 0 0 6px rgba(212,168,67,0); } }
          .pulse-gold { animation: pulse-gold 2s infinite; }
          .heat-bar { transition: width 0.8s ease-out; }
          .glass-card { background: rgba(26,35,50,0.7); backdrop-filter: blur(10px); }
        `}} />
      </head>
      <body class="font-inter antialiased">
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(function() {});
          }
        `}} />
      </body>
    </html>
  )
})
