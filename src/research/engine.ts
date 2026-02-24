// ============================================================
// EKANTIK RESEARCH ENGINE — Claude API Client
// Supports web_search tool, structured output parsing,
// cost tracking, and D1 persistence
// ============================================================
import { SYSTEM_IDENTITY, AGENT_PROMPTS, buildDataContext, OUTPUT_FORMAT } from './prompts'

interface ResearchResult {
  reportId: string
  structured: any
  rawMarkdown: string
  model: string
  tokenUsage: { input: number; output: number }
  costEstimate: number
  processingTimeMs: number
}

// ── Claude API Client ──────────────────────────────────────
export async function callClaude(
  apiKey: string,
  agentType: string,
  tickers: string[],
  additionalContext?: string
): Promise<{ structured: any; rawMarkdown: string; model: string; tokenUsage: any; costEstimate: number; processingTimeMs: number }> {
  const startTime = Date.now()

  const agentPrompt = AGENT_PROMPTS[agentType]
  if (!agentPrompt) throw new Error(`Unknown agent type: ${agentType}`)

  const outputFormat = OUTPUT_FORMAT[agentType] || OUTPUT_FORMAT.material_events
  const dataContext = buildDataContext(tickers, additionalContext)

  // Assemble the 4-layer prompt
  const systemPrompt = `${SYSTEM_IDENTITY}\n\n--- AGENT INSTRUCTIONS ---\n${agentPrompt}\n\n--- OUTPUT FORMAT ---\n${outputFormat}`

  const userMessage = `Run the ${agentType.replace(/_/g, ' ').toUpperCase()} analysis now.${dataContext}

IMPORTANT: 
1. Use web search to find the latest real data. Search for recent news, filings, and market data.
2. Start your response with a valid JSON block wrapped in \`\`\`json ... \`\`\` 
3. Follow the JSON with a detailed markdown analysis.
4. Be specific with numbers, dates, and sources.`

  // Select model — use Sonnet for routine, Opus for deep analysis
  const model = ['bias_mode', 'doubler', 'aomg_scanner', 'disruption', 'dislocation'].includes(agentType) 
    ? 'claude-sonnet-4-20250514'  // Heavier analysis
    : 'claude-sonnet-4-20250514'  // Standard — use Sonnet for cost efficiency in MVP

  // Retry logic for rate limits
  let response: Response | null = null
  let lastError = ''
  const maxRetries = 3

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Wait before retry — exponential backoff: 60s, 90s
      const waitMs = (attempt + 1) * 60000
      console.log(`Rate limited. Waiting ${waitMs/1000}s before retry ${attempt + 1}/${maxRetries}...`)
      await new Promise(resolve => setTimeout(resolve, waitMs))
    }

    const currentModel = model  // Always use Sonnet — no fallback to avoid model errors
    const useWebSearch = attempt < 2  // Disable web search on final retry to reduce tokens

    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        ...(useWebSearch ? { 'anthropic-beta': 'web-search-2025-03-05' } : {}),
      },
      body: JSON.stringify({
        model: currentModel,
        max_tokens: useWebSearch ? 8192 : 4096,
        system: systemPrompt,
        ...(useWebSearch ? {
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search',
              max_uses: 3,
            }
          ]
        } : {}),
        messages: [
          { role: 'user', content: useWebSearch ? userMessage : userMessage.replace('Use web search to find the latest real data. Search for recent news, filings, and market data.', 'Analyze based on your training knowledge. Provide the most current analysis you can.') }
        ]
      })
    })

    if (response.ok) break

    const errorText = await response.text()
    lastError = errorText
    console.error(`Claude API attempt ${attempt + 1} error:`, response.status, errorText.substring(0, 300))

    // Only retry on rate limits (429)
    if (response.status !== 429) {
      throw new Error(`Claude API error ${response.status}: ${errorText}`)
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Claude API rate limited after ${maxRetries} retries: ${lastError.substring(0, 300)}`)
  }

  const data: any = await response.json()
  const processingTimeMs = Date.now() - startTime

  // Extract text from response content blocks
  let fullText = ''
  if (data.content) {
    for (const block of data.content) {
      if (block.type === 'text') {
        fullText += block.text
      }
    }
  }

  // Parse structured JSON from response
  let structured: any = {}
  const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    try {
      structured = JSON.parse(jsonMatch[1])
    } catch (e) {
      console.error('Failed to parse JSON from Claude response:', e)
      // Try to extract partial JSON
      try {
        const relaxed = jsonMatch[1].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
        structured = JSON.parse(relaxed)
      } catch (e2) {
        structured = { key_takeaway: 'Analysis complete — see raw markdown', parse_error: true }
      }
    }
  }

  // Extract markdown (everything after the JSON block, or the full text if no JSON)
  let rawMarkdown = fullText
  if (jsonMatch) {
    rawMarkdown = fullText.substring(fullText.indexOf('```json'))
    const endOfJson = rawMarkdown.indexOf('```', 7)
    if (endOfJson > 0) {
      rawMarkdown = rawMarkdown.substring(endOfJson + 3).trim()
    }
  }

  // Token usage and cost calculation
  const tokenUsage = {
    input: data.usage?.input_tokens || 0,
    output: data.usage?.output_tokens || 0,
  }

  // Cost calculation (Sonnet 4: $3/MTok input, $15/MTok output)
  const costEstimate = (tokenUsage.input * 3 / 1_000_000) + (tokenUsage.output * 15 / 1_000_000)

  return {
    structured,
    rawMarkdown: rawMarkdown || fullText,
    model: data.model || model,
    tokenUsage,
    costEstimate,
    processingTimeMs,
  }
}

// ── Persist Research Report to D1 ──────────────────────────
export async function persistReport(
  db: D1Database,
  agentType: string,
  tickers: string[],
  triggerSource: string,
  result: { structured: any; rawMarkdown: string; model: string; tokenUsage: any; costEstimate: number; processingTimeMs: number },
  slackChannelId?: string,
  slackMessageTs?: string
): Promise<string> {
  const reportId = `rpt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

  const structured = result.structured || {}

  // Extract episodic pivot data if present
  const episodicPivot = structured.episodic_pivot ? JSON.stringify(structured.episodic_pivot) : null

  await db.prepare(`
    INSERT INTO research_reports (
      id, agent_type, ticker_symbols, trigger_source, model_used, api_mode,
      raw_markdown, structured_json, impact_score, ai_composite_score,
      conviction_level, token_usage, cost_estimate, processing_time_ms,
      status, slack_channel_id, slack_message_ts, episodic_pivot_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
  `).bind(
    reportId,
    agentType,
    JSON.stringify(tickers),
    triggerSource,
    result.model,
    'standard',
    result.rawMarkdown,
    JSON.stringify(structured),
    structured.impact_score || 'M',
    structured.ai_composite_score || null,
    structured.conviction_level || null,
    JSON.stringify(result.tokenUsage),
    result.costEstimate,
    result.processingTimeMs,
    slackChannelId || null,
    slackMessageTs || null,
    episodicPivot
  ).run()

  // Persist agent-specific data
  try {
    if (agentType === 'material_events' && structured.events) {
      await persistMaterialEvents(db, reportId, tickers, structured.events)
    }
    if (agentType === 'bias_mode') {
      await persistBiasCheck(db, reportId, tickers, structured)
    }
    if (['ai_scorer', 'material_events', 'mag7_monitor', 'doubler'].includes(agentType) && structured.scores) {
      await persistAiScores(db, reportId, tickers, structured)
    }
    if (agentType === 'mag7_monitor' && structured.stocks) {
      await persistMag7Scores(db, reportId, structured.stocks)
    }
    if (agentType === 'social_sentiment' && structured.high_conviction_signals) {
      await persistSocialSentiment(db, reportId, structured)
    }
  } catch (e) {
    console.error('Error persisting agent-specific data:', e)
  }

  return reportId
}

// ── Helper: Persist Material Events ────────────────────────
async function persistMaterialEvents(db: D1Database, reportId: string, tickers: string[], events: any[]) {
  for (const event of events.slice(0, 10)) { // Cap at 10 events
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

    // Find ticker ID
    for (const symbol of tickers) {
      const ticker = await db.prepare('SELECT id FROM tickers WHERE symbol = ?').bind(symbol).first()
      if (ticker) {
        await db.prepare(`
          INSERT INTO material_events (
            id, report_id, ticker_id, event_title, event_description, 
            impact_score, event_date, event_category, earnings_impact_pct,
            catalyst_timeline, source_type, source_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          eventId + '-' + symbol,
          reportId,
          ticker.id,
          event.title || 'Unnamed event',
          event.description || null,
          event.impact || 'M',
          event.event_date || new Date().toISOString().split('T')[0],
          event.category || null,
          event.earnings_impact_pct || null,
          event.catalyst_timeline || null,
          event.source_type || 'web_search',
          event.source || null
        ).run()
      }
    }
  }
}

// ── Helper: Persist Bias Mode Check ────────────────────────
async function persistBiasCheck(db: D1Database, reportId: string, tickers: string[], structured: any) {
  for (const symbol of tickers) {
    const ticker = await db.prepare('SELECT id FROM tickers WHERE symbol = ?').bind(symbol).first()
    if (ticker) {
      const checkId = `bias-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      await db.prepare(`
        INSERT INTO bias_mode_checks (
          id, ticker_id, report_id, fundamental_score, market_score,
          sentiment_score, alt_data_score, weighted_composite,
          triple_test_result, triple_test_detail, key_signals
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        checkId,
        ticker.id,
        reportId,
        structured.fundamental_score || 5,
        structured.market_score || 5,
        structured.sentiment_score || 5,
        structured.alt_data_score || 5,
        structured.weighted_composite || 5,
        structured.triple_test_result || 'inconclusive',
        structured.triple_test_detail || null,
        JSON.stringify(structured.key_signals || [])
      ).run()
    }
  }
}

// ── Helper: Persist AI Scores ──────────────────────────────
async function persistAiScores(db: D1Database, reportId: string, tickers: string[], structured: any) {
  const scores = structured.scores || {}
  const tam = scores.tam || 5
  const bias = scores.bias || 5
  const superlative = scores.superlative || 5
  const disruption = scores.disruption || 5
  const composite = (tam * 0.30) + (bias * 0.25) + (superlative * 0.25) + (disruption * 0.20)
  const conviction = composite >= 8 ? 'HIGH' : composite >= 6 ? 'MEDIUM' : 'LOW'

  for (const symbol of tickers) {
    const ticker = await db.prepare('SELECT id FROM tickers WHERE symbol = ?').bind(symbol).first()
    if (ticker) {
      const scoreId = `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      await db.prepare(`
        INSERT INTO ai_scores (
          id, ticker_id, report_id, tam_score, bias_score,
          superlative_score, disruption_score, composite,
          conviction_level, scoring_rationale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        scoreId,
        ticker.id,
        reportId,
        tam, bias, superlative, disruption,
        Math.round(composite * 100) / 100,
        conviction,
        structured.key_takeaway || null
      ).run()
    }
  }
}

// ── Helper: Persist Mag 7 Scores ───────────────────────────
async function persistMag7Scores(db: D1Database, reportId: string, stocks: any[]) {
  for (const stock of stocks) {
    const ticker = await db.prepare('SELECT id FROM tickers WHERE symbol = ?').bind(stock.symbol).first()
    if (ticker) {
      const tam = stock.tam || 5
      const bias = stock.bias || 5
      const superlative = stock.superlative || 5
      const disruption = stock.disruption || 5
      const composite = stock.composite || ((tam * 0.30) + (bias * 0.25) + (superlative * 0.25) + (disruption * 0.20))

      const scoreId = `score-mag7-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      await db.prepare(`
        INSERT INTO ai_scores (
          id, ticker_id, report_id, tam_score, bias_score,
          superlative_score, disruption_score, composite,
          conviction_level, scoring_rationale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        scoreId,
        ticker.id,
        reportId,
        tam, bias, superlative, disruption,
        Math.round(composite * 100) / 100,
        stock.conviction || 'MEDIUM',
        stock.one_liner || null
      ).run()
    }
  }
}

// ── Helper: Persist Social Sentiment Signals ──────────────
async function persistSocialSentiment(db: D1Database, reportId: string, structured: any) {
  // Social sentiment stores its intelligence primarily in the structured_json column of research_reports.
  // For cross-referencing, we also create observations from high-conviction signals
  // so they appear in the Observations feed.
  const signals = structured.high_conviction_signals || []
  for (const signal of signals.slice(0, 10)) {
    try {
      const obsId = `obs-social-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      const happened = `[Social ${signal.signal_type?.toUpperCase() || 'SIGNAL'}] ${signal.core_thesis || 'Social momentum detected'}`
      const whyMatters = `Signal Tier ${signal.signal_tier || '?'} from ${signal.source_platform || 'unknown'} (${signal.source_subreddit || 'N/A'}). Thesis grade: ${signal.thesis_quality_grade || '?'}. Bull/Bear split: ${signal.bull_bear_split || 'N/A'}.`
      const watchNext = signal.catalyst || 'Monitor social momentum trajectory and cross-platform confirmation.'

      await db.prepare(`
        INSERT INTO observations (id, happened_text, why_matters, watch_next, ticker_symbols, category, promoted_to_report_id)
        VALUES (?, ?, ?, ?, ?, 'social_sentiment', ?)
      `).bind(
        obsId,
        happened.substring(0, 500),
        whyMatters.substring(0, 500),
        watchNext.substring(0, 500),
        JSON.stringify(signal.ticker ? [signal.ticker] : []),
        reportId
      ).run()
    } catch (e) {
      console.error('Error persisting social sentiment observation:', e)
    }
  }
}
