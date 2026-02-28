import { Hono } from 'hono'
import { postReportToSlack, postDailyDigestToSlack, listSlackChannels } from '../slack/notify'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const slackApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SLACK INTEGRATION — Portal -> Slack
// ============================================================

// Share a specific report to Slack
slackApi.post('/share', async (c) => {
  const { reportId, channelId } = await c.req.json()
  if (!reportId) return c.json({ error: 'reportId is required' }, 400)
  if (!c.env.SLACK_BOT_TOKEN) return c.json({ error: 'SLACK_BOT_TOKEN not configured. Set it in Cloudflare Pages secrets.' }, 500)

  // Determine target channel: explicit param > system_config > error
  let targetChannel = channelId
  if (!targetChannel) {
    const config = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_channel_id'").first() as any
    targetChannel = config?.value ? JSON.parse(config.value) : null
  }
  if (!targetChannel) return c.json({ error: 'No Slack channel configured. Set one in Settings or pass channelId.' }, 400)

  const report = await c.env.DB.prepare('SELECT * FROM research_reports WHERE id = ?').bind(reportId).first()
  if (!report) return c.json({ error: 'Report not found' }, 404)

  const portalUrl = 'https://research.ekantikcapital.com'
  const result = await postReportToSlack(c.env.SLACK_BOT_TOKEN, targetChannel, report, portalUrl)

  if (result.ok && result.ts) {
    await c.env.DB.prepare(
      'UPDATE research_reports SET slack_channel_id = ?, slack_message_ts = ? WHERE id = ?'
    ).bind(targetChannel, result.ts, reportId).run()
  }

  return c.json({ success: result.ok, error: result.error, channelId: targetChannel })
})

// List available Slack channels
slackApi.get('/channels', async (c) => {
  if (!c.env.SLACK_BOT_TOKEN) return c.json({ error: 'SLACK_BOT_TOKEN not configured' }, 500)
  const result = await listSlackChannels(c.env.SLACK_BOT_TOKEN)
  return c.json(result)
})

// Get / set Slack configuration
slackApi.get('/config', async (c) => {
  const channelRow = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_channel_id'").first() as any
  const autoPostRow = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_auto_post'").first() as any
  const channelNameRow = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_channel_name'").first() as any

  return c.json({
    channelId: channelRow?.value ? JSON.parse(channelRow.value) : null,
    channelName: channelNameRow?.value ? JSON.parse(channelNameRow.value) : null,
    autoPost: autoPostRow?.value ? JSON.parse(autoPostRow.value) : false,
    botConfigured: !!c.env.SLACK_BOT_TOKEN,
  })
})

slackApi.post('/config', async (c) => {
  const { channelId, channelName, autoPost } = await c.req.json()

  if (channelId !== undefined) {
    await c.env.DB.prepare(
      "INSERT INTO system_config (key, value) VALUES ('slack_channel_id', ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
    ).bind(JSON.stringify(channelId), JSON.stringify(channelId)).run()
  }
  if (channelName !== undefined) {
    await c.env.DB.prepare(
      "INSERT INTO system_config (key, value) VALUES ('slack_channel_name', ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
    ).bind(JSON.stringify(channelName), JSON.stringify(channelName)).run()
  }
  if (autoPost !== undefined) {
    await c.env.DB.prepare(
      "INSERT INTO system_config (key, value) VALUES ('slack_auto_post', ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
    ).bind(JSON.stringify(autoPost), JSON.stringify(autoPost)).run()
  }

  return c.json({ success: true })
})

// Daily digest endpoint — generates and posts a summary to Slack
slackApi.post('/digest', async (c) => {
  if (!c.env.SLACK_BOT_TOKEN) return c.json({ error: 'SLACK_BOT_TOKEN not configured' }, 500)

  const config = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'slack_channel_id'").first() as any
  const channelId = config?.value ? JSON.parse(config.value) : null
  if (!channelId) return c.json({ error: 'No Slack channel configured for digest.' }, 400)

  const today = new Date().toISOString().split('T')[0]

  // Gather reports from last 24 hours
  const { results: recentReports } = await c.env.DB.prepare(
    "SELECT * FROM research_reports WHERE created_at >= datetime('now', '-24 hours') ORDER BY created_at DESC"
  ).all()

  // Calculate total cost
  const totalCost = (recentReports as any[]).reduce((sum, r) => sum + (r.cost_estimate || 0), 0)
  const highImpactCount = (recentReports as any[]).filter(r => r.impact_score === 'H').length

  // Get open positions for P&L summary
  const { results: positions } = await c.env.DB.prepare(`
    SELECT pp.*, t.symbol FROM portfolio_positions pp
    JOIN tickers t ON pp.ticker_id = t.id WHERE pp.status = 'open'
    ORDER BY pp.heat_contribution DESC
  `).all()

  // Get active signals count
  const sigCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM trade_signals WHERE is_active = 1").first() as any

  // Get heat utilization
  const heatConfig = await c.env.DB.prepare("SELECT value FROM system_config WHERE key = 'heat_ceiling_pct'").first() as any
  const ceiling = heatConfig?.value ? JSON.parse(heatConfig.value) : 20
  let totalHeat = 0
  for (const p of positions as any[]) {
    totalHeat += (p.heat_contribution || 0)
  }
  const utilization = (totalHeat / ceiling) * 100

  const result = await postDailyDigestToSlack(
    c.env.SLACK_BOT_TOKEN,
    channelId,
    {
      date: today,
      totalReports: recentReports.length,
      totalCost,
      highImpactCount,
      topReports: recentReports.slice(0, 5),
      openPositions: positions as any[],
      activeSignals: (sigCount as any)?.count || 0,
      heatUtilization: utilization,
    },
    'https://research.ekantikcapital.com'
  )

  return c.json({ success: result.ok, error: result.error, date: today, reportCount: recentReports.length })
})

export { slackApi }
