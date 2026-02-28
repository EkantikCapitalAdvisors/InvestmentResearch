import { Hono } from 'hono'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const journalApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// TRADE JOURNAL
// ============================================================
journalApi.get('/', async (c) => {
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
journalApi.post('/positions', async (c) => {
  const body = await c.req.json()
  const { symbol, engine, entry_price, entry_date, size_pct, stop_price, target_price, thesis, episodic_pivot } = body
  if (!symbol || !engine || !entry_price || !entry_date || !size_pct) {
    return c.json({ error: 'symbol, engine, entry_price, entry_date, size_pct are required' }, 400)
  }
  const sym = symbol.toUpperCase().trim()
  const ticker = await c.env.DB.prepare('SELECT id FROM tickers WHERE symbol = ?').bind(sym).first() as any
  if (!ticker) return c.json({ error: `Ticker ${sym} not found. Add it to watchlist first.` }, 404)

  const id = `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const stopDist = stop_price ? Math.abs(((entry_price - stop_price) / entry_price) * 100) : null
  const heat = stop_price ? (size_pct * (stopDist! / 100)) : (size_pct * 0.05)
  const pivotJson = episodic_pivot ? JSON.stringify(episodic_pivot) : null

  await c.env.DB.prepare(`
    INSERT INTO portfolio_positions (id, ticker_id, engine, entry_price, entry_date, current_price, size_pct, stop_price, stop_distance_pct, heat_contribution, target_price, pnl_pct, pnl_usd, thesis, episodic_pivot_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 'open')
  `).bind(id, ticker.id, engine, entry_price, entry_date, entry_price, size_pct, stop_price || null, stopDist, heat, target_price || null, thesis || null, pivotJson).run()

  const position = await c.env.DB.prepare('SELECT pp.*, t.symbol, t.name FROM portfolio_positions pp JOIN tickers t ON pp.ticker_id = t.id WHERE pp.id = ?').bind(id).first()
  return c.json({ success: true, position })
})

// ── Update Position ──────────────────────────────────────────
journalApi.put('/positions/:id', async (c) => {
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
journalApi.post('/positions/:id/close', async (c) => {
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
journalApi.delete('/positions/:id', async (c) => {
  const id = c.req.param('id')
  const existing = await c.env.DB.prepare('SELECT id FROM portfolio_positions WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'Position not found' }, 404)
  await c.env.DB.prepare('DELETE FROM portfolio_positions WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ── Create Signal ────────────────────────────────────────────
journalApi.post('/signals', async (c) => {
  const body = await c.req.json()
  const { symbol, signal_type, engine, confidence, entry_price, stop_price, target_price, thesis, time_horizon, position_size_pct, invalidation_criteria, episodic_pivot } = body
  if (!symbol || !signal_type || !engine) {
    return c.json({ error: 'symbol, signal_type, engine are required' }, 400)
  }
  const sym = symbol.toUpperCase().trim()
  const ticker = await c.env.DB.prepare('SELECT id FROM tickers WHERE symbol = ?').bind(sym).first() as any
  if (!ticker) return c.json({ error: `Ticker ${sym} not found. Add it to watchlist first.` }, 404)

  const id = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const rr = entry_price && stop_price && target_price && (entry_price - stop_price) !== 0
    ? Math.abs((target_price - entry_price) / (entry_price - stop_price)) : null
  const pivotJson = episodic_pivot ? JSON.stringify(episodic_pivot) : null

  await c.env.DB.prepare(`
    INSERT INTO trade_signals (id, ticker_id, signal_type, engine, confidence, entry_price, stop_price, target_price, risk_reward_ratio, position_size_pct, thesis, invalidation_criteria, time_horizon, episodic_pivot_json, is_active, activated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
  `).bind(id, ticker.id, signal_type, engine, confidence || null, entry_price || null, stop_price || null, target_price || null, rr, position_size_pct || null, thesis || null, invalidation_criteria || null, time_horizon || null, pivotJson).run()

  const signal = await c.env.DB.prepare('SELECT ts.*, t.symbol, t.name FROM trade_signals ts JOIN tickers t ON ts.ticker_id = t.id WHERE ts.id = ?').bind(id).first()
  return c.json({ success: true, signal })
})

// ── Update Signal ────────────────────────────────────────────
journalApi.put('/signals/:id', async (c) => {
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
journalApi.post('/signals/:id/deactivate', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare("UPDATE trade_signals SET is_active = 0, invalidated_at = datetime('now') WHERE id = ?").bind(id).run()
  return c.json({ success: true })
})

// ── Delete Signal ────────────────────────────────────────────
journalApi.delete('/signals/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM trade_signals WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

export { journalApi }
