// ============================================================
// YAHOO FINANCE — Real-Time Price & Fundamental Data Fetcher
// v8 chart API for basic price (no auth needed)
// v7 quote API via crumb/cookie for rich data (market cap, P/E)
// ============================================================

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── Crumb / Cookie Management ────────────────────────────────
// Yahoo v7 quote requires a crumb + A3 cookie. Cached per-request lifetime.
let _cachedCrumb: string | null = null
let _cachedCookie: string | null = null
let _crumbExpiry = 0

async function getYahooCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  // Cache for 25 minutes (crumbs last ~30 min)
  if (_cachedCrumb && _cachedCookie && Date.now() < _crumbExpiry) {
    return { crumb: _cachedCrumb, cookie: _cachedCookie }
  }

  try {
    // Step 1: Hit fc.yahoo.com to get A3 cookie
    const cookieRes = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA },
      redirect: 'manual', // Don't follow redirects
    })
    // Extract Set-Cookie header — we need the A3 cookie
    const setCookieHeader = cookieRes.headers.get('set-cookie') || ''
    const a3Match = setCookieHeader.match(/A3=([^;]+)/)
    if (!a3Match) {
      console.error('Yahoo crumb: no A3 cookie returned')
      return null
    }
    const cookie = `A3=${a3Match[1]}`

    // Step 2: Use A3 cookie to fetch crumb
    const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: {
        'User-Agent': UA,
        'Cookie': cookie,
      },
    })
    if (!crumbRes.ok) {
      console.error('Yahoo crumb: getcrumb failed', crumbRes.status)
      return null
    }
    const crumb = await crumbRes.text()
    if (!crumb || crumb.length < 5 || crumb.includes('<')) {
      console.error('Yahoo crumb: invalid crumb response')
      return null
    }

    _cachedCrumb = crumb
    _cachedCookie = cookie
    _crumbExpiry = Date.now() + 25 * 60 * 1000 // 25 minutes
    return { crumb, cookie }
  } catch (e) {
    console.error('Yahoo crumb fetch failed:', e)
    return null
  }
}

// ── V7 Rich Quote (market cap, P/E, etc.) ────────────────────
export interface YahooRichQuote {
  symbol: string
  shortName: string
  longName: string
  price: number
  previousClose: number
  changePercent: number
  marketCap: number
  forwardPE: number | null
  trailingPE: number | null
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  marketState: string
  currency: string
}

async function fetchV7Quotes(symbols: string[]): Promise<YahooRichQuote[]> {
  const auth = await getYahooCrumb()
  if (!auth) return []

  try {
    const symbolStr = symbols.map(s => encodeURIComponent(s)).join(',')
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}&crumb=${encodeURIComponent(auth.crumb)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Cookie': auth.cookie,
      },
    })
    if (!res.ok) {
      console.error('Yahoo v7 quote failed:', res.status)
      // Invalidate crumb cache on auth failure
      if (res.status === 401) {
        _cachedCrumb = null
        _cachedCookie = null
        _crumbExpiry = 0
      }
      return []
    }

    const data: any = await res.json()
    const quotes = data?.quoteResponse?.result
    if (!quotes || !Array.isArray(quotes)) return []

    return quotes.map((q: any) => ({
      symbol: q.symbol,
      shortName: q.shortName || q.symbol,
      longName: q.longName || q.shortName || q.symbol,
      price: q.regularMarketPrice || 0,
      previousClose: q.regularMarketPreviousClose || q.previousClose || 0,
      changePercent: q.regularMarketChangePercent ? Math.round(q.regularMarketChangePercent * 100) / 100 : 0,
      marketCap: q.marketCap || 0,
      forwardPE: q.forwardPE || null,
      trailingPE: q.trailingPE || null,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow || 0,
      marketState: q.marketState || 'CLOSED',
      currency: q.currency || 'USD',
    }))
  } catch (e) {
    console.error('Yahoo v7 quotes fetch failed:', e)
    return []
  }
}

// ── V8 Chart Fallback (always works, no auth) ────────────────
export interface YahooQuote {
  symbol: string
  price: number
  previousClose: number
  changePercent: number
  currency: string
  marketState: string
  timestamp: number
}

export async function fetchQuote(symbol: string): Promise<YahooQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA }
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
    console.error(`Yahoo v8 fetch failed for ${symbol}:`, e)
    return null
  }
}

async function fetchV8Quotes(symbols: string[]): Promise<YahooQuote[]> {
  const results = await Promise.allSettled(symbols.map(s => fetchQuote(s)))
  return results
    .filter((r): r is PromiseFulfilledResult<YahooQuote | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((q): q is YahooQuote => q !== null)
}

// ── Rich Ticker Profile (for adding new tickers) ─────────────
export interface YahooProfile {
  symbol: string
  shortName: string
  longName: string
  sector: string
  industry: string
  marketCap: number
  price: number
  previousClose: number
  changePercent: number
  forwardPE: number | null
  currency: string
}

export async function fetchTickerProfile(symbol: string): Promise<YahooProfile | null> {
  // Try v7 rich quote first (has market cap, P/E)
  const richQuotes = await fetchV7Quotes([symbol])
  if (richQuotes.length > 0) {
    const q = richQuotes[0]
    return {
      symbol: q.symbol,
      shortName: q.shortName,
      longName: q.longName,
      sector: '',  // v7 quote doesn't have sector
      industry: '',
      marketCap: q.marketCap,
      price: q.price,
      previousClose: q.previousClose,
      changePercent: q.changePercent,
      forwardPE: q.forwardPE,
      currency: q.currency,
    }
  }

  // Fall back to v8 chart (always works but no market cap/PE)
  const chart = await fetchQuote(symbol)
  if (!chart) return null

  // Get chart meta for name
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    const data: any = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    return {
      symbol: chart.symbol,
      shortName: meta?.shortName || chart.symbol,
      longName: meta?.longName || meta?.shortName || chart.symbol,
      sector: '',
      industry: '',
      marketCap: 0,
      price: chart.price,
      previousClose: chart.previousClose,
      changePercent: chart.changePercent,
      forwardPE: null,
      currency: chart.currency,
    }
  } catch {
    return null
  }
}

// ── Update D1 tickers with live prices + fundamentals ────────
export async function refreshPrices(db: D1Database): Promise<{
  updated: number
  failed: string[]
  quotes: YahooQuote[]
}> {
  const { results: tickers } = await db.prepare(
    'SELECT id, symbol FROM tickers WHERE is_watchlist = 1'
  ).all()

  if (!tickers || tickers.length === 0) {
    return { updated: 0, failed: [], quotes: [] }
  }

  const symbols = (tickers as any[]).map(t => t.symbol)

  // Try v7 rich quotes first (batch, includes market cap + P/E)
  const richQuotes = await fetchV7Quotes(symbols)
  const richMap = new Map<string, YahooRichQuote>()
  for (const q of richQuotes) richMap.set(q.symbol, q)

  // Fall back to v8 chart for any tickers v7 missed
  const missingSymbols = symbols.filter(s => !richMap.has(s))
  const v8Quotes = missingSymbols.length > 0 ? await fetchV8Quotes(missingSymbols) : []
  const v8Map = new Map<string, YahooQuote>()
  for (const q of v8Quotes) v8Map.set(q.symbol, q)

  let updated = 0
  const failed: string[] = []
  const allQuotes: YahooQuote[] = []

  for (const ticker of tickers as any[]) {
    const rich = richMap.get(ticker.symbol)
    const basic = v8Map.get(ticker.symbol)

    if (rich) {
      // Full update with market cap + P/E
      await db.prepare(`
        UPDATE tickers SET 
          last_price = ?,
          price_change_pct = ?,
          market_cap = CASE WHEN ? > 0 THEN ? ELSE market_cap END,
          forward_pe = CASE WHEN ? IS NOT NULL THEN ? ELSE forward_pe END,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        rich.price, rich.changePercent,
        rich.marketCap, rich.marketCap,
        rich.forwardPE, rich.forwardPE,
        ticker.id
      ).run()
      updated++
      allQuotes.push({
        symbol: rich.symbol,
        price: rich.price,
        previousClose: rich.previousClose,
        changePercent: rich.changePercent,
        currency: rich.currency,
        marketState: rich.marketState,
        timestamp: Date.now(),
      })
    } else if (basic) {
      // Basic price-only update
      await db.prepare(`
        UPDATE tickers SET 
          last_price = ?,
          price_change_pct = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(basic.price, basic.changePercent, ticker.id).run()
      updated++
      allQuotes.push(basic)
    } else {
      failed.push(ticker.symbol)
    }
  }

  // Update portfolio positions with fresh prices
  const priceMap = new Map<string, number>()
  for (const q of richQuotes) priceMap.set(q.symbol, q.price)
  for (const q of v8Quotes) if (!priceMap.has(q.symbol)) priceMap.set(q.symbol, q.price)

  for (const [symbol, price] of priceMap) {
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
    `).bind(price, price, price, symbol).run()
  }

  return { updated, failed, quotes: allQuotes }
}
