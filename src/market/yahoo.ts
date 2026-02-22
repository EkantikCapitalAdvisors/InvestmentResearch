// ============================================================
// YAHOO FINANCE — Real-Time Price Fetcher
// Uses v8 chart API (no API key needed)
// ============================================================

export interface YahooQuote {
  symbol: string
  price: number
  previousClose: number
  changePercent: number
  currency: string
  marketState: string  // "REGULAR", "PRE", "POST", "CLOSED"
  timestamp: number
}

// ── Fetch single ticker quote ──────────────────────────────
export async function fetchQuote(symbol: string): Promise<YahooQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EkantikResearch/1.0)' }
    })
    if (!res.ok) return null

    const data: any = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    const price = meta.regularMarketPrice
    const previousClose = meta.chartPreviousClose || meta.previousClose
    const changePercent = previousClose ? ((price - previousClose) / previousClose) * 100 : 0

    return {
      symbol: meta.symbol,
      price,
      previousClose,
      changePercent: Math.round(changePercent * 100) / 100,
      currency: meta.currency || 'USD',
      marketState: meta.marketState || 'CLOSED',
      timestamp: Date.now(),
    }
  } catch (e) {
    console.error(`Yahoo fetch failed for ${symbol}:`, e)
    return null
  }
}

// ── Fetch multiple tickers in parallel ─────────────────────
export async function fetchQuotes(symbols: string[]): Promise<YahooQuote[]> {
  const results = await Promise.allSettled(
    symbols.map(s => fetchQuote(s))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<YahooQuote | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((q): q is YahooQuote => q !== null)
}

// ── Update D1 tickers with live prices ─────────────────────
export async function refreshPrices(db: D1Database): Promise<{
  updated: number
  failed: string[]
  quotes: YahooQuote[]
}> {
  // Get all watchlist tickers
  const { results: tickers } = await db.prepare(
    'SELECT id, symbol FROM tickers WHERE is_watchlist = 1'
  ).all()

  if (!tickers || tickers.length === 0) {
    return { updated: 0, failed: [], quotes: [] }
  }

  const symbols = (tickers as any[]).map(t => t.symbol)
  const quotes = await fetchQuotes(symbols)

  const quoteMap = new Map<string, YahooQuote>()
  for (const q of quotes) {
    quoteMap.set(q.symbol, q)
  }

  let updated = 0
  const failed: string[] = []

  // Update each ticker in D1
  for (const ticker of tickers as any[]) {
    const quote = quoteMap.get(ticker.symbol)
    if (quote) {
      await db.prepare(`
        UPDATE tickers SET 
          last_price = ?,
          price_change_pct = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(quote.price, quote.changePercent, ticker.id).run()
      updated++
    } else {
      failed.push(ticker.symbol)
    }
  }

  // Also update current_price on open portfolio positions
  for (const [symbol, quote] of quoteMap) {
    await db.prepare(`
      UPDATE portfolio_positions SET
        current_price = ?,
        pnl_pct = ROUND(((? - entry_price) / entry_price) * 100, 2),
        pnl_usd = ROUND((? - entry_price) * (size_pct / 100.0) * (
          SELECT CAST(value AS REAL) FROM system_config WHERE key = 'portfolio_equity'
        ) / entry_price, 2),
        updated_at = datetime('now')
      WHERE ticker_id IN (SELECT id FROM tickers WHERE symbol = ?)
        AND status = 'open'
    `).bind(quote.price, quote.price, quote.price, symbol).run()
  }

  return { updated, failed, quotes }
}
