-- ═══════════════════════════════════════════════════════════════════
-- Migration: episodes.transcript
--
-- Persist the full transcript text alongside the episode so downstream
-- generators (article drafts, devotionals, short-form clip picks,
-- study guides) can re-read it without going back to Azotus / Bunny.
--
-- The transcript is typically populated at ingestion time by either:
--   1. scripts/generate-metadata.ts (CLI or Azotus pipeline)
--   2. POST /api/admin/drafts/create (manual "Nýtt drag")
--
-- Existing rows stay NULL and can be backfilled later by re-running
-- the metadata generator with a transcript source.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS transcript TEXT;

COMMENT ON COLUMN episodes.transcript IS
  'Full text transcript (VTT timing stripped). Primary language = episode.language_primary. Used by article / devotional / study-guide generators.';
