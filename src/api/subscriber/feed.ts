import { Hono } from 'hono'

type Bindings = { DB: D1Database }

export const subscriberFeedApi = new Hono<{ Bindings: Bindings }>()

// ── GET /feed — Published intelligence entries, paginated ──
subscriberFeedApi.get('/feed', async (c) => {
  const db = c.env.DB
  const category = c.req.query('category') || ''
  const impact = c.req.query('impact') || ''
  const ticker = c.req.query('ticker') || ''
  const dateFrom = c.req.query('from') || ''
  const dateTo = c.req.query('to') || ''
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')
  const search = c.req.query('q') || ''

  let where = "WHERE status = 'published'"
  const params: any[] = []

  if (category) { where += ' AND category = ?'; params.push(category) }
  if (impact) { where += ' AND impact_score = ?'; params.push(impact) }
  if (ticker) { where += ' AND ticker_symbols LIKE ?'; params.push(`%${ticker.toUpperCase()}%`) }
  if (dateFrom) { where += ' AND published_at >= ?'; params.push(dateFrom) }
  if (dateTo) { where += ' AND published_at <= ?'; params.push(dateTo) }
  if (search) { where += ' AND (title LIKE ? OR summary LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }

  const entries = await db.prepare(
    `SELECT id, title, slug, category, framework_source, summary, ticker_symbols, tags,
     impact_score, conviction_level, earnings_impact_estimate, catalyst_description,
     catalyst_date, portfolio_implication, published_at, created_at
     FROM intelligence_entries ${where}
     ORDER BY published_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all()

  const countResult = await db.prepare(
    `SELECT COUNT(*) as total FROM intelligence_entries ${where}`
  ).bind(...params).first<{ total: number }>()

  // Parse JSON fields for each entry
  const parsed = (entries.results || []).map((e: any) => ({
    ...e,
    ticker_symbols: safeJsonParse(e.ticker_symbols, []),
    tags: safeJsonParse(e.tags, []),
  }))

  return c.json({ entries: parsed, total: countResult?.total || 0 })
})

// ── GET /feed/:slug — Single entry detail ──
subscriberFeedApi.get('/feed/:slug', async (c) => {
  const slug = c.req.param('slug')
  const db = c.env.DB

  // Check if user is expired — only show preview
  const user = c.get('user') as any
  const isExpired = user?.plan === 'expired'

  const entry = await db.prepare(
    `SELECT * FROM intelligence_entries WHERE slug = ? AND status = 'published'`
  ).bind(slug).first<any>()

  if (!entry) return c.json({ error: 'Entry not found' }, 404)

  // Expired users only get summary, no full body
  if (isExpired) {
    return c.json({
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      category: entry.category,
      summary: entry.summary,
      ticker_symbols: safeJsonParse(entry.ticker_symbols, []),
      impact_score: entry.impact_score,
      conviction_level: entry.conviction_level,
      published_at: entry.published_at,
      locked: true,
    })
  }

  return c.json({
    ...entry,
    ticker_symbols: safeJsonParse(entry.ticker_symbols, []),
    tags: safeJsonParse(entry.tags, []),
    sources: safeJsonParse(entry.sources, []),
    locked: false,
  })
})

// ── GET /watchlist — Active subscriber watchlist entries ──
subscriberFeedApi.get('/watchlist', async (c) => {
  const db = c.env.DB
  const entries = await db.prepare(
    `SELECT * FROM watchlist_entries WHERE status != 'closed_hit' AND status != 'closed_invalidated' ORDER BY last_updated DESC`
  ).all()

  const parsed = (entries.results || []).map((e: any) => ({
    ...e,
    entry_framework: safeJsonParse(e.entry_framework, {}),
  }))

  return c.json({ entries: parsed })
})

// ── GET /trends — Active trend themes ──
subscriberFeedApi.get('/trends', async (c) => {
  const db = c.env.DB
  const themes = await db.prepare(
    `SELECT * FROM subscriber_trend_themes WHERE status IN ('active', 'monitoring') ORDER BY ai_score DESC`
  ).all()

  const parsed = (themes.results || []).map((t: any) => ({
    ...t,
    key_beneficiaries: safeJsonParse(t.key_beneficiaries, []),
    drivers: safeJsonParse(t.drivers, []),
    constraints: safeJsonParse(t.constraints, []),
    key_catalysts: safeJsonParse(t.key_catalysts, []),
  }))

  return c.json({ themes: parsed })
})

// ── GET /research — Multibagger reports ──
subscriberFeedApi.get('/research', async (c) => {
  const db = c.env.DB
  const status = c.req.query('status') || ''

  let where = "WHERE status = 'published' AND category = 'multibagger_report'"
  const params: any[] = []
  if (status) { where += ' AND conviction_level = ?'; params.push(status) }

  const entries = await db.prepare(
    `SELECT id, title, slug, summary, ticker_symbols, impact_score, conviction_level, published_at
     FROM intelligence_entries ${where} ORDER BY published_at DESC`
  ).bind(...params).all()

  const parsed = (entries.results || []).map((e: any) => ({
    ...e,
    ticker_symbols: safeJsonParse(e.ticker_symbols, []),
  }))

  return c.json({ reports: parsed })
})

// ── GET /market — Market commentary ──
subscriberFeedApi.get('/market', async (c) => {
  const db = c.env.DB
  const entries = await db.prepare(
    `SELECT id, title, slug, summary, ticker_symbols, impact_score, conviction_level, published_at
     FROM intelligence_entries WHERE status = 'published' AND category = 'market_commentary'
     ORDER BY published_at DESC LIMIT 20`
  ).all()

  const parsed = (entries.results || []).map((e: any) => ({
    ...e,
    ticker_symbols: safeJsonParse(e.ticker_symbols, []),
  }))

  return c.json({ entries: parsed })
})

// ── GET /avoid — Avoid list entries ──
subscriberFeedApi.get('/avoid', async (c) => {
  const db = c.env.DB
  const entries = await db.prepare(
    `SELECT * FROM avoid_list_entries ORDER BY obsolescence_score DESC`
  ).all()

  return c.json({ entries: entries.results || [] })
})

// ── GET /mag7 — Magnificent 7 data ──
subscriberFeedApi.get('/mag7', async (c) => {
  const db = c.env.DB

  // Get mag7 tickers with latest scores
  const tickers = await db.prepare(
    `SELECT t.*, s.composite, s.tam_score, s.bias_score, s.superlative_score, s.disruption_score, s.conviction_level as score_conviction
     FROM tickers t
     LEFT JOIN ai_scores s ON s.ticker_id = t.id AND s.id = (SELECT id FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1)
     WHERE t.is_mag7 = 1
     ORDER BY s.composite DESC`
  ).all()

  // Get latest mag7 published entry
  const latestEntry = await db.prepare(
    `SELECT title, summary, published_at FROM intelligence_entries
     WHERE status = 'published' AND framework_source = 'mag7_monitor'
     ORDER BY published_at DESC LIMIT 1`
  ).first()

  return c.json({ tickers: tickers.results || [], latestSummary: latestEntry })
})

// ── GET /stats — Feed stats for header ──
subscriberFeedApi.get('/stats', async (c) => {
  const db = c.env.DB
  const today = new Date().toISOString().split('T')[0]

  const totalToday = await db.prepare(
    `SELECT COUNT(*) as count FROM intelligence_entries WHERE status = 'published' AND date(published_at) = ?`
  ).bind(today).first<{ count: number }>()

  const highImpact = await db.prepare(
    `SELECT COUNT(*) as count FROM intelligence_entries WHERE status = 'published' AND date(published_at) = ? AND impact_score = 'HIGH'`
  ).bind(today).first<{ count: number }>()

  const watchlistUpdates = await db.prepare(
    `SELECT COUNT(*) as count FROM intelligence_entries WHERE status = 'published' AND date(published_at) = ? AND category = 'watchlist_update'`
  ).bind(today).first<{ count: number }>()

  const totalPublished = await db.prepare(
    `SELECT COUNT(*) as count FROM intelligence_entries WHERE status = 'published'`
  ).first<{ count: number }>()

  return c.json({
    todayTotal: totalToday?.count || 0,
    todayHighImpact: highImpact?.count || 0,
    todayWatchlistUpdates: watchlistUpdates?.count || 0,
    totalPublished: totalPublished?.count || 0,
  })
})

function safeJsonParse(str: any, fallback: any): any {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}
