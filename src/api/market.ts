import { Hono } from 'hono'
import { refreshPrices, fetchQuote } from '../market/yahoo'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const marketApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// MARKET DATA — Yahoo Finance Live Prices
// ============================================================
marketApi.post('/refresh', async (c) => {
  try {
    const result = await refreshPrices(c.env.DB)
    return c.json({
      success: true,
      updated: result.updated,
      failed: result.failed,
      quotes: result.quotes.map(q => ({
        symbol: q.symbol,
        price: q.price,
        changePercent: q.changePercent,
        marketState: q.marketState,
      })),
      refreshedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Price refresh failed:', error)
    return c.json({ error: error.message || 'Price refresh failed' }, 500)
  }
})

marketApi.get('/quote/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase()
  const quote = await fetchQuote(symbol)
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  return c.json(quote)
})

export { marketApi }
