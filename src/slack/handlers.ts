// ============================================================
// EKANTIK SLACK INTEGRATION — Command Handlers
// HTTP Webhook mode (no Railway needed, runs on Workers)
// ============================================================
import { Hono } from 'hono'
import { callClaude, persistReport } from '../research/engine'
import { buildBlockKitResponse, buildAckResponse, buildErrorResponse } from './blocks'

type Bindings = {
  DB: D1Database
  ANTHROPIC_API_KEY: string
  SLACK_BOT_TOKEN?: string
  SLACK_SIGNING_SECRET?: string
}

export const slackRoutes = new Hono<{ Bindings: Bindings }>()

// ── Slack Signature Verification ───────────────────────────
async function verifySlackSignature(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  // Prevent replay attacks (5 min window)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp)) > 300) return false

  const sigBasestring = `v0:${timestamp}:${body}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(sigBasestring))
  const hash = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return signature === `v0=${hash}`
}

// ── Parse URL-encoded form body ────────────────────────────
function parseFormBody(body: string): Record<string, string> {
  const params = new URLSearchParams(body)
  const result: Record<string, string> = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

// ── Slash Command Handler ──────────────────────────────────
// POST /api/slack/commands
slackRoutes.post('/commands', async (c) => {
  const rawBody = await c.req.text()

  // Verify Slack signature if signing secret is configured
  if (c.env.SLACK_SIGNING_SECRET) {
    const signature = c.req.header('x-slack-signature') || ''
    const timestamp = c.req.header('x-slack-request-timestamp') || ''
    const valid = await verifySlackSignature(c.env.SLACK_SIGNING_SECRET, signature, timestamp, rawBody)
    if (!valid) {
      return c.json({ error: 'Invalid signature' }, 401)
    }
  }

  const form = parseFormBody(rawBody)
  const command = form.command    // e.g., "/material"
  const text = form.text || ''   // e.g., "NVDA"
  const responseUrl = form.response_url
  const channelId = form.channel_id
  const userId = form.user_id
  const userName = form.user_name

  // Map Slack commands to agent types
  const commandMap: Record<string, { agent: string; needsTicker: boolean; description: string }> = {
    '/material': { agent: 'material_events', needsTicker: true, description: 'Material Events Intelligence' },
    '/bias': { agent: 'bias_mode', needsTicker: true, description: 'Bias Mode Detection' },
    '/mag7': { agent: 'mag7_monitor', needsTicker: false, description: 'Magnificent 7 Scorecard' },
    '/score': { agent: 'ai_scorer', needsTicker: true, description: 'AI Scoring Framework' },
    '/heat': { agent: 'portfolio_heat_view', needsTicker: false, description: 'Portfolio Heat Dashboard' },
    '/watch': { agent: 'watchlist_view', needsTicker: false, description: 'Watchlist Overview' },
    '/aomg': { agent: 'aomg_scanner', needsTicker: false, description: 'AOMG Growth Scanner' },
    '/trend': { agent: 'hot_micro', needsTicker: false, description: 'Hot Micro Trends' },
    '/macro': { agent: 'hot_macro', needsTicker: false, description: 'Hot Macro Events' },
    '/doubler': { agent: 'doubler', needsTicker: true, description: 'Doubling Potential Analysis' },
  }

  const cmdConfig = commandMap[command]
  if (!cmdConfig) {
    return c.json({
      response_type: 'ephemeral',
      text: `Unknown command: ${command}. Available: ${Object.keys(commandMap).join(', ')}`
    })
  }

  // Parse tickers from text
  const tickers = text.toUpperCase().split(/[\s,]+/).filter((t: string) => /^[A-Z]{1,5}$/.test(t))

  if (cmdConfig.needsTicker && tickers.length === 0) {
    return c.json({
      response_type: 'ephemeral',
      text: `:warning: *${cmdConfig.description}* requires at least one ticker symbol.\nUsage: \`${command} NVDA\` or \`${command} AAPL, MSFT\``
    })
  }

  // Immediate acknowledgment — Slack requires response within 3 seconds
  // Use waitUntil to process in background
  const ctx = c.executionCtx

  // Handle read-only commands (no Claude needed)
  if (['portfolio_heat_view', 'watchlist_view'].includes(cmdConfig.agent)) {
    ctx.waitUntil(handleReadOnlyCommand(c.env.DB, c.env.SLACK_BOT_TOKEN || '', cmdConfig.agent, responseUrl))
    return c.json(buildAckResponse(cmdConfig.description, tickers, true))
  }

  // Handle research commands (Claude + web search)
  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({
      response_type: 'ephemeral',
      text: ':x: ANTHROPIC_API_KEY not configured. Please set it in your environment.'
    })
  }

  ctx.waitUntil(
    handleResearchCommand(
      c.env.ANTHROPIC_API_KEY,
      c.env.DB,
      c.env.SLACK_BOT_TOKEN || '',
      cmdConfig.agent,
      tickers,
      text,
      responseUrl,
      channelId,
      userName
    )
  )

  return c.json(buildAckResponse(cmdConfig.description, tickers, false))
})

// ── Slack Interactions Handler ──────────────────────────────
// POST /api/slack/interactions (for button clicks, menus)
slackRoutes.post('/interactions', async (c) => {
  const rawBody = await c.req.text()

  if (c.env.SLACK_SIGNING_SECRET) {
    const signature = c.req.header('x-slack-signature') || ''
    const timestamp = c.req.header('x-slack-request-timestamp') || ''
    const valid = await verifySlackSignature(c.env.SLACK_SIGNING_SECRET, signature, timestamp, rawBody)
    if (!valid) return c.json({ error: 'Invalid signature' }, 401)
  }

  const form = parseFormBody(rawBody)
  const payload = JSON.parse(form.payload || '{}')

  // Handle button actions
  if (payload.type === 'block_actions') {
    for (const action of payload.actions || []) {
      if (action.action_id === 'run_deeper_analysis') {
        // TODO: Trigger deeper analysis
        return c.json({ text: 'Deeper analysis triggered. Processing...' })
      }
    }
  }

  return c.json({ ok: true })
})

// ── Health check for Slack ─────────────────────────────────
slackRoutes.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'ekantik-slack',
    commands: ['/material', '/bias', '/mag7', '/score', '/heat', '/watch', '/aomg', '/trend', '/macro', '/doubler'],
    version: '1.0.0',
  })
})

// ── Background: Handle Research Commands ───────────────────
async function handleResearchCommand(
  apiKey: string,
  db: D1Database,
  botToken: string,
  agentType: string,
  tickers: string[],
  rawText: string,
  responseUrl: string,
  channelId: string,
  userName: string
) {
  try {
    // Call Claude with web search
    const result = await callClaude(apiKey, agentType, tickers, rawText !== tickers.join(' ') ? rawText : undefined)

    // Persist to D1
    const reportId = await persistReport(db, agentType, tickers, 'slack', result, channelId)

    // Build Block Kit response
    const blocks = buildBlockKitResponse(agentType, tickers, result.structured, result.rawMarkdown, reportId, result.costEstimate, result.processingTimeMs)

    // Send response to Slack via response_url
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'in_channel',
        replace_original: true,
        ...blocks
      })
    })
  } catch (error: any) {
    console.error('Research command failed:', error)
    // Send error to Slack
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildErrorResponse(agentType, tickers, error.message))
    })
  }
}

// ── Background: Handle Read-Only Commands ──────────────────
async function handleReadOnlyCommand(
  db: D1Database,
  botToken: string,
  command: string,
  responseUrl: string
) {
  try {
    let blocks: any = {}

    if (command === 'portfolio_heat_view') {
      const { results: positions } = await db.prepare(`
        SELECT pp.*, t.symbol, t.name, t.last_price
        FROM portfolio_positions pp
        JOIN tickers t ON pp.ticker_id = t.id
        WHERE pp.status = 'open'
        ORDER BY pp.heat_contribution DESC
      `).all()

      const config = await db.prepare("SELECT * FROM system_config WHERE key IN ('heat_ceiling_pct','stocks_leaps_risk_cap_pct','options_risk_cap_pct','market_mode','portfolio_equity')").all()
      const configMap: Record<string, any> = {}
      for (const row of config.results as any[]) {
        configMap[row.key] = JSON.parse(row.value as string)
      }

      let stocksHeat = 0, optionsHeat = 0
      for (const p of positions as any[]) {
        if (p.engine === 'stocks_leaps') stocksHeat += (p.heat_contribution || 0)
        else optionsHeat += (p.heat_contribution || 0)
      }
      const totalHeat = stocksHeat + optionsHeat
      const ceiling = configMap.heat_ceiling_pct || 20

      const positionLines = (positions as any[]).map(p =>
        `*${p.symbol}* — ${p.engine === 'stocks_leaps' ? 'Stock' : 'Options'} · Heat: ${(p.heat_contribution||0).toFixed(2)}% · P&L: ${((p.pnl_pct||0) >= 0 ? '+' : '')}${(p.pnl_pct||0).toFixed(2)}%`
      ).join('\n')

      blocks = {
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: ':fire: Portfolio Heat Dashboard', emoji: true } },
          { type: 'section', text: { type: 'mrkdwn', text: `*Total Heat:* ${totalHeat.toFixed(2)}% / ${ceiling}% ceiling\n*Utilization:* ${(totalHeat/ceiling*100).toFixed(1)}%\n*Stocks/LEAPS:* ${stocksHeat.toFixed(2)}% · *Options:* ${optionsHeat.toFixed(2)}%\n*Market Mode:* ${configMap.market_mode || 'bull'}` } },
          { type: 'divider' },
          { type: 'section', text: { type: 'mrkdwn', text: positionLines || 'No open positions' } },
        ]
      }
    } else if (command === 'watchlist_view') {
      const { results: tickers } = await db.prepare(`
        SELECT t.*, 
          (SELECT composite FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as ai_score,
          (SELECT conviction_level FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as conviction
        FROM tickers t WHERE t.is_watchlist = 1 ORDER BY t.is_mag7 DESC, t.symbol ASC
      `).all()

      const tickerLines = (tickers as any[]).map(t =>
        `*${t.symbol}* — $${(t.last_price||0).toFixed(2)} · AI: ${t.ai_score ? t.ai_score.toFixed(1) : '—'} · ${t.conviction || '—'}${t.is_mag7 ? ' :crown:' : ''}`
      ).join('\n')

      blocks = {
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: ':binoculars: Watchlist Overview', emoji: true } },
          { type: 'section', text: { type: 'mrkdwn', text: `*${(tickers as any[]).length} tickers* on watchlist\n\n${tickerLines}` } },
        ]
      }
    }

    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'in_channel',
        replace_original: true,
        ...blocks
      })
    })
  } catch (error: any) {
    console.error('Read-only command failed:', error)
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'ephemeral',
        text: `:x: Error: ${error.message}`
      })
    })
  }
}

// ── Portal Research Handler (called from api.tsx) ──────────
export async function processPortalResearch(
  apiKey: string,
  db: D1Database,
  agentType: string,
  tickers: string[],
  additionalContext?: string
): Promise<string> {
  const result = await callClaude(apiKey, agentType, tickers, additionalContext)
  const reportId = await persistReport(db, agentType, tickers, 'portal', result)
  return reportId
}
