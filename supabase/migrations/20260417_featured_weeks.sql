-- Migration: featured_weeks
--
-- The homepage reads from this table. One row per week, written by admin.
-- Replaces the "hero = one hardcoded image" pattern. See plans/twinkling-mapping-pizza.md §4.1.
--
-- Phase 1 uses it minimally — later phases add sermon_id_pick, article_id_pick,
-- prayer_id_pick, featured_passage_id as the cross-content threads go live.

CREATE TABLE IF NOT EXISTS featured_weeks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date     DATE NOT NULL,

  -- Visual
  hero_image_url      TEXT NOT NULL,
  hero_image_alt      TEXT,

  -- Copy
  kicker              TEXT NOT NULL,   -- e.g. "SÝNING VIKUNNAR · FÖSTUDAGUR 18. APRÍL · KL. 20:00"
  headline            TEXT NOT NULL,   -- Vaka display serif
  body                TEXT NOT NULL,   -- 40–60 words of editorial curation

  -- Actions
  primary_cta_label   TEXT NOT NULL DEFAULT 'Horfa beint',
  primary_cta_href    TEXT NOT NULL DEFAULT '/live',
  secondary_cta_label TEXT,
  secondary_cta_href  TEXT,

  -- Forward-compat picks (populate in later phases)
  sermon_id_pick       UUID REFERENCES episodes(id) ON DELETE SET NULL,
  article_id_pick      UUID REFERENCES articles(id) ON DELETE SET NULL,
  prayer_id_pick       UUID REFERENCES prayers(id) ON DELETE SET NULL,
  featured_passage_ref TEXT,   -- OSIS canonical, e.g. "MAT.5.3-MAT.5.10" (phase 2+)
  featured_series_id   UUID REFERENCES series(id) ON DELETE SET NULL,

  -- State
  is_fallback         BOOLEAN NOT NULL DEFAULT FALSE,  -- evergreen row when no new letter shipped
  published_at        TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One current feature per week_start_date, published ones only
CREATE UNIQUE INDEX IF NOT EXISTS uniq_featured_week_published
  ON featured_weeks (week_start_date)
  WHERE published_at IS NOT NULL;

-- Common query: "most recent published week, fall back to fallback row"
CREATE INDEX IF NOT EXISTS idx_featured_weeks_published_at
  ON featured_weeks (published_at DESC);

-- RLS — public read for published rows, full write for service role only
ALTER TABLE featured_weeks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "featured_weeks_public_read" ON featured_weeks;
CREATE POLICY "featured_weeks_public_read"
  ON featured_weeks
  FOR SELECT
  USING (published_at IS NOT NULL);

DROP POLICY IF EXISTS "featured_weeks_service_all" ON featured_weeks;
CREATE POLICY "featured_weeks_service_all"
  ON featured_weeks
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ───────────────────────────────────────────────────────────────────
-- Phase 1 seed — one fallback row so the homepage has something to render
-- even before admin writes a real weekly feature.
-- ───────────────────────────────────────────────────────────────────
INSERT INTO featured_weeks (
  week_start_date,
  hero_image_url,
  hero_image_alt,
  kicker,
  headline,
  body,
  primary_cta_label,
  primary_cta_href,
  secondary_cta_label,
  secondary_cta_href,
  is_fallback,
  published_at
) VALUES (
  '2026-04-13',
  'https://images.unsplash.com/photo-1504829857797-ddff29c27927?q=80&w=2600&auto=format&fit=crop',
  'Íslenskt landslag í vetrarbirtu',
  'OMEGA · KRISTIN FJÖLMIÐLASTÖÐ SÍÐAN 1992',
  'Von og sannleikur fyrir Ísland.',
  'Omega er útvarpsstöð á íslensku — beint, þáttasafn, greinar og námskeið sem miða að því að kynna fólk fyrir Jesú Kristi. Komdu við og vertu með okkur í vikunni.',
  'Horfa beint',
  '/live',
  'Skoða safnið',
  '/sermons',
  TRUE,
  NOW()
)
ON CONFLICT DO NOTHING;
