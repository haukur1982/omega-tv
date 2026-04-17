-- ═══════════════════════════════════════════════════════════════════
-- Migration: Phase 3 — schedule_slots
--
-- Replaces the hardcoded LiveSchedule component + FTP-sourced schedule
-- with a Supabase-backed table that the /live page and the homepage
-- "Dagskrá vikunnar" strip both read from. See plan §4.1 row 4, §4.3.
--
-- The existing /api/schedule FTP route stays in place as a fallback
-- until the DB is fully populated; new components prefer DB.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS schedule_slots (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at            TIMESTAMPTZ NOT NULL,
  ends_at              TIMESTAMPTZ NOT NULL,

  -- Content
  program_title        TEXT NOT NULL,
  program_subtitle     TEXT,              -- Optional second line ("Þáttur 12" etc.)
  program_type         TEXT NOT NULL DEFAULT 'rerun',
  -- Allowed: 'service' (Sunday), 'prayer_night', 'teaching', 'broadcast',
  --          'rerun', 'special', 'filler'

  -- Links to existing content
  episode_id           UUID REFERENCES episodes(id) ON DELETE SET NULL,
  series_id            UUID REFERENCES series(id) ON DELETE SET NULL,

  -- Presentation
  host_name            TEXT,
  description          TEXT,              -- Short one-line description for schedule rows

  -- State
  is_live_broadcast    BOOLEAN NOT NULL DEFAULT FALSE,  -- Will be aired live (not rerun)
  is_featured          BOOLEAN NOT NULL DEFAULT FALSE,  -- Highlight (e.g. Sunday service)
  reminder_count       INTEGER NOT NULL DEFAULT 0,      -- Incremented on .ics download

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_schedule_slots_starts_at ON schedule_slots (starts_at);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_live ON schedule_slots (is_live_broadcast, starts_at);

-- RLS — public read, service role full write
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedule_slots_public_read" ON schedule_slots;
CREATE POLICY "schedule_slots_public_read"
  ON schedule_slots FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "schedule_slots_service_all" ON schedule_slots;
CREATE POLICY "schedule_slots_service_all"
  ON schedule_slots FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════
-- Seed: a realistic week of programming (2026-04-13 → 2026-04-19)
-- Times are stored as UTC but represent Reykjavík local wall-clock,
-- which in practice is UTC year-round (no DST in Iceland).
--
-- Rhythm modeled on the hardcoded live schedule in the old site + the
-- "Í snertingu / Sunnudagssamkoma / Bænakvöld" patterns in CLAUDE.md.
-- Hawk can edit these rows directly in Supabase.
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO schedule_slots (starts_at, ends_at, program_title, program_type, host_name, description, is_live_broadcast, is_featured) VALUES
  -- ── Monday 2026-04-13 ───────────────────────────────────────────
  ('2026-04-13 07:00:00+00', '2026-04-13 08:00:00+00', 'Morgunbæn',                   'prayer_night', 'Omega', 'Opnum daginn í bæn með íslenskri rödd.',       FALSE, FALSE),
  ('2026-04-13 12:00:00+00', '2026-04-13 13:00:00+00', 'Í Snertingu',                 'rerun',        'Dr. Charles Stanley', 'Daglegur boðskapur um náð og sannleika.', FALSE, FALSE),
  ('2026-04-13 18:00:00+00', '2026-04-13 19:00:00+00', 'Fræðsla',                     'teaching',     'Omega', 'Grunnatriði kristinnar trúar — vikulegur fræðsluþáttur.', FALSE, FALSE),
  ('2026-04-13 20:00:00+00', '2026-04-13 21:30:00+00', 'Sunnudagssamkoma (endurtekin)','rerun',       'Eiríkur Sigurbjörnsson', 'Samkoman frá síðasta sunnudegi.', FALSE, FALSE),

  -- ── Tuesday 2026-04-14 ─────────────────────────────────────────
  ('2026-04-14 07:00:00+00', '2026-04-14 08:00:00+00', 'Morgunbæn',                   'prayer_night', 'Omega', 'Opnum daginn í bæn.', FALSE, FALSE),
  ('2026-04-14 12:00:00+00', '2026-04-14 13:00:00+00', 'Í Snertingu',                 'rerun',        'Dr. Charles Stanley', 'Daglegur boðskapur.', FALSE, FALSE),
  ('2026-04-14 18:00:00+00', '2026-04-14 19:00:00+00', 'Vitnisburðir',                'teaching',     'Omega', 'Sögur af náð og endurnýjun.', FALSE, FALSE),
  ('2026-04-14 20:00:00+00', '2026-04-14 21:00:00+00', 'Omega Tímaritið',             'teaching',     'Omega', 'Vikuleg umfjöllun um trú og samtíma.', FALSE, FALSE),

  -- ── Wednesday 2026-04-15 ───────────────────────────────────────
  ('2026-04-15 07:00:00+00', '2026-04-15 08:00:00+00', 'Morgunbæn',                   'prayer_night', 'Omega', 'Opnum daginn í bæn.', FALSE, FALSE),
  ('2026-04-15 12:00:00+00', '2026-04-15 13:00:00+00', 'Í Snertingu',                 'rerun',        'Dr. Charles Stanley', 'Daglegur boðskapur.', FALSE, FALSE),
  ('2026-04-15 18:00:00+00', '2026-04-15 19:30:00+00', 'Bænakvöld',                   'prayer_night', 'Eiríkur Sigurbjörnsson', 'Vikulegt bænakvöld — bænir fyrir Ísland og fjölskyldur.', TRUE, TRUE),
  ('2026-04-15 20:00:00+00', '2026-04-15 21:00:00+00', 'Sunnudagssamkoma (endurtekin)','rerun',       'Eiríkur Sigurbjörnsson', 'Samkoman frá síðasta sunnudegi.', FALSE, FALSE),

  -- ── Thursday 2026-04-16 ────────────────────────────────────────
  ('2026-04-16 07:00:00+00', '2026-04-16 08:00:00+00', 'Morgunbæn',                   'prayer_night', 'Omega', 'Opnum daginn í bæn.', FALSE, FALSE),
  ('2026-04-16 12:00:00+00', '2026-04-16 13:00:00+00', 'Í Snertingu',                 'rerun',        'Dr. Charles Stanley', 'Daglegur boðskapur.', FALSE, FALSE),
  ('2026-04-16 18:00:00+00', '2026-04-16 19:00:00+00', 'Fræðsla',                     'teaching',     'Omega', 'Grunnatriði kristinnar trúar.', FALSE, FALSE),
  ('2026-04-16 20:00:00+00', '2026-04-16 21:00:00+00', 'Ísrael í brennidepli',        'special',      'Omega', 'Mánaðarleg umfjöllun um fyrirheitna landið.', FALSE, FALSE),

  -- ── Friday 2026-04-17 ──────────────────────────────────────────
  ('2026-04-17 07:00:00+00', '2026-04-17 08:00:00+00', 'Morgunbæn',                   'prayer_night', 'Omega', 'Opnum daginn í bæn.', FALSE, FALSE),
  ('2026-04-17 12:00:00+00', '2026-04-17 13:00:00+00', 'Í Snertingu',                 'rerun',        'Dr. Charles Stanley', 'Daglegur boðskapur.', FALSE, FALSE),
  ('2026-04-17 18:00:00+00', '2026-04-17 19:00:00+00', 'Vitnisburðir',                'teaching',     'Omega', 'Sögur af trú og von.', FALSE, FALSE),
  ('2026-04-17 20:00:00+00', '2026-04-17 21:30:00+00', 'Bænakvöld (endurtekið)',      'rerun',        'Eiríkur Sigurbjörnsson', 'Endurtekið bænakvöld frá miðvikudagskvöldi.', FALSE, FALSE),

  -- ── Saturday 2026-04-18 ────────────────────────────────────────
  ('2026-04-18 09:00:00+00', '2026-04-18 10:00:00+00', 'Fjölskyldustund',             'teaching',     'Omega', 'Biblíusögur og söngur fyrir börn og foreldra.', FALSE, FALSE),
  ('2026-04-18 12:00:00+00', '2026-04-18 13:00:00+00', 'Í Snertingu — vikuhlaðvarp',  'rerun',        'Dr. Charles Stanley', 'Safn vikunnar.', FALSE, FALSE),
  ('2026-04-18 19:00:00+00', '2026-04-18 20:30:00+00', 'Tónleikakvöld',               'special',      'Omega', 'Lofgjörð og íslenskir listamenn.', FALSE, FALSE),

  -- ── Sunday 2026-04-19 ──────────────────────────────────────────
  ('2026-04-19 07:00:00+00', '2026-04-19 08:00:00+00', 'Morgunbæn',                   'prayer_night', 'Omega', 'Opnum daginn í bæn.', FALSE, FALSE),
  ('2026-04-19 11:00:00+00', '2026-04-19 12:30:00+00', 'Sunnudagssamkoma',            'service',      'Eiríkur Sigurbjörnsson', 'Vikulegi lofgjörðar- og prédikunarþátturinn — í beinni útsendingu.', TRUE, TRUE),
  ('2026-04-19 14:00:00+00', '2026-04-19 15:00:00+00', 'Í Snertingu',                 'rerun',        'Dr. Charles Stanley', 'Daglegur boðskapur.', FALSE, FALSE),
  ('2026-04-19 19:00:00+00', '2026-04-19 20:00:00+00', 'Sunnudagssamkoma (endurtekin)','rerun',       'Eiríkur Sigurbjörnsson', 'Samkoman frá morgninum í dag.', FALSE, FALSE)
ON CONFLICT DO NOTHING;
