import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const homeRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// HOME — Parabolic Stock Life Cycle
// ============================================================
homeRoutes.get('/', (c) => {
  return c.render(
    <Layout active="home">
      <div class="fade-in max-w-6xl mx-auto">
        {/* Hero Section */}
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ekantik-gold/10 border border-ekantik-gold/20 mb-6">
            <i class="fas fa-chart-line text-ekantik-gold text-xs"></i>
            <span class="text-ekantik-gold text-xs font-semibold uppercase tracking-widest">ECA Investment Research</span>
          </div>
          <h1 class="text-4xl font-bold text-white mb-4">
            The Parabolic <span class="text-ekantik-gold italic">Stock Life Cycle</span>
          </h1>
          <p class="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Every parabolic stock follows a predictable life cycle driven by shifts in market psychology.
            Understanding these five phases gives you the edge to identify where a stock sits in its arc — and
            whether the opportunity is ahead or behind.
          </p>
        </div>

        {/* Parabolic Curve Visualization */}
        <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-8 mb-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-ekantik-gold/20 rounded-lg flex items-center justify-center">
              <i class="fas fa-wave-square text-ekantik-gold text-sm"></i>
            </div>
            <h2 class="text-lg font-bold text-white">Life Cycle Overview</h2>
          </div>
          <canvas id="parabolic-chart" height="120"></canvas>
          <div class="flex justify-between mt-4 px-4 text-[10px] text-gray-500 uppercase tracking-widest">
            <span>Stealth</span>
            <span>Awareness</span>
            <span>Mania</span>
            <span>Blowoff</span>
            <span>Mean Reversion</span>
          </div>
        </div>

        {/* 5 Phases Grid */}
        <div class="grid grid-cols-1 gap-6 mb-10">

          {/* Phase 1 — Stealth */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 hover:border-ekantik-gold/30 transition-colors group">
            <div class="flex items-start gap-5">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg group-hover:from-ekantik-gold/30 group-hover:to-ekantik-gold/10 transition-all">
                <span class="text-2xl font-black text-white/80 group-hover:text-ekantik-gold">1</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">Stealth Phase</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-gray-700/50 text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Smart Money</span>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed mb-4">
                  The cycle begins quietly. Well-informed investors — insiders, deep-research funds, and contrarian
                  value hunters — accumulate shares while the stock sits in obscurity. Prices drift slowly upward
                  from a depressed base, but no one is paying attention. Media coverage is absent or negative.
                  This is where the greatest asymmetric opportunity exists.
                </p>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Price Action</div>
                    <div class="text-sm text-gray-300">Flat base with subtle higher lows; gradual drift off bottom</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Volume</div>
                    <div class="text-sm text-gray-300">Low &amp; quiet with occasional unusual accumulation spikes</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Sentiment</div>
                    <div class="text-sm text-gray-300">Disbelief, apathy; "dead money" consensus among the crowd</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</div>
                    <div class="text-sm text-gray-300">Months to years — the longest phase; patience is the price of admission</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 — Awareness */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 hover:border-ekantik-accent/30 transition-colors group">
            <div class="flex items-start gap-5">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center shadow-lg group-hover:from-ekantik-accent/40 group-hover:to-ekantik-accent/20 transition-all">
                <span class="text-2xl font-black text-white/80 group-hover:text-ekantik-accent">2</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">Awareness Phase</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-ekantik-accent/20 text-ekantik-accent text-[10px] font-semibold uppercase tracking-wider">Institutional Money</span>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed mb-4">
                  A catalyst breaks the stock out of its base — a strong earnings beat, a product breakthrough, or
                  sector re-rating. Institutional investors and momentum funds take notice. Analyst upgrades appear.
                  The price curve steepens as each pullback is met with eager buying. Media coverage shifts from
                  absent to cautiously optimistic. The first "bear trap" shakes out weak hands.
                </p>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Price Action</div>
                    <div class="text-sm text-gray-300">Breakout from base; higher highs &amp; higher lows; first "bear trap"</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Volume</div>
                    <div class="text-sm text-gray-300">Rising on advances, shrinking on pullbacks — classic accumulation</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Sentiment</div>
                    <div class="text-sm text-gray-300">Growing optimism; "this could be real" narrative takes hold</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</div>
                    <div class="text-sm text-gray-300">Weeks to months — the sweet spot for trend-following strategies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3 — Mania */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 hover:border-ekantik-gold/30 transition-colors group">
            <div class="flex items-start gap-5">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-700 to-amber-500 flex items-center justify-center shadow-lg group-hover:from-ekantik-gold/50 group-hover:to-ekantik-amber/30 transition-all">
                <span class="text-2xl font-black text-white/80 group-hover:text-ekantik-gold">3</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">Mania Phase</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-ekantik-amber/20 text-ekantik-amber text-[10px] font-semibold uppercase tracking-wider">Public Frenzy</span>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed mb-4">
                  The stock becomes a household name. Retail traders flood in, driven by Fear Of Missing Out (FOMO).
                  Prices go vertical — returns that took months now happen in days. Leverage and margin usage surge.
                  "New paradigm" narratives dominate: "this time is different." Valuation becomes untethered from
                  fundamentals. The chart goes parabolic in the truest sense — each base is shorter, each rally steeper.
                  Smart money quietly begins to distribute.
                </p>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Price Action</div>
                    <div class="text-sm text-gray-300">Vertical ascent; gaps up; shorter bases; blow-through of all resistance</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Volume</div>
                    <div class="text-sm text-gray-300">Explosive — record volume; retail order flow dominates</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Sentiment</div>
                    <div class="text-sm text-gray-300">Euphoria, greed, "can't lose" mentality; bears are mocked</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</div>
                    <div class="text-sm text-gray-300">Days to weeks — compressed and intense; the most dangerous phase</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 4 — Blowoff / Distribution */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 hover:border-ekantik-red/30 transition-colors group">
            <div class="flex items-start gap-5">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center shadow-lg group-hover:from-ekantik-red/40 group-hover:to-ekantik-red/20 transition-all">
                <span class="text-2xl font-black text-white/80 group-hover:text-ekantik-red">4</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">Blowoff Phase</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-ekantik-red/20 text-ekantik-red text-[10px] font-semibold uppercase tracking-wider">Distribution &amp; Collapse</span>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed mb-4">
                  A trigger event shatters confidence — a missed earnings report, regulatory action, or simply the
                  exhaustion of buyers. The parabolic curve breaks. Panic selling erupts and prices collapse at a
                  rate faster than the ascent. A deceptive "return to normal" rally traps dip-buyers before the
                  next wave of selling. Institutional investors are long gone. Leveraged positions are liquidated,
                  creating cascading sell pressure.
                </p>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Price Action</div>
                    <div class="text-sm text-gray-300">Sharp reversal; gaps down; "return to normal" bull trap; waterfall decline</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Volume</div>
                    <div class="text-sm text-gray-300">Massive on sell-offs; climactic capitulation spikes mark local bottoms</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Sentiment</div>
                    <div class="text-sm text-gray-300">Denial, then fear, then panic; "return to normal" delusion</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</div>
                    <div class="text-sm text-gray-300">Weeks to months — faster than the ascent; speed shocks participants</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 5 — Mean Reversion */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6 hover:border-ekantik-green/30 transition-colors group">
            <div class="flex items-start gap-5">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center shadow-lg group-hover:from-ekantik-green/40 group-hover:to-ekantik-green/20 transition-all">
                <span class="text-2xl font-black text-white/80 group-hover:text-ekantik-green">5</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">Mean Reversion Phase</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-ekantik-green/20 text-ekantik-green text-[10px] font-semibold uppercase tracking-wider">Capitulation &amp; Reset</span>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed mb-4">
                  The final phase. Prices overshoot to the downside, often falling below fair value. The stock
                  becomes universally despised — "the worst investment you can make." Volume dries up. The general
                  public swears off the sector entirely. Yet this despair creates the conditions for the next cycle:
                  smart money begins accumulating again at bargain-basement prices. The cycle is complete — and ready
                  to begin anew.
                </p>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Price Action</div>
                    <div class="text-sm text-gray-300">Undershoots fair value; long basing pattern; volatility contracts</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Volume</div>
                    <div class="text-sm text-gray-300">Dries up to minimal levels; apathy replaces activity</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Sentiment</div>
                    <div class="text-sm text-gray-300">Despair, disgust, total disinterest — "dead money" again</div>
                  </div>
                  <div class="bg-ekantik-bg rounded-lg p-3">
                    <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</div>
                    <div class="text-sm text-gray-300">Months to years — the reset; seeds of the next cycle are planted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Key Principles Section */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6">
            <div class="w-10 h-10 bg-ekantik-gold/20 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-brain text-ekantik-gold"></i>
            </div>
            <h3 class="text-white font-bold mb-2">Psychology Drives Price</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              Parabolic moves are fueled by cascading shifts in mass psychology — from disbelief to euphoria to
              panic. Recognizing the emotional temperature of the market is more valuable than any technical indicator.
            </p>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6">
            <div class="w-10 h-10 bg-ekantik-accent/20 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-clock text-ekantik-accent"></i>
            </div>
            <h3 class="text-white font-bold mb-2">Time Asymmetry</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              The stealth and mean reversion phases consume the most time. The mania and blowoff are compressed
              and violent. The longest periods of waiting produce the most explosive moves.
            </p>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-2xl p-6">
            <div class="w-10 h-10 bg-ekantik-green/20 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-recycle text-ekantik-green"></i>
            </div>
            <h3 class="text-white font-bold mb-2">Cycles Repeat</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              From the Dutch Tulip Mania to Bitcoin to meme stocks, the parabolic life cycle repeats across every
              asset class and era. The players change, but human nature — greed and fear — never does.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div class="bg-gradient-to-r from-ekantik-gold/10 via-ekantik-card to-ekantik-gold/10 border border-ekantik-gold/20 rounded-2xl p-8 text-center mb-6">
          <h2 class="text-2xl font-bold text-white mb-3">Put the Framework to Work</h2>
          <p class="text-gray-400 mb-6 max-w-2xl mx-auto">
            Use ECA's AI-powered research agents to identify which phase any stock is in right now.
            Run Material Events, Bias Mode, and Episodic Pivot analyses to spot inflection points in real time.
          </p>
          <div class="flex items-center justify-center gap-4">
            <a href="/feed" class="px-6 py-3 bg-ekantik-gold text-ekantik-bg rounded-lg font-semibold hover:bg-ekantik-gold-light transition-colors inline-flex items-center gap-2">
              <i class="fas fa-satellite-dish"></i> Intelligence Feed
            </a>
            <a href="/watchlist" class="px-6 py-3 bg-ekantik-surface border border-ekantik-border text-gray-300 rounded-lg font-semibold hover:border-ekantik-gold/50 hover:text-ekantik-gold transition-colors inline-flex items-center gap-2">
              <i class="fas fa-binoculars"></i> Watchlist
            </a>
          </div>
        </div>

        {/* Attribution */}
        <div class="text-center text-xs text-gray-600 mb-4">
          Parabolic life cycle framework adapted from Dr. Jean-Paul Rodrigue's "Stages in a Bubble" model
        </div>

      </div>

      {/* Chart.js Parabolic Curve Script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const ctx = document.getElementById('parabolic-chart');
          if (!ctx) return;

          // Generate parabolic curve data points for all 5 phases
          const points = [];
          const colors = [];
          const N = 200;

          for (let i = 0; i <= N; i++) {
            const x = i / N;
            let y;

            if (x <= 0.25) {
              // Phase 1: Stealth — slow, flat drift upward
              y = 10 + 5 * (x / 0.25);
              colors.push('rgba(107,114,128,0.8)');
            } else if (x <= 0.50) {
              // Phase 2: Awareness — steeper climb
              const t = (x - 0.25) / 0.25;
              y = 15 + 25 * Math.pow(t, 1.5);
              colors.push('rgba(59,130,246,0.8)');
            } else if (x <= 0.65) {
              // Phase 3: Mania — exponential spike
              const t = (x - 0.50) / 0.15;
              y = 40 + 55 * Math.pow(t, 2.2);
              colors.push('rgba(245,158,11,0.8)');
            } else if (x <= 0.80) {
              // Phase 4: Blowoff — crash with "return to normal" bump
              const t = (x - 0.65) / 0.15;
              const crash = 95 - 60 * Math.pow(t, 0.6);
              const bump = 12 * Math.sin(t * Math.PI * 1.2) * Math.exp(-t * 2);
              y = crash + bump;
              colors.push('rgba(239,68,68,0.8)');
            } else {
              // Phase 5: Mean Reversion — drifts below fair value, flattens
              const t = (x - 0.80) / 0.20;
              y = 35 - 15 * Math.pow(t, 0.5) + 3 * Math.sin(t * Math.PI);
              colors.push('rgba(16,185,129,0.8)');
            }

            points.push({ x: i, y: Math.max(y, 5) });
          }

          // Phase boundary annotations
          const phaseLines = [
            { x: 50, label: '' },
            { x: 100, label: '' },
            { x: 130, label: '' },
            { x: 160, label: '' },
          ];

          new Chart(ctx, {
            type: 'line',
            data: {
              datasets: [{
                data: points,
                borderColor: function(context) {
                  const i = context.dataIndex || 0;
                  const x = i / ${N};
                  if (x <= 0.25) return '#6b7280';
                  if (x <= 0.50) return '#3b82f6';
                  if (x <= 0.65) return '#f59e0b';
                  if (x <= 0.80) return '#ef4444';
                  return '#10b981';
                },
                segment: {
                  borderColor: function(ctx) {
                    const i = ctx.p0DataIndex;
                    const x = i / ${N};
                    if (x <= 0.25) return '#6b7280';
                    if (x <= 0.50) return '#3b82f6';
                    if (x <= 0.65) return '#f59e0b';
                    if (x <= 0.80) return '#ef4444';
                    return '#10b981';
                  }
                },
                borderWidth: 3,
                pointRadius: 0,
                fill: true,
                backgroundColor: function(context) {
                  const chart = context.chart;
                  const {ctx: c, chartArea} = chart;
                  if (!chartArea) return 'transparent';
                  const gradient = c.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                  gradient.addColorStop(0, 'rgba(107,114,128,0.1)');
                  gradient.addColorStop(0.25, 'rgba(59,130,246,0.1)');
                  gradient.addColorStop(0.50, 'rgba(245,158,11,0.15)');
                  gradient.addColorStop(0.65, 'rgba(239,68,68,0.1)');
                  gradient.addColorStop(0.80, 'rgba(16,185,129,0.08)');
                  gradient.addColorStop(1, 'rgba(16,185,129,0.03)');
                  return gradient;
                },
                tension: 0.4,
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              parsing: { xAxisKey: 'x', yAxisKey: 'y' },
              plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                annotation: {}
              },
              scales: {
                x: {
                  type: 'linear',
                  display: false,
                  min: 0,
                  max: ${N}
                },
                y: {
                  display: false,
                  min: 0,
                  max: 110
                }
              },
              elements: { point: { radius: 0 } }
            },
            plugins: [{
              id: 'phaseLines',
              afterDraw: function(chart) {
                const ctx = chart.ctx;
                const xScale = chart.scales.x;
                const yScale = chart.scales.y;
                const lines = [50, 100, 130, 160];
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(55,65,81,0.5)';
                ctx.lineWidth = 1;
                lines.forEach(function(xVal) {
                  const px = xScale.getPixelForValue(xVal);
                  ctx.beginPath();
                  ctx.moveTo(px, yScale.top);
                  ctx.lineTo(px, yScale.bottom);
                  ctx.stroke();
                });
                ctx.restore();
              }
            }]
          });
        })();
      `}} />
    </Layout>,
    { title: 'Ekantik Capital Advisors — Parabolic Stock Life Cycle' }
  )
})


export { homeRoutes }
