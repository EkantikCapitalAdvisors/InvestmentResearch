-- ============================================================
-- Migration: Add social_sentiment agent type
-- SQLite doesn't support ALTER TABLE to modify CHECK constraints,
-- so we recreate the research_reports table with the new constraint
-- ============================================================

-- Step 1: Create new table with updated constraint
CREATE TABLE IF NOT EXISTS research_reports_new (
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

-- Step 2: Copy existing data
INSERT INTO research_reports_new SELECT * FROM research_reports;

-- Step 3: Drop old table
DROP TABLE research_reports;

-- Step 4: Rename new table
ALTER TABLE research_reports_new RENAME TO research_reports;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_reports_agent ON research_reports(agent_type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON research_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_impact ON research_reports(impact_score);
