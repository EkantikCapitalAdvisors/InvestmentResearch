import { Hono } from 'hono'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const portfolioApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// PORTFOLIO / HEAT
// ============================================================
portfolioApi.get('/heat', async (c) => {
  const { results: positions } = await c.env.DB.prepare(`
    SELECT pp.*, t.symbol, t.name, t.last_price
    FROM portfolio_positions pp
    JOIN tickers t ON pp.ticker_id = t.id
    WHERE pp.status = 'open'
    ORDER BY pp.heat_contribution DESC
  `).all()

  const config = await c.env.DB.prepare("SELECT * FROM system_config WHERE key IN ('heat_ceiling_pct','stocks_leaps_risk_cap_pct','options_risk_cap_pct','market_mode','portfolio_equity')").all()
  const configMap: Record<string, any> = {}
  for (const row of config.results as any[]) {
    configMap[row.key] = JSON.parse(row.value)
  }

  let stocksLeapsHeat = 0, optionsHeat = 0
  for (const p of positions as any[]) {
    if (p.engine === 'stocks_leaps') stocksLeapsHeat += (p.heat_contribution || 0)
    else optionsHeat += (p.heat_contribution || 0)
  }

  const ceiling = configMap.heat_ceiling_pct || 20
  const totalHeat = stocksLeapsHeat + optionsHeat

  return c.json({
    positions,
    heat: {
      stocksLeapsHeat: Math.round(stocksLeapsHeat * 100) / 100,
      optionsHeat: Math.round(optionsHeat * 100) / 100,
      totalHeat: Math.round(totalHeat * 100) / 100,
      heatCeiling: ceiling,
      stocksLeapsCap: configMap.stocks_leaps_risk_cap_pct || 14,
      optionsCap: configMap.options_risk_cap_pct || 6,
      utilization: Math.round((totalHeat / ceiling) * 10000) / 100,
      marketMode: configMap.market_mode || 'bull',
      portfolioEquity: configMap.portfolio_equity || 100000,
    }
  })
})

portfolioApi.get('/positions', async (c) => {
  const status = c.req.query('status') || 'open'
  const { results } = await c.env.DB.prepare(`
    SELECT pp.*, t.symbol, t.name, t.last_price
    FROM portfolio_positions pp
    JOIN tickers t ON pp.ticker_id = t.id
    WHERE pp.status = ?
    ORDER BY pp.created_at DESC
  `).bind(status).all()
  return c.json({ positions: results })
})

export { portfolioApi }
