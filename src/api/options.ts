import { Hono } from 'hono'
import { sizeOptionPosition } from '../market/options'

type Bindings = { DB: D1Database }

const optionsApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// OPTION POSITION SIZING
// GET /api/options/size?symbol=SPY&exposure=1.0&days=5[&equity=100000]
//
// Equity defaults to the portfolio_equity system_config value so the
// calculator and the heat dashboard stay on the same book size.
// ============================================================
optionsApi.get('/size', async (c) => {
  const symbol = (c.req.query('symbol') || 'SPY').toUpperCase()
  const exposure = Number(c.req.query('exposure') ?? 1)
  const windowDays = Number(c.req.query('days') ?? 5)
  const equityParam = c.req.query('equity')

  if (!/^[A-Z.\-]{1,10}$/.test(symbol)) {
    return c.json({ error: 'Invalid symbol' }, 400)
  }
  if (!Number.isFinite(exposure) || exposure <= 0 || exposure > 5) {
    return c.json({ error: 'exposure must be between 0 and 5' }, 400)
  }
  if (!Number.isFinite(windowDays) || windowDays < 1 || windowDays > 120) {
    return c.json({ error: 'days must be between 1 and 120' }, 400)
  }

  let equity = Number(equityParam)
  if (!equityParam || !Number.isFinite(equity) || equity <= 0) {
    const row = await c.env.DB
      .prepare("SELECT value FROM system_config WHERE key = 'portfolio_equity'")
      .first<{ value: string }>()
    equity = row ? Number(JSON.parse(row.value)) : 100_000
  }

  try {
    const result = await sizeOptionPosition({ symbol, equity, exposure, windowDays })
    if (!result) {
      return c.json({ error: `No tradeable chain for ${symbol} in that tenor window` }, 502)
    }

    // Sleeve caps, so the page can say whether the premium fits the book's risk budget.
    const caps = await c.env.DB
      .prepare("SELECT key, value FROM system_config WHERE key IN ('options_risk_cap_pct','heat_ceiling_pct')")
      .all<{ key: string; value: string }>()
    const capMap: Record<string, number> = {}
    for (const row of caps.results ?? []) capMap[row.key] = Number(JSON.parse(row.value))

    return c.json({
      ...result,
      equity,
      exposure,
      optionsRiskCapPct: capMap.options_risk_cap_pct ?? 6,
      heatCeilingPct: capMap.heat_ceiling_pct ?? 20,
    })
  } catch (error: any) {
    console.error('Option sizing failed:', error)
    return c.json({ error: error?.message || 'Option sizing failed' }, 500)
  }
})

export { optionsApi }
