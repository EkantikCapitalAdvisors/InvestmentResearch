import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { apiRoutes } from './api'
import { pageRoutes } from './pages'
import { slackRoutes } from './slack/handlers'

type Bindings = {
  DB: D1Database
  ANTHROPIC_API_KEY: string
  SLACK_BOT_TOKEN?: string
  SLACK_SIGNING_SECRET?: string
  RESEARCH_PASSCODE?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)
app.use('/api/*', cors())

// Slack routes (must be before generic API routes)
app.route('/api/slack', slackRoutes)

// API routes
app.route('/api', apiRoutes)

// Page routes
app.route('/', pageRoutes)

export default app
