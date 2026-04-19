-- ═══════════════════════════════════════════════════════════════════
-- Migration: programs table + schedule_slots enrichment flags
--
-- The playout system generates a daily XML with bare schedule data
-- (time + title only) and posts it to FTP for the cable network. The
-- website now imports that XML and ENRICHES each slot with rich
-- metadata — program_type, host, description, live/featured flags —
-- looked up from this `programs` table by title.
--
-- Workflow:
--   1. Hawk defines each recurring show ONCE in /admin/programs.
--   2. Daily XML import matches title → programs row → enriches.
--   3. New shows in XML without a programs row = nudge to define.
--   4. Ad-hoc admin overrides on schedule_slots survive re-sync via
--      is_manual_override flag.
--
-- See docs/content-pipeline.md for the full flow.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS programs (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Match key — must match XML title exactly (trailing whitespace is
  -- trimmed by the importer before lookup)
  title                  TEXT NOT NULL UNIQUE,
  -- Allowed: 'service' | 'prayer_night' | 'teaching' | 'broadcast' |
  --          'rerun' | 'special' | 'filler'
  program_type           TEXT NOT NULL DEFAULT 'rerun',
  host_name              TEXT,
  description            TEXT,
  -- When TRUE, airings of this show default to is_live_broadcast=TRUE
  is_usually_live        BOOLEAN NOT NULL DEFAULT FALSE,
  -- When TRUE, airings of this show default to is_featured=TRUE
  is_featured_default    BOOLEAN NOT NULL DEFAULT FALSE,
  -- Optional OSIS ref the show is anchored to (rare — most are
  -- left blank and set per-episode)
  default_bible_ref      TEXT,
  -- Optional thematic tags applied to airings
  default_tags           TEXT[] DEFAULT '{}'::text[],
  -- Optional link into series table (connects shows to their VOD)
  series_id              UUID REFERENCES series(id) ON DELETE SET NULL,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_title ON programs (title);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "programs_public_read" ON programs;
CREATE POLICY "programs_public_read"
  ON programs FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "programs_service_all" ON programs;
CREATE POLICY "programs_service_all"
  ON programs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════
-- schedule_slots: add tracking flags for XML-sync safety
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE schedule_slots
  ADD COLUMN IF NOT EXISTS is_manual_override BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS xml_source_id      TEXT;

COMMENT ON COLUMN schedule_slots.is_manual_override IS
  'TRUE when this slot was created or edited manually in admin. These slots survive XML re-sync; slots with is_manual_override=FALSE and xml_source_id IS NOT NULL are purged before each sync.';
COMMENT ON COLUMN schedule_slots.xml_source_id IS
  'The <ID> value from the source XML (e.g. "1", "2") for slots imported from the playout system. NULL for slots created manually in admin.';

CREATE INDEX IF NOT EXISTS idx_schedule_slots_xml_source
  ON schedule_slots (xml_source_id)
  WHERE xml_source_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════
-- Seed data is NOT in this migration file.
--
-- Icelandic text pasted through the Supabase SQL editor corrupts UTF-8
-- silently (observed 2026-04-18). Programs are seeded via a Node
-- service-role client which preserves bytes end-to-end.
--
-- Run after applying this migration:
--   pnpm exec tsx --env-file=.env.local scripts/seed-programs.ts
-- ═══════════════════════════════════════════════════════════════════
