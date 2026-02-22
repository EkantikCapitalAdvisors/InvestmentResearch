# Ekantik Capital Advisors — Investment Research Portal

## Project Overview
- **Name**: Ekantik Investment Research Portal
- **Goal**: Operationalized investment research platform with Claude AI-powered analysis, Slack integration, and structured intelligence feed
- **Version**: 2.0 — Minimum Viable Prototype (Live Research + Slack)

## Live URLs
- **Sandbox**: https://3000-iaczzs5c7x3y1m6figdk3-2e77fc33.sandbox.novita.ai
- **Slack Health Check**: `/api/slack/health`

## What's Working (MVP)

### Research Engine (LIVE)
- **4-Layer Prompt System**: System Identity → Agent Instructions → Data Context → Output Format
- **Claude Sonnet 4 + Web Search**: Real-time web search for latest news, filings, analyst reports
- **8 Agent Types**: material_events, bias_mode, mag7_monitor, ai_scorer, hot_micro, hot_macro, doubler, aomg_scanner
- **Structured Output Parsing**: JSON extraction from Claude responses with markdown analysis
- **D1 Persistence**: Reports, material events, AI scores, bias checks all stored in database
- **Cost Tracking**: Token usage and cost estimates tracked per report

### Slack Integration (READY)
- **HTTP Webhook Mode**: Runs on Cloudflare Workers — $0/mo fixed cost
- **10 Slash Commands**: `/material`, `/bias`, `/mag7`, `/score`, `/heat`, `/watch`, `/aomg`, `/trend`, `/macro`, `/doubler`
- **Signature Verification**: HMAC-SHA256 Slack signature validation
- **Background Processing**: `waitUntil()` for async Claude calls (Slack 3-second ack rule)
- **Block Kit Responses**: Rich formatted messages with impact badges, score bars, and event details
- **Read-Only Commands**: `/heat` and `/watch` serve DB data without Claude calls ($0 cost)

### Portal UI (LIVE)
- **Intelligence Feed** (`/`): Real-time research reports with Claude-generated analysis
- **Run Research Modal**: Click "Run Research" → Select agent → Enter ticker → Get live analysis
- **Watchlist** (`/watchlist`): 12 tracked tickers with AI scores, conviction levels
- **Ticker Detail** (`/tickers/:id`): Timeline, Trade Signals, Bias Mode, Reports tabs
- **Magnificent 7** (`/mag7`): Per-stock AI dimension cards + summary scorecard
- **AOMG Tracker** (`/aomg`): Growth themes with TAM→SAM→SOM funnels
- **Portfolio Heat** (`/heat`): Risk thermometer, position breakdown
- **Observations** (`/observations`): "This Happened → Why It Matters → Watch Next" log
- **Trade Journal** (`/journal`): Open positions, active signals
- **Settings** (`/settings`): Configuration and scheduled job status

## API Endpoints

### Research
| Method | Path | Description | Claude Cost |
|--------|------|-------------|-------------|
| POST | `/api/research/run` | Run research analysis | ~$0.10-0.70/call |
| GET | `/api/research/feed` | Get all research reports | $0 |
| GET | `/api/research/:id` | Get single report + events | $0 |

### Slack
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/slack/commands` | Slack slash command handler |
| POST | `/api/slack/interactions` | Slack button/menu handler |
| GET | `/api/slack/health` | Health check |

### Data
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/watchlist` | Watchlist tickers with AI scores |
| GET | `/api/tickers` | All tickers |
| GET | `/api/tickers/:id` | Ticker detail with scores, events, signals |
| GET | `/api/mag7/scorecard` | Magnificent 7 scorecard |
| GET | `/api/aomg/themes` | AOMG growth themes |
| GET | `/api/portfolio/heat` | Portfolio heat dashboard |
| GET | `/api/portfolio/positions` | Portfolio positions |
| GET | `/api/observations` | Observation log |
| POST | `/api/observations` | Add observation |
| GET | `/api/journal` | Trade journal |
| GET | `/api/stats` | Dashboard stats |
| GET | `/api/config/:key` | System config |

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Cloudflare Workers (Hono)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Portal   │  │ Slack    │  │ Research     │  │
│  │ Pages    │  │ Commands │  │ Engine       │  │
│  │ (UI)     │  │ (Hooks)  │  │ (4-Layer)    │  │
│  └──────────┘  └──────────┘  └──────┬───────┘  │
│                                       │          │
│  ┌──────────────────────────────────┐ │          │
│  │        D1 Database               │ │          │
│  │  (reports, scores, events,       │ │          │
│  │   tickers, positions, obs)       │ │          │
│  └──────────────────────────────────┘ │          │
└───────────────────────────────────────┼──────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  Claude API      │
                              │  (Sonnet 4)      │
                              │  + Web Search    │
                              └──────────────────┘
```

## Cost Structure (MVP)
| Component | Monthly Cost |
|-----------|-------------|
| Cloudflare Pages | $0 (free) |
| Cloudflare D1 | $0 (free tier) |
| Slack App | $0 (free) |
| Claude API | Pay-per-use |
| **Total Fixed** | **$0/mo** |

**Claude API Cost Per Call**: ~$0.08-0.70 depending on web search depth
- Light use (10 requests/mo): $3-5
- Moderate (30 requests/mo): $10-15
- Active (60 requests/mo): $20-35

## Setup Instructions

### 1. Anthropic API Key
Already configured in `.dev.vars`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Slack App Setup (5 minutes)
1. Go to https://api.slack.com/apps → Create New App → From Scratch
2. **Slash Commands**: Add these pointing to `https://<your-domain>/api/slack/commands`:
   - `/material` — Material Events Intelligence
   - `/bias` — Bias Mode Detection
   - `/mag7` — Magnificent 7 Scorecard
   - `/score` — AI Scoring Framework
   - `/heat` — Portfolio Heat Dashboard
   - `/watch` — Watchlist Overview
   - `/aomg` — AOMG Growth Scanner
   - `/trend` — Hot Micro Trends
   - `/macro` — Hot Macro Events
   - `/doubler` — Doubling Potential Analysis
3. **OAuth Scopes**: `commands`, `chat:write`, `chat:write.public`
4. **Install to Workspace** → Copy Bot Token
5. Add to `.dev.vars`:
   ```
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-signing-secret
   ```

### 3. Run Locally
```bash
npm run build
npm run db:migrate:local
npm run db:seed
pm2 start ecosystem.config.cjs
```

## Tech Stack
- **Runtime**: Cloudflare Workers (Edge)
- **Framework**: Hono v4
- **Database**: Cloudflare D1 (SQLite)
- **AI**: Anthropic Claude Sonnet 4 + Web Search
- **Frontend**: Tailwind CSS (CDN), Font Awesome, Chart.js
- **Slack**: HTTP Webhook mode (no server needed)

## Project Structure
```
webapp/
├── src/
│   ├── index.tsx           # Main app entry (Hono routes)
│   ├── api.tsx             # REST API routes
│   ├── pages.tsx           # Portal page routes + inline scripts
│   ├── renderer.tsx        # HTML renderer with Ekantik branding
│   ├── components/
│   │   └── layout.tsx      # Sidebar + header layout
│   ├── research/
│   │   ├── prompts.ts      # 4-layer prompt system (8 agents)
│   │   └── engine.ts       # Claude API client + D1 persistence
│   └── slack/
│       ├── handlers.ts     # Slash command router + background processing
│       └── blocks.ts       # Block Kit response builders
├── migrations/
│   └── 0001_initial_schema.sql  # D1 database schema (11 tables)
├── seed.sql                # Demo data (Mag 7 + extras)
├── .dev.vars               # Local secrets (git-ignored)
├── wrangler.jsonc          # Cloudflare config
├── ecosystem.config.cjs    # PM2 config
└── package.json
```

## Branding
- **Background**: #0a0f1e (Deep Navy)
- **Card**: #111827 (Dark Charcoal)
- **Gold Accent**: #d4a843 (ECA Logo Gold)
- **Accent Blue**: #3b82f6
- **Green**: #10b981 (Positive)
- **Red**: #ef4444 (Negative)
- **Font**: Inter

## Deployment Status
- **Platform**: Cloudflare Pages (ready for deployment)
- **Status**: ✅ Active (sandbox)
- **Last Updated**: 2026-02-22
