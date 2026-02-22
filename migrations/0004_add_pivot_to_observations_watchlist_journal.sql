-- ============================================================
-- Migration: Add episodic pivot support to Observations, Watchlist, and Trade Journal
-- 1. Adds pivot fields to observations table
-- 2. Adds pivot-watching fields to tickers table
-- 3. Adds episodic_pivot_json to portfolio_positions
-- 4. Adds episodic_pivot_json to trade_signals
-- ============================================================

-- ── 1. Observations: Add pivot fields ──
ALTER TABLE observations ADD COLUMN is_potential_pivot INTEGER DEFAULT 0;
ALTER TABLE observations ADD COLUMN pivot_type TEXT;
ALTER TABLE observations ADD COLUMN pivot_magnitude TEXT CHECK(pivot_magnitude IN ('high','medium','low'));
ALTER TABLE observations ADD COLUMN catalyst_date TEXT;
ALTER TABLE observations ADD COLUMN reality_change TEXT;

-- ── 2. Tickers: Add pivot-watching fields ──
ALTER TABLE tickers ADD COLUMN pivot_watch INTEGER DEFAULT 0;
ALTER TABLE tickers ADD COLUMN pivot_watch_notes TEXT;
ALTER TABLE tickers ADD COLUMN pivot_watch_type TEXT;
ALTER TABLE tickers ADD COLUMN pivot_watch_updated_at TEXT;

-- ── 3. Portfolio Positions: Add episodic pivot context ──
ALTER TABLE portfolio_positions ADD COLUMN episodic_pivot_json TEXT;

-- ── 4. Trade Signals: Add episodic pivot context ──
ALTER TABLE trade_signals ADD COLUMN episodic_pivot_json TEXT;

-- ── 5. Add index for pivot observations ──
CREATE INDEX IF NOT EXISTS idx_observations_pivot ON observations(is_potential_pivot) WHERE is_potential_pivot = 1;

-- ── 6. Add index for pivot-watched tickers ──
CREATE INDEX IF NOT EXISTS idx_tickers_pivot_watch ON tickers(pivot_watch) WHERE pivot_watch = 1;
