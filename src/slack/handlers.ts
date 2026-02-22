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

  // ─────────────────────────────────────────────────────────
  // Handle /save command separately — it imports external reports
  // ─────────────────────────────────────────────────────────
  if (command === '/save') {
    return handleSaveCommand(c.env.DB, text, channelId, userName, responseUrl)
  }

  const cmdConfig = commandMap[command]
  if (!cmdConfig) {
    return c.json({
      response_type: 'ephemeral',
      text: `Unknown command: ${command}. Available: ${Object.keys(commandMap).join(', ')}, /save`
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
    commands: ['/material', '/bias', '/mag7', '/score', '/heat', '/watch', '/aomg', '/trend', '/macro', '/doubler', '/sentiment', '/save'],
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

// ── /save Command — Import External Research to Portal ──────
// Usage: /save NVDA material_events <paste your report here>
// Or:    /save NVDA <paste report> (auto-detects agent type)
// Or:    /save <paste report> (tries to extract tickers from content)
// ─────────────────────────────────────────────────────────────

const VALID_AGENTS = [
  'material_events', 'bias_mode', 'mag7_monitor', 'aomg_scanner',
  'hot_micro', 'hot_macro', 'doubler', 'ai_scorer', 'social_sentiment',
  'portfolio_heat', 'superlative_products',
]

const AGENT_DETECTION_KEYWORDS: Record<string, string[]> = {
  material_events: ['material event', 'catalyst', 'earnings impact', '8-k', '10-q', 'sec filing'],
  bias_mode: ['bias mode', 'triple test', 'false positive', 'genuine deterioration', 'weighted composite'],
  mag7_monitor: ['magnificent 7', 'mag 7', 'mag7', 'aapl.*msft.*googl', 'seven stocks'],
  ai_scorer: ['ai scor', 'tam score', 'bias score', 'superlative score', 'disruption score', 'composite score'],
  hot_micro: ['micro trend', 'hot micro', 'emerging trend'],
  hot_macro: ['macro event', 'hot macro', 'fed funds', 'rate environment', 'inflation'],
  doubler: ['doubling potential', 'doubler', '100% upside', 'double in', '2x thesis'],
  aomg_scanner: ['aomg', 'area of maximum growth', 'tam.*sam.*som'],
  social_sentiment: ['social sentiment', 'reddit', 'wsb', 'wallstreetbets', 'fintwit', 'social buzz'],
}

export function detectAgentType(text: string): string {
  const lower = text.toLowerCase()
  for (const [agent, keywords] of Object.entries(AGENT_DETECTION_KEYWORDS)) {
    for (const kw of keywords) {
      if (new RegExp(kw, 'i').test(lower)) return agent
    }
  }
  return 'material_events' // default fallback
}

export function extractTickersFromContent(text: string): string[] {
  // Match common ticker patterns: $NVDA, NVDA:, "NVDA", standalone uppercase 1-5 letters
  // that appear near stock/investing context
  const dollarTickers = text.match(/\$([A-Z]{1,5})\b/g)?.map(t => t.replace('$', '')) || []
  const colonTickers = text.match(/\b([A-Z]{1,5}):/g)?.map(t => t.replace(':', '')) || []
  
  // Combine and deduplicate
  const all = [...new Set([...dollarTickers, ...colonTickers])]
  
  // Filter out common false positives
  const falsePositives = new Set(['I', 'A', 'AM', 'PM', 'DD', 'AI', 'CEO', 'CFO', 'CTO', 'IPO', 'ETF', 'SEC', 'FDA', 'US', 'EU', 'UK', 'GDP', 'CPI', 'PCE', 'Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'YOY', 'QOQ', 'MOM', 'EPS', 'PE', 'PB', 'PS', 'EV', 'IV', 'OI', 'ATH', 'ATL', 'RSI', 'MACD', 'SMA', 'EMA', 'IMO', 'FWIW', 'TL', 'DR', 'YOLO', 'HODL', 'FYI', 'BTW', 'TLDR', 'LMAO', 'EST', 'PST', 'UTC', 'JSON', 'API', 'URL', 'PDF', 'CSV', 'SQL'])
  return all.filter(t => !falsePositives.has(t))
}

function tryParseJSON(text: string): any | null {
  // Try to find a JSON block in the text
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]) } catch {}
    try { return JSON.parse(jsonMatch[1].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')) } catch {}
  }
  // Try to find a raw JSON object
  const braceMatch = text.match(/\{[\s\S]*"key_takeaway"[\s\S]*\}/)
  if (braceMatch) {
    try { return JSON.parse(braceMatch[0]) } catch {}
  }
  return null
}

async function handleSaveCommand(
  db: D1Database,
  text: string,
  channelId: string,
  userName: string,
  responseUrl: string,
): Promise<Response> {
  if (!text || text.trim().length < 10) {
    return new Response(JSON.stringify({
      response_type: 'ephemeral',
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: ':floppy_disk: */save* — Import external research to the Ekantik Portal' } },
        { type: 'divider' },
        { type: 'section', text: { type: 'mrkdwn', text: 
          '*Usage:*\n' +
          '`/save NVDA material_events <your research report>`\n' +
          '`/save NVDA <your research report>` _(auto-detects agent)_\n' +
          '`/save <your research report>` _(auto-detects tickers & agent)_\n\n' +
          '*Agent types:* material_events, bias_mode, mag7_monitor, ai_scorer, hot_micro, hot_macro, doubler, aomg_scanner, social_sentiment\n\n' +
          '*Tip:* Paste your Claude Desktop report directly after the command. JSON blocks will be parsed automatically for structured data.'
        } },
      ]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    // ── Parse the /save command text ──────────────────────────
    // Strategy: first few words might be tickers and/or agent type,
    // everything else is the report content.
    const words = text.trim().split(/\s+/)
    const parsedTickers: string[] = []
    let agentType = ''
    let contentStartIndex = 0

    // Scan the first few words for tickers and agent type
    for (let i = 0; i < Math.min(words.length, 5); i++) {
      const word = words[i].toUpperCase().replace(/,/g, '')
      const wordLower = words[i].toLowerCase().replace(/,/g, '')
      
      // Check if it's a known agent type
      if (VALID_AGENTS.includes(wordLower)) {
        agentType = wordLower
        contentStartIndex = i + 1
        continue
      }
      
      // Check if it looks like a ticker (1-5 uppercase letters)
      if (/^[A-Z]{1,5}$/.test(word) && !['THE', 'AND', 'FOR', 'WITH', 'THIS', 'THAT', 'FROM', 'HAVE', 'BEEN'].includes(word)) {
        parsedTickers.push(word)
        contentStartIndex = i + 1
        continue
      }
      
      // Once we hit a non-ticker non-agent word, rest is content
      break
    }

    // The report content is everything after the parsed tokens
    let reportContent = words.slice(contentStartIndex).join(' ').trim()
    
    // If we consumed everything as tickers/agent, the whole text IS the report
    if (!reportContent || reportContent.length < 10) {
      reportContent = text.trim()
    }

    // Auto-detect agent type from content if not explicitly provided
    if (!agentType) {
      agentType = detectAgentType(reportContent)
    }

    // Auto-extract tickers from content if none parsed from command prefix
    if (parsedTickers.length === 0) {
      const extracted = extractTickersFromContent(reportContent)
      parsedTickers.push(...extracted.slice(0, 10))
    }

    // Try to extract structured JSON from the report
    const structured = tryParseJSON(reportContent) || {
      key_takeaway: reportContent.substring(0, 200).replace(/[#*`]/g, '').trim(),
      impact_score: 'M',
      conviction_level: 'MEDIUM',
      source: 'external_import',
    }

    // Ensure impact/conviction exist
    if (!structured.impact_score) structured.impact_score = 'M'
    if (!structured.conviction_level) structured.conviction_level = 'MEDIUM'

    // ── Save to D1 ───────────────────────────────────────────
    const reportId = `rpt-import-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

    await db.prepare(`
      INSERT INTO research_reports (
        id, agent_type, ticker_symbols, trigger_source, model_used, api_mode,
        raw_markdown, structured_json, impact_score, ai_composite_score,
        conviction_level, token_usage, cost_estimate, processing_time_ms,
        status, slack_channel_id
      ) VALUES (?, ?, ?, 'manual', ?, 'import', ?, ?, ?, ?, ?, '{}', 0, 0, 'completed', ?)
    `).bind(
      reportId,
      agentType,
      JSON.stringify(parsedTickers),
      structured.model || 'external',
      reportContent,
      JSON.stringify(structured),
      structured.impact_score,
      structured.ai_composite_score || structured.ai_scores?.composite || null,
      structured.conviction_level,
      channelId,
    ).run()

    console.log(`[Save] Report imported: ${reportId} | agent=${agentType} | tickers=${parsedTickers.join(',')} | by=${userName}`)

    // ── Post confirmation to Slack ───────────────────────────
    const tickerStr = parsedTickers.length > 0 ? parsedTickers.map(t => `\`${t}\``).join(' ') : '_none detected_'
    const takeaway = (structured.key_takeaway || reportContent.substring(0, 150)).substring(0, 200)
    const contentPreview = reportContent.length > 300
      ? reportContent.substring(0, 300).replace(/[`]/g, '') + '...'
      : reportContent.replace(/[`]/g, '')

    const AGENT_LABELS: Record<string, string> = {
      material_events: 'Material Events', bias_mode: 'Bias Mode', mag7_monitor: 'Mag 7 Monitor',
      ai_scorer: 'AI Scorer', hot_micro: 'Hot Micro', hot_macro: 'Hot Macro',
      doubler: 'Doubler', aomg_scanner: 'AOMG Scanner', social_sentiment: 'Social Sentiment',
      portfolio_heat: 'Portfolio Heat', superlative_products: 'Superlative Products',
    }

    const confirmBlocks = {
      response_type: 'in_channel' as const,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: ':floppy_disk: Research Report Saved to Portal', emoji: true }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: [
              `*Agent:* ${AGENT_LABELS[agentType] || agentType}`,
              `*Tickers:* ${tickerStr}`,
              `*Impact:* ${structured.impact_score || 'M'} · *Conviction:* ${structured.conviction_level || 'MEDIUM'}`,
              structured.ai_composite_score ? `*AI Score:* ${structured.ai_composite_score}/10` : null,
              `*Report ID:* \`${reportId}\``,
              `*Saved by:* @${userName}`,
            ].filter(Boolean).join('\n')
          }
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:bulb: *Takeaway:*\n>${takeaway}`
          }
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `_Imported via /save · Content length: ${reportContent.length} chars · <https://research.ekantikcapital.com|View in Portal>_` }
          ]
        },
      ]
    }

    // Post via response_url
    if (responseUrl) {
      await fetch(responseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmBlocks),
      })
    }

    return new Response(JSON.stringify({ ok: true, reportId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('[Save] Error:', error.message)
    
    const errorResponse = {
      response_type: 'ephemeral',
      text: `:x: Failed to save report: ${error.message}`
    }

    if (responseUrl) {
      try {
        await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorResponse),
        })
      } catch (e) {}
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 200, // Return 200 to Slack even on error
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ── Export saveExternalReport for api.tsx to use ──────────────
export async function saveExternalReport(
  db: D1Database,
  agentType: string,
  tickers: string[],
  content: string,
  source: string,
  channelId?: string,
): Promise<string> {
  const structured = tryParseJSON(content) || {
    key_takeaway: content.substring(0, 200).replace(/[#*`]/g, '').trim(),
    impact_score: 'M',
    conviction_level: 'MEDIUM',
    source: source,
  }

  if (!structured.impact_score) structured.impact_score = 'M'
  if (!structured.conviction_level) structured.conviction_level = 'MEDIUM'

  const reportId = `rpt-import-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

  await db.prepare(`
    INSERT INTO research_reports (
      id, agent_type, ticker_symbols, trigger_source, model_used, api_mode,
      raw_markdown, structured_json, impact_score, ai_composite_score,
      conviction_level, token_usage, cost_estimate, processing_time_ms,
      status, slack_channel_id
    ) VALUES (?, ?, ?, 'manual', ?, 'import', ?, ?, ?, ?, ?, '{}', 0, 0, 'completed', ?)
  `).bind(
    reportId,
    agentType,
    JSON.stringify(tickers),
    structured.model || 'external',
    content,
    JSON.stringify(structured),
    structured.impact_score,
    structured.ai_composite_score || null,
    structured.conviction_level,
    channelId || null,
  ).run()

  return reportId
}
