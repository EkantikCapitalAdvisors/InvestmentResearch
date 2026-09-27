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

---

# SPY option equivalent to a 100% long-market position

Run: `python3 analysis/spy_option_equivalent.py` (needs the cached chain JSON in
`analysis/.cache`, or re-fetch — see the module docstring).

## The question

A 100% long-market position, with the move expected to complete inside one week.
What is the equivalent SPY option on position size, time frame and delta?

## Inputs (2026-09-25 close, live chain)

SPY $771.35 · ATM IV 12.8% · VIX 14.87 · VIX9D 12.76. Volatility is cheap, which
is the single most important fact for this trade.

## Answer

**SPY 2026-10-16 765 call, 2 contracts, ~$2,747.**

| | |
|---|---|
| position delta | 125 share-equivalents vs 129.6 needed (−4%) |
| premium | $2,747 — 2.7% of equity, against $100,000 for the stock |
| max loss | $2,747, hard floor |
| theta | $58/day, $288 over the 5-day window |
| tenor | 21 DTE against a 5-day thesis — 4.2x buffer |
| breakeven | +0.04% SPY |
| at +2% SPY in 5 days | +$2,258, or 113% of the stock's +$2,000 |
| quote | 13.67 / 13.80, OI 7,191 |

## How each axis was matched

**Size — match delta, not dollars.** $100,000 of SPY is 129.6 shares, so the
option position needs 129.6 share-equivalents of delta. At 0.63 delta that is
2.07 contracts, which rounds to 2. Rounding is unavoidable and here costs 4%
of the intended exposure.

**Time frame — buy 3-4x the thesis window, not the window itself.** A 1-week
expiry on a 1-week thesis has no margin for the move arriving late. 21 DTE costs
$288 of theta over the week and leaves the position alive if the move slips.
The scenario grid prices that slippage directly: a +2% move pays $2,355 on day 3,
$2,258 on day 5, $2,111 on day 8, still $1,608 at expiry.

**Delta — 0.60-0.70 is the band.** Below 0.55 the position under-delivers on the
move (770C tracks at 102%, 775C at 89%). Above 0.77 the premium jumps without
improving tracking, and quoted IV on those strikes is unreliable.

## Why deep in-the-money was rejected

Yahoo's quoted IV on deep ITM calls comes back at 20-30% against a 12.8% ATM.
Those strikes barely trade, so the mid is not a real price. Strike selection is
therefore filtered on open interest (>=3,000) and quoted spread (<=2%) first,
with delta read off what survives.

## The asymmetry

| if the thesis is wrong | option | stock | option better by |
|---|---|---|---|
| flat for a week | −$44 | $0 | −$44 |
| down 2% | −$1,598 | −$2,000 | $402 |
| down 5% | −$2,572 | −$5,000 | $2,428 |
| down 10% | −$2,746 | −$10,000 | $7,254 |

Being flat for a week costs $44. That is the whole price of the optionality.

## Note on the heat cap

$2,747 of premium is 2.7% of equity, inside the 6% options risk cap. A 100%
notional market long expressed as stock cannot fit the cap at all; expressed
this way it uses under half of it. Leaning on the full 6% cap would be ~4
contracts, which is ~193% market exposure — a different trade, sized
deliberately rather than by accident.

## Contract choice

SPY, not SPX. At $100k notional SPX would be 0.13 contracts — unusable
granularity. SPX's 60/40 tax treatment and cash settlement only start to matter
several hundred thousand dollars up; XSP (mini-SPX) is the middle option if the
tax treatment is worth chasing.
