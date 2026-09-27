"""SPY option equivalent to a 100% long-market stock position, for a move
estimated to complete inside one week.

Matched on three axes:
  position size -- total option delta equals the share count the stock
                   position would have held
  time frame    -- expiry chosen with buffer past the 1-week thesis window
  delta         -- per-contract delta, which sets how closely it tracks SPY

Live chain, quotes as of 2026-09-25 close. Greeks are Black-Scholes on each
strike's own quoted IV, since the chain does not publish them.
"""
import datetime, glob, json, math, os

SCRATCH = "/tmp/claude-0/-home-user/3dc970a2-7a8a-5f17-9037-61e1d51bc8a0/scratchpad"
EQUITY   = 100_000.0     # model portfolio equity
EXPOSURE = 1.00          # "100% position" == full equity of market exposure
RATE     = 0.0375
CONTRACT = 100
ASOF     = datetime.date(2026, 9, 25)   # last close in the chain
HOLD     = 5                            # thesis window, calendar days
MOVES    = (0.005, 0.01, 0.02, 0.03)    # candidate up-moves in SPY


def norm_cdf(x):  return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
def norm_pdf(x):  return math.exp(-0.5 * x * x) / math.sqrt(2.0 * math.pi)


def greeks(S, K, T, r, vol):
    """Call value, delta, theta/day, gamma."""
    if T <= 0:
        return max(S - K, 0.0), (1.0 if S > K else 0.0), 0.0, 0.0
    v = vol * math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * vol * vol) * T) / v
    d2 = d1 - v
    price = S * norm_cdf(d1) - K * math.exp(-r * T) * norm_cdf(d2)
    delta = norm_cdf(d1)
    theta = (-S * norm_pdf(d1) * vol / (2 * math.sqrt(T))
             - r * K * math.exp(-r * T) * norm_cdf(d2)) / 365.0
    gamma = norm_pdf(d1) / (S * v)
    return price, delta, theta, gamma


def load():
    """Chain rows keyed by expiry, with mid price and quoted IV."""
    out = {}
    for path in sorted(glob.glob(f"{SCRATCH}/exp_*.json")):
        node = json.load(open(path))["optionChain"]["result"][0]
        opt = node["options"][0]
        expiry = datetime.datetime.utcfromtimestamp(opt["expirationDate"]).date()
        spot = node["quote"]["regularMarketPrice"]
        rows = []
        for c in opt["calls"]:
            bid, ask = c.get("bid") or 0, c.get("ask") or 0
            iv = c.get("impliedVolatility")
            if not iv or bid <= 0 or ask <= 0:
                continue
            spread = (ask - bid) / ((ask + bid) / 2)
            rows.append(dict(K=c["strike"], bid=bid, ask=ask, mid=(bid + ask) / 2,
                             iv=iv, oi=c.get("openInterest") or 0,
                             vol=c.get("volume") or 0, spread=spread))
        out[expiry] = dict(spot=spot, calls=rows)
    return out


chain = load()
SPOT = next(iter(chain.values()))["spot"]
SHARES = EQUITY * EXPOSURE / SPOT          # the stock position being replaced
DELTA_NEEDED = SHARES                       # 1 share of delta == 1 share

print("=" * 100)
print(f"BASELINE   the stock position being replaced")
print("=" * 100)
print(f"  SPY spot                      ${SPOT:,.2f}   (close {ASOF})")
print(f"  100% of ${EQUITY:,.0f} equity      ${EQUITY * EXPOSURE:,.0f}")
print(f"  shares                        {SHARES:.1f}")
print(f"  delta to replicate            {SHARES:.1f} share-equivalents "
      f"= {SHARES / CONTRACT:.2f} contracts at 1.00 delta")
print(f"  capital committed             ${EQUITY * EXPOSURE:,.0f}")
print(f"  thesis window                 {HOLD} calendar days")

# pick, per expiry, the strike closest to each target delta
TARGETS = (0.85, 0.75, 0.65, 0.50)
print()
print("=" * 100)
print(f"CANDIDATES   delta-matched to {SHARES:.1f} shares, priced at the mid")
print("=" * 100)
hdr = (f"{'expiry':11} {'dte':>4} {'tgt':>5} {'strike':>7} {'IV':>6} {'mid':>7} "
       f"{'delta':>6} {'ctrs':>6} {'rounded':>8} {'cost':>9} {'%notl':>7} "
       f"{'theta/day':>10} {f'theta {HOLD}d':>10} {'spread':>7} {'OI':>7}")
print(hdr)

cands = []
for expiry in sorted(chain):
    dte = (expiry - ASOF).days
    T = dte / 365.0
    for tgt in TARGETS:
        best, best_gap = None, 9e9
        for row in chain[expiry]["calls"]:
            _, dl, _, _ = greeks(SPOT, row["K"], T, RATE, row["iv"])
            if abs(dl - tgt) < best_gap:
                best, best_gap = (row, dl), abs(dl - tgt)
        row, dl = best
        _, _, th, gm = greeks(SPOT, row["K"], T, RATE, row["iv"])
        need = DELTA_NEEDED / (dl * CONTRACT)
        n = max(1, round(need))
        cost = n * row["mid"] * CONTRACT
        theta_d = n * th * CONTRACT
        rec = dict(expiry=expiry, dte=dte, T=T, tgt=tgt, K=row["K"], iv=row["iv"],
                   mid=row["mid"], delta=dl, need=need, n=n, cost=cost,
                   theta_d=theta_d, theta_hold=theta_d * HOLD, gamma=gm,
                   spread=row["spread"], oi=row["oi"], vol=row["vol"])
        cands.append(rec)
        print(f"{str(expiry):11} {dte:4d} {tgt:5.2f} {row['K']:7.0f} "
              f"{row['iv']*100:5.1f}% {row['mid']:7.2f} {dl:6.2f} {need:6.2f} "
              f"{n:8d} ${cost:8,.0f} {cost/EQUITY*100:6.1f}% "
              f"${theta_d:9,.0f} ${theta_d*HOLD:9,.0f} {row['spread']*100:6.1f}% {row['oi']:7,.0f}")

json.dump([{k: (str(v) if isinstance(v, datetime.date) else v) for k, v in c.items()}
           for c in cands], open(f"{SCRATCH}/cands.json", "w"), indent=1)


# ------------------------------------------------------- payoff after the week
def value_after(c, move, days=HOLD, iv_shift=0.0):
    S1 = SPOT * (1 + move)
    T1 = max(c["T"] - days / 365.0, 1e-9)
    px, _, _, _ = greeks(S1, c["K"], T1, RATE, max(c["iv"] + iv_shift, 0.02))
    return c["n"] * px * CONTRACT


def breakeven(c, days=HOLD, iv_shift=0.0):
    lo, hi = -0.10, 0.15
    f = lambda m: value_after(c, m, days, iv_shift) - c["cost"]
    if f(lo) * f(hi) > 0:
        return None
    for _ in range(200):
        mid = (lo + hi) / 2
        if f(lo) * f(mid) <= 0: hi = mid
        else: lo = mid
    return (lo + hi) / 2


print()
print("=" * 100)
print(f"PAYOFF AFTER {HOLD} DAYS   vs the $100,000 stock position, IV held flat")
print("=" * 100)
print(f"{'expiry':11} {'dte':>4} {'delta':>6} {'cost':>8} | "
      + " ".join(f"{m*100:+5.1f}%" .rjust(9) for m in (0.0,) + MOVES)
      + f" | {'breakeven':>10}")
for c in cands:
    if c["oi"] < 300:                       # skip strikes with no real market
        continue
    cells = []
    for m in (0.0,) + MOVES:
        cells.append(f"${value_after(c, m) - c['cost']:+8,.0f}")
    be = breakeven(c)
    print(f"{str(c['expiry']):11} {c['dte']:4d} {c['delta']:6.2f} ${c['cost']:7,.0f} | "
          + " ".join(x.rjust(9) for x in cells)
          + f" | {(f'{be*100:+.2f}%' if be else 'n/a'):>10}")

print()
print(f"{'STOCK, $100,000':30} | "
      + " ".join(f"${EQUITY*m:+8,.0f}".rjust(9) for m in (0.0,) + MOVES)
      + f" | {'0.00%':>10}")

# ------------------------------------------------- IV crush on the up-move leg
print()
print("=" * 100)
print("IV RISK   a rally in a 12.8% IV tape usually compresses IV further")
print("=" * 100)
print(f"{'expiry':11} {'delta':>6} | {'+2% flat IV':>13} {'+2% IV -2pt':>13} "
      f"{'+2% IV -4pt':>13} | {'0% move, IV -2pt':>17}")
for c in cands:
    if c["oi"] < 300:
        continue
    a = value_after(c, 0.02, HOLD, 0.0)   - c["cost"]
    b = value_after(c, 0.02, HOLD, -0.02) - c["cost"]
    d = value_after(c, 0.02, HOLD, -0.04) - c["cost"]
    e = value_after(c, 0.00, HOLD, -0.02) - c["cost"]
    print(f"{str(c['expiry']):11} {c['delta']:6.2f} | ${a:+12,.0f} ${b:+12,.0f} "
          f"${d:+12,.0f} | ${e:+16,.0f}")

# -------------------------------------------------------- capital and the tail
print()
print("=" * 100)
print("CAPITAL AND MAX LOSS")
print("=" * 100)
print(f"{'expiry':11} {'delta':>6} {'premium':>9} {'capital freed':>14} "
      f"{'max loss':>10} {'vs 100% stock at -5%':>21}")
for c in cands:
    if c["oi"] < 300:
        continue
    print(f"{str(c['expiry']):11} {c['delta']:6.2f} ${c['cost']:8,.0f} "
          f"${EQUITY - c['cost']:13,.0f} ${c['cost']:9,.0f} "
          f"${EQUITY * 0.05 - c['cost']:20,.0f}")
print(f"\n  a 100% stock position loses ${EQUITY*0.05:,.0f} on a 5% SPY drawdown, "
      f"${EQUITY*0.10:,.0f} on 10%, with no floor.")

# ============================================================================
# LIQUIDITY-FIRST SELECTION
#
# Yahoo's quoted IV on deep in-the-money calls is not trustworthy -- those
# strikes barely trade, the mid is not a real price, and their implied vols come
# back at 20-30% against a 12.8% at-the-money. So the shortlist below filters on
# open interest and quoted spread FIRST, and reads delta off what survives,
# rather than solving for a target delta and accepting whatever strike that hits.
# ============================================================================
MIN_OI, MAX_SPREAD = 3_000, 0.02


def tradeable():
    out = []
    for expiry in sorted(chain):
        dte = (expiry - ASOF).days
        T = dte / 365.0
        for row in chain[expiry]["calls"]:
            if row["oi"] < MIN_OI or row["spread"] > MAX_SPREAD:
                continue
            _, dl, th, _ = greeks(SPOT, row["K"], T, RATE, row["iv"])
            if not 0.40 <= dl <= 0.92:
                continue
            n = max(1, round(SHARES / (dl * CONTRACT)))
            out.append(dict(expiry=expiry, dte=dte, T=T, K=row["K"], iv=row["iv"],
                            mid=row["mid"], delta=dl, n=n,
                            cost=n * row["mid"] * CONTRACT,
                            theta_d=n * th * CONTRACT, spread=row["spread"],
                            oi=row["oi"], bid=row["bid"], ask=row["ask"],
                            need=SHARES / (dl * CONTRACT)))
    return out


print()
print("=" * 104)
print(f"TRADEABLE STRIKES   OI >= {MIN_OI:,}, spread <= {MAX_SPREAD*100:.0f}%")
print("=" * 104)
print(f"{'expiry':11} {'dte':>4} {'strike':>7} {'IV':>6} {'mid':>7} {'delta':>6} "
      f"{'pos delta':>10} {'vs need':>8} {'n':>3} {'cost':>8} {'%eq':>6} "
      f"{f'theta {HOLD}d':>10} {'BE':>8} {'+2% P&L':>9} {'% of stk':>9} {'OI':>8}")
rows = tradeable()
for c in rows:
    pos_delta = c["delta"] * c["n"] * CONTRACT
    be = breakeven(c)
    p2 = value_after(c, 0.02) - c["cost"]
    print(f"{str(c['expiry']):11} {c['dte']:4d} {c['K']:7.0f} {c['iv']*100:5.1f}% "
          f"{c['mid']:7.2f} {c['delta']:6.2f} {pos_delta:10.0f} "
          f"{pos_delta / SHARES - 1:+7.0%} {c['n']:3d} ${c['cost']:7,.0f} "
          f"{c['cost']/EQUITY*100:5.1f}% ${c['theta_d']*HOLD:9,.0f} "
          f"{(f'{be*100:+.2f}%' if be else 'n/a'):>8} ${p2:+8,.0f} "
          f"{p2/(EQUITY*0.02)*100:8.0f}% {c['oi']:8,.0f}")

# ------------------------------------------------------------- scenario grid
best = min((c for c in rows if c["dte"] >= HOLD + 10 and 0.55 <= c["delta"] <= 0.85),
           key=lambda c: abs(c["delta"] * c["n"] * CONTRACT / SHARES - 1))
print()
print("=" * 104)
print(f"SCENARIO GRID   tightest delta match: SPY {best['expiry']} {best['K']:.0f} call "
      f"x{best['n']}  (${best['cost']:,.0f})")
print("=" * 104)
days = (3, HOLD, 8, 12, best["dte"])
print(f"{'SPY move':>10} | " + " ".join(f"day {d}".rjust(10) for d in days) + f" | {'stock':>10}")
for mv in (-0.04, -0.03, -0.02, -0.01, 0.0, 0.005, 0.01, 0.015, 0.02, 0.03, 0.04):
    cells = " ".join(f"${value_after(best, mv, d) - best['cost']:+9,.0f}".rjust(10)
                     for d in days)
    print(f"{mv*100:+9.1f}% | {cells} | ${EQUITY*mv:+9,.0f}")
print(f"\n  day {best['dte']} is expiry. Read across a row for the cost of a late move.")
