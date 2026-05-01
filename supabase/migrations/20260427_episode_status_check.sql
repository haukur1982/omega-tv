-- ══════════════════════════════════════════════════════════════════════
-- Migration: enforce episodes.status enum at the DB layer
-- ══════════════════════════════════════════════════════════════════════
-- Today the column is a freeform TEXT defaulting to 'published'. The app
-- only writes 'draft' or 'published', but nothing prevents a typo or a
-- future bug from storing an invalid value, which would silently drop
-- the episode out of every public query.
--
-- We add a CHECK constraint so the database refuses any value outside
-- the canonical set. If/when we add a new state (e.g. 'archived' or
-- 'scheduled'), update the constraint in a follow-up migration.
--
-- Safe to run multiple times: drops the existing constraint by name first.

ALTER TABLE episodes
    DROP CONSTRAINT IF EXISTS episodes_status_check;

-- Allow 'draft' and 'published' only. Other values fail the insert/update.
ALTER TABLE episodes
    ADD CONSTRAINT episodes_status_check
    CHECK (status IN ('draft', 'published'));

COMMENT ON CONSTRAINT episodes_status_check ON episodes IS
  'Status must be draft or published. Update this constraint when adding new lifecycle states (archived, scheduled, etc.) — DO NOT remove it.';
