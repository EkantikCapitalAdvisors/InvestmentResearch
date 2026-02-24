-- Uploaded reports: files attached to watchlist tickers (md, pdf, txt, doc, etc.)
-- Content stored as base64-encoded TEXT in D1 (no R2 needed)
CREATE TABLE IF NOT EXISTS uploaded_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker_symbol TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,        -- MIME type e.g. text/markdown, application/pdf
  file_size INTEGER NOT NULL,     -- original size in bytes
  content_b64 TEXT NOT NULL,      -- base64-encoded file content
  notes TEXT,                     -- optional user notes
  uploaded_by TEXT DEFAULT 'portal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploaded_reports_symbol ON uploaded_reports(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_uploaded_reports_created ON uploaded_reports(created_at DESC);
