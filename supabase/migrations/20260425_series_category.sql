-- 20260425_series_category.sql
--
-- Series category — lets the Þáttasafn page group shows by where they
-- come from (Omega-produced / Icelandic partners / international /
-- documentaries / music / kids) without hardcoding a mapping in code.
--
-- Same pattern as articles.category — single TEXT column, partial
-- index for filtered queries, NULL means "uncategorized" and won't
-- show up in any of the curated sections (a fallback for new series
-- that haven't been tagged yet).
--
-- Suggested values used by the /sermons page:
--   'omega-produced'    — Sunnudagssamkoma, Bænakvöld, Útsending, TrúarLíf, ...
--   'iceland-partners'  — CTF, United, Hvítasunnukirkjan, ...
--   'international'     — Times Square, Shekinah, CBN, Joyce Meyer, ONE FOR ISRAEL, ...
--   'documentaries'     — Fingur Guðs, Hinir útvöldu, Svo að við gleymum EKKI, ...
--   'music'             — Lofgjörð, Tónleikakvöld, Bethel, ...
--   'kids'              — Barnaefni, Ævintýravindar, Fjölskyldustund

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS category TEXT;

CREATE INDEX IF NOT EXISTS series_category_idx
  ON series (category)
  WHERE category IS NOT NULL;

COMMENT ON COLUMN series.category IS
  'Section tag for the Þáttasafn editorial layout. NULL = uncategorized. Suggested values: omega-produced, iceland-partners, international, documentaries, music, kids.';
