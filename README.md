# Ekantik Capital Advisors — Investment Research Portal

## Project Overview
- **Name**: Ekantik Investment Research Platform
- **Goal**: Full-stack investment intelligence portal with automated research engine, Slack integration, and institutional-grade analysis
- **Platform**: Cloudflare Pages + Hono + D1 Database
- **Status**: MVP — Frontend Portal Complete

## Live URLs
- **Local Dev**: http://localhost:3000
- **Dashboard**: `/` — Intelligence Feed
- **Watchlist**: `/watchlist` — Active ticker surveillance
- **Ticker Detail**: `/tickers/:id` — Individual ticker intelligence
- **Mag 7**: `/mag7` — Magnificent 7 Command Center
- **AOMG**: `/aomg` — Areas of Maximum Growth Tracker
- **Heat**: `/heat` — Portfolio Heat Dashboard
- **Observations**: `/observations` — Hot Micro Observation Log
- **Journal**: `/journal` — Trade Journal & Performance
- **Settings**: `/settings` — System configuration

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/research/feed` | Research reports feed (filterable) |
| GET | `/api/research/:id` | Single research report |
| GET | `/api/watchlist` | Watchlist tickers with AI scores |
| GET | `/api/tickers` | All tickers |
| GET | `/api/tickers/:id` | Ticker detail with scores, events, signals |
| GET | `/api/tickers/:id/scores` | AI score history |
| GET | `/api/mag7/scorecard` | Magnificent 7 scorecard |
| GET | `/api/aomg/themes` | AOMG themes |
| GET | `/api/portfolio/heat` | Portfolio heat calculation |
| GET | `/api/portfolio/positions` | Open positions |
| GET | `/api/observations` | Observation log |
| POST | `/api/observations` | Add new observation |
| GET | `/api/journal` | Trade journal data |
| GET | `/api/config/:key` | System configuration |

## Currently Completed Features
- Full Research Intelligence Feed with expandable report cards
- Watchlist table with AI scores, conviction levels, impact tracking
- Individual ticker pages with Timeline, Trade Signals, Bias Mode, Reports tabs
- Magnificent 7 Command Center with per-stock cards and summary scorecard table
- AOMG Tracker with TAM/SAM/SOM funnel visualization, drivers/constraints/catalysts
- Portfolio Heat Dashboard with thermometer gauge, sleeve breakdowns, position risk table
- Observation Log with "This Happened → Why It Matters → Watch Next" format and quick-add form
- Trade Journal with open positions, active signals, closed trade tracking
- Settings page with portfolio config, scheduled jobs, integration status
- Full Ekantik branding: deep navy (#0a0f1e) background, gold (#d4a843) accents, Inter font
- D1 database with complete schema (tickers, reports, events, scores, signals, positions, observations)
- Seeded with Mag 7 + 5 additional tickers, 6 research reports, AI scores, trade signals, portfolio positions

## Features Not Yet Implemented
- **Slack Bot**: Requires long-running server (Railway recommended) — slash commands, @mention routing
- **Research Engine**: Claude API integration with 4-layer prompt system — requires external worker service
- **Scheduled Jobs**: Vercel Cron or external scheduler for automated research runs
- **Market Data Integration**: Alpha Vantage, Finnhub, SEC EDGAR real-time data feeds
- **Authentication**: Supabase Auth for portal login
- **Real-time Updates**: Supabase Realtime subscriptions for live feed updates
- **Charts**: Recharts radar charts, sparklines, historical price charts
- **Full-text Search**: Cross-report search functionality

## Data Architecture
- **Database**: Cloudflare D1 (SQLite) — local development mode
- **Tables**: tickers, research_reports, material_events, ai_scores, trade_signals, portfolio_positions, observations, bias_mode_checks, aomg_themes, scheduled_jobs, system_config
- **Storage**: All data persisted in D1 with proper indexes

## Tech Stack
- **Backend**: Hono (TypeScript) on Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Server-rendered JSX + Tailwind CSS (CDN) + vanilla JavaScript
- **Icons**: Font Awesome 6
- **Font**: Inter (Google Fonts)
- **Build**: Vite + wrangler
- **Dev Server**: wrangler pages dev (via PM2)

## Recommended Next Steps
1. **Deploy to Cloudflare Pages** for production hosting
2. **Set up Supabase** for PostgreSQL + Auth + Realtime (as per spec)
3. **Build Research Engine worker** on Railway with Claude API integration
4. **Create Slack Bot** using Bolt SDK with Socket Mode
5. **Integrate market data APIs** (Alpha Vantage, Finnhub)
6. **Add authentication** with Supabase Auth
7. **Implement scheduled jobs** with Vercel Cron

## Development
```bash
npm run build              # Build for production
npm run db:migrate:local   # Apply D1 migrations
npm run db:seed            # Seed database
npm run db:reset           # Reset + re-seed database
pm2 start ecosystem.config.cjs  # Start dev server
```

## Deployment
- **Platform**: Cloudflare Pages
- **Tech Stack**: Hono + TypeScript + Tailwind CSS + D1
- **Last Updated**: February 22, 2026
