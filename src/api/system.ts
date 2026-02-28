import { Hono } from 'hono'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const systemApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SYSTEM CONFIG
// ============================================================
systemApi.get('/config/:key', async (c) => {
  const key = c.req.param('key')
  const row = await c.env.DB.prepare('SELECT * FROM system_config WHERE key = ?').bind(key).first()
  if (!row) return c.json({ error: 'Config not found' }, 404)
  return c.json({ key: row.key, value: JSON.parse(row.value as string) })
})

// ============================================================
// DIAGNOSTICS — Test Claude API connectivity & executionCtx
// ============================================================
systemApi.get('/diag/claude', async (c) => {
  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'ANTHROPIC_API_KEY not set', keyPresent: false })
  }
  try {
    const start = Date.now()
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': c.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }]
      })
    })
    const data: any = await resp.json()
    const ms = Date.now() - start

    // Check executionCtx availability
    let ctxInfo = 'unknown'
    try {
      const ctx = c.executionCtx
      ctxInfo = ctx ? (typeof ctx.waitUntil === 'function' ? 'has_waitUntil' : 'no_waitUntil') : 'null'
    } catch (e: any) { ctxInfo = `error: ${e.message}` }

    return c.json({
      keyPresent: true,
      keyLength: c.env.ANTHROPIC_API_KEY.length,
      apiStatus: resp.status,
      model: data.model,
      reply: data.content?.[0]?.text?.substring(0, 50),
      latencyMs: ms,
      ok: resp.ok,
      executionCtx: ctxInfo,
    })
  } catch (e: any) {
    return c.json({ keyPresent: true, error: e.message })
  }
})

// ============================================================
// STATS
// ============================================================
systemApi.get('/stats', async (c) => {
  const totalReports = await c.env.DB.prepare('SELECT COUNT(*) as count FROM research_reports').first()
  const highImpact = await c.env.DB.prepare("SELECT COUNT(*) as count FROM research_reports WHERE impact_score = 'H'").first()
  const watchlistCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM tickers WHERE is_watchlist = 1').first()
  const activeSignals = await c.env.DB.prepare('SELECT COUNT(*) as count FROM trade_signals WHERE is_active = 1').first()
  const openPositions = await c.env.DB.prepare("SELECT COUNT(*) as count FROM portfolio_positions WHERE status = 'open'").first()

  return c.json({
    totalReports: (totalReports as any)?.count || 0,
    highImpactReports: (highImpact as any)?.count || 0,
    watchlistTickers: (watchlistCount as any)?.count || 0,
    activeSignals: (activeSignals as any)?.count || 0,
    openPositions: (openPositions as any)?.count || 0,
  })
})

// ============================================================
// AOMG
// ============================================================
systemApi.get('/aomg/themes', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM aomg_themes ORDER BY
      CASE status WHEN 'active' THEN 1 WHEN 'monitoring' THEN 2 ELSE 3 END,
      ai_score_composite DESC
  `).all()
  return c.json({ themes: results })
})

export { systemApi }
