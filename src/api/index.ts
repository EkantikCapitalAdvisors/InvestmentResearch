import { Hono } from 'hono'
import { authApi, requirePasscode } from './auth'
import { researchApi } from './research'
import { watchlistApi } from './watchlist'
import { tickersApi } from './tickers'
import { mag7Api } from './mag7'
import { portfolioApi } from './portfolio'
import { observationsApi } from './observations'
import { journalApi } from './journal'
import { marketApi } from './market'
import { slackApi } from './slack-api'
import { systemApi } from './system'
import { subscriberAuthApi } from './subscriber-auth'
import { subscriberFeedApi } from './subscriber/feed'
import { adminContentApi } from './admin/content'
import { adminSubscribersApi } from './admin/subscribers'
import { billingApi } from './billing'
import { pushApi } from './push'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string; AUTH_SECRET?: string; RESEND_API_KEY?: string; STRIPE_SECRET_KEY?: string; STRIPE_WEBHOOK_SECRET?: string; STRIPE_PRICE_MONTHLY?: string; STRIPE_PRICE_ANNUAL?: string }

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// Apply passcode middleware to AI-calling routes
apiRoutes.use('/research/run', requirePasscode)
apiRoutes.use('/watchlist/run-agent', requirePasscode)
apiRoutes.use('/diag/claude', requirePasscode)

// Mount sub-routers
apiRoutes.route('/auth', authApi)
apiRoutes.route('/research', researchApi)
apiRoutes.route('/watchlist', watchlistApi)
apiRoutes.route('/tickers', tickersApi)
apiRoutes.route('/mag7', mag7Api)
apiRoutes.route('/portfolio', portfolioApi)
apiRoutes.route('/observations', observationsApi)
apiRoutes.route('/journal', journalApi)
apiRoutes.route('/market', marketApi)
apiRoutes.route('/slack', slackApi)

// Subscriber auth routes
apiRoutes.route('/auth', subscriberAuthApi)

// Subscriber-facing content API
apiRoutes.route('/subscriber', subscriberFeedApi)

// Admin content management
apiRoutes.route('/admin/content', adminContentApi)
apiRoutes.route('/admin/subscribers', adminSubscribersApi)

// Billing
apiRoutes.route('/billing', billingApi)

// Push notifications
apiRoutes.route('/push', pushApi)

// System routes are mounted at root level (config, stats, diag, aomg)
apiRoutes.route('/', systemApi)
