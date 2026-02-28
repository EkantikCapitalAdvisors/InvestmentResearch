import { Hono } from 'hono'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const tickersApi = new Hono<{ Bindings: Bindings }>()

tickersApi.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM tickers ORDER BY symbol ASC').all()
  return c.json({ tickers: results })
})

tickersApi.get('/:id', async (c) => {
  const id = c.req.param('id')
  const ticker = await c.env.DB.prepare('SELECT * FROM tickers WHERE id = ?').bind(id).first()
  if (!ticker) return c.json({ error: 'Ticker not found' }, 404)

  const scores = await c.env.DB.prepare('SELECT * FROM ai_scores WHERE ticker_id = ? ORDER BY scored_at DESC LIMIT 10').bind(id).all()
  const events = await c.env.DB.prepare('SELECT * FROM material_events WHERE ticker_id = ? ORDER BY created_at DESC LIMIT 20').bind(id).all()
  const signals = await c.env.DB.prepare('SELECT * FROM trade_signals WHERE ticker_id = ? ORDER BY created_at DESC LIMIT 10').bind(id).all()
  const biasChecks = await c.env.DB.prepare('SELECT * FROM bias_mode_checks WHERE ticker_id = ? ORDER BY checked_at DESC LIMIT 5').bind(id).all()
  const reports = await c.env.DB.prepare("SELECT * FROM research_reports WHERE ticker_symbols LIKE ? ORDER BY created_at DESC LIMIT 10").bind(`%${ticker.symbol}%`).all()

  return c.json({
    ticker,
    scores: scores.results,
    events: events.results,
    signals: signals.results,
    biasChecks: biasChecks.results,
    reports: reports.results,
  })
})

tickersApi.get('/:id/scores', async (c) => {
  const id = c.req.param('id')
  const { results } = await c.env.DB.prepare('SELECT * FROM ai_scores WHERE ticker_id = ? ORDER BY scored_at DESC').bind(id).all()
  return c.json({ scores: results })
})

export { tickersApi }
