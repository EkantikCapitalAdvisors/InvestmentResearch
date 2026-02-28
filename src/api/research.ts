import { Hono } from 'hono'
import { processPortalResearch, saveExternalReport, detectAgentType, extractTickersFromContent } from '../slack/handlers'
import { postReportToSlack } from '../slack/notify'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const researchApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// RESEARCH ENGINE — Async trigger for Slack (fire & forget from Slack handler)
// ============================================================
researchApi.post('/slack-run', async (c) => {
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
    const { callClaude, persistReport } = await import('../research/engine')
    const { buildBlockKitResponse, buildErrorResponse } = await import('../slack/blocks')

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
      const { buildErrorResponse } = await import('../slack/blocks')
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
// Agent mode classification for validation
const TICKER_AGENTS = ['material_events', 'bias_mode', 'ai_scorer', 'doubler', 'episodic_pivot', 'disruption', 'dislocation']
const MARKET_AGENTS = ['mag7_monitor', 'hot_micro', 'hot_macro']
const HYBRID_AGENTS = ['social_sentiment', 'aomg_scanner']
const ALL_AGENTS = [...TICKER_AGENTS, ...MARKET_AGENTS, ...HYBRID_AGENTS]

researchApi.post('/run', async (c) => {
  const body = await c.req.json()
  const { agentType, tickers, additionalContext } = body

  if (!agentType) {
    return c.json({ error: 'agentType is required' }, 400)
  }

  if (!ALL_AGENTS.includes(agentType)) {
    return c.json({ error: `Unknown agentType: ${agentType}. Valid agents: ${ALL_AGENTS.join(', ')}` }, 400)
  }

  // Validate ticker requirements per agent mode
  const tickerList = Array.isArray(tickers) ? tickers.filter((t: string) => t && t.trim()) : []
  if (TICKER_AGENTS.includes(agentType) && tickerList.length === 0) {
    return c.json({ error: `Agent '${agentType}' requires at least one ticker symbol.` }, 400)
  }
  // MARKET_AGENTS: ignore any tickers passed (run market-wide)
  // HYBRID_AGENTS: tickers are optional — passed through if provided

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
  }

  try {
    // Market-wide agents don't need tickers; hybrid agents pass through whatever user provided
    const effectiveTickers = MARKET_AGENTS.includes(agentType) ? [] : tickerList
    const reportId = await processPortalResearch(
      c.env.ANTHROPIC_API_KEY,
      c.env.DB,
      agentType,
      effectiveTickers,
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
// RESEARCH IMPORT — Save external reports (from Claude Desktop, etc.)
// ============================================================
researchApi.post('/import', async (c) => {
  const body = await c.req.json()
  const { agentType, tickers, content, source } = body

  if (!content || content.trim().length < 10) {
    return c.json({ error: 'content is required (min 10 chars)' }, 400)
  }

  const validAgents = [
    'material_events', 'bias_mode', 'mag7_monitor', 'aomg_scanner',
    'hot_micro', 'hot_macro', 'doubler', 'ai_scorer', 'social_sentiment',
    'portfolio_heat', 'superlative_products', 'episodic_pivot',
  ]
  // Auto-detect agent type from content if not provided
  const agent = validAgents.includes(agentType) ? agentType : detectAgentType(content)
  // Auto-extract tickers from content if not provided
  const resolvedTickers = (tickers && tickers.length > 0) ? tickers : extractTickersFromContent(content)

  try {
    const reportId = await saveExternalReport(
      c.env.DB,
      agent,
      resolvedTickers,
      content,
      source || 'portal_import',
    )
    const report = await c.env.DB.prepare('SELECT * FROM research_reports WHERE id = ?').bind(reportId).first()
    return c.json({ success: true, reportId, report })
  } catch (error: any) {
    console.error('Research import failed:', error)
    return c.json({ error: error.message || 'Import failed' }, 500)
  }
})

// ============================================================
// RESEARCH REPORTS
// ============================================================
researchApi.get('/feed', async (c) => {
  const agent = c.req.query('agent')
  const impact = c.req.query('impact')
  const ticker = c.req.query('ticker')
  const pivot = c.req.query('pivot')   // has_pivot, no_pivot, or specific pivot_type
  const from = c.req.query('from')   // ISO date string e.g. 2026-02-20
  const to = c.req.query('to')       // ISO date string e.g. 2026-02-22
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')

  let sql = 'SELECT * FROM research_reports WHERE 1=1'
  const params: any[] = []

  if (agent) { sql += ' AND agent_type = ?'; params.push(agent) }
  if (impact) { sql += ' AND impact_score = ?'; params.push(impact) }
  if (ticker) { sql += ' AND ticker_symbols LIKE ?'; params.push(`%${ticker}%`) }
  if (from) { sql += ' AND created_at >= ?'; params.push(from + ' 00:00:00') }
  if (to) { sql += ' AND created_at <= ?'; params.push(to + ' 23:59:59') }

  // Pivot filtering — uses the episodic_pivot_json column
  if (pivot === 'has_pivot') {
    sql += ' AND episodic_pivot_json IS NOT NULL AND episodic_pivot_json != \'null\''
  } else if (pivot === 'no_pivot') {
    sql += ' AND (episodic_pivot_json IS NULL OR episodic_pivot_json = \'null\')'
  } else if (pivot) {
    // Specific pivot type — search within JSON string
    sql += ' AND episodic_pivot_json LIKE ?'
    params.push(`%"pivot_type":"${pivot}"%`)
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ reports: results })
})

researchApi.get('/:id', async (c) => {
  const id = c.req.param('id')
  const report = await c.env.DB.prepare('SELECT * FROM research_reports WHERE id = ?').bind(id).first()
  if (!report) return c.json({ error: 'Report not found' }, 404)

  const events = await c.env.DB.prepare('SELECT me.*, t.symbol FROM material_events me JOIN tickers t ON me.ticker_id = t.id WHERE me.report_id = ?').bind(id).all()
  return c.json({ report, events: events.results })
})

export { researchApi, TICKER_AGENTS, MARKET_AGENTS, HYBRID_AGENTS, ALL_AGENTS }
