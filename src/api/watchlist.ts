import { Hono } from 'hono'
import { processPortalResearch } from '../slack/handlers'
import { fetchTickerProfile } from '../market/yahoo'
import { TICKER_AGENTS, HYBRID_AGENTS } from './research'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const watchlistApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// TICKERS & WATCHLIST
// ============================================================
watchlistApi.get('/', async (c) => {
  // Get watchlist tickers with basic info
  const { results: tickers } = await c.env.DB.prepare(`
    SELECT t.id, t.symbol, t.name, t.last_price, t.price_change_pct, t.is_mag7,
           t.pivot_watch, t.pivot_watch_type, t.pivot_watch_notes
    FROM tickers t WHERE t.is_watchlist = 1 ORDER BY t.symbol ASC
  `).all() as any

  // For each ticker, fetch latest report blob for pivot, bias, and material agents
  const enriched = await Promise.all(tickers.map(async (t: any) => {
    const sym = t.symbol
    const likePattern = `%${sym}%`

    // Latest episodic_pivot report
    const pivotReport = await c.env.DB.prepare(`
      SELECT id, created_at, impact_score, conviction_level, ai_composite_score,
             structured_json, raw_markdown
      FROM research_reports
      WHERE agent_type = 'episodic_pivot' AND ticker_symbols LIKE ?
      ORDER BY created_at DESC LIMIT 1
    `).bind(likePattern).first() as any

    // Latest bias_mode report
    const biasReport = await c.env.DB.prepare(`
      SELECT id, created_at, impact_score, conviction_level, ai_composite_score,
             structured_json, raw_markdown
      FROM research_reports
      WHERE agent_type = 'bias_mode' AND ticker_symbols LIKE ?
      ORDER BY created_at DESC LIMIT 1
    `).bind(likePattern).first() as any

    // Latest material_events report
    const materialReport = await c.env.DB.prepare(`
      SELECT id, created_at, impact_score, conviction_level, ai_composite_score,
             structured_json, raw_markdown
      FROM research_reports
      WHERE agent_type = 'material_events' AND ticker_symbols LIKE ?
      ORDER BY created_at DESC LIMIT 1
    `).bind(likePattern).first() as any

    // Uploaded report file count
    const fileCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM uploaded_reports WHERE ticker_symbol = ?'
    ).bind(sym).first() as any

    return {
      ...t,
      uploaded_file_count: fileCount?.cnt || 0,
      pivot_report: pivotReport ? {
        id: pivotReport.id,
        created_at: pivotReport.created_at,
        impact: pivotReport.impact_score,
        conviction: pivotReport.conviction_level,
        score: pivotReport.ai_composite_score,
        json: pivotReport.structured_json,
        markdown: pivotReport.raw_markdown,
      } : null,
      bias_report: biasReport ? {
        id: biasReport.id,
        created_at: biasReport.created_at,
        impact: biasReport.impact_score,
        conviction: biasReport.conviction_level,
        score: biasReport.ai_composite_score,
        json: biasReport.structured_json,
        markdown: biasReport.raw_markdown,
      } : null,
      material_report: materialReport ? {
        id: materialReport.id,
        created_at: materialReport.created_at,
        impact: materialReport.impact_score,
        conviction: materialReport.conviction_level,
        score: materialReport.ai_composite_score,
        json: materialReport.structured_json,
        markdown: materialReport.raw_markdown,
      } : null,
    }
  }))

  return c.json({ tickers: enriched })
})

// ── Toggle pivot watch on a ticker ──────────────────────────
watchlistApi.post('/pivot-watch', async (c) => {
  const body = await c.req.json()
  const { symbol, pivot_watch, pivot_watch_notes, pivot_watch_type } = body
  if (!symbol) return c.json({ error: 'symbol is required' }, 400)
  const sym = symbol.toUpperCase().trim()

  const existing = await c.env.DB.prepare('SELECT * FROM tickers WHERE symbol = ?').bind(sym).first() as any
  if (!existing) return c.json({ error: `${sym} not found` }, 404)

  await c.env.DB.prepare(
    "UPDATE tickers SET pivot_watch = ?, pivot_watch_notes = ?, pivot_watch_type = ?, pivot_watch_updated_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
  ).bind(
    pivot_watch ? 1 : 0,
    pivot_watch_notes || null,
    pivot_watch_type || null,
    existing.id
  ).run()

  const updated = await c.env.DB.prepare('SELECT * FROM tickers WHERE id = ?').bind(existing.id).first()
  return c.json({ success: true, ticker: updated })
})

// ── Watchlist Management ─────────────────────────────────────

// Add ticker to watchlist (creates if not exists, fetches Yahoo data)
watchlistApi.post('/add', async (c) => {
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
watchlistApi.post('/remove', async (c) => {
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

// Bulk import tickers to watchlist (accepts array of symbols or comma/newline-separated string)
watchlistApi.post('/bulk-import', async (c) => {
  const body = await c.req.json()
  let symbols: string[] = []

  if (Array.isArray(body.symbols)) {
    symbols = body.symbols
  } else if (typeof body.symbols === 'string') {
    // Accept comma, newline, space, tab, semicolon separated
    symbols = body.symbols.split(/[,\n\r\t;|\s]+/).filter(Boolean)
  } else {
    return c.json({ error: 'symbols is required (array or comma-separated string)' }, 400)
  }

  // Clean & validate symbols
  symbols = [...new Set(symbols.map(s => s.toUpperCase().replace(/[^A-Z]/g, '')).filter(s => s.length >= 1 && s.length <= 5))]

  if (symbols.length === 0) {
    return c.json({ error: 'No valid ticker symbols provided' }, 400)
  }
  if (symbols.length > 100) {
    return c.json({ error: 'Maximum 100 symbols per import' }, 400)
  }

  const results: { symbol: string; status: 'added' | 'exists' | 'failed'; error?: string }[] = []

  for (const sym of symbols) {
    try {
      // Check if ticker already exists
      const existing = await c.env.DB.prepare('SELECT * FROM tickers WHERE symbol = ?').bind(sym).first() as any

      if (existing) {
        if (existing.is_watchlist) {
          results.push({ symbol: sym, status: 'exists' })
          continue
        }
        // Enable watchlist flag
        await c.env.DB.prepare(
          'UPDATE tickers SET is_watchlist = 1, added_to_watchlist_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?'
        ).bind(existing.id).run()
        results.push({ symbol: sym, status: 'added' })
        continue
      }

      // New ticker — fetch from Yahoo
      const profile = await fetchTickerProfile(sym)
      if (!profile) {
        results.push({ symbol: sym, status: 'failed', error: 'Not found on Yahoo Finance' })
        continue
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
      results.push({ symbol: sym, status: 'added' })
    } catch (e: any) {
      results.push({ symbol: sym, status: 'failed', error: e.message || 'Unknown error' })
    }
  }

  const added = results.filter(r => r.status === 'added').length
  const existed = results.filter(r => r.status === 'exists').length
  const failed = results.filter(r => r.status === 'failed').length

  return c.json({
    success: true,
    summary: { total: symbols.length, added, already_on_watchlist: existed, failed },
    results
  })
})

// ── Bulk-run a research agent across a single watchlist ticker ──
// Client-side will call this per-ticker sequentially to show progress
// Accepts all ticker-specific agents + hybrid agents (which can run per-ticker)
watchlistApi.post('/run-agent', async (c) => {
  const body = await c.req.json()
  const { agentType, symbol } = body

  const validWatchlistAgents = [...TICKER_AGENTS, ...HYBRID_AGENTS]
  if (!agentType || !validWatchlistAgents.includes(agentType)) {
    return c.json({ error: `agentType must be one of: ${validWatchlistAgents.join(', ')}` }, 400)
  }
  if (!symbol) return c.json({ error: 'symbol is required' }, 400)

  const sym = symbol.toUpperCase().trim()
  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
  }

  try {
    const reportId = await processPortalResearch(
      c.env.ANTHROPIC_API_KEY,
      c.env.DB,
      agentType,
      [sym],
    )
    const report = await c.env.DB.prepare('SELECT id, created_at, impact_score, conviction_level, ai_composite_score, structured_json, raw_markdown FROM research_reports WHERE id = ?').bind(reportId).first() as any
    return c.json({ success: true, reportId, report })
  } catch (e: any) {
    return c.json({ error: e.message || 'Research failed' }, 500)
  }
})

// Search Yahoo for a ticker (validate before adding)
watchlistApi.get('/lookup/:symbol', async (c) => {
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

// ============================================================
// UPLOADED REPORTS — File attachments per watchlist ticker
// ============================================================

// List uploaded reports for a ticker (metadata only, no content)
watchlistApi.get('/:symbol/files', async (c) => {
  const sym = c.req.param('symbol').toUpperCase().trim()
  const { results } = await c.env.DB.prepare(`
    SELECT id, ticker_symbol, file_name, file_type, file_size, notes, uploaded_by, created_at
    FROM uploaded_reports WHERE ticker_symbol = ? ORDER BY created_at DESC
  `).bind(sym).all() as any
  return c.json({ files: results || [] })
})

// Upload a file for a ticker (multipart/form-data)
watchlistApi.post('/:symbol/files', async (c) => {
  const sym = c.req.param('symbol').toUpperCase().trim()
  if (!/^[A-Z]{1,5}$/.test(sym)) return c.json({ error: 'Invalid symbol' }, 400)

  // Verify ticker is on watchlist
  const ticker = await c.env.DB.prepare('SELECT id FROM tickers WHERE symbol = ? AND is_watchlist = 1').bind(sym).first()
  if (!ticker) return c.json({ error: `${sym} is not on the watchlist` }, 404)

  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    const notes = (formData.get('notes') as string) || ''

    if (!file) return c.json({ error: 'No file uploaded' }, 400)

    // Validate file type
    const allowedTypes = [
      'text/plain', 'text/markdown', 'text/csv',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    const allowedExts = ['.md', '.txt', '.csv', '.pdf', '.doc', '.docx', '.xls', '.xlsx']
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      return c.json({ error: `File type not allowed. Supported: ${allowedExts.join(', ')}` }, 400)
    }

    // Max 5 MB
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) return c.json({ error: 'File too large (max 5 MB)' }, 400)

    // Read file as ArrayBuffer and encode to base64
    const buf = await file.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const b64 = btoa(binary)

    const result = await c.env.DB.prepare(`
      INSERT INTO uploaded_reports (ticker_symbol, file_name, file_type, file_size, content_b64, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(sym, file.name, file.type || 'application/octet-stream', file.size, b64, notes).run()

    return c.json({
      success: true,
      file: {
        id: result.meta.last_row_id,
        ticker_symbol: sym,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        notes,
      }
    })
  } catch (e: any) {
    return c.json({ error: e.message || 'Upload failed' }, 500)
  }
})

// Download a file (returns the original binary)
watchlistApi.get('/files/:id/download', async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare(
    'SELECT file_name, file_type, content_b64 FROM uploaded_reports WHERE id = ?'
  ).bind(id).first() as any
  if (!row) return c.json({ error: 'File not found' }, 404)

  // Decode base64 back to binary
  const binary = atob(row.content_b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new Response(bytes.buffer, {
    headers: {
      'Content-Type': row.file_type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${row.file_name}"`,
    }
  })
})

// Preview a text-based file (returns rendered content for md/txt/csv)
watchlistApi.get('/files/:id/preview', async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare(
    'SELECT file_name, file_type, content_b64 FROM uploaded_reports WHERE id = ?'
  ).bind(id).first() as any
  if (!row) return c.json({ error: 'File not found' }, 404)

  const isText = row.file_type?.startsWith('text/') ||
    row.file_name.endsWith('.md') || row.file_name.endsWith('.txt') || row.file_name.endsWith('.csv')

  if (!isText) {
    return c.json({ preview: null, file_name: row.file_name, file_type: row.file_type, message: 'Binary file — download to view' })
  }

  // Decode base64 to text
  const binary = atob(row.content_b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const text = new TextDecoder().decode(bytes)

  return c.json({ preview: text, file_name: row.file_name, file_type: row.file_type })
})

// Delete a file
watchlistApi.delete('/files/:id', async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT id, file_name FROM uploaded_reports WHERE id = ?').bind(id).first()
  if (!row) return c.json({ error: 'File not found' }, 404)

  await c.env.DB.prepare('DELETE FROM uploaded_reports WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

export { watchlistApi }
