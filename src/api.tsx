import { Hono } from 'hono'
import { processPortalResearch } from './slack/handlers'
import { refreshPrices, fetchQuote, fetchTickerProfile } from './market/yahoo'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string }

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// RESEARCH ENGINE — Run Research from Portal
// ============================================================
apiRoutes.post('/research/run', async (c) => {
  const body = await c.req.json()
  const { agentType, tickers, additionalContext } = body

  if (!agentType) {
    return c.json({ error: 'agentType is required' }, 400)
  }

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
  }

  try {
    const reportId = await processPortalResearch(
      c.env.ANTHROPIC_API_KEY,
      c.env.DB,
      agentType,
      tickers || [],
      additionalContext,
    )

    // Fetch the created report
    const report = await c.env.DB.prepare('SELECT * FROM research_reports WHERE id = ?').bind(reportId).first()

    return c.json({ success: true, reportId, report })
  } catch (error: any) {
    console.error('Research execution failed:', error)
    return c.json({ error: error.message || 'Research execution failed' }, 500)
  }
})

// ============================================================
// RESEARCH REPORTS
// ============================================================
apiRoutes.get('/research/feed', async (c) => {
  const agent = c.req.query('agent')
  const impact = c.req.query('impact')
  const ticker = c.req.query('ticker')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')

  let sql = 'SELECT * FROM research_reports WHERE 1=1'
  const params: any[] = []

  if (agent) { sql += ' AND agent_type = ?'; params.push(agent) }
  if (impact) { sql += ' AND impact_score = ?'; params.push(impact) }
  if (ticker) { sql += ' AND ticker_symbols LIKE ?'; params.push(`%${ticker}%`) }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ reports: results })
})

apiRoutes.get('/research/:id', async (c) => {
  const id = c.req.param('id')
  const report = await c.env.DB.prepare('SELECT * FROM research_reports WHERE id = ?').bind(id).first()
  if (!report) return c.json({ error: 'Report not found' }, 404)

  const events = await c.env.DB.prepare('SELECT me.*, t.symbol FROM material_events me JOIN tickers t ON me.ticker_id = t.id WHERE me.report_id = ?').bind(id).all()
  return c.json({ report, events: events.results })
})

// ============================================================
// TICKERS & WATCHLIST
// ============================================================
apiRoutes.get('/watchlist', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT t.*, 
      (SELECT composite FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as latest_ai_score,
      (SELECT conviction_level FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as latest_conviction,
      (SELECT impact_score FROM research_reports WHERE ticker_symbols LIKE '%' || t.symbol || '%' ORDER BY created_at DESC LIMIT 1) as latest_impact
    FROM tickers t WHERE t.is_watchlist = 1 ORDER BY t.is_mag7 DESC, t.symbol ASC
  `).all()
  return c.json({ tickers: results })
})

// ── Watchlist Management ─────────────────────────────────────

// Add ticker to watchlist (creates if not exists, fetches Yahoo data)
apiRoutes.post('/watchlist/add', async (c) => {
  const { symbol } = await c.req.json()
  if (!symbol) return c.json({ error: 'symbol is required' }, 400)
  const sym = symbol.toUpperCase().trim()
  if (!/^[A-Z]{1,5}$/.test(sym)) return c.json({ error: 'Invalid ticker symbol' }, 400)

  // Check if ticker already exists
  const existing = await c.env.DB.prepare('SELECT * FROM tickers WHERE symbol = ?').bind(sym).first() as any

  if (existing) {
    if (existing.is_watchlist) {
      return c.json({ error: `${sym} is already on the watchlist`, ticker: existing }, 409)
    }
    // Just flip the watchlist flag
    await c.env.DB.prepare(
      'UPDATE tickers SET is_watchlist = 1, added_to_watchlist_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(existing.id).run()
    const updated = await c.env.DB.prepare('SELECT * FROM tickers WHERE id = ?').bind(existing.id).first()
    return c.json({ success: true, ticker: updated, action: 'enabled' })
  }

  // New ticker — fetch from Yahoo to validate & get metadata
  const profile = await fetchTickerProfile(sym)
  if (!profile) {
    return c.json({ error: `Could not find ${sym} on Yahoo Finance. Check the symbol and try again.` }, 404)
  }

  const id = 'tk-' + sym.toLowerCase()
  await c.env.DB.prepare(`
    INSERT INTO tickers (id, symbol, name, sector, industry, is_mag7, is_watchlist, last_price, price_change_pct, market_cap, forward_pe, added_to_watchlist_at)
    VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, ?, ?, datetime('now'))
  `).bind(
    id, profile.symbol, profile.longName || profile.shortName,
    profile.sector, profile.industry,
    profile.price, profile.changePercent,
    profile.marketCap, profile.forwardPE
  ).run()

  const ticker = await c.env.DB.prepare('SELECT * FROM tickers WHERE id = ?').bind(id).first()
  return c.json({ success: true, ticker, action: 'created' })
})

// Remove ticker from watchlist (soft — just flips the flag)
apiRoutes.post('/watchlist/remove', async (c) => {
  const { symbol } = await c.req.json()
  if (!symbol) return c.json({ error: 'symbol is required' }, 400)
  const sym = symbol.toUpperCase().trim()

  const existing = await c.env.DB.prepare('SELECT * FROM tickers WHERE symbol = ?').bind(sym).first() as any
  if (!existing) return c.json({ error: `${sym} not found` }, 404)
  if (!existing.is_watchlist) return c.json({ error: `${sym} is not on the watchlist` }, 409)

  await c.env.DB.prepare(
    'UPDATE tickers SET is_watchlist = 0, updated_at = datetime(\'now\') WHERE id = ?'
  ).bind(existing.id).run()
  return c.json({ success: true, symbol: sym })
})

// Search Yahoo for a ticker (validate before adding)
apiRoutes.get('/watchlist/lookup/:symbol', async (c) => {
  const sym = c.req.param('symbol').toUpperCase().trim()
  if (!/^[A-Z]{1,5}$/.test(sym)) return c.json({ error: 'Invalid symbol' }, 400)

  // Check if already in DB
  const existing = await c.env.DB.prepare('SELECT * FROM tickers WHERE symbol = ?').bind(sym).first() as any

  const profile = await fetchTickerProfile(sym)
  if (!profile) return c.json({ error: `${sym} not found on Yahoo Finance` }, 404)

  return c.json({
    symbol: profile.symbol,
    name: profile.longName || profile.shortName,
    sector: profile.sector,
    industry: profile.industry,
    price: profile.price,
    changePercent: profile.changePercent,
    marketCap: profile.marketCap,
    forwardPE: profile.forwardPE,
    alreadyInDb: !!existing,
    isWatchlist: existing?.is_watchlist === 1,
  })
})

apiRoutes.get('/tickers', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM tickers ORDER BY symbol ASC').all()
  return c.json({ tickers: results })
})

apiRoutes.get('/tickers/:id', async (c) => {
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

apiRoutes.get('/tickers/:id/scores', async (c) => {
  const id = c.req.param('id')
  const { results } = await c.env.DB.prepare('SELECT * FROM ai_scores WHERE ticker_id = ? ORDER BY scored_at DESC').bind(id).all()
  return c.json({ scores: results })
})

// ============================================================
// MAG 7
// ============================================================
apiRoutes.get('/mag7/scorecard', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT t.*,
      (SELECT composite FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as ai_score,
      (SELECT conviction_level FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as conviction,
      (SELECT signal_type FROM trade_signals WHERE ticker_id = t.id AND is_active = 1 ORDER BY created_at DESC LIMIT 1) as active_signal,
      (SELECT tam_score FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as tam_score,
      (SELECT bias_score FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as bias_score,
      (SELECT superlative_score FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as superlative_score,
      (SELECT disruption_score FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as disruption_score
    FROM tickers t WHERE t.is_mag7 = 1 ORDER BY 
      (SELECT composite FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) DESC
  `).all()
  return c.json({ tickers: results })
})

// ============================================================
// AOMG
// ============================================================
apiRoutes.get('/aomg/themes', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM aomg_themes ORDER BY 
      CASE status WHEN 'active' THEN 1 WHEN 'monitoring' THEN 2 ELSE 3 END,
      ai_score_composite DESC
  `).all()
  return c.json({ themes: results })
})

// ============================================================
// PORTFOLIO / HEAT
// ============================================================
apiRoutes.get('/portfolio/heat', async (c) => {
  const { results: positions } = await c.env.DB.prepare(`
    SELECT pp.*, t.symbol, t.name, t.last_price
    FROM portfolio_positions pp
    JOIN tickers t ON pp.ticker_id = t.id
    WHERE pp.status = 'open'
    ORDER BY pp.heat_contribution DESC
  `).all()

  const config = await c.env.DB.prepare("SELECT * FROM system_config WHERE key IN ('heat_ceiling_pct','stocks_leaps_risk_cap_pct','options_risk_cap_pct','market_mode','portfolio_equity')").all()
  const configMap: Record<string, any> = {}
  for (const row of config.results as any[]) {
    configMap[row.key] = JSON.parse(row.value)
  }

  let stocksLeapsHeat = 0, optionsHeat = 0
  for (const p of positions as any[]) {
    if (p.engine === 'stocks_leaps') stocksLeapsHeat += (p.heat_contribution || 0)
    else optionsHeat += (p.heat_contribution || 0)
  }

  const ceiling = configMap.heat_ceiling_pct || 20
  const totalHeat = stocksLeapsHeat + optionsHeat

  return c.json({
    positions,
    heat: {
      stocksLeapsHeat: Math.round(stocksLeapsHeat * 100) / 100,
      optionsHeat: Math.round(optionsHeat * 100) / 100,
      totalHeat: Math.round(totalHeat * 100) / 100,
      heatCeiling: ceiling,
      stocksLeapsCap: configMap.stocks_leaps_risk_cap_pct || 14,
      optionsCap: configMap.options_risk_cap_pct || 6,
      utilization: Math.round((totalHeat / ceiling) * 10000) / 100,
      marketMode: configMap.market_mode || 'bull',
      portfolioEquity: configMap.portfolio_equity || 100000,
    }
  })
})

apiRoutes.get('/portfolio/positions', async (c) => {
  const status = c.req.query('status') || 'open'
  const { results } = await c.env.DB.prepare(`
    SELECT pp.*, t.symbol, t.name, t.last_price
    FROM portfolio_positions pp
    JOIN tickers t ON pp.ticker_id = t.id
    WHERE pp.status = ?
    ORDER BY pp.created_at DESC
  `).bind(status).all()
  return c.json({ positions: results })
})

// ============================================================
// OBSERVATIONS
// ============================================================
apiRoutes.get('/observations', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM observations ORDER BY created_at DESC LIMIT 50').all()
  return c.json({ observations: results })
})

apiRoutes.post('/observations', async (c) => {
  const body = await c.req.json()
  const id = 'obs-' + Date.now()
  await c.env.DB.prepare(
    'INSERT INTO observations (id, happened_text, why_matters, watch_next, ticker_symbols, kpi, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.happened_text, body.why_matters, body.watch_next, JSON.stringify(body.ticker_symbols || []), body.kpi || null, body.category || null).run()
  return c.json({ id, success: true })
})

// ============================================================
// TRADE JOURNAL
// ============================================================
apiRoutes.get('/journal', async (c) => {
  const { results: openPositions } = await c.env.DB.prepare(`
    SELECT pp.*, t.symbol, t.name FROM portfolio_positions pp
    JOIN tickers t ON pp.ticker_id = t.id
    ORDER BY pp.status ASC, pp.created_at DESC
  `).all()
  
  const { results: signals } = await c.env.DB.prepare(`
    SELECT ts.*, t.symbol, t.name FROM trade_signals ts
    JOIN tickers t ON ts.ticker_id = t.id
    ORDER BY ts.created_at DESC LIMIT 20
  `).all()

  return c.json({ positions: openPositions, signals })
})

// ============================================================
// SYSTEM CONFIG
// ============================================================
apiRoutes.get('/config/:key', async (c) => {
  const key = c.req.param('key')
  const row = await c.env.DB.prepare('SELECT * FROM system_config WHERE key = ?').bind(key).first()
  if (!row) return c.json({ error: 'Config not found' }, 404)
  return c.json({ key: row.key, value: JSON.parse(row.value as string) })
})

// ============================================================
// MARKET DATA — Yahoo Finance Live Prices
// ============================================================
apiRoutes.post('/market/refresh', async (c) => {
  try {
    const result = await refreshPrices(c.env.DB)
    return c.json({
      success: true,
      updated: result.updated,
      failed: result.failed,
      quotes: result.quotes.map(q => ({
        symbol: q.symbol,
        price: q.price,
        changePercent: q.changePercent,
        marketState: q.marketState,
      })),
      refreshedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Price refresh failed:', error)
    return c.json({ error: error.message || 'Price refresh failed' }, 500)
  }
})

apiRoutes.get('/market/quote/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase()
  const quote = await fetchQuote(symbol)
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  return c.json(quote)
})

// ============================================================
// STATS
// ============================================================
apiRoutes.get('/stats', async (c) => {
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
