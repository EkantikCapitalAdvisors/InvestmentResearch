-- ============================================================
-- SUBSCRIBERS & AUTH — Dual-mode portal support
-- ============================================================

-- SUBSCRIBERS: User accounts for both admin and subscriber roles
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'trial' CHECK(role IN ('admin','subscriber','trial','expired')),
  plan TEXT DEFAULT 'trial' CHECK(plan IN ('trial','active_monthly','active_annual','past_due','cancelled','expired')),
  magic_link_token TEXT,
  magic_link_expires TEXT,
  trial_start TEXT DEFAULT (datetime('now')),
  trial_end TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_status TEXT,
  stripe_current_period_end TEXT,
  notification_prefs TEXT DEFAULT '{}',
  push_subscription TEXT,
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_role ON subscribers(role);
CREATE INDEX IF NOT EXISTS idx_subscribers_magic_token ON subscribers(magic_link_token) WHERE magic_link_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe ON subscribers(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ADMIN AUDIT LOG: Track all admin publish/edit/delete actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('publish','edit','delete','schedule','bulk_import','status_change','role_change','trial_extend')),
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at);
