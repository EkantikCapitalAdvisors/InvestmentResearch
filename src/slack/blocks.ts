// ============================================================
// EKANTIK SLACK BLOCK KIT — Response Builders
// ============================================================

const AGENT_LABELS: Record<string, string> = {
  material_events: ':mag: Material Events Intelligence',
  bias_mode: ':scales: Bias Mode Detection',
  mag7_monitor: ':crown: Magnificent 7 Scorecard',
  ai_scorer: ':brain: AI Scoring Framework',
  hot_micro: ':microscope: Hot Micro Trends',
  hot_macro: ':globe_with_meridians: Hot Macro Events',
  doubler: ':rocket: Doubling Potential Analysis',
  aomg_scanner: ':dart: AOMG Growth Scanner',
}

const IMPACT_EMOJI: Record<string, string> = {
  H: ':red_circle:',
  M: ':large_orange_circle:',
  L: ':large_green_circle:',
}

const CONVICTION_EMOJI: Record<string, string> = {
  HIGH: ':white_check_mark:',
  MEDIUM: ':warning:',
  LOW: ':grey_question:',
}

// ── Build immediate acknowledgment ─────────────────────────
export function buildAckResponse(description: string, tickers: string[], isReadOnly: boolean): any {
  if (isReadOnly) {
    return {
      response_type: 'in_channel',
      text: `:hourglass_flowing_sand: Loading ${description}...`
    }
  }

  return {
    response_type: 'in_channel',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:hourglass_flowing_sand: *${description}* initiated${tickers.length > 0 ? ` for *${tickers.join(', ')}*` : ''}...\n_Claude is analyzing with web search — typically 30-90 seconds._`
        }
      }
    ]
  }
}

// ── Build error response ───────────────────────────────────
export function buildErrorResponse(agentType: string, tickers: string[], errorMessage: string): any {
  return {
    response_type: 'ephemeral',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:x: *${AGENT_LABELS[agentType] || agentType} Failed*\n${tickers.length > 0 ? `Tickers: ${tickers.join(', ')}\n` : ''}Error: ${errorMessage}`
        }
      }
    ]
  }
}

// ── Build full research response ───────────────────────────
export function buildBlockKitResponse(
  agentType: string,
  tickers: string[],
  structured: any,
  rawMarkdown: string,
  reportId: string,
  costEstimate: number,
  processingTimeMs: number
): any {
  const s = structured || {}

  // Common header
  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: (AGENT_LABELS[agentType] || agentType).replace(/:[a-z_]+:/g, '').trim(), emoji: true }
    }
  ]

  // Ticker tags + Impact badge
  if (tickers.length > 0 || s.impact_score) {
    let metaLine = ''
    if (tickers.length > 0) metaLine += `*Tickers:* ${tickers.map(t => '`' + t + '`').join(' ')} · `
    if (s.impact_score) metaLine += `*Impact:* ${IMPACT_EMOJI[s.impact_score] || ''} ${s.impact_score} · `
    if (s.conviction_level) metaLine += `*Conviction:* ${CONVICTION_EMOJI[s.conviction_level] || ''} ${s.conviction_level} · `
    if (s.ai_composite_score) metaLine += `*AI Score:* ${s.ai_composite_score}/10`
    
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: metaLine.replace(/ · $/, '') }
    })
  }

  // Key takeaway
  if (s.key_takeaway) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `:bulb: *Key Takeaway:*\n>${s.key_takeaway}` }
    })
  }

  // Agent-specific content
  switch (agentType) {
    case 'material_events':
      blocks.push(...buildMaterialEventsBlocks(s))
      break
    case 'bias_mode':
      blocks.push(...buildBiasModeBlocks(s))
      break
    case 'mag7_monitor':
      blocks.push(...buildMag7Blocks(s))
      break
    case 'ai_scorer':
      blocks.push(...buildAiScorerBlocks(s))
      break
    case 'doubler':
      blocks.push(...buildDoublerBlocks(s))
      break
    case 'hot_micro':
      blocks.push(...buildHotMicroBlocks(s))
      break
    case 'hot_macro':
      blocks.push(...buildHotMacroBlocks(s))
      break
    case 'aomg_scanner':
      blocks.push(...buildAomgBlocks(s))
      break
  }

  // Recommended action
  if (s.recommended_action) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `:point_right: *Recommended Action:*\n${s.recommended_action}` }
    })
  }

  // Footer with cost and timing
  const timeStr = processingTimeMs > 1000 ? `${(processingTimeMs / 1000).toFixed(1)}s` : `${processingTimeMs}ms`
  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `_Ekantik Research Engine · Report: ${reportId} · Cost: $${costEstimate.toFixed(4)} · Time: ${timeStr}_` }
    ]
  })

  return { blocks }
}

// ── Material Events Blocks ─────────────────────────────────
function buildMaterialEventsBlocks(s: any): any[] {
  const blocks: any[] = []
  const events = s.events || []

  if (events.length > 0) {
    blocks.push({ type: 'divider' })
    for (const event of events.slice(0, 5)) {
      const emoji = IMPACT_EMOJI[event.impact] || ':white_circle:'
      let eventText = `${emoji} *${event.title}*`
      if (event.description) eventText += `\n${event.description}`
      if (event.category) eventText += `\n_Category: ${event.category}_`
      if (event.catalyst_timeline) eventText += ` · _Timeline: ${event.catalyst_timeline}_`
      if (event.earnings_impact_pct) eventText += ` · _EPS Impact: ${event.earnings_impact_pct > 0 ? '+' : ''}${event.earnings_impact_pct}%_`

      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: eventText }
      })
    }
  }
  return blocks
}

// ── Bias Mode Blocks ───────────────────────────────────────
function buildBiasModeBlocks(s: any): any[] {
  const blocks: any[] = []
  const verdictEmoji: Record<string, string> = {
    false_positive: ':white_check_mark: FALSE POSITIVE — Buying Opportunity',
    genuine_deterioration: ':rotating_light: GENUINE DETERIORATION — Avoid',
    inconclusive: ':grey_question: INCONCLUSIVE — Monitor',
  }

  blocks.push({ type: 'divider' })
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Triple Test Verdict:* ${verdictEmoji[s.triple_test_result] || s.triple_test_result}\n*Weighted Composite:* ${(s.weighted_composite || 0).toFixed(1)}/10`
    }
  })

  // Score bars (using text-based visualization)
  const scores = [
    { label: 'Fundamental (35%)', val: s.fundamental_score || 0 },
    { label: 'Market (25%)', val: s.market_score || 0 },
    { label: 'Sentiment (25%)', val: s.sentiment_score || 0 },
    { label: 'Alt Data (15%)', val: s.alt_data_score || 0 },
  ]
  const scoreText = scores.map(sc => {
    const filled = Math.round(sc.val)
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
    return `${sc.label}: \`${bar}\` ${sc.val.toFixed(1)}/10`
  }).join('\n')

  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: scoreText }
  })

  if (s.key_signals && s.key_signals.length > 0) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Key Signals:*\n${s.key_signals.map((sig: string) => `• ${sig}`).join('\n')}` }
    })
  }

  return blocks
}

// ── Mag 7 Blocks ───────────────────────────────────────────
function buildMag7Blocks(s: any): any[] {
  const blocks: any[] = []
  const stocks = s.stocks || []

  if (stocks.length > 0) {
    blocks.push({ type: 'divider' })
    
    // Top pick highlight
    if (s.top_pick) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `:trophy: *Top Pick:* \`${s.top_pick}\` · ${s.weekly_theme || ''}` }
      })
    }

    // Stock scorecard
    const stockLines = stocks.map((st: any) => {
      const conv = CONVICTION_EMOJI[st.conviction] || ''
      return `*${st.symbol}* — AI: ${(st.composite || 0).toFixed(1)} ${conv} · ${st.signal || 'N/A'}\n  _${st.one_liner || ''}_`
    }).join('\n\n')

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: stockLines }
    })
  }

  if (s.biggest_risk) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `:warning: *Biggest Risk:* ${s.biggest_risk}` }
    })
  }

  return blocks
}

// ── AI Scorer Blocks ───────────────────────────────────────
function buildAiScorerBlocks(s: any): any[] {
  const blocks: any[] = []
  const scores = s.scores || {}

  blocks.push({ type: 'divider' })

  const dimensions = [
    { label: 'TAM (30%)', val: scores.tam || 0, rationale: scores.tam_rationale },
    { label: 'Bias (25%)', val: scores.bias || 0, rationale: scores.bias_rationale },
    { label: 'Superlative (25%)', val: scores.superlative || 0, rationale: scores.superlative_rationale },
    { label: 'Disruption (20%)', val: scores.disruption || 0, rationale: scores.disruption_rationale },
  ]

  const scoreText = dimensions.map(d => {
    const filled = Math.round(d.val)
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
    let line = `*${d.label}:* \`${bar}\` ${d.val.toFixed(1)}/10`
    if (d.rationale) line += `\n  _${d.rationale.substring(0, 150)}_`
    return line
  }).join('\n\n')

  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: scoreText }
  })

  if (s.composite) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Composite Score:* ${s.composite.toFixed(1)}/10 · *Conviction:* ${CONVICTION_EMOJI[s.conviction] || ''} ${s.conviction || '—'}` }
    })
  }

  return blocks
}

// ── Doubler Blocks ─────────────────────────────────────────
function buildDoublerBlocks(s: any): any[] {
  const blocks: any[] = []
  const verdictEmoji: Record<string, string> = {
    PLAUSIBLE: ':rocket: PLAUSIBLE (>30%)',
    POSSIBLE: ':thinking_face: POSSIBLE (15-30%)',
    UNLIKELY: ':no_entry: UNLIKELY (<15%)',
  }

  blocks.push({ type: 'divider' })
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Doubling Verdict:* ${verdictEmoji[s.doubling_verdict] || s.doubling_verdict}\n*Probability:* ${s.doubling_probability_pct || 0}%`
    }
  })

  if (s.catalysts && s.catalysts.length > 0) {
    const catLines = s.catalysts.map((c: any) => `• ${c.catalyst} — ${c.probability_pct || 0}% · ${c.timeline || ''}`).join('\n')
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Key Catalysts:*\n${catLines}` }
    })
  }

  if (s.kill_factors && s.kill_factors.length > 0) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Kill Factors:*\n${s.kill_factors.map((f: string) => `:x: ${f}`).join('\n')}` }
    })
  }

  return blocks
}

// ── Hot Micro Blocks ───────────────────────────────────────
function buildHotMicroBlocks(s: any): any[] {
  const blocks: any[] = []
  const trends = s.trends || []

  if (trends.length > 0) {
    blocks.push({ type: 'divider' })
    for (const trend of trends.slice(0, 5)) {
      let trendText = `:sparkles: *${trend.title}*`
      if (trend.happened) trendText += `\n*This Happened:* ${trend.happened}`
      if (trend.why_matters) trendText += `\n*Why It Matters:* ${trend.why_matters}`
      if (trend.watch_next) trendText += `\n*Watch Next:* ${trend.watch_next}`
      if (trend.tickers) trendText += `\n*Tickers:* ${trend.tickers.map((t: string) => '`' + t + '`').join(' ')}`

      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: trendText }
      })
    }
  }
  return blocks
}

// ── Hot Macro Blocks ───────────────────────────────────────
function buildHotMacroBlocks(s: any): any[] {
  const blocks: any[] = []
  const events = s.events || []

  if (events.length > 0) {
    blocks.push({ type: 'divider' })
    for (const event of events.slice(0, 5)) {
      const impactEmoji = event.tech_impact === 'positive' ? ':arrow_up:' : event.tech_impact === 'negative' ? ':arrow_down:' : ':left_right_arrow:'
      let eventText = `${IMPACT_EMOJI[event.magnitude] || ''} *${event.title}*`
      if (event.what_happened) eventText += `\n${event.what_happened}`
      eventText += `\n_Tech Impact: ${impactEmoji} ${event.tech_impact || 'neutral'}_ · _${event.positioning || ''}_`

      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: eventText }
      })
    }
  }

  if (s.rate_environment) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `:bank: *Rate Environment:* ${s.rate_environment}` }
    })
  }

  return blocks
}

// ── AOMG Blocks ────────────────────────────────────────────
function buildAomgBlocks(s: any): any[] {
  const blocks: any[] = []
  const themes = s.themes || []

  if (themes.length > 0) {
    blocks.push({ type: 'divider' })
    for (const theme of themes.slice(0, 3)) {
      let themeText = `:dart: *${theme.name}*`
      if (theme.description) themeText += `\n${theme.description}`

      const tam = theme.tam_estimate ? formatMarketSize(theme.tam_estimate) : '—'
      const sam = theme.sam_estimate ? formatMarketSize(theme.sam_estimate) : '—'
      const som = theme.som_estimate ? formatMarketSize(theme.som_estimate) : '—'
      themeText += `\n*TAM:* ${tam} → *SAM:* ${sam} → *SOM:* ${som}`

      if (theme.drivers) themeText += `\n*Drivers:* ${theme.drivers.join(', ')}`
      if (theme.beneficiary_tickers) themeText += `\n*Beneficiaries:* ${theme.beneficiary_tickers.map((t: string) => '`' + t + '`').join(' ')}`

      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: themeText }
      })
    }
  }
  return blocks
}

function formatMarketSize(val: number): string {
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`
  if (val >= 1e9) return `$${(val / 1e9).toFixed(0)}B`
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`
  return `$${val}`
}
