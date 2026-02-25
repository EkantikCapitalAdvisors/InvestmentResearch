-- Migration: Add file upload support for Observations
-- Stores uploaded reports/files attached to individual observations or the observations section in general

CREATE TABLE IF NOT EXISTS observation_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  observation_id TEXT,                    -- optional: link to a specific observation (NULL = general file)
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,                -- MIME type e.g. text/markdown, application/pdf
  file_size INTEGER NOT NULL,             -- original size in bytes
  content_b64 TEXT NOT NULL,              -- base64-encoded file content
  notes TEXT,                             -- optional user notes
  uploaded_by TEXT DEFAULT 'portal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_observation_files_obs ON observation_files(observation_id);
CREATE INDEX IF NOT EXISTS idx_observation_files_created ON observation_files(created_at DESC);
