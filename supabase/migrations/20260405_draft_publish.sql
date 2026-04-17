-- Migration: Add status column to episodes for draft/publish workflow
-- Existing episodes default to 'published' so they remain visible

ALTER TABLE episodes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';

-- Make series_id and season_id nullable so drafts from folder watcher can exist without a series
ALTER TABLE episodes ALTER COLUMN series_id DROP NOT NULL;
ALTER TABLE episodes ALTER COLUMN season_id DROP NOT NULL;

-- Index for quick draft lookups
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);

-- Also add a source field to track where the video came from
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'admin';
-- Values: 'admin' (uploaded via panel), 'folder' (from Iceland watcher)
