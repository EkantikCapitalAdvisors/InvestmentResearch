import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { apiRoutes } from './api'
import { pageRoutes } from './pages'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)
app.use('/api/*', cors())

// API routes
app.route('/api', apiRoutes)

// Page routes
app.route('/', pageRoutes)

export default app
