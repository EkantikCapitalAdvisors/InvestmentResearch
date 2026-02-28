import { Hono } from 'hono'
import { parseFrontmatter, validateIntelligenceEntry, slugify, autoSummary } from '../../lib/yaml-parser'

type Bindings = { DB: D1Database; RESEARCH_PASSCODE?: string }

export const adminContentApi = new Hono<{ Bindings: Bindings }>()

// ── GET / — List content entries (admin) ──
adminContentApi.get('/', async (c) => {
  const db = c.env.DB
  const status = c.req.query('status') || ''
  const category = c.req.query('category') || ''
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')

  let where = 'WHERE 1=1'
  const params: any[] = []
  if (status) { where += ' AND status = ?'; params.push(status) }
  if (category) { where += ' AND category = ?'; params.push(category) }

  const entries = await db.prepare(
    `SELECT * FROM intelligence_entries ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all()

  const countResult = await db.prepare(
    `SELECT COUNT(*) as total FROM intelligence_entries ${where}`
  ).bind(...params).first<{ total: number }>()

  return c.json({ entries: entries.results, total: countResult?.total || 0 })
})

// ── POST / — Create draft entry ──
adminContentApi.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const db = c.env.DB
    const id = crypto.randomUUID()
    const slug = slugify(body.title || 'untitled') + '-' + id.substring(0, 8)
    const summary = body.summary || autoSummary(body.body_markdown || '')

    await db.prepare(`
      INSERT INTO intelligence_entries (id, title, slug, category, framework_source, body_markdown, summary,
        ticker_symbols, tags, impact_score, conviction_level, earnings_impact_estimate,
        catalyst_description, catalyst_date, portfolio_implication, sources, status, ingestion_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)
    `).bind(
      id, body.title, slug, body.category, body.framework_source || null,
      body.body_markdown || '', summary,
      JSON.stringify(body.ticker_symbols || []), JSON.stringify(body.tags || []),
      body.impact_score || null, body.conviction_level || null,
      body.earnings_impact_estimate || null, body.catalyst_description || null,
      body.catalyst_date || null, body.portfolio_implication || null,
      JSON.stringify(body.sources || []), body.ingestion_source || 'manual'
    ).run()

    return c.json({ success: true, id, slug })
  } catch (e: any) {
    return c.json({ error: 'Failed to create entry: ' + e.message }, 500)
  }
})

// ── PUT /:id — Update entry ──
adminContentApi.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const db = c.env.DB

    const existing = await db.prepare('SELECT id FROM intelligence_entries WHERE id = ?').bind(id).first()
    if (!existing) return c.json({ error: 'Entry not found' }, 404)

    const fields: string[] = []
    const values: any[] = []

    const updateFields = ['title', 'category', 'framework_source', 'body_markdown', 'summary',
      'impact_score', 'conviction_level', 'earnings_impact_estimate', 'catalyst_description',
      'catalyst_date', 'portfolio_implication', 'status']

    for (const field of updateFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`)
        values.push(body[field])
      }
    }

    // JSON fields
    if (body.ticker_symbols !== undefined) { fields.push('ticker_symbols = ?'); values.push(JSON.stringify(body.ticker_symbols)) }
    if (body.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(body.tags)) }
    if (body.sources !== undefined) { fields.push('sources = ?'); values.push(JSON.stringify(body.sources)) }

    fields.push("updated_at = datetime('now')")

    if (fields.length === 1) return c.json({ error: 'No fields to update' }, 400)

    await db.prepare(`UPDATE intelligence_entries SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values, id).run()

    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: 'Failed to update: ' + e.message }, 500)
  }
})

// ── POST /:id/publish — Publish entry now ──
adminContentApi.post('/:id/publish', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB

  await db.prepare(`
    UPDATE intelligence_entries SET status = 'published', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ?
  `).bind(id).run()

  // Audit log
  const user = c.get('user') as any
  await db.prepare(`
    INSERT INTO admin_audit_log (id, admin_email, action, target_type, target_id) VALUES (?, ?, 'publish', 'intelligence_entry', ?)
  `).bind(crypto.randomUUID(), user?.email || 'admin', id).run()

  return c.json({ success: true })
})

// ── POST /:id/schedule — Schedule entry ──
adminContentApi.post('/:id/schedule', async (c) => {
  const id = c.req.param('id')
  const { scheduled_for } = await c.req.json<{ scheduled_for: string }>()
  const db = c.env.DB

  await db.prepare(`
    UPDATE intelligence_entries SET status = 'scheduled', scheduled_for = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(scheduled_for, id).run()

  return c.json({ success: true })
})

// ── DELETE /:id — Archive entry ──
adminContentApi.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB

  await db.prepare(`
    UPDATE intelligence_entries SET status = 'archived', updated_at = datetime('now') WHERE id = ?
  `).bind(id).run()

  const user = c.get('user') as any
  await db.prepare(`
    INSERT INTO admin_audit_log (id, admin_email, action, target_type, target_id) VALUES (?, ?, 'delete', 'intelligence_entry', ?)
  `).bind(crypto.randomUUID(), user?.email || 'admin', id).run()

  return c.json({ success: true })
})

// ── POST /upload — Upload .md with YAML frontmatter ──
adminContentApi.post('/upload', async (c) => {
  try {
    const contentType = c.req.header('content-type') || ''
    let rawContent = ''

    if (contentType.includes('application/json')) {
      const body = await c.req.json<{ content: string; filename?: string }>()
      rawContent = body.content
    } else {
      rawContent = await c.req.text()
    }

    if (!rawContent.trim()) {
      return c.json({ error: 'Empty content' }, 400)
    }

    const { frontmatter, body, errors: parseErrors } = parseFrontmatter(rawContent)

    // Validate required fields
    const missingFields = validateIntelligenceEntry(frontmatter)
    const status = missingFields.length > 0 ? 'needs_review' : 'draft'

    const db = c.env.DB
    const id = crypto.randomUUID()
    const title = frontmatter.title || 'Untitled'
    const slug = slugify(title) + '-' + id.substring(0, 8)
    const summary = frontmatter.summary || autoSummary(body)

    // Duplicate detection
    const ticker = frontmatter.ticker || ''
    const existingDupe = await db.prepare(
      `SELECT id FROM intelligence_entries WHERE title = ? AND ticker_symbols LIKE ? AND date(created_at) = date('now')`
    ).bind(title, `%${ticker}%`).first()

    if (existingDupe) {
      return c.json({
        warning: 'Potential duplicate detected',
        existing_id: existingDupe.id,
        id, // still created, flagged
        status: 'needs_review',
      })
    }

    // Insert
    const tickerSymbols = typeof frontmatter.ticker === 'string' ? [frontmatter.ticker] : (frontmatter.ticker || [])

    await db.prepare(`
      INSERT INTO intelligence_entries (id, title, slug, category, framework_source, body_markdown, summary,
        ticker_symbols, tags, impact_score, conviction_level, earnings_impact_estimate,
        catalyst_description, catalyst_date, portfolio_implication, sources, status, ingestion_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual')
    `).bind(
      id, title, slug,
      frontmatter.category || 'daily_intelligence',
      frontmatter.framework_source || null,
      body, summary,
      JSON.stringify(tickerSymbols),
      JSON.stringify(frontmatter.tags || []),
      frontmatter.impact_score || null,
      frontmatter.conviction_level || null,
      frontmatter.earnings_impact_estimate || null,
      frontmatter.catalyst_description || null,
      frontmatter.catalyst_date || null,
      frontmatter.portfolio_implication || null,
      JSON.stringify(frontmatter.sources || []),
      status
    ).run()

    return c.json({
      success: true,
      id,
      slug,
      status,
      parseErrors,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
      frontmatter,
    })
  } catch (e: any) {
    return c.json({ error: 'Upload failed: ' + e.message }, 500)
  }
})

// ── POST /from-report/:reportId — Convert existing research_report to draft ──
adminContentApi.post('/from-report/:reportId', async (c) => {
  try {
    const reportId = c.req.param('reportId')
    const db = c.env.DB

    const report = await db.prepare('SELECT * FROM research_reports WHERE id = ?').bind(reportId).first<any>()
    if (!report) return c.json({ error: 'Report not found' }, 404)

    // Map agent_type to category
    const categoryMap: Record<string, string> = {
      material_events: 'daily_intelligence',
      bias_mode: 'daily_intelligence',
      mag7_monitor: 'watchlist_update',
      aomg_scanner: 'aomg_trend',
      hot_micro: 'daily_intelligence',
      hot_macro: 'market_commentary',
      doubler: 'multibagger_report',
      ai_scorer: 'watchlist_update',
      social_sentiment: 'daily_intelligence',
      episodic_pivot: 'value_opportunity',
      disruption: 'daily_intelligence',
      dislocation: 'value_opportunity',
    }

    const id = crypto.randomUUID()
    const tickers = JSON.parse(report.ticker_symbols || '[]')
    const title = `${report.agent_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}: ${tickers.join(', ') || 'Market Analysis'}`
    const slug = slugify(title) + '-' + id.substring(0, 8)
    const summary = autoSummary(report.raw_markdown || '')

    await db.prepare(`
      INSERT INTO intelligence_entries (id, title, slug, category, framework_source, body_markdown, summary,
        ticker_symbols, impact_score, conviction_level, status, ingestion_source, source_report_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'manual', ?)
    `).bind(
      id, title, slug,
      categoryMap[report.agent_type] || 'daily_intelligence',
      report.agent_type,
      report.raw_markdown || '',
      summary,
      report.ticker_symbols || '[]',
      report.impact_score === 'H' ? 'HIGH' : report.impact_score === 'M' ? 'MEDIUM' : report.impact_score === 'L' ? 'LOW' : null,
      report.conviction_level || null,
      reportId
    ).run()

    return c.json({ success: true, id, slug, title })
  } catch (e: any) {
    return c.json({ error: 'Conversion failed: ' + e.message }, 500)
  }
})
