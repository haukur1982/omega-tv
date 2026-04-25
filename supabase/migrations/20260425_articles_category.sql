-- 20260425_articles_category.sql
--
-- Articles category tag — lets articles be filtered into focused
-- sections without splitting them into separate tables.
--
-- Initial use: the /israel section. An article tagged 'israel' appears
-- in the general magazine (/greinar) AND surfaces in the Israel
-- section's reading list. NULL = general article (default behavior
-- for everything written before this migration).
--
-- Future-friendly: more categories can be added without schema change.
-- A partial index on non-NULL values keeps the general /greinar query
-- unaffected.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS category TEXT;

CREATE INDEX IF NOT EXISTS articles_category_idx
  ON articles (category)
  WHERE category IS NOT NULL;

COMMENT ON COLUMN articles.category IS
  'Optional section tag (e.g., ''israel''). NULL = general magazine article. Articles with a category still appear in the general magazine; the category just enables focused-section filtering.';
