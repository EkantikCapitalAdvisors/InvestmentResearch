# LEAPS vs stock — non-market single names

Run: `python3 analysis/leaps_vs_stock.py` (add `--no-fetch` to reuse cached prices).

## The question

For the non-market single names in the book (CRWD, PLTR, and SPCX as a
hypothetical), what would performance look like if each position had been
expressed as a LEAPS call instead of stock?

## Substitution spec

- ~15-month expiry, ~0.75 delta call (struck 84–94% of spot)
- premium budget sized so the LEAPS max loss equals the stock position's loss
  at its stop — **same dollar risk, not same notional**
- Black-Scholes pricing, 3.75% short rate, entry IV proxied by trailing
  6-month realised volatility

## Data caveat — read this first

The research portal's `portfolio_positions` rows are still the **demo seed**.
Its recorded prices do not match the tape on the dates it records:

| | portal entry | real close that day |
|---|---|---|
| CRWD 2026-01-20 | $380.00 | $110.68 |
| PLTR 2026-02-01 | $98.00 | $147.76 |
| NVDA 2025-11-15 | $118.50 | $186.60 |

Its `current_price` column was last refreshed 2026-03-11, six months stale.
So this model takes the **trade structure** from the portal (tickers, entry
dates, sizes, stops) and every **price** from Yahoo. The numbers below are what
LEAPS would have done on those tickers and dates at real prices — not a
reconstruction of actual fills. Re-point `BOOK` at real fills for real answers.

SPCX was never entered (gated to 12/8 in the research record); it is modelled
from its first post-IPO close, and its volatility estimate is look-ahead
because no pre-entry history exists.

## Findings

**1. Same dollar risk means the stock leg wins on dollars.** The LEAPS premium
is only 11–25% of the stock notional, so the LEAPS leg carries roughly a ninth
of the capital. On the non-market sleeve it earned +172% on capital deployed
against the stock's +49% — and still made $1,265 *less* in dollars. Even CRWD,
up 125%, made $953 less as a LEAPS than as stock.

**2. The crossover is a downside threshold, not an upside one.** For every name
the two legs pay identically somewhere between −2.5% and −10% spot. Below that
the LEAPS leg is ahead; above it the stock leg is. LEAPS do not win these trades
by going up — they win by not going down.

**3. IV is the tax, and it is highest on exactly these names.** Premium as a
share of spot: MSFT 13.6%, CRWD 24.8%, PLTR 30.3%, SPCX 43.7%. Spot has to move
+5% to +8% just to cover premium and decay. The LEAPS expression is structurally
most expensive on the high-volatility non-market names.

**4. The real case for LEAPS is the downside, and it is a good one.** At the
stop, the LEAPS leg loses 40–60% less than the stock, because 5–12 months of
time value survives. Every name in the book is better off on the downside.

**5. It only breaks even if the freed capital works.** The substitution frees
$31,449 across the book. Idle, LEAPS trail by $4,304. At the cash rate, $3,453.
Parked in SPY, $220 — and on the mega-caps the LEAPS book actually wins by $377.

**6. It is not implementable at $100k.** Contracts come in 100-share lots. One
contract costs 4.6x (NVDA, CRWD) to 30x (META) the position's entire risk
budget. Same-dollar-risk LEAPS sizing needs roughly $500k–1M of equity before
the granularity stops dominating.
