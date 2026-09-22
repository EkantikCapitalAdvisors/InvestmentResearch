#!/usr/bin/env python3
"""LEAPS-vs-stock counterfactual for the model portfolio.

Question: for the non-market single names in the book (CRWD, SPCX, PLTR),
what would performance look like if the position had been expressed as a LEAPS
call instead of stock?

Substitution spec:
  - ~15-month expiry, ~0.75 delta call (slightly in the money)
  - premium budget sized so the LEAPS max loss equals the stock position's
    loss at its stop -- same dollar risk, not same notional

Trade list (ticker, entry date, size, stop) comes from the research portal's
portfolio_positions table. Prices, however, are taken from Yahoo rather than
the portal: the portal's recorded entry and current prices do not match the
real tape for those tickers and dates (see NOTES at the bottom), so the portal
is used only for the trade structure.

Options are priced Black-Scholes. Entry IV is proxied by trailing 6-month
realised close-to-close volatility, which is the single largest assumption in
the model -- stage 2 reprices both legs at +/-10 vol points.

Usage:
    python3 analysis/leaps_vs_stock.py            # fetches prices, prints all stages
    python3 analysis/leaps_vs_stock.py --no-fetch # reuse cached JSON in --cache
"""
from __future__ import annotations

import argparse
import datetime
import json
import math
import os
import urllib.request

EQUITY       = 100_000.0
RATE         = 0.0375        # short rate; Fed at 3.50-3.75% in this tape
TENOR        = 15.0 / 12.0   # 15-month LEAPS
TARGET_DELTA = 0.75
CONTRACT     = 100           # shares per option contract

# ticker -> (entry date, size %, stop %, group)
#
# size/stop for the four mega-caps are the portal's own recorded values.
# CRWD and PLTR are booked in the portal as short-dated options with a 100%
# stop, so they take the -20% single-name stock stop convention instead.
# SPCX was never entered (gated to 12/8 in the research record) and is modelled
# from its first post-IPO close as a hypothetical.
BOOK = {
    "NVDA": ("2025-11-15", 8.0, 11.4, "market"),
    "MSFT": ("2025-12-01", 7.0,  6.5, "market"),
    "AMZN": ("2025-12-15", 6.0,  8.3, "market"),
    "META": ("2026-01-10", 6.0,  8.1, "market"),
    "CRWD": ("2026-01-20", 3.0, 20.0, "non-market"),
    "PLTR": ("2026-02-01", 2.5, 20.0, "non-market"),
    "SPCX": ("2026-06-12", 3.0, 20.0, "non-market"),
}
BENCHMARK = "SPY"


# --------------------------------------------------------------- price data
def fetch(symbol: str, cache: str, use_network: bool) -> str:
    path = os.path.join(cache, f"hist_{symbol}.json")
    if os.path.exists(path) and not use_network:
        return path
    if not use_network and not os.path.exists(path):
        raise SystemExit(f"no cached data for {symbol}; drop --no-fetch")
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
           "?interval=1d&range=2y")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read()
    os.makedirs(cache, exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(body)
    return path


def series(symbol: str, cache: str, use_network: bool) -> dict:
    with open(fetch(symbol, cache, use_network)) as fh:
        node = json.load(fh)["chart"]["result"][0]
    closes = node["indicators"]["quote"][0]["close"]
    out = {}
    for stamp, price in zip(node["timestamp"], closes):
        if price:
            out[datetime.datetime.utcfromtimestamp(stamp).date()] = price
    return dict(sorted(out.items()))


def on_or_after(ser: dict, day: datetime.date):
    later = [k for k in ser if k >= day]
    return (later[0], ser[later[0]]) if later else (None, None)


def years(a: datetime.date, b: datetime.date) -> float:
    return (b - a).days / 365.25


# ------------------------------------------------------------ option pricing
def norm_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def bs_call(spot: float, strike: float, t: float, rate: float, vol: float):
    """Black-Scholes call value and delta."""
    if t <= 0:
        return max(spot - strike, 0.0), (1.0 if spot > strike else 0.0)
    v = vol * math.sqrt(t)
    d1 = (math.log(spot / strike) + (rate + 0.5 * vol * vol) * t) / v
    return (spot * norm_cdf(d1) - strike * math.exp(-rate * t) * norm_cdf(d1 - v),
            norm_cdf(d1))


def strike_for_delta(spot, t, rate, vol, target):
    """Bisect on moneyness until delta hits the target. Lower strike -> higher
    delta, so the branch below walks the low end up."""
    lo, hi = 0.20, 3.00
    for _ in range(200):
        mid = (lo + hi) / 2
        if bs_call(spot, spot * mid, t, rate, vol)[1] > target:
            lo = mid
        else:
            hi = mid
    return spot * (lo + hi) / 2


def realised_vol(ser: dict, asof: datetime.date, lookback: int = 126):
    """Annualised close-to-close vol over `lookback` sessions before `asof`.
    Falls back to the forward window when there is no pre-entry history, which
    is the case for SPCX -- it is entered at its own IPO close, so its vol
    estimate is look-ahead and flagged as such."""
    keys = [k for k in ser if k <= asof]
    forward = len(keys) < 30
    if forward:
        keys = list(ser)
    window = keys[:lookback] if forward else keys[-lookback:]
    rets = [math.log(ser[window[i]] / ser[window[i - 1]])
            for i in range(1, len(window))]
    mean = sum(rets) / len(rets)
    var = sum((x - mean) ** 2 for x in rets) / (len(rets) - 1)
    return math.sqrt(var * 252), forward, len(window)


# ------------------------------------------------------------------ the model
def build(cache: str, use_network: bool) -> list[dict]:
    rows = []
    for symbol, (entry, size_pct, stop_pct, group) in BOOK.items():
        ser = series(symbol, cache, use_network)
        fill_day, spot0 = on_or_after(ser, datetime.date.fromisoformat(entry))
        last_day = max(ser)
        spot1 = ser[last_day]

        vol, look_ahead, vol_n = realised_vol(ser, fill_day)
        remaining = max(TENOR - years(fill_day, last_day), 0.0)

        # stock leg
        notional = EQUITY * size_pct / 100.0
        shares = notional / spot0
        risk_usd = notional * stop_pct / 100.0
        stock_pnl = shares * (spot1 - spot0)

        # LEAPS leg, premium budget == the stock leg's loss at its stop
        strike = strike_for_delta(spot0, TENOR, RATE, vol, TARGET_DELTA)
        prem0, delta0 = bs_call(spot0, strike, TENOR, RATE, vol)
        prem1, delta1 = bs_call(spot1, strike, remaining, RATE, vol)
        contracts = risk_usd / (prem0 * CONTRACT)
        cost = contracts * prem0 * CONTRACT
        value = contracts * prem1 * CONTRACT

        rows.append(dict(
            sym=symbol, group=group, fill=fill_day, last=last_day,
            spot0=spot0, spot1=spot1, move=spot1 / spot0 - 1,
            size_pct=size_pct, stop_pct=stop_pct, notional=notional,
            risk_usd=risk_usd, stock_pnl=stock_pnl,
            vol=vol, vol_look_ahead=look_ahead, vol_n=vol_n,
            strike=strike, moneyness=strike / spot0, prem0=prem0, prem1=prem1,
            delta0=delta0, delta1=delta1, remaining=remaining,
            contracts=contracts, leaps_cost=cost, leaps_value=value,
            leaps_pnl=value - cost, cap_freed=notional - cost,
        ))
    return rows


def leaps_pnl_at(row: dict, move: float) -> float:
    price, _ = bs_call(row["spot0"] * (1 + move), row["strike"],
                       row["remaining"], RATE, row["vol"])
    return row["contracts"] * price * CONTRACT - row["leaps_cost"]


def stock_pnl_at(row: dict, move: float) -> float:
    return row["notional"] * move


def bisect(row, fn, lo=-0.60, hi=4.00):
    if fn(row, lo) * fn(row, hi) > 0:
        return None
    for _ in range(300):
        mid = (lo + hi) / 2
        if fn(row, lo) * fn(row, mid) <= 0:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2


# -------------------------------------------------------------------- output
def money(x: float) -> str:
    return f"{'-' if x < 0 else ''}${abs(x):,.0f}"


def report(rows: list[dict], cache: str, use_network: bool) -> None:
    print("=" * 96)
    print("LEAPS SUBSTITUTION SPEC   15mo tenor | ~0.75 delta at entry | premium = stock stop risk")
    print("=" * 96)
    print(f"{'SYM':5} {'fill':11} {'spot':>8} {'IV':>7} {'strike':>8} {'K/S':>6} "
          f"{'premium':>8} {'delta':>6} {'contracts':>10} {'mo left':>8}")
    for r in rows:
        flag = "*" if r["vol_look_ahead"] else " "
        print(f"{r['sym']:5} {str(r['fill']):11} {r['spot0']:8.2f} "
              f"{r['vol'] * 100:6.1f}%{flag} {r['strike']:8.2f} "
              f"{r['moneyness'] * 100:5.0f}% {r['prem0']:8.2f} {r['delta0']:6.2f} "
              f"{r['contracts']:10.2f} {r['remaining'] * 12:8.1f}")
    if any(r["vol_look_ahead"] for r in rows):
        print("  * vol estimated from post-entry data (no prior history) -- look-ahead")

    print()
    print("=" * 96)
    print(f"STAGE 1  STOCK vs LEAPS -- realised P&L to {rows[0]['last']}")
    print("=" * 96)
    print(f"{'SYM':5} {'group':11} {'move':>8} | {'notional':>9} {'stk P&L':>9} {'stk %':>8} | "
          f"{'premium':>8} {'lps P&L':>9} {'lps %':>9} | {'difference':>11}")
    for r in sorted(rows, key=lambda x: (x["group"], x["sym"])):
        print(f"{r['sym']:5} {r['group']:11} {r['move'] * 100:7.1f}% | "
              f"{money(r['notional']):>9} {money(r['stock_pnl']):>9} "
              f"{r['stock_pnl'] / r['notional'] * 100:7.1f}% | "
              f"{money(r['leaps_cost']):>8} {money(r['leaps_pnl']):>9} "
              f"{r['leaps_pnl'] / r['leaps_cost'] * 100:8.1f}% | "
              f"{money(r['leaps_pnl'] - r['stock_pnl']):>11}")

    print()
    for group in ("non-market", "market", None):
        sub = [r for r in rows if group is None or r["group"] == group]
        label = group or "whole book"
        stk = sum(r["stock_pnl"] for r in sub)
        lps = sum(r["leaps_pnl"] for r in sub)
        notl = sum(r["notional"] for r in sub)
        cost = sum(r["leaps_cost"] for r in sub)
        print(f"  {label.upper():12} stock {money(stk):>8} on {money(notl):>8} "
              f"({stk / notl * 100:+6.1f}%)   LEAPS {money(lps):>8} on {money(cost):>7} "
              f"({lps / cost * 100:+7.1f}%)   difference {money(lps - stk):>8}")

    print()
    print("=" * 96)
    print("STAGE 2  IV SENSITIVITY -- entry IV is the dominant assumption")
    print("=" * 96)
    print(f"{'SYM':5} {'base IV':>8} | {'LEAPS P&L @ -10v':>17} {'@ base':>10} "
          f"{'@ +10v':>10} | {'stock P&L':>10}")
    for r in sorted(rows, key=lambda x: (x["group"], x["sym"])):
        out = []
        for bump in (-0.10, 0.0, 0.10):
            vol = max(r["vol"] + bump, 0.05)
            strike = strike_for_delta(r["spot0"], TENOR, RATE, vol, TARGET_DELTA)
            p0, _ = bs_call(r["spot0"], strike, TENOR, RATE, vol)
            p1, _ = bs_call(r["spot1"], strike, r["remaining"], RATE, vol)
            out.append((r["risk_usd"] / (p0 * CONTRACT)) * CONTRACT * (p1 - p0))
        print(f"{r['sym']:5} {r['vol'] * 100:7.1f}% | {money(out[0]):>17} "
              f"{money(out[1]):>10} {money(out[2]):>10} | {money(r['stock_pnl']):>10}")

    print()
    print("=" * 96)
    print("STAGE 3  FREED CAPITAL -- the LEAPS premium is a fraction of the stock notional")
    print("=" * 96)
    bench = None
    try:
        bench = series(BENCHMARK, cache, use_network)
    except Exception as exc:                      # benchmark is optional
        print(f"  ({BENCHMARK} unavailable: {exc})")
    for group in ("non-market", "market", None):
        sub = [r for r in rows if group is None or r["group"] == group]
        label = group or "whole book"
        stk = sum(r["stock_pnl"] for r in sub)
        lps = sum(r["leaps_pnl"] for r in sub)
        freed = sum(r["cap_freed"] for r in sub)
        cash = sum(r["cap_freed"] * ((1 + RATE) ** years(r["fill"], r["last"]) - 1)
                   for r in sub)
        print(f"\n  {label.upper()}   freed capital {money(freed)}")
        print(f"    {'stock, fully invested':40} {money(stk):>9}")
        print(f"    {'LEAPS, freed capital idle':40} {money(lps):>9}"
              f"   ({money(lps - stk)} vs stock)")
        print(f"    {'LEAPS + freed capital at cash rate':40} {money(lps + cash):>9}"
              f"   ({money(lps + cash - stk)} vs stock)")
        if bench:
            ride = 0.0
            for r in sub:
                _, entry_px = on_or_after(bench, r["fill"])
                ride += r["cap_freed"] * (bench[max(bench)] / entry_px - 1)
            print(f"    {'LEAPS + freed capital in ' + BENCHMARK:40} "
                  f"{money(lps + ride):>9}   ({money(lps + ride - stk)} vs stock)")

    print()
    print("=" * 96)
    print("STAGE 4  DOWNSIDE -- what each leg loses if the stock hits its stop today")
    print("=" * 96)
    print(f"{'SYM':5} {'stop':>7} {'stock loss':>12} {'LEAPS value':>13} "
          f"{'LEAPS loss':>12} {'LEAPS better by':>16}")
    for r in sorted(rows, key=lambda x: (x["group"], x["sym"])):
        price, _ = bs_call(r["spot0"] * (1 - r["stop_pct"] / 100), r["strike"],
                           r["remaining"], RATE, r["vol"])
        value = r["contracts"] * price * CONTRACT
        loss = r["leaps_cost"] - value
        print(f"{r['sym']:5} {-r['stop_pct']:6.1f}% {money(-r['risk_usd']):>12} "
              f"{money(value):>13} {money(-loss):>12} {money(r['risk_usd'] - loss):>16}")

    print()
    print("=" * 96)
    print("STAGE 5  BREAKEVENS -- below the crossover the LEAPS leg is ahead, above it the stock leg is")
    print("=" * 96)
    print(f"{'SYM':5} {'group':11} {'IV':>7} {'premium/spot':>13} | "
          f"{'LEAPS P&L=0':>12} {'legs equal':>11} | {'actual':>8} {'winner':>8}")
    mismatches = 0
    for r in sorted(rows, key=lambda x: (x["group"], x["sym"])):
        zero = bisect(r, leaps_pnl_at)
        cross = bisect(r, lambda row, mv: leaps_pnl_at(row, mv) - stock_pnl_at(row, mv))
        winner = "LEAPS" if (cross is not None and r["move"] < cross) else "stock"
        if (r["leaps_pnl"] - r["stock_pnl"] > 0) != (winner == "LEAPS"):
            mismatches += 1
        print(f"{r['sym']:5} {r['group']:11} {r['vol'] * 100:6.1f}% "
              f"{r['prem0'] / r['spot0'] * 100:12.1f}% | "
              f"{(f'{zero * 100:+.1f}%' if zero is not None else 'n/a'):>12} "
              f"{(f'{cross * 100:+.1f}%' if cross is not None else 'never'):>11} | "
              f"{r['move'] * 100:7.1f}% {winner:>8}")
    print(f"\n  cross-check against stage 1: {mismatches} mismatch(es)")


    print()
    print("=" * 96)
    print("STAGE 6  FEASIBILITY -- options trade in 100-share contracts, so sizing is lumpy")
    print("=" * 96)
    print(f"{'SYM':5} {'contracts needed':>17} {'rounded':>8} {'1 contract costs':>17} "
          f"{'risk budget':>12} {'implementable':>26}")
    for r in sorted(rows, key=lambda x: (x["group"], x["sym"])):
        one = r["prem0"] * CONTRACT
        verdict = ("yes" if r["contracts"] >= 1
                   else f"no -- 1 contract = {one / r['risk_usd']:.1f}x budget")
        print(f"{r['sym']:5} {r['contracts']:17.2f} {round(r['contracts']):8d} "
              f"{money(one):>17} {money(r['risk_usd']):>12} {verdict:>26}")


# NOTES
# The research portal's portfolio_positions rows are still the demo seed. Its
# recorded prices do not match the tape on the dates it records, e.g. it has
# CRWD entered at $380.00 on 2026-01-20 against a real close of $110.68, and
# its current_price column was last refreshed 2026-03-11. The trade structure
# (tickers, dates, sizes, stops) is therefore used, but every price in this
# model comes from Yahoo. Re-point BOOK at real fills to get real answers.

def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--cache", default=os.path.join(os.path.dirname(__file__), ".cache"))
    ap.add_argument("--no-fetch", action="store_true", help="reuse cached price JSON")
    args = ap.parse_args()
    use_network = not args.no_fetch
    report(build(args.cache, use_network), args.cache, use_network)


if __name__ == "__main__":
    main()
