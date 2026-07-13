-- =============================================================================
-- schema-gaplog.sql — K228 / Build 1.5a — Yūrei Gap Log (admin testing lane)
-- =============================================================================
-- Additive migration to the EXISTING wuld-comments D1 (admin Worker binding
-- COMMENTS_DB, id fbae13d3-7ec2-4c09-96a8-031046241f5a). Touches NO comments
-- table. Idempotent (IF NOT EXISTS) — safe to re-run.
--
-- PRIVACY FLOOR (invariant, not a runtime promise):
--   * NO identity field of any kind exists in either table — no IP, no
--     session/cookie id, no user-agent, no account handle. There is nothing
--     here to tie a row to a person; the testing lane is provably Josiah's by
--     the Cloudflare Access mount, never by anything stored.
--   * Dates are DAY-GRANULAR only (YYYY-MM-DD, America/Phoenix).
--   * Miss lane stores PII-scrubbed content + a dedup count. The hit-quality
--     lane stores entry_id + kind ONLY — never query content.
--   * persona-scoped ('yurei'); a future Omega/proxy log is a SEPARATE store,
--     never commingled (design v0.5 §4.5 / §5).
--
-- Operator runs (after the Worker deploy):
--   npx wrangler d1 execute wuld-comments --file schema-gaplog.sql --remote
-- =============================================================================

-- ---- Miss lane: coverage gaps (below-threshold or all-damped; never repeats) --
CREATE TABLE IF NOT EXISTS gap_log_miss (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  persona          TEXT    NOT NULL DEFAULT 'yurei',
  content_scrubbed TEXT    NOT NULL,
  class            TEXT    NOT NULL DEFAULT 'below_threshold',  -- below_threshold | all_damped
  count            INTEGER NOT NULL DEFAULT 1,
  first_date       TEXT    NOT NULL,                            -- YYYY-MM-DD (America/Phoenix)
  last_date        TEXT    NOT NULL,
  resolved         INTEGER NOT NULL DEFAULT 0                   -- 0 | 1 (manual mark; never auto-deleted)
);
CREATE UNIQUE INDEX IF NOT EXISTS gap_log_miss_key
  ON gap_log_miss (persona, content_scrubbed);

-- ---- Hit-quality lane: thin-hit flags + novel/repetitive votes (by entry_id) --
CREATE TABLE IF NOT EXISTS gap_log_hit (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  persona    TEXT    NOT NULL DEFAULT 'yurei',
  entry_id   TEXT    NOT NULL,
  kind       TEXT    NOT NULL,                                  -- thin | novel | repetitive
  count      INTEGER NOT NULL DEFAULT 1,
  first_date TEXT    NOT NULL,
  last_date  TEXT    NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS gap_log_hit_key
  ON gap_log_hit (persona, entry_id, kind);
