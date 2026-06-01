-- =============================================================================
-- wuld.ink comment board — D1 schema
-- Apply with:  wrangler d1 execute wuld-comments --remote --file=./schema.sql
-- (use --local first to test against the local dev DB if you want)
-- =============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  board      TEXT    NOT NULL DEFAULT 'global',   -- future: per-page key (e.g. essay slug)
  name       TEXT,                                 -- optional, nullable, unverified display name
  email      TEXT,                                 -- optional, PRIVATE — never returned by the public API,
                                                   --   never displayed; visible only in the Access-gated /admin
                                                   --   view so the operator can reply off-site. Drop this column
                                                   --   any time to revert to zero-PII: see README "Dropping email".
  body       TEXT    NOT NULL,
  created_at INTEGER NOT NULL,                      -- unix epoch milliseconds
  hidden     INTEGER NOT NULL DEFAULT 0,            -- soft-delete (1 = hidden from public, row kept)
  ip_hash    TEXT                                   -- salted SHA-256 of the client IP; raw IP is NEVER stored.
                                                    --   Used only for rate-limiting / abuse triage.
);

-- Public list query: WHERE board=? AND hidden=0 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_comments_board ON comments(board, hidden, created_at);

-- Rate-limit query: WHERE ip_hash=? AND created_at > (now - window)
CREATE INDEX IF NOT EXISTS idx_comments_ratelimit ON comments(ip_hash, created_at);
