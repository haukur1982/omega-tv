-- ══════════════════════════════════════════════════════════════════════
-- Migration: system_events — minimal observability log
-- ══════════════════════════════════════════════════════════════════════
-- Today every error goes to console.* and disappears into Vercel logs.
-- This table is a small append-only audit trail for the events that
-- matter when something goes sideways: cron jobs, payment intents,
-- newsletter sends, Bunny upload failures, schedule import skips.
--
-- Not a full APM. Not a replacement for proper error tracking. Just
-- enough so the admin can answer "did the cron run last night?" from
-- /admin/health without grepping logs.
--
-- Severity values: info | warn | error. No CHECK constraint yet so we
-- can extend later (e.g. 'critical') without another migration.

CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    payload JSONB,
    actor TEXT
);

CREATE INDEX IF NOT EXISTS system_events_created_at_idx
    ON system_events (created_at DESC);

CREATE INDEX IF NOT EXISTS system_events_severity_idx
    ON system_events (severity)
    WHERE severity IN ('warn', 'error');

CREATE INDEX IF NOT EXISTS system_events_event_type_idx
    ON system_events (event_type, created_at DESC);

COMMENT ON TABLE system_events IS
  'Append-only audit log for cron runs, sends, imports, Bunny ops, and other server-side events. Read at /admin/health.';

NOTIFY pgrst, 'reload schema';
