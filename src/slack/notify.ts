// ============================================================
// EKANTIK SLACK NOTIFICATIONS — Portal → Slack Integration
// 
// Features:
// 1. Auto-post portal research results to a Slack channel
// 2. Share individual reports to Slack on demand
// 3. Daily digest summary
// ============================================================

const AGENT_LABELS: Record<string, string> = {
  material_events: 'Material Events Intelligence',
  bias_mode: 'Bias Mode Detection',
  mag7_monitor: 'Magnificent 7 Scorecard',
  ai_scorer: 'AI Scoring Framework',
  hot_micro: 'Hot Micro Trends',
  hot_macro: 'Hot Macro Events',
  doubler: 'Doubling Potential Analysis',
  aomg_scanner: 'AOMG Growth Scanner',
}

const AGENT_EMOJI: Record<string, string> = {
  material_events: ':mag:',
  bias_mode: ':scales:',
  mag7_monitor: ':crown:',
  ai_scorer: ':brain:',
  hot_micro: ':microscope:',
  hot_macro: ':globe_with_meridians:',
  doubler: ':rocket:',
  aomg_scanner: ':dart:',
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

// ── Post a research report to Slack channel ──────────────────
export async function postReportToSlack(
  botToken: string,
  channelId: string,
  report: any,
  portalUrl: string
): Promise<{ ok: boolean; ts?: string; error?: string }> {
  if (!botToken || !channelId) {
    return { ok: false, error: 'Missing SLACK_BOT_TOKEN or channel ID' }
  }

  const tickers = typeof report.ticker_symbols === 'string'
    ? JSON.parse(report.ticker_symbols)
    : (report.ticker_symbols || [])

  const structured = typeof report.structured_json === 'string'
    ? JSON.parse(report.structured_json)
    : (report.structured_json || {})

  const agentLabel = AGENT_LABELS[report.agent_type] || report.agent_type
  const agentEmoji = AGENT_EMOJI[report.agent_type] || ':clipboard:'
  const impactEmoji = IMPACT_EMOJI[report.impact_score] || ''
  const convictionEmoji = CONVICTION_EMOJI[report.conviction_level] || ''

  const tickerStr = tickers.length > 0 ? tickers.map((t: string) => `\`${t}\``).join(' ') : 'N/A'
  const costStr = report.cost_estimate ? `$${report.cost_estimate.toFixed(3)}` : '—'
  const timeStr = report.processing_time_ms
    ? (report.processing_time_ms > 1000 ? `${(report.processing_time_ms / 1000).toFixed(1)}s` : `${report.processing_time_ms}ms`)
    : '—'

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${agentLabel}`, emoji: true }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          `${agentEmoji} *Source:* Portal Research`,
          tickers.length > 0 ? `*Tickers:* ${tickerStr}` : null,
          report.impact_score ? `*Impact:* ${impactEmoji} ${report.impact_score}` : null,
          report.conviction_level ? `*Conviction:* ${convictionEmoji} ${report.conviction_level}` : null,
          report.ai_composite_score ? `*AI Score:* ${report.ai_composite_score}/10` : null,
        ].filter(Boolean).join(' · ')
      }
    },
  ]

  // Key takeaway
  if (structured.key_takeaway) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `:bulb: *Key Takeaway:*\n>${structured.key_takeaway}` }
    })
  }

  // Recommended action
  if (structured.recommended_action) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `:point_right: *Recommended Action:*\n${structured.recommended_action}` }
    })
  }

  // Footer with portal link
  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `_Ekantik Research Engine · ${report.id} · Cost: ${costStr} · Time: ${timeStr} · <${portalUrl}|View in Portal>_` }
    ]
  })

  try {
    const resp = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: channelId,
        text: `${agentEmoji} ${agentLabel} — ${tickerStr}`,
        blocks,
        unfurl_links: false,
        unfurl_media: false,
      })
    })

    const data: any = await resp.json()
    if (!data.ok) {
      console.error('[SlackNotify] postMessage error:', data.error)
      return { ok: false, error: data.error }
    }

    return { ok: true, ts: data.ts }
  } catch (e: any) {
    console.error('[SlackNotify] postMessage exception:', e.message)
    return { ok: false, error: e.message }
  }
}

// ── Post daily digest to Slack ──────────────────────────────
export async function postDailyDigestToSlack(
  botToken: string,
  channelId: string,
  digest: {
    date: string
    totalReports: number
    totalCost: number
    highImpactCount: number
    topReports: any[]
    openPositions: any[]
    activeSignals: number
    heatUtilization: number
  },
  portalUrl: string
): Promise<{ ok: boolean; error?: string }> {
  if (!botToken || !channelId) {
    return { ok: false, error: 'Missing SLACK_BOT_TOKEN or channel ID' }
  }

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: ':newspaper: Daily Research Digest', emoji: true }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Date:* ${digest.date}\n*Total Reports:* ${digest.totalReports} · *High Impact:* ${digest.highImpactCount} · *Total Cost:* $${digest.totalCost.toFixed(2)}`
      }
    },
    { type: 'divider' },
  ]

  // Portfolio snapshot
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:fire: *Portfolio Snapshot*\n` +
        `• *Heat Utilization:* ${digest.heatUtilization.toFixed(1)}%\n` +
        `• *Open Positions:* ${digest.openPositions.length}\n` +
        `• *Active Signals:* ${digest.activeSignals}`
    }
  })

  // Top P&L movers
  if (digest.openPositions.length > 0) {
    const sorted = [...digest.openPositions].sort((a, b) => Math.abs(b.pnl_pct || 0) - Math.abs(a.pnl_pct || 0))
    const topMovers = sorted.slice(0, 5).map(p => {
      const pnl = p.pnl_pct || 0
      const emoji = pnl >= 0 ? ':chart_with_upwards_trend:' : ':chart_with_downwards_trend:'
      return `${emoji} *${p.symbol}* — ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}% (${p.engine === 'stocks_leaps' ? 'Stocks' : 'Options'})`
    }).join('\n')

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `:bar_chart: *Top P&L Movers*\n${topMovers}` }
    })
  }

  // Today's research highlights
  if (digest.topReports.length > 0) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: ':mag: *Research Highlights*' }
    })

    for (const r of digest.topReports.slice(0, 5)) {
      const tickers = typeof r.ticker_symbols === 'string' ? JSON.parse(r.ticker_symbols) : (r.ticker_symbols || [])
      const structured = typeof r.structured_json === 'string' ? JSON.parse(r.structured_json) : (r.structured_json || {})
      const agentEmoji = AGENT_EMOJI[r.agent_type] || ':clipboard:'
      const agentLabel = AGENT_LABELS[r.agent_type] || r.agent_type
      const impactEmoji = IMPACT_EMOJI[r.impact_score] || ''
      const tickerStr = tickers.length > 0 ? tickers.map((t: string) => `\`${t}\``).join(' ') : ''

      let line = `${agentEmoji} *${agentLabel}* ${tickerStr} ${impactEmoji}`
      if (structured.key_takeaway) {
        const takeaway = structured.key_takeaway.length > 120
          ? structured.key_takeaway.substring(0, 120) + '...'
          : structured.key_takeaway
        line += `\n  _"${takeaway}"_`
      }

      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: line }
      })
    }
  }

  // Footer
  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `_Ekantik Capital Research Engine · <${portalUrl}|Open Portal> · Automated Daily Digest_` }
    ]
  })

  try {
    const resp = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: channelId,
        text: `:newspaper: Daily Research Digest — ${digest.date}`,
        blocks,
        unfurl_links: false,
      })
    })

    const data: any = await resp.json()
    if (!data.ok) {
      console.error('[SlackNotify] digest error:', data.error)
      return { ok: false, error: data.error }
    }

    return { ok: true }
  } catch (e: any) {
    console.error('[SlackNotify] digest exception:', e.message)
    return { ok: false, error: e.message }
  }
}

// ── List Slack channels (to let user pick a channel) ────────
export async function listSlackChannels(
  botToken: string
): Promise<{ ok: boolean; channels?: any[]; error?: string }> {
  if (!botToken) {
    return { ok: false, error: 'Missing SLACK_BOT_TOKEN' }
  }

  try {
    const resp = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200&exclude_archived=true', {
      headers: { 'Authorization': `Bearer ${botToken}` }
    })
    const data: any = await resp.json()
    if (!data.ok) {
      return { ok: false, error: data.error }
    }

    const channels = (data.channels || []).map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      is_private: ch.is_private,
      is_member: ch.is_member,
      num_members: ch.num_members,
    }))

    return { ok: true, channels }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}
