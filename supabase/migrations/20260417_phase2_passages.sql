-- ═══════════════════════════════════════════════════════════════════
-- Migration: Phase 2 — Threads of Scripture
--
-- See plans/twinkling-mapping-pizza.md §7 for the full data model.
--
-- Adds the spine for the whole redesign: every sermon anchors to ONE
-- Bible passage, and that single field is the connective tissue between
-- episodes / articles / prayers / (eventually courses).
--
-- OSIS canonical refs (e.g. "MAT.5.3-MAT.5.10") are stored as text.
-- A passage-autocomplete widget in admin prevents drift (Phase 2b).
-- ═══════════════════════════════════════════════════════════════════

-- ── episodes ────────────────────────────────────────────────────────
ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS bible_ref          TEXT,
  ADD COLUMN IF NOT EXISTS editor_note        TEXT,
  ADD COLUMN IF NOT EXISTS captions_available TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS chapters           JSONB,
  ADD COLUMN IF NOT EXISTS transcript_url     TEXT,
  ADD COLUMN IF NOT EXISTS tags               TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS language_primary   TEXT DEFAULT 'is';

COMMENT ON COLUMN episodes.bible_ref IS
  'OSIS canonical reference, e.g. "MAT.5.3-MAT.5.10". Single anchor passage. Connects to articles/prayers via this field.';
COMMENT ON COLUMN episodes.editor_note IS
  '40–80 words of editor voice shown above the sermon synopsis on detail page.';
COMMENT ON COLUMN episodes.captions_available IS
  'Language codes (BCP47/ISO) of caption tracks available on the Bunny video, e.g. {is,en,de}. Populated by the Azotus pipeline.';
COMMENT ON COLUMN episodes.chapters IS
  'Array of {t: seconds, title: string} objects used to render chapter markers on the scrub bar and an expandable chapter list in the sidebar.';
COMMENT ON COLUMN episodes.transcript_url IS
  'URL of a WebVTT transcript (language default = language_primary). Additional languages are resolved via captions_available.';

-- Index for passage-based lookups (the hot path for threads-of-Scripture)
CREATE INDEX IF NOT EXISTS idx_episodes_bible_ref ON episodes (bible_ref) WHERE bible_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_episodes_tags ON episodes USING GIN (tags);

-- ── prayers ────────────────────────────────────────────────────────
ALTER TABLE prayers
  ADD COLUMN IF NOT EXISTS bible_ref  TEXT,
  ADD COLUMN IF NOT EXISTS sermon_id  UUID REFERENCES episodes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS season_tag TEXT;

COMMENT ON COLUMN prayers.bible_ref IS
  'Optional OSIS passage this prayer is anchored to (for threads-of-Scripture).';
COMMENT ON COLUMN prayers.sermon_id IS
  'If submitted during a broadcast, the episode the prayer was prayed over.';
COMMENT ON COLUMN prayers.season_tag IS
  'Liturgical season for seasonal surfaces (advent, lent, easter, ordinary).';

CREATE INDEX IF NOT EXISTS idx_prayers_bible_ref ON prayers (bible_ref) WHERE bible_ref IS NOT NULL;

-- ── articles ───────────────────────────────────────────────────────
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS bible_refs       TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tags             TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS reading_minutes  INTEGER,
  ADD COLUMN IF NOT EXISTS editor_note      TEXT;

COMMENT ON COLUMN articles.bible_refs IS
  'Passages this article engages (multiple allowed, unlike sermons). Any overlap with a sermon''s bible_ref surfaces the article in that sermon''s threads sidebar.';

CREATE INDEX IF NOT EXISTS idx_articles_bible_refs ON articles USING GIN (bible_refs);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN (tags);

-- ═══════════════════════════════════════════════════════════════════
-- bible_passages — normalized cache for rendering
--
-- One-time import from a public-domain Icelandic translation.
-- Small seed included below so the UI has something to render before
-- the full import ships. Each row maps one canonical OSIS ref to its
-- display string + Icelandic text + English text + cross-refs.
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bible_passages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_canonical   TEXT NOT NULL UNIQUE,    -- "MAT.5.3-MAT.5.10"
  ref_display_is  TEXT NOT NULL,           -- "Matteus 5:3–10"
  ref_display_en  TEXT,                    -- "Matthew 5:3–10"
  text_is         TEXT,                    -- Icelandic translation (public domain)
  text_en         TEXT,                    -- English (ESV/KJV PD)
  cross_refs      TEXT[] DEFAULT '{}'::text[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bible_passages_canonical ON bible_passages (ref_canonical);

-- RLS: public read, service-role write (same pattern as other content tables)
ALTER TABLE bible_passages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bible_passages_public_read" ON bible_passages;
CREATE POLICY "bible_passages_public_read"
  ON bible_passages FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "bible_passages_service_all" ON bible_passages;
CREATE POLICY "bible_passages_service_all"
  ON bible_passages FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Seed: a handful of passages so the UI isn't empty on ship ──────
-- Icelandic text: Biblían 1912/1981 (public domain) — placeholder values,
-- replace with verified text during the full import pass.
INSERT INTO bible_passages (ref_canonical, ref_display_is, ref_display_en, text_is, text_en) VALUES
  ('JHN.3.16', 'Jóhannes 3:16', 'John 3:16',
   'Því svo elskaði Guð heiminn, að hann gaf son sinn eingetinn, til þess að hver sem á hann trúir glatist ekki, heldur hafi eilíft líf.',
   'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.'),
  ('MAT.5.3-MAT.5.10', 'Matteus 5:3–10', 'Matthew 5:3–10',
   'Sælir eru fátækir í anda, því að þeirra er himnaríki. Sælir eru sorgmæddir, því að þeir munu huggaðir verða. Sælir eru hógværir, því að þeir munu jörðina erfa. Sælir eru þeir sem hungrar og þyrstir eftir réttlætinu, því að þeir munu saddir verða. Sælir eru miskunnsamir, því að þeim mun miskunnað verða. Sælir eru hjartahreinir, því að þeir munu Guð sjá. Sælir eru friðflytjendur, því að þeir munu Guðs börn kallaðir verða. Sælir eru þeir sem ofsóttir eru fyrir réttlætis sakir, því að þeirra er himnaríki.',
   'Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness, for they shall be satisfied. Blessed are the merciful, for they shall receive mercy. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers, for they shall be called sons of God. Blessed are those who are persecuted for righteousness'' sake, for theirs is the kingdom of heaven.'),
  ('PSA.23', 'Sálmarnir 23', 'Psalm 23',
   'Drottinn er minn hirðir, mig mun ekkert bresta. Á grænum grundum lætur hann mig hvílast, leiðir mig að vötnum þar sem ég má næðis njóta.',
   'The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.'),
  ('ROM.8.28', 'Rómverjabréfið 8:28', 'Romans 8:28',
   'Vér vitum, að þeim sem Guð elska, samverkar allt til góðs, þeim sem kallaðir eru eftir fyrirætlun Guðs.',
   'And we know that for those who love God all things work together for good, for those who are called according to his purpose.'),
  ('PHP.4.6-PHP.4.7', 'Filippíbréfið 4:6–7', 'Philippians 4:6–7',
   'Verið ekki hugsjúkir um neitt, heldur gerið í öllum hlutum óskir yðar kunnar Guði með bæn og beiðni og þakkargjörð. Og friður Guðs, sem er æðri öllum skilningi, mun varðveita hjörtu yðar og hugsanir yðar í Kristi Jesú.',
   'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.')
ON CONFLICT (ref_canonical) DO NOTHING;
