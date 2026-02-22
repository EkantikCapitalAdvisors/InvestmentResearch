import { Hono } from 'hono'
import { processPortalResearch } from './slack/handlers'
import { postReportToSlack, postDailyDigestToSlack, listSlackChannels } from './slack/notify'
import { refreshPrices, fetchQuote, fetchTickerProfile } from './market/yahoo'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string }

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// RESEARCH ENGINE — Async trigger for Slack (fire & forget from Slack handler)
// ============================================================
apiRoutes.post('/research/slack-run', async (c) => {
  const body = await c.req.json()
  const { agentType, tickers, responseUrl, channelId, userName, rawText } = body

  if (!c.env.ANTHROPIC_API_KEY) {
    // Post error to Slack response_url
    if (responseUrl) {
      await fetch(responseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_type: 'ephemeral', text: ':x: ANTHROPIC_API_KEY not configured.' })
      })
    }
    return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
  }

  try {
    const { callClaude, persistReport } = await import('./research/engine')
    const { buildBlockKitResponse, buildErrorResponse } = await import('./slack/blocks')

    console.log(`[SlackRun] Starting ${agentType} for ${tickers.join(',')}`)
    const result = await callClaude(c.env.ANTHROPIC_API_KEY, agentType, tickers, rawText)
    console.log(`[SlackRun] Claude returned in ${result.processingTimeMs}ms`)

    const reportId = await persistReport(c.env.DB, agentType, tickers, 'slack', result, channelId)
    console.log(`[SlackRun] Report persisted: ${reportId}`)

    const blocks = buildBlockKitResponse(agentType, tickers, result.structured, result.rawMarkdown, reportId, result.costEstimate, result.processingTimeMs)

    if (responseUrl) {
      const slackResp = await fetch(responseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_type: 'in_channel', replace_original: true, ...blocks })
      })
      console.log(`[SlackRun] Posted to Slack: ${slackResp.status}`)
    }

    return c.json({ success: true, reportId })
  } catch (error: any) {
    console.error(`[SlackRun] Error: ${error.message}`)
    if (responseUrl) {
      const { buildErrorResponse } = await import('./slack/blocks')
      await fetch(responseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildErrorResponse(agentType, tickers, error.message))
      })
    }
    return c.json({ error: error.message }, 500)
  }
})

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

    // ── Auto-post to Slack if configured ──
    let slackPosted = false
    if (c.env.SLACK_BOT_TOKEN && report) {
      try {
        // Check if auto-post is enabled in system_config
        const channelConfig = await c.env.DB.prepare(
          "SELECT value FROM system_config WHERE key = 'slack_channel_id'"
        ).first() as any
        const autoPostConfig = await c.env.DB.prepare(
          "SELECT value FROM system_config WHERE key = 'slack_auto_post'"
        ).first() as any

        const channelId = channelConfig?.value ? JSON.parse(channelConfig.value) : null
        const autoPostEnabled = autoPostConfig?.value ? JSON.parse(autoPostConfig.value) : false

        if (channelId && autoPostEnabled) {
          const portalUrl = 'https://research.ekantikcapital.com'
          const result = await postReportToSlack(c.env.SLACK_BOT_TOKEN, channelId, report, portalUrl)
          slackPosted = result.ok
          if (result.ok && result.ts) {
            // Update report with Slack message reference
            await c.env.DB.prepare(
              'UPDATE research_reports SET slack_channel_id = ?, slack_message_ts = ? WHERE id = ?'
            ).bind(channelId, result.ts, reportId).run()
          }
          console.log(`[Portal] Auto-posted to Slack: ${result.ok ? 'success' : result.error}`)
        }
      } catch (e: any) {
        console.error('[Portal] Auto-post to Slack failed:', e.message)
      }
    }

    return c.json({ success: true, reportId, report, slackPosted })
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

// ── Create Position ──────────────────────────────────────────
apiRoutes.post('/journal/positions', async (c) => {
  const body = await c.req.json()
  const { symbol, engine, entry_price, entry_date, size_pct, stop_price, target_price, thesis } = body
  if (!symbol || !engine || !entry_price || !entry_date || !size_pct) {
    return c.json({ error: 'symbol, engine, entry_price, entry_date, size_pct are required' }, 400)
  }
  const sym = symbol.toUpperCase().trim()
  const ticker = await c.env.DB.prepare('SELECT id FROM tickers WHERE symbol = ?').bind(sym).first() as any
  if (!ticker) return c.json({ error: `Ticker ${sym} not found. Add it to watchlist first.` }, 404)

  const id = `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const stopDist = stop_price ? Math.abs(((entry_price - stop_price) / entry_price) * 100) : null
  const heat = stop_price ? (size_pct * (stopDist! / 100)) : (size_pct * 0.05)

  await c.env.DB.prepare(`
    INSERT INTO portfolio_positions (id, ticker_id, engine, entry_price, entry_date, current_price, size_pct, stop_price, stop_distance_pct, heat_contribution, target_price, pnl_pct, pnl_usd, thesis, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'open')
  `).bind(id, ticker.id, engine, entry_price, entry_date, entry_price, size_pct, stop_price || null, stopDist, heat, target_price || null, thesis || null).run()

  const position = await c.env.DB.prepare('SELECT pp.*, t.symbol, t.name FROM portfolio_positions pp JOIN tickers t ON pp.ticker_id = t.id WHERE pp.id = ?').bind(id).first()
  return c.json({ success: true, position })
})

// ── Update Position ──────────────────────────────────────────
apiRoutes.put('/journal/positions/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT * FROM portfolio_positions WHERE id = ?').bind(id).first() as any
  if (!existing) return c.json({ error: 'Position not found' }, 404)

  const engine = body.engine ?? existing.engine
  const entry_price = body.entry_price ?? existing.entry_price
  const entry_date = body.entry_date ?? existing.entry_date
  const size_pct = body.size_pct ?? existing.size_pct
  const stop_price = body.stop_price !== undefined ? body.stop_price : existing.stop_price
  const target_price = body.target_price !== undefined ? body.target_price : existing.target_price
  const thesis = body.thesis !== undefined ? body.thesis : existing.thesis
  const current_price = body.current_price ?? existing.current_price

  const stopDist = stop_price ? Math.abs(((entry_price - stop_price) / entry_price) * 100) : null
  const heat = stop_price ? (size_pct * (stopDist! / 100)) : (size_pct * 0.05)
  const pnl_pct = current_price ? ((current_price - entry_price) / entry_price) * 100 : 0
  const rMult = stop_price && (entry_price - stop_price) !== 0 ? (current_price - entry_price) / Math.abs(entry_price - stop_price) : 0

  await c.env.DB.prepare(`
    UPDATE portfolio_positions SET engine=?, entry_price=?, entry_date=?, current_price=?, size_pct=?, stop_price=?, stop_distance_pct=?, heat_contribution=?, target_price=?, pnl_pct=?, r_multiple=?, thesis=?, updated_at=datetime('now') WHERE id=?
  `).bind(engine, entry_price, entry_date, current_price, size_pct, stop_price, stopDist, heat, target_price, pnl_pct, rMult, thesis, id).run()

  const position = await c.env.DB.prepare('SELECT pp.*, t.symbol, t.name FROM portfolio_positions pp JOIN tickers t ON pp.ticker_id = t.id WHERE pp.id = ?').bind(id).first()
  return c.json({ success: true, position })
})

// ── Close Position ───────────────────────────────────────────
apiRoutes.post('/journal/positions/:id/close', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { exit_price, exit_reason } = body
  if (!exit_price) return c.json({ error: 'exit_price is required' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM portfolio_positions WHERE id = ?').bind(id).first() as any
  if (!existing) return c.json({ error: 'Position not found' }, 404)
  if (existing.status !== 'open') return c.json({ error: 'Position is already closed' }, 409)

  const pnl_pct = ((exit_price - existing.entry_price) / existing.entry_price) * 100
  const status = exit_reason === 'stopped_out' ? 'stopped_out' : 'closed'

  await c.env.DB.prepare(`
    UPDATE portfolio_positions SET status=?, exit_price=?, exit_date=datetime('now'), exit_reason=?, pnl_pct=?, current_price=?, heat_contribution=0, updated_at=datetime('now') WHERE id=?
  `).bind(status, exit_price, exit_reason || 'manual_close', pnl_pct, exit_price, id).run()

  const position = await c.env.DB.prepare('SELECT pp.*, t.symbol, t.name FROM portfolio_positions pp JOIN tickers t ON pp.ticker_id = t.id WHERE pp.id = ?').bind(id).first()
  return c.json({ success: true, position })
})

// ── Delete Position ──────────────────────────────────────────
apiRoutes.delete('/journal/positions/:id', async (c) => {
  const id = c.req.param('id')
  const existing = await c.env.DB.prepare('SELECT id FROM portfolio_positions WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'Position not found' }, 404)
  await c.env.DB.prepare('DELETE FROM portfolio_positions WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ── Create Signal ────────────────────────────────────────────
apiRoutes.post('/journal/signals', async (c) => {
  const body = await c.req.json()
  const { symbol, signal_type, engine, confidence, entry_price, stop_price, target_price, thesis, time_horizon, position_size_pct, invalidation_criteria } = body
  if (!symbol || !signal_type || !engine) {
    return c.json({ error: 'symbol, signal_type, engine are required' }, 400)
  }
  const sym = symbol.toUpperCase().trim()
  const ticker = await c.env.DB.prepare('SELECT id FROM tickers WHERE symbol = ?').bind(sym).first() as any
  if (!ticker) return c.json({ error: `Ticker ${sym} not found. Add it to watchlist first.` }, 404)

  const id = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const rr = entry_price && stop_price && target_price && (entry_price - stop_price) !== 0
    ? Math.abs((target_price - entry_price) / (entry_price - stop_price)) : null

  await c.env.DB.prepare(`
    INSERT INTO trade_signals (id, ticker_id, signal_type, engine, confidence, entry_price, stop_price, target_price, risk_reward_ratio, position_size_pct, thesis, invalidation_criteria, time_horizon, is_active, activated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
  `).bind(id, ticker.id, signal_type, engine, confidence || null, entry_price || null, stop_price || null, target_price || null, rr, position_size_pct || null, thesis || null, invalidation_criteria || null, time_horizon || null).run()

  const signal = await c.env.DB.prepare('SELECT ts.*, t.symbol, t.name FROM trade_signals ts JOIN tickers t ON ts.ticker_id = t.id WHERE ts.id = ?').bind(id).first()
  return c.json({ success: true, signal })
})

// ── Update Signal ────────────────────────────────────────────
apiRoutes.put('/journal/signals/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT * FROM trade_signals WHERE id = ?').bind(id).first() as any
  if (!existing) return c.json({ error: 'Signal not found' }, 404)

  const signal_type = body.signal_type ?? existing.signal_type
  const engine = body.engine ?? existing.engine
  const confidence = body.confidence !== undefined ? body.confidence : existing.confidence
  const entry_price = body.entry_price !== undefined ? body.entry_price : existing.entry_price
  const stop_price = body.stop_price !== undefined ? body.stop_price : existing.stop_price
  const target_price = body.target_price !== undefined ? body.target_price : existing.target_price
  const thesis = body.thesis !== undefined ? body.thesis : existing.thesis
  const time_horizon = body.time_horizon !== undefined ? body.time_horizon : existing.time_horizon
  const position_size_pct = body.position_size_pct !== undefined ? body.position_size_pct : existing.position_size_pct
  const invalidation_criteria = body.invalidation_criteria !== undefined ? body.invalidation_criteria : existing.invalidation_criteria
  const is_active = body.is_active !== undefined ? body.is_active : existing.is_active

  const rr = entry_price && stop_price && target_price && (entry_price - stop_price) !== 0
    ? Math.abs((target_price - entry_price) / (entry_price - stop_price)) : null

  await c.env.DB.prepare(`
    UPDATE trade_signals SET signal_type=?, engine=?, confidence=?, entry_price=?, stop_price=?, target_price=?, risk_reward_ratio=?, position_size_pct=?, thesis=?, invalidation_criteria=?, time_horizon=?, is_active=? WHERE id=?
  `).bind(signal_type, engine, confidence, entry_price, stop_price, target_price, rr, position_size_pct, thesis, invalidation_criteria, time_horizon, is_active, id).run()

  const signal = await c.env.DB.prepare('SELECT ts.*, t.symbol, t.name FROM trade_signals ts JOIN tickers t ON ts.ticker_id = t.id WHERE ts.id = ?').bind(id).first()
  return c.json({ success: true, signal })
})

// ── Deactivate Signal ────────────────────────────────────────
apiRoutes.post('/journal/signals/:id/deactivate', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare("UPDATE trade_signals SET is_active = 0, invalidated_at = datetime('now') WHERE id = ?").bind(id).run()
  return c.json({ success: true })
})

// ── Delete Signal ────────────────────────────────────────────
apiRoutes.delete('/journal/signals/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM trade_signals WHERE id = ?').bind(id).run()
  return c.json({ success: true })
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
// SLACK INTEGRATION — Portal → Slack
// ============================================================

// Share a specific report to Slack
apiRoutes.post('/slack/share', async (c) => {
  const { reportId, channelId } = await c.req.json()
  if (!reportId) return c.json({ error: 'reportId is required' }, 400)
  if (!c.env.SLACK_BOT_TOKEN) return c.json({ error: 'SLACK_BOT_TOKEN not configured. Set it in Cloudflare Pages secrets.' }, 500)

  // Determine target channel: explicit param > system_config > error
  let targetChannel = channelId
  if (!targetChannel) {
    const config = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_channel_id'").first() as any
    targetChannel = config?.value ? JSON.parse(config.value) : null
  }
  if (!targetChannel) return c.json({ error: 'No Slack channel configured. Set one in Settings or pass channelId.' }, 400)

  const report = await c.env.DB.prepare('SELECT * FROM research_reports WHERE id = ?').bind(reportId).first()
  if (!report) return c.json({ error: 'Report not found' }, 404)

  const portalUrl = 'https://research.ekantikcapital.com'
  const result = await postReportToSlack(c.env.SLACK_BOT_TOKEN, targetChannel, report, portalUrl)

  if (result.ok && result.ts) {
    await c.env.DB.prepare(
      'UPDATE research_reports SET slack_channel_id = ?, slack_message_ts = ? WHERE id = ?'
    ).bind(targetChannel, result.ts, reportId).run()
  }

  return c.json({ success: result.ok, error: result.error, channelId: targetChannel })
})

// List available Slack channels
apiRoutes.get('/slack/channels', async (c) => {
  if (!c.env.SLACK_BOT_TOKEN) return c.json({ error: 'SLACK_BOT_TOKEN not configured' }, 500)
  const result = await listSlackChannels(c.env.SLACK_BOT_TOKEN)
  return c.json(result)
})

// Get / set Slack configuration
apiRoutes.get('/slack/config', async (c) => {
  const channelRow = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_channel_id'").first() as any
  const autoPostRow = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_auto_post'").first() as any
  const channelNameRow = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_channel_name'").first() as any

  return c.json({
    channelId: channelRow?.value ? JSON.parse(channelRow.value) : null,
    channelName: channelNameRow?.value ? JSON.parse(channelNameRow.value) : null,
    autoPost: autoPostRow?.value ? JSON.parse(autoPostRow.value) : false,
    botConfigured: !!c.env.SLACK_BOT_TOKEN,
  })
})

apiRoutes.post('/slack/config', async (c) => {
  const { channelId, channelName, autoPost } = await c.req.json()

  if (channelId !== undefined) {
    await c.env.DB.prepare(
      "INSERT INTO system_config (key, value) VALUES ('slack_channel_id', ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
    ).bind(JSON.stringify(channelId), JSON.stringify(channelId)).run()
  }
  if (channelName !== undefined) {
    await c.env.DB.prepare(
      "INSERT INTO system_config (key, value) VALUES ('slack_channel_name', ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
    ).bind(JSON.stringify(channelName), JSON.stringify(channelName)).run()
  }
  if (autoPost !== undefined) {
    await c.env.DB.prepare(
      "INSERT INTO system_config (key, value) VALUES ('slack_auto_post', ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
    ).bind(JSON.stringify(autoPost), JSON.stringify(autoPost)).run()
  }

  return c.json({ success: true })
})

// Daily digest endpoint — generates and posts a summary to Slack
apiRoutes.post('/slack/digest', async (c) => {
  if (!c.env.SLACK_BOT_TOKEN) return c.json({ error: 'SLACK_BOT_TOKEN not configured' }, 500)

  const config = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_channel_id'").first() as any
  const channelId = config?.value ? JSON.parse(config.value) : null
  if (!channelId) return c.json({ error: 'No Slack channel configured for digest.' }, 400)

  const today = new Date().toISOString().split('T')[0]

  // Gather reports from last 24 hours
  const { results: recentReports } = await c.env.DB.prepare(
    "SELECT * FROM research_reports WHERE created_at >= datetime('now', '-24 hours') ORDER BY created_at DESC"
  ).all()

  // Calculate total cost
  const totalCost = (recentReports as any[]).reduce((sum, r) => sum + (r.cost_estimate || 0), 0)
  const highImpactCount = (recentReports as any[]).filter(r => r.impact_score === 'H').length

  // Get open positions for P&L summary
  const { results: positions } = await c.env.DB.prepare(`
    SELECT pp.*, t.symbol FROM portfolio_positions pp
    JOIN tickers t ON pp.ticker_id = t.id WHERE pp.status = 'open'
    ORDER BY pp.heat_contribution DESC
  `).all()

  // Get active signals count
  const sigCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM trade_signals WHERE is_active = 1").first() as any

  // Get heat utilization
  const heatConfig = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'heat_ceiling_pct'").first() as any
  const ceiling = heatConfig?.value ? JSON.parse(heatConfig.value) : 20
  let totalHeat = 0
  for (const p of positions as any[]) {
    totalHeat += (p.heat_contribution || 0)
  }
  const utilization = (totalHeat / ceiling) * 100

  const result = await postDailyDigestToSlack(
    c.env.SLACK_BOT_TOKEN,
    channelId,
    {
      date: today,
      totalReports: recentReports.length,
      totalCost,
      highImpactCount,
      topReports: recentReports.slice(0, 5),
      openPositions: positions as any[],
      activeSignals: (sigCount as any)?.count || 0,
      heatUtilization: utilization,
    },
    'https://research.ekantikcapital.com'
  )

  return c.json({ success: result.ok, error: result.error, date: today, reportCount: recentReports.length })
})

// ============================================================
// DIAGNOSTICS — Test Claude API connectivity & executionCtx
// ============================================================
apiRoutes.get('/diag/claude', async (c) => {
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
