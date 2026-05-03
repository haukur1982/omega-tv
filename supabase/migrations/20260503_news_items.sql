-- ══════════════════════════════════════════════════════════════════════
-- Migration: news_items — translated Christian world news
-- ══════════════════════════════════════════════════════════════════════
-- Distinct from `articles` on purpose. Articles are evergreen teaching
-- (the kind you re-read a year later). News is time-sensitive: what
-- happened in the global church this week.
--
-- Editorial practice (enforced by NOT NULL on source fields):
--   - Every news item credits its source by name
--   - Every news item links back to the original
--   - We publish 2-3 paragraph Icelandic summaries, not full reposts
--
-- Categories are a small known set; not enforced as enum so we can
-- extend without another migration.

CREATE TABLE IF NOT EXISTS news_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT,

    -- Source attribution — required, never null. The public detail page
    -- renders "Heimild: <source_name> →" linked to source_url at the top
    -- of every story, so this row CAN'T quietly be published without credit.
    source_url TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_published_at TIMESTAMPTZ,

    -- Editorial metadata
    region TEXT,
    category TEXT,
    image_url TEXT,
    editor_note TEXT,

    -- Lifecycle
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS news_items_published_at_idx
    ON news_items (published_at DESC)
    WHERE is_published = true;

CREATE INDEX IF NOT EXISTS news_items_category_idx
    ON news_items (category)
    WHERE category IS NOT NULL AND is_published = true;

CREATE INDEX IF NOT EXISTS news_items_slug_idx
    ON news_items (slug);

COMMENT ON TABLE news_items IS
  'Translated Christian world news. Time-sensitive, source-attributed. Read at /frettir.';
COMMENT ON COLUMN news_items.summary IS
  'Short 2-3 sentence preview shown in the /frettir feed cards.';
COMMENT ON COLUMN news_items.body IS
  'Full Icelandic translation/summary, 3-6 paragraphs. Always credits source_url at top.';
COMMENT ON COLUMN news_items.category IS
  'persecution / kingdom-growth / missions / israel / general — extend as needed.';

NOTIFY pgrst, 'reload schema';
