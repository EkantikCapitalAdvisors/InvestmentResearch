-- ============================================================
-- CONTENT PUBLISHING — Subscriber-facing intelligence entries
-- ============================================================

-- INTELLIGENCE ENTRIES: Published content for subscriber feed
CREATE TABLE IF NOT EXISTS intelligence_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK(category IN ('daily_intelligence','value_opportunity','multibagger_report','aomg_trend','market_commentary','watchlist_update','avoid_list')),
  framework_source TEXT,
  body_markdown TEXT NOT NULL,
  summary TEXT,
  ticker_symbols TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  impact_score TEXT CHECK(impact_score IN ('HIGH','MEDIUM','LOW')),
  conviction_level TEXT CHECK(conviction_level IN ('HIGH','MEDIUM','LOW')),
  earnings_impact_estimate TEXT,
  catalyst_description TEXT,
  catalyst_date TEXT,
  portfolio_implication TEXT,
  sources TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','needs_review','scheduled','published','archived')),
  published_at TEXT,
  scheduled_for TEXT,
  ingestion_source TEXT DEFAULT 'manual' CHECK(ingestion_source IN ('manual','auto','api')),
  source_report_id TEXT REFERENCES research_reports(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_intel_entries_status ON intelligence_entries(status);
CREATE INDEX IF NOT EXISTS idx_intel_entries_category ON intelligence_entries(category);
CREATE INDEX IF NOT EXISTS idx_intel_entries_published ON intelligence_entries(published_at);
CREATE INDEX IF NOT EXISTS idx_intel_entries_slug ON intelligence_entries(slug);

-- WATCHLIST ENTRIES: Subscriber-facing curated watchlist
CREATE TABLE IF NOT EXISTS watchlist_entries (
  id TEXT PRIMARY KEY,
  ticker_symbol TEXT NOT NULL,
  company_name TEXT,
  watchlist_category TEXT CHECK(watchlist_category IN ('value_opportunity','aomg_play','multibagger_candidate','episodic_pivot','counter_trend')),
  status TEXT DEFAULT 'monitoring' CHECK(status IN ('monitoring','approaching_entry','active','closed_hit','closed_invalidated')),
  conviction_level TEXT CHECK(conviction_level IN ('HIGH','MEDIUM','LOW')),
  key_catalyst TEXT,
  catalyst_date TEXT,
  thesis_summary TEXT,
  entry_framework TEXT DEFAULT '{}',
  invalidation_criteria TEXT,
  last_updated TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_watchlist_entries_status ON watchlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_entries_ticker ON watchlist_entries(ticker_symbol);

-- AVOID LIST ENTRIES: Broken business model reports
CREATE TABLE IF NOT EXISTS avoid_list_entries (
  id TEXT PRIMARY KEY,
  ticker_symbol TEXT NOT NULL,
  company_name TEXT,
  threat_category TEXT CHECK(threat_category IN ('ai_displacement','tech_obsolescence','regulatory','platform_disintermediation','demand_destruction','commoditization')),
  obsolescence_score REAL,
  revenue_at_risk_pct INTEGER,
  decline_timeline TEXT,
  status TEXT DEFAULT 'early_warning' CHECK(status IN ('actively_declining','early_warning','structural_shift')),
  summary TEXT,
  full_analysis TEXT,
  published_at TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_avoid_list_ticker ON avoid_list_entries(ticker_symbol);

-- SUBSCRIBER TREND THEMES: Curated AOMG data for subscribers
CREATE TABLE IF NOT EXISTS subscriber_trend_themes (
  id TEXT PRIMARY KEY,
  theme_title TEXT NOT NULL,
  quarter TEXT NOT NULL,
  thesis TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','monitoring','closed')),
  ai_score REAL,
  key_beneficiaries TEXT DEFAULT '[]',
  tam INTEGER,
  sam INTEGER,
  som INTEGER,
  drivers TEXT DEFAULT '[]',
  constraints TEXT DEFAULT '[]',
  key_catalysts TEXT DEFAULT '[]',
  investment_implication TEXT,
  disruption_score REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sub_trends_status ON subscriber_trend_themes(status);
