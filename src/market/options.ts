// ============================================================
// OPTIONS CHAIN + SIZING
// Delta-matched option sizing for a directional stock position.
//
// The rule is match delta, not dollars: a position worth `equity * exposure`
// holds `equity * exposure / spot` shares, and an option position replicates it
// when its total delta equals that share count.
//
// Yahoo publishes no greeks, so delta and theta are Black-Scholes on each
// strike's own quoted IV. Yahoo's IV on deep in-the-money calls is unreliable
// (those strikes barely trade, so the mid is not a real price, and the implied
// vols come back far above the at-the-money), which is why candidates are
// filtered on open interest and quoted spread BEFORE delta is considered.
// ============================================================

import { getYahooCrumb, UA } from './yahoo'

export interface ChainRow {
  strike: number
  bid: number
  ask: number
  mid: number
  iv: number
  openInterest: number
  volume: number
  spreadPct: number
}

export interface ChainExpiry {
  expiry: string        // YYYY-MM-DD
  dte: number
  calls: ChainRow[]
}

// ── Black-Scholes ────────────────────────────────────────────
function normCdf(x: number): number {
  // Abramowitz & Stegun 7.1.26 on erf
  const sign = x < 0 ? -1 : 1
  const z = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * z)
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t
    - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z)
  return 0.5 * (1 + sign * erf)
}

function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

export interface Greeks { price: number; delta: number; thetaPerDay: number; gamma: number }

export function bsCall(spot: number, strike: number, years: number, rate: number, vol: number): Greeks {
  if (years <= 0 || vol <= 0) {
    return { price: Math.max(spot - strike, 0), delta: spot > strike ? 1 : 0, thetaPerDay: 0, gamma: 0 }
  }
  const v = vol * Math.sqrt(years)
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * vol * vol) * years) / v
  const d2 = d1 - v
  const disc = Math.exp(-rate * years)
  return {
    price: spot * normCdf(d1) - strike * disc * normCdf(d2),
    delta: normCdf(d1),
    thetaPerDay: (-spot * normPdf(d1) * vol / (2 * Math.sqrt(years))
      - rate * strike * disc * normCdf(d2)) / 365,
    gamma: normPdf(d1) / (spot * v),
  }
}

// ── Chain fetch ──────────────────────────────────────────────
const OPTIONS_BASE = 'https://query2.finance.yahoo.com/v7/finance/options'

async function fetchChainPage(symbol: string, date?: number) {
  const auth = await getYahooCrumb()
  if (!auth) return null
  const url = new URL(`${OPTIONS_BASE}/${encodeURIComponent(symbol)}`)
  url.searchParams.set('crumb', auth.crumb)
  if (date) url.searchParams.set('date', String(date))
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': UA, Cookie: auth.cookie },
  })
  if (!res.ok) return null
  const data = await res.json() as any
  return data?.optionChain?.result?.[0] ?? null
}

function toRows(calls: any[]): ChainRow[] {
  const out: ChainRow[] = []
  for (const c of calls ?? []) {
    const bid = c.bid ?? 0, ask = c.ask ?? 0, iv = c.impliedVolatility
    if (!iv || bid <= 0 || ask <= 0) continue
    const mid = (bid + ask) / 2
    out.push({
      strike: c.strike, bid, ask, mid, iv,
      openInterest: c.openInterest ?? 0,
      volume: c.volume ?? 0,
      spreadPct: (ask - bid) / mid,
    })
  }
  return out.sort((a, b) => a.strike - b.strike)
}

function isoDay(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toISOString().slice(0, 10)
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000)
}

export interface ChainFetch {
  symbol: string
  spot: number
  asof: string
  expiries: ChainExpiry[]
}

/** Fetch the chain for every expiry inside [minDte, maxDte]. */
export async function fetchChain(
  symbol: string, minDte: number, maxDte: number,
): Promise<ChainFetch | null> {
  const root = await fetchChainPage(symbol)
  if (!root) return null
  const spot = root.quote?.regularMarketPrice
  if (!spot) return null

  const asof = isoDay(root.quote?.regularMarketTime ?? Math.floor(Date.now() / 1000))
  const wanted = (root.expirationDates ?? []).filter((e: number) => {
    const d = daysBetween(asof, isoDay(e))
    return d >= minDte && d <= maxDte
  })

  const expiries: ChainExpiry[] = []
  for (const epoch of wanted) {
    // The root response already carries one expiry's contracts; reuse it when
    // it is the one we want rather than paying for a second round trip.
    const page = root.options?.[0]?.expirationDate === epoch
      ? root.options[0]
      : (await fetchChainPage(symbol, epoch))?.options?.[0]
    if (!page) continue
    const expiry = isoDay(page.expirationDate)
    expiries.push({ expiry, dte: daysBetween(asof, expiry), calls: toRows(page.calls) })
  }
  if (!expiries.length) return null
  return { symbol, spot, asof, expiries: expiries.sort((a, b) => a.dte - b.dte) }
}

// ── Sizing ───────────────────────────────────────────────────
export interface SizingInput {
  symbol: string
  equity: number
  exposure: number      // 1.0 == a 100% position
  windowDays: number    // how long the thesis needs
  rate?: number
  minOpenInterest?: number
  maxSpreadPct?: number
  minDelta?: number
  maxDelta?: number
}

export interface Candidate {
  expiry: string
  dte: number
  strike: number
  iv: number
  mid: number
  bid: number
  ask: number
  openInterest: number
  spreadPct: number
  delta: number
  contractsExact: number
  contracts: number
  positionDelta: number
  deltaErrorPct: number      // signed miss against the share count, from rounding
  premium: number
  premiumPctEquity: number
  thetaWindow: number        // dollars of decay across the thesis window
  breakevenMove: number | null
  pnlAtMove: Record<string, number>
  trackingAt2Pct: number     // option P&L as a share of the stock's on a +2% move
}

export interface SizingResult {
  symbol: string
  spot: number
  asof: string
  notional: number
  shares: number
  deltaNeeded: number
  windowDays: number
  scenarioMoves: number[]
  candidates: Candidate[]
  recommended: Candidate | null
  rejectedIlliquid: number
}

const CONTRACT = 100
const MOVES = [-0.02, -0.01, 0, 0.005, 0.01, 0.02, 0.03]

function valueAfter(
  c: { strike: number; iv: number; contracts: number }, spot: number,
  dte: number, move: number, days: number, rate: number,
): number {
  const years = Math.max((dte - days) / 365, 1e-9)
  return c.contracts * bsCall(spot * (1 + move), c.strike, years, rate, c.iv).price * CONTRACT
}

function solveBreakeven(
  c: { strike: number; iv: number; contracts: number; premium: number },
  spot: number, dte: number, days: number, rate: number,
): number | null {
  const f = (m: number) => valueAfter(c, spot, dte, m, days, rate) - c.premium
  let lo = -0.10, hi = 0.15
  if (f(lo) * f(hi) > 0) return null
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid
  }
  return (lo + hi) / 2
}

export async function sizeOptionPosition(input: SizingInput): Promise<SizingResult | null> {
  const {
    symbol, equity, exposure, windowDays,
    rate = 0.0375, minOpenInterest = 3_000, maxSpreadPct = 0.02,
    minDelta = 0.40, maxDelta = 0.92,
  } = input

  // Tenor buffer: never the thesis window itself. Aim for 2-5x so a late move
  // still has time value to sell, and cap the search a little past that.
  const chain = await fetchChain(symbol, windowDays * 2, Math.max(windowDays * 6, 35))
  if (!chain) return null

  const notional = equity * exposure
  const shares = notional / chain.spot
  const candidates: Candidate[] = []
  let rejectedIlliquid = 0

  for (const exp of chain.expiries) {
    for (const row of exp.calls) {
      if (row.openInterest < minOpenInterest || row.spreadPct > maxSpreadPct) {
        rejectedIlliquid++
        continue
      }
      const years = exp.dte / 365
      const g = bsCall(chain.spot, row.strike, years, rate, row.iv)
      if (g.delta < minDelta || g.delta > maxDelta) continue

      const exact = shares / (g.delta * CONTRACT)
      const contracts = Math.max(1, Math.round(exact))
      const premium = contracts * row.mid * CONTRACT
      const positionDelta = g.delta * contracts * CONTRACT
      const shape = { strike: row.strike, iv: row.iv, contracts, premium }

      const pnlAtMove: Record<string, number> = {}
      for (const m of MOVES) {
        pnlAtMove[m.toFixed(3)] =
          valueAfter(shape, chain.spot, exp.dte, m, windowDays, rate) - premium
      }

      candidates.push({
        expiry: exp.expiry, dte: exp.dte, strike: row.strike, iv: row.iv,
        mid: row.mid, bid: row.bid, ask: row.ask,
        openInterest: row.openInterest, spreadPct: row.spreadPct,
        delta: g.delta, contractsExact: exact, contracts, positionDelta,
        deltaErrorPct: positionDelta / shares - 1,
        premium, premiumPctEquity: premium / equity,
        thetaWindow: g.thetaPerDay * contracts * CONTRACT * windowDays,
        breakevenMove: solveBreakeven(shape, chain.spot, exp.dte, windowDays, rate),
        pnlAtMove,
        trackingAt2Pct: pnlAtMove['0.020'] / (notional * 0.02),
      })
    }
  }

  // Prefer the tightest delta match; break ties toward the cheaper premium.
  const eligible = candidates.filter(c => c.delta >= 0.55 && c.delta <= 0.85)
  const pool = eligible.length ? eligible : candidates
  const recommended = pool.length
    ? pool.reduce((best, c) => {
        const d = Math.abs(c.deltaErrorPct) - Math.abs(best.deltaErrorPct)
        if (Math.abs(d) > 0.005) return d < 0 ? c : best
        return c.premium < best.premium ? c : best
      })
    : null

  candidates.sort((a, b) => a.dte - b.dte || a.strike - b.strike)

  return {
    symbol: chain.symbol, spot: chain.spot, asof: chain.asof,
    notional, shares, deltaNeeded: shares, windowDays,
    scenarioMoves: MOVES, candidates, recommended, rejectedIlliquid,
  }
}
