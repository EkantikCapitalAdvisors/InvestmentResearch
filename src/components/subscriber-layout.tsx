import type { FC } from 'hono/jsx'
import type { AuthUser } from '../middleware/auth'

const navItems = [
  { path: '/feed', icon: 'fas fa-satellite-dish', label: 'Feed', id: 'feed' },
  { path: '/watchlist', icon: 'fas fa-binoculars', label: 'Watchlist', id: 'watchlist' },
  { path: '/trends', icon: 'fas fa-bullseye', label: 'Trends', id: 'trends' },
  { path: '/research', icon: 'fas fa-microscope', label: 'Research Reports', id: 'research' },
  { path: '/market', icon: 'fas fa-chart-bar', label: 'Market Commentary', id: 'market' },
  { path: '/avoid', icon: 'fas fa-ban', label: 'Avoid List', id: 'avoid' },
  { path: '/mag7', icon: 'fas fa-crown', label: 'Magnificent 7', id: 'mag7' },
]

const accountItems = [
  { path: '/account', icon: 'fas fa-user-circle', label: 'My Subscription', id: 'account' },
  { path: '/account/notifications', icon: 'fas fa-bell', label: 'Notifications', id: 'notifications' },
  { path: '/methodology', icon: 'fas fa-book-open', label: 'Methodology', id: 'methodology' },
]

// Bottom tab items for mobile
const tabItems = [
  { path: '/feed', icon: 'fas fa-satellite-dish', label: 'Feed', id: 'feed' },
  { path: '/watchlist', icon: 'fas fa-binoculars', label: 'Watchlist', id: 'watchlist' },
  { path: '/trends', icon: 'fas fa-bullseye', label: 'Trends', id: 'trends' },
  { path: '/research', icon: 'fas fa-microscope', label: 'Research', id: 'research' },
  { path: '/account', icon: 'fas fa-user-circle', label: 'Account', id: 'account' },
]

function getTrialBadge(user: AuthUser | null): string {
  if (!user) return ''
  if (user.plan === 'trial' && user.trialDaysRemaining !== null) {
    return `Free Trial — ${user.trialDaysRemaining} days remaining`
  }
  if (user.plan === 'active_monthly') return 'Monthly'
  if (user.plan === 'active_annual') return 'Annual — Committed Investor'
  if (user.plan === 'past_due') return 'Payment Failed'
  if (user.plan === 'cancelled') return 'Cancelling'
  if (user.plan === 'expired') return 'Expired'
  return ''
}

function getBadgeColor(plan: string): string {
  if (plan === 'trial') return 'bg-ekantik-amber/20 text-ekantik-amber'
  if (plan === 'active_monthly' || plan === 'active_annual') return 'bg-ekantik-green/20 text-ekantik-green'
  if (plan === 'past_due') return 'bg-ekantik-red/20 text-ekantik-red'
  if (plan === 'cancelled') return 'bg-gray-700 text-gray-400'
  if (plan === 'expired') return 'bg-ekantik-red/20 text-ekantik-red'
  return 'bg-gray-700 text-gray-400'
}

export const SubscriberLayout: FC<{ active: string; user?: AuthUser | null; children: any }> = ({ active, user, children }) => {
  const badgeText = getTrialBadge(user || null)
  const badgeColor = getBadgeColor(user?.plan || '')
  const showTrialBanner = user?.plan === 'trial' && user.trialDaysRemaining !== null && user.trialDaysRemaining <= 7
  const showExpiredOverlay = user?.plan === 'expired' && active !== 'feed' && active !== 'methodology'

  return (
    <div class="flex h-screen overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <aside class="hidden md:flex w-64 bg-ekantik-card border-r border-ekantik-border flex-shrink-0 flex-col">
        {/* Logo */}
        <div class="p-5 border-b border-ekantik-border">
          <a href="/feed" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-ekantik-gold rounded-lg flex items-center justify-center shadow-lg">
              <span class="text-ekantik-bg font-bold text-sm tracking-tight">ECA</span>
            </div>
            <div>
              <div class="text-ekantik-gold font-semibold text-sm tracking-wide">Ekantik Research</div>
              <div class="text-gray-500 text-[10px] tracking-widest uppercase">Intelligence Portal</div>
            </div>
          </a>
        </div>

        {/* Navigation */}
        <nav class="flex-1 py-4 overflow-y-auto">
          <div class="px-3 mb-2">
            <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3">Intelligence</span>
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
            <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3">Account</span>
          </div>
          {accountItems.map((item) => (
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
        </nav>

        {/* Subscription badge footer */}
        {badgeText && (
          <div class="p-4 border-t border-ekantik-border">
            <div class={`px-3 py-1.5 rounded-full text-[10px] font-semibold text-center ${badgeColor}`}>
              {badgeText}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main class="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* Top Bar */}
        <header class="bg-ekantik-card/80 backdrop-blur-md border-b border-ekantik-border sticky top-0 z-40">
          <div class="h-1 bg-gradient-to-r from-ekantik-gold via-ekantik-gold-light to-transparent"></div>
          <div class="flex items-center justify-between px-4 md:px-6 py-3">
            {/* Mobile logo */}
            <a href="/feed" class="flex md:hidden items-center gap-2">
              <div class="w-8 h-8 bg-ekantik-gold rounded-lg flex items-center justify-center">
                <span class="text-ekantik-bg font-bold text-xs">ECA</span>
              </div>
            </a>
            <div class="hidden md:block" />
            <div class="flex items-center gap-3">
              {badgeText && (
                <span class={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${badgeColor}`}>
                  {badgeText}
                </span>
              )}
              <span class="text-[10px] text-gray-500" id="last-updated"></span>
            </div>
          </div>
        </header>

        {/* Trial expiring banner */}
        {showTrialBanner && (
          <div class="bg-ekantik-amber/10 border-b border-ekantik-amber/20 px-6 py-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fas fa-exclamation-triangle text-ekantik-amber text-sm"></i>
              <span class="text-ekantik-amber text-sm font-semibold">
                {user!.trialDaysRemaining! <= 2
                  ? `Your trial expires in ${user!.trialDaysRemaining} day${user!.trialDaysRemaining === 1 ? '' : 's'}!`
                  : `${user!.trialDaysRemaining} days left in your trial. Keep your edge.`
                }
              </span>
            </div>
            <a href="/account/subscribe" class="px-4 py-1.5 bg-ekantik-gold text-ekantik-bg rounded-lg text-xs font-bold hover:bg-ekantik-gold-light transition-colors">
              Subscribe Now
            </a>
          </div>
        )}

        {/* Main content area */}
        <div class="p-4 md:p-6 relative">
          {showExpiredOverlay && (
            <div class="absolute inset-0 bg-ekantik-bg/80 backdrop-blur-sm z-30 flex items-center justify-center">
              <div class="text-center max-w-md mx-auto p-8">
                <div class="w-16 h-16 bg-ekantik-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-lock text-ekantik-gold text-2xl"></i>
                </div>
                <h2 class="text-xl font-bold text-white mb-2">Reactivate Your Access</h2>
                <p class="text-gray-400 text-sm mb-6">Your subscription has expired. Reactivate to continue receiving daily institutional-grade intelligence.</p>
                <a href="/account/subscribe" class="px-6 py-3 bg-ekantik-gold text-ekantik-bg rounded-lg font-semibold hover:bg-ekantik-gold-light transition-colors inline-block">
                  Reactivate Now
                </a>
              </div>
            </div>
          )}
          {children}
        </div>

        {/* Compliance disclaimer */}
        <footer class="px-6 py-4 border-t border-ekantik-border">
          <p class="text-[10px] text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
            All content is for educational and informational purposes only. Nothing herein constitutes investment advice.
            All investments carry risk, including potential loss of principal. Past performance does not guarantee future results.
            EPIG performance targets are goals based on backtested methodology and are not guaranteed.
          </p>
        </footer>
      </main>

      {/* Mobile bottom tab bar */}
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-ekantik-card border-t border-ekantik-border z-50 flex items-center justify-around px-2 py-1 safe-area-pb">
        {tabItems.map((item) => (
          <a
            href={item.path}
            class={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg text-[10px] ${
              active === item.id ? 'text-ekantik-gold' : 'text-gray-500'
            }`}
          >
            <i class={`${item.icon} text-sm`}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .safe-area-pb { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
      `}} />
    </div>
  )
}
