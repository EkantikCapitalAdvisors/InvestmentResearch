-- ============================================================
-- Migration: Add episodic_pivot support
-- 1. Adds episodic_pivot_json column to research_reports
-- 2. Adds 'episodic_pivot' to agent_type CHECK constraint
-- 3. Creates index on pivot_type for filtering
-- ============================================================

-- Step 1: Create new table with updated constraint + new column
CREATE TABLE IF NOT EXISTS research_reports_new (
  id TEXT PRIMARY KEY,
  agent_type TEXT NOT NULL CHECK(agent_type IN ('material_events','bias_mode','mag7_monitor','aomg_scanner','hot_micro','hot_macro','doubler','ai_scorer','portfolio_heat','superlative_products','social_sentiment','episodic_pivot')),
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
  episodic_pivot_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Step 2: Copy existing data (add NULL for new column)
INSERT INTO research_reports_new (
  id, agent_type, ticker_symbols, trigger_source, model_used, api_mode,
  raw_markdown, structured_json, impact_score, ai_composite_score,
  conviction_level, token_usage, cost_estimate, processing_time_ms,
  status, error_message, slack_channel_id, slack_message_ts, created_at
)
SELECT 
  id, agent_type, ticker_symbols, trigger_source, model_used, api_mode,
  raw_markdown, structured_json, impact_score, ai_composite_score,
  conviction_level, token_usage, cost_estimate, processing_time_ms,
  status, error_message, slack_channel_id, slack_message_ts, created_at
FROM research_reports;

-- Step 3: Drop old table
DROP TABLE research_reports;

-- Step 4: Rename new table
ALTER TABLE research_reports_new RENAME TO research_reports;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_reports_agent ON research_reports(agent_type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON research_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_impact ON research_reports(impact_score);

-- Step 6: Add index for pivot type filtering (extract from JSON not possible in SQLite,
-- but the column presence enables application-level filtering)
