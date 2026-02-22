-- ============================================================
-- EKANTIK INVESTMENT RESEARCH — D1 DATABASE SCHEMA
-- Adapted from PostgreSQL for Cloudflare D1 (SQLite)
-- ============================================================

-- AOMG THEMES: Area of Maximum Growth tracking
CREATE TABLE IF NOT EXISTS aomg_themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  tam_estimate INTEGER,
  sam_estimate INTEGER,
  som_estimate INTEGER,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','monitoring','archived')),
  ai_score_composite REAL,
  sentiment_drivers TEXT,
  sentiment_constraints TEXT,
  sentiment_unreasonability TEXT,
  key_catalysts TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- TICKERS: Master ticker reference
CREATE TABLE IF NOT EXISTS tickers (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sector TEXT,
  industry TEXT,
  is_mag7 INTEGER DEFAULT 0,
  is_watchlist INTEGER DEFAULT 0,
  aomg_id TEXT REFERENCES aomg_themes(id) ON DELETE SET NULL,
  last_price REAL,
  price_change_pct REAL,
  market_cap INTEGER,
  forward_pe REAL,
  earnings_date TEXT,
  added_to_watchlist_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tickers_symbol ON tickers(symbol);
CREATE INDEX IF NOT EXISTS idx_tickers_watchlist ON tickers(is_watchlist) WHERE is_watchlist = 1;
CREATE INDEX IF NOT EXISTS idx_tickers_mag7 ON tickers(is_mag7) WHERE is_mag7 = 1;

-- RESEARCH REPORTS: Central intelligence repository
CREATE TABLE IF NOT EXISTS research_reports (
  id TEXT PRIMARY KEY,
  agent_type TEXT NOT NULL CHECK(agent_type IN ('material_events','bias_mode','mag7_monitor','aomg_scanner','hot_micro','hot_macro','doubler','ai_scorer','portfolio_heat','superlative_products','social_sentiment')),
  ticker_symbols TEXT DEFAULT '[]',
  trigger_source TEXT NOT NULL CHECK(trigger_source IN ('slack','cron','event','portal','manual')),
  model_used TEXT,
  api_mode TEXT,
  raw_markdown TEXT NOT NULL,
  structured_json TEXT,
  impact_score TEXT CHECK(impact_score IN ('H','M','L')),
  ai_composite_score REAL,
  conviction_level TEXT CHECK(conviction_level IN ('HIGH','MEDIUM','LOW')),
  token_usage TEXT,
  cost_estimate REAL,
  processing_time_ms INTEGER,
  status TEXT DEFAULT 'completed' CHECK(status IN ('pending','running','completed','failed','cancelled')),
  error_message TEXT,
  slack_channel_id TEXT,
  slack_message_ts TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_agent ON research_reports(agent_type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON research_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_impact ON research_reports(impact_score);

-- MATERIAL EVENTS: Individual events extracted from reports
CREATE TABLE IF NOT EXISTS material_events (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES research_reports(id) ON DELETE CASCADE,
  ticker_id TEXT NOT NULL REFERENCES tickers(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_description TEXT,
  impact_score TEXT NOT NULL CHECK(impact_score IN ('H','M','L')),
  event_date TEXT,
  event_category TEXT,
  earnings_impact_pct REAL,
  catalyst_timeline TEXT,
  source_type TEXT,
  source_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_material_events_ticker ON material_events(ticker_id);
CREATE INDEX IF NOT EXISTS idx_material_events_impact ON material_events(impact_score);

-- AI SCORES: Longitudinal scoring history
CREATE TABLE IF NOT EXISTS ai_scores (
  id TEXT PRIMARY KEY,
  ticker_id TEXT NOT NULL REFERENCES tickers(id) ON DELETE CASCADE,
  report_id TEXT REFERENCES research_reports(id) ON DELETE SET NULL,
  tam_score REAL NOT NULL CHECK (tam_score >= 0 AND tam_score <= 10),
  bias_score REAL NOT NULL CHECK (bias_score >= 0 AND bias_score <= 10),
  superlative_score REAL NOT NULL CHECK (superlative_score >= 0 AND superlative_score <= 10),
  disruption_score REAL NOT NULL CHECK (disruption_score >= 0 AND disruption_score <= 10),
  composite REAL NOT NULL,
  conviction_level TEXT NOT NULL CHECK(conviction_level IN ('HIGH','MEDIUM','LOW')),
  scoring_rationale TEXT,
  scored_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_scores_ticker ON ai_scores(ticker_id);
CREATE INDEX IF NOT EXISTS idx_ai_scores_composite ON ai_scores(composite);

-- TRADE SIGNALS: Actionable signals from any agent
CREATE TABLE IF NOT EXISTS trade_signals (
  id TEXT PRIMARY KEY,
  ticker_id TEXT NOT NULL REFERENCES tickers(id) ON DELETE CASCADE,
  report_id TEXT REFERENCES research_reports(id) ON DELETE SET NULL,
  signal_type TEXT NOT NULL CHECK(signal_type IN ('dislocation','reversal','breakout','consolidation','episodic_pivot')),
  confidence REAL,
  engine TEXT NOT NULL CHECK(engine IN ('stocks_leaps','options')),
  entry_price REAL,
  stop_price REAL,
  target_price REAL,
  risk_reward_ratio REAL,
  position_size_pct REAL,
  thesis TEXT,
  invalidation_criteria TEXT,
  time_horizon TEXT,
  is_active INTEGER DEFAULT 1,
  activated_at TEXT,
  invalidated_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_trade_signals_ticker ON trade_signals(ticker_id);
CREATE INDEX IF NOT EXISTS idx_trade_signals_active ON trade_signals(is_active) WHERE is_active = 1;

-- PORTFOLIO POSITIONS: Active portfolio tracking
CREATE TABLE IF NOT EXISTS portfolio_positions (
  id TEXT PRIMARY KEY,
  ticker_id TEXT NOT NULL REFERENCES tickers(id) ON DELETE CASCADE,
  engine TEXT NOT NULL CHECK(engine IN ('stocks_leaps','options')),
  entry_price REAL NOT NULL,
  entry_date TEXT NOT NULL,
  current_price REAL,
  size_pct REAL NOT NULL,
  stop_price REAL,
  stop_distance_pct REAL,
  heat_contribution REAL,
  target_price REAL,
  pnl_pct REAL,
  pnl_usd REAL,
  r_multiple REAL,
  thesis TEXT,
  status TEXT DEFAULT 'open' CHECK(status IN ('open','closed','stopped_out')),
  exit_price REAL,
  exit_date TEXT,
  exit_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_positions_status ON portfolio_positions(status);

-- OBSERVATIONS: Hot Micro observation log
CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  happened_text TEXT NOT NULL,
  why_matters TEXT NOT NULL,
  watch_next TEXT NOT NULL,
  ticker_symbols TEXT DEFAULT '[]',
  kpi TEXT,
  category TEXT,
  is_promoted INTEGER DEFAULT 0,
  promoted_to_report_id TEXT REFERENCES research_reports(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_observations_created ON observations(created_at);

-- BIAS MODE CHECKS
CREATE TABLE IF NOT EXISTS bias_mode_checks (
  id TEXT PRIMARY KEY,
  ticker_id TEXT NOT NULL REFERENCES tickers(id) ON DELETE CASCADE,
  report_id TEXT REFERENCES research_reports(id) ON DELETE SET NULL,
  fundamental_score REAL NOT NULL,
  market_score REAL NOT NULL,
  sentiment_score REAL NOT NULL,
  alt_data_score REAL NOT NULL,
  weighted_composite REAL NOT NULL,
  triple_test_result TEXT CHECK(triple_test_result IN ('false_positive','genuine_deterioration','inconclusive')),
  triple_test_detail TEXT,
  key_signals TEXT,
  checked_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bias_checks_ticker ON bias_mode_checks(ticker_id);

-- SCHEDULED JOBS
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL,
  cron_expression TEXT,
  agent_type TEXT NOT NULL,
  parameters TEXT,
  is_active INTEGER DEFAULT 1,
  last_run TEXT,
  next_run TEXT,
  last_status TEXT CHECK(last_status IN ('pending','running','completed','failed','cancelled')),
  last_error TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- SYSTEM CONFIG
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
