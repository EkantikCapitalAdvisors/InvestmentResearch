import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { apiRoutes } from './api/index'
import { adminPageRoutes } from './pages/admin/index'
import { subscriberPageRoutes } from './pages/subscriber/index'
import { publicPageRoutes } from './pages/public/index'
import { slackRoutes } from './slack/handlers'
import { optionalAuth } from './middleware/auth'

type Bindings = {
  DB: D1Database
  ANTHROPIC_API_KEY: string
  SLACK_BOT_TOKEN?: string
  SLACK_SIGNING_SECRET?: string
  RESEARCH_PASSCODE?: string
  AUTH_SECRET?: string
  RESEND_API_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_MONTHLY?: string
  STRIPE_PRICE_ANNUAL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)
app.use('/api/*', cors())

// Slack routes (must be before generic API routes)
app.route('/api/slack', slackRoutes)

// API routes (includes admin, subscriber, auth, billing, push APIs)
app.route('/api', apiRoutes)

// Apply optional auth only to page routes (not API routes)
app.use('*', async (c, next) => {
  // Skip if already handled (API routes)
  if (c.req.path.startsWith('/api/')) return next()
  return optionalAuth(c, next)
})

// Public pages (login, register, verify, onboarding) — no auth required
app.route('/', publicPageRoutes)

// Subscriber pages (feed, watchlist, trends, research, market, avoid, mag7, methodology, account)
app.route('/', subscriberPageRoutes)

// Admin pages (home, feed, watchlist, mag7, aomg, heat, observations, journal, settings, upload, queue, subscribers)
app.route('/', adminPageRoutes)

export default app
