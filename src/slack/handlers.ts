// ============================================================
// EKANTIK SLACK INTEGRATION — Command Handlers
// HTTP Webhook mode (runs on Cloudflare Pages Workers)
//
// ARCHITECTURE NOTE:
// Cloudflare Pages kills waitUntil() promises after ~30s.
// Claude API calls take 30-90s. So we CAN'T use the standard
// Slack pattern of "ack in 3s + waitUntil for background work".
//
// Instead, we run the research SYNCHRONOUSLY. Slack will show
// a brief "timed out" for the slash command, but the full result
// will appear in the channel via response_url (valid 30 min).
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

  // Verify Slack signature
  if (c.env.SLACK_SIGNING_SECRET) {
    const signature = c.req.header('x-slack-signature') || ''
    const timestamp = c.req.header('x-slack-request-timestamp') || ''
    const valid = await verifySlackSignature(c.env.SLACK_SIGNING_SECRET, signature, timestamp, rawBody)
    if (!valid) {
      return c.json({ error: 'Invalid signature' }, 401)
    }
  }

  const form = parseFormBody(rawBody)
  const command = form.command
  const text = form.text || ''
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
    '/sentiment': { agent: 'social_sentiment', needsTicker: false, description: 'Social Sentiment Scanner' },
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

  // ─────────────────────────────────────────────────────────
  // Handle READ-ONLY commands (fast, <1s) — these can use ack + waitUntil
  // ─────────────────────────────────────────────────────────
  if (['portfolio_heat_view', 'watchlist_view'].includes(cmdConfig.agent)) {
    // These are fast enough for waitUntil
    c.executionCtx.waitUntil(handleReadOnlyCommand(c.env.DB, c.env.SLACK_BOT_TOKEN || '', cmdConfig.agent, responseUrl))
    return c.json(buildAckResponse(cmdConfig.description, tickers, true))
  }

  // ─────────────────────────────────────────────────────────
  // Handle RESEARCH commands (Claude + web search — 30-90s)
  // These are too slow for waitUntil on CF Pages.
  // Run SYNCHRONOUSLY — Slack will timeout the slash command
  // but the result will appear via response_url.
  // ─────────────────────────────────────────────────────────
  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({
      response_type: 'ephemeral',
      text: ':x: ANTHROPIC_API_KEY not configured. Please set it in your environment.'
    })
  }

  // Step 1: Post a "processing" message to Slack immediately via response_url
  // This replaces the slash command's "thinking..." with our custom message
  try {
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'in_channel',
        text: `:hourglass_flowing_sand: *${cmdConfig.description}* initiated for *${tickers.join(', ')}*...\n_Claude is analyzing with web search — typically 30-90 seconds._`
      })
    })
    console.log(`[Slack] Posted processing message for ${cmdConfig.agent} ${tickers.join(',')}`)
  } catch (e) {
    console.error('[Slack] Failed to post processing message:', e)
  }

  // Step 2: Run Claude research SYNCHRONOUSLY (this takes 30-90s)
  try {
    console.log(`[Slack] Starting ${cmdConfig.agent} for ${tickers.join(',')}`)
    const result = await callClaude(
      c.env.ANTHROPIC_API_KEY, 
      cmdConfig.agent, 
      tickers, 
      text !== tickers.join(' ') ? text : undefined
    )
    console.log(`[Slack] Claude completed in ${result.processingTimeMs}ms`)

    // Persist to D1
    const reportId = await persistReport(c.env.DB, cmdConfig.agent, tickers, 'slack', result, channelId)
    console.log(`[Slack] Report saved: ${reportId}`)

    // Build Block Kit response
    const blocks = buildBlockKitResponse(
      cmdConfig.agent, tickers, result.structured, result.rawMarkdown,
      reportId, result.costEstimate, result.processingTimeMs
    )

    // Step 3: Post the full result to Slack via response_url
    const slackResp = await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'in_channel',
        replace_original: false,
        ...blocks
      })
    })
    console.log(`[Slack] Result posted: ${slackResp.status}`)

    // Return empty 200 (Slack may have already timed out the original request, that's OK)
    return c.json({ ok: true })

  } catch (error: any) {
    console.error('[Slack] Research failed:', error.message)
    
    // Post error to Slack
    try {
      await fetch(responseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildErrorResponse(cmdConfig.agent, tickers, error.message))
      })
    } catch (e) {
      console.error('[Slack] Failed to post error:', e)
    }

    return c.json({ error: error.message }, 500)
  }
})

// ── Slack Interactions Handler ──────────────────────────────
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

  if (payload.type === 'block_actions') {
    for (const action of payload.actions || []) {
      if (action.action_id === 'run_deeper_analysis') {
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
    commands: ['/material', '/bias', '/mag7', '/score', '/heat', '/watch', '/aomg', '/trend', '/macro', '/doubler', '/sentiment'],
    version: '2.0.0',
  })
})

// ── Handle Read-Only Commands (fast, <1s) ────────────────
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
