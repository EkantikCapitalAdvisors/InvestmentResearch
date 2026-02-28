import type { FC } from 'hono/jsx'

const navItems = [
  { path: '/', icon: 'fas fa-home', label: 'Home', id: 'home' },
  { path: '/feed', icon: 'fas fa-satellite-dish', label: 'Intelligence Feed', id: 'dashboard' },
  { path: '/watchlist', icon: 'fas fa-binoculars', label: 'Watchlist', id: 'watchlist' },
  { path: '/mag7', icon: 'fas fa-crown', label: 'Magnificent 7', id: 'mag7' },
  { path: '/aomg', icon: 'fas fa-bullseye', label: 'AOMG Tracker', id: 'aomg' },
  { path: '/heat', icon: 'fas fa-fire', label: 'Portfolio Heat', id: 'heat' },
  { path: '/observations', icon: 'fas fa-microscope', label: 'Observations', id: 'observations' },
  { path: '/journal', icon: 'fas fa-book', label: 'Trade Journal', id: 'journal' },
]

export const Layout: FC<{ active: string; children: any }> = ({ active, children }) => {
  return (
    <div class="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside class="w-64 bg-ekantik-card border-r border-ekantik-border flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div class="p-5 border-b border-ekantik-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-ekantik-gold rounded-lg flex items-center justify-center shadow-lg">
              <span class="text-ekantik-bg font-bold text-sm tracking-tight">ECA</span>
            </div>
            <div>
              <div class="text-ekantik-gold font-semibold text-sm tracking-wide">Ekantik Capital</div>
              <div class="text-gray-500 text-[10px] tracking-widest uppercase">Advisors LLC</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav class="flex-1 py-4 overflow-y-auto">
          <div class="px-3 mb-2">
            <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3">Research</span>
          </div>
          {navItems.map((item) => (
            <a
              href={item.path}
              class={`sidebar-link flex items-center gap-3 px-6 py-2.5 text-sm border-l-3 border-transparent ${
                active === item.id
                  ? 'bg-ekantik-gold/10 text-ekantik-gold border-l-[3px] border-ekantik-gold'
                  : 'text-gray-400 hover:text-ekantik-gold'
              }`}
            >
              <i class={`${item.icon} w-4 text-center text-xs`}></i>
              <span>{item.label}</span>
            </a>
          ))}

          <div class="px-3 mt-6 mb-2">
            <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3">Publish</span>
          </div>
          <a href="/admin/upload" class={`sidebar-link flex items-center gap-3 px-6 py-2.5 text-sm border-l-3 border-transparent ${active === 'upload' ? 'bg-ekantik-gold/10 text-ekantik-gold border-l-[3px] border-ekantik-gold' : 'text-gray-400 hover:text-ekantik-gold'}`}>
            <i class="fas fa-cloud-upload-alt w-4 text-center text-xs"></i>
            <span>Upload Content</span>
          </a>
          <a href="/admin/queue" class={`sidebar-link flex items-center gap-3 px-6 py-2.5 text-sm border-l-3 border-transparent ${active === 'queue' ? 'bg-ekantik-gold/10 text-ekantik-gold border-l-[3px] border-ekantik-gold' : 'text-gray-400 hover:text-ekantik-gold'}`}>
            <i class="fas fa-tasks w-4 text-center text-xs"></i>
            <span>Review Queue</span>
          </a>

          <div class="px-3 mt-6 mb-2">
            <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3">System</span>
          </div>
          <a href="/settings" class={`sidebar-link flex items-center gap-3 px-6 py-2.5 text-sm border-l-3 border-transparent ${active === 'settings' ? 'bg-ekantik-gold/10 text-ekantik-gold border-l-[3px] border-ekantik-gold' : 'text-gray-400 hover:text-ekantik-gold'}`}>
            <i class="fas fa-cog w-4 text-center text-xs"></i>
            <span>Settings</span>
          </a>
          <a href="/admin/subscribers" class={`sidebar-link flex items-center gap-3 px-6 py-2.5 text-sm border-l-3 border-transparent ${active === 'subscribers' ? 'bg-ekantik-gold/10 text-ekantik-gold border-l-[3px] border-ekantik-gold' : 'text-gray-400 hover:text-ekantik-gold'}`}>
            <i class="fas fa-users w-4 text-center text-xs"></i>
            <span>Subscribers</span>
          </a>
        </nav>

        {/* Footer */}
        <div class="p-4 border-t border-ekantik-border">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>Market Mode</span>
            <span class="px-2 py-0.5 bg-ekantik-green/20 text-ekantik-green rounded-full text-[10px] font-semibold uppercase" id="market-mode-badge">Bull</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Portfolio Heat</span>
            <span class="text-ekantik-amber font-semibold" id="heat-badge">—</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main class="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header class="bg-ekantik-card/80 backdrop-blur-md border-b border-ekantik-border sticky top-0 z-40">
          <div class="h-1 bg-gradient-to-r from-ekantik-gold via-ekantik-gold-light to-transparent"></div>
          <div class="flex items-center justify-between px-6 py-3">
            <div class="flex items-center gap-4">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search tickers, reports, observations..."
                  class="bg-ekantik-bg border border-ekantik-border rounded-lg px-4 py-2 text-sm w-80 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-ekantik-gold/50"
                />
                <i class="fas fa-search absolute right-3 top-2.5 text-gray-500 text-xs"></i>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <button onclick="refreshMarketPrices()" id="refresh-prices-btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ekantik-gold/30 text-ekantik-gold text-xs hover:bg-ekantik-gold/10 transition-colors">
                <i class="fas fa-sync-alt text-[10px]" id="refresh-icon"></i>
                <span id="refresh-label">Refresh Prices</span>
              </button>
              <span class="text-[10px] text-gray-500" id="last-refresh"></span>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <div class="w-2 h-2 bg-ekantik-green rounded-full pulse-gold" id="live-dot"></div>
                <span id="market-state">Live</span>
              </div>
            </div>
          </div>
        </header>

        <div class="p-6">
          {children}
        </div>
      </main>

      {/* Global Market Refresh Script */}
      <script dangerouslySetInnerHTML={{ __html: `
        let _pricesRefreshing = false;
        async function refreshMarketPrices() {
          if (_pricesRefreshing) return;
          _pricesRefreshing = true;
          const btn = document.getElementById('refresh-prices-btn');
          const icon = document.getElementById('refresh-icon');
          const label = document.getElementById('refresh-label');
          if (icon) icon.classList.add('fa-spin');
          if (label) label.textContent = 'Refreshing...';
          try {
            const res = await fetch('/api/market/refresh', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
              if (label) label.textContent = data.updated + ' updated';
              const ts = document.getElementById('last-refresh');
              if (ts) ts.textContent = 'as of ' + new Date().toLocaleTimeString();
              const dot = document.getElementById('live-dot');
              if (dot) { dot.classList.remove('bg-gray-500'); dot.classList.add('bg-ekantik-green'); }
              const ms = document.getElementById('market-state');
              if (ms && data.quotes && data.quotes[0]) ms.textContent = data.quotes[0].marketState === 'REGULAR' ? 'Market Open' : 'Market Closed';
              setTimeout(() => { if (label) label.textContent = 'Refresh Prices'; }, 3000);
              // Trigger page-specific reload if available
              if (typeof window._onPricesRefreshed === 'function') window._onPricesRefreshed(data);
              else setTimeout(() => location.reload(), 500);
            } else {
              if (label) label.textContent = 'Error';
              setTimeout(() => { if (label) label.textContent = 'Refresh Prices'; }, 3000);
            }
          } catch(e) {
            console.error('Price refresh failed:', e);
            if (label) label.textContent = 'Failed';
            setTimeout(() => { if (label) label.textContent = 'Refresh Prices'; }, 3000);
          }
          if (icon) icon.classList.remove('fa-spin');
          _pricesRefreshing = false;
        }
        // Auto-refresh prices on first page load (debounced to avoid hammering)
        if (!sessionStorage.getItem('_pricesRefreshed') || (Date.now() - parseInt(sessionStorage.getItem('_pricesRefreshed')||'0')) > 300000) {
          setTimeout(() => {
            refreshMarketPrices().then(() => sessionStorage.setItem('_pricesRefreshed', Date.now().toString()));
          }, 1000);
        }
      `}} />
    </div>
  )
}
