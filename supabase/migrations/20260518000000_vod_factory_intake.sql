-- ══════════════════════════════════════════════════════════════════════
-- VOD Factory intake: Azotus → Omega
-- ══════════════════════════════════════════════════════════════════════
-- Omega is the publishing house. Azotus is the media factory. This migration
-- adds the durable handoff state and review fields needed for a draft-gated
-- VOD workflow.

CREATE EXTENSION IF NOT EXISTS pgmq;

DO $$
BEGIN
  PERFORM pgmq.create('vod_metadata_jobs');
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS azotus_track_id TEXT,
  ADD COLUMN IF NOT EXISTS azotus_job_id TEXT,
  ADD COLUMN IF NOT EXISTS source_language TEXT,
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS assigned_to TEXT,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata_confidence NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS poster_candidates JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE INDEX IF NOT EXISTS episodes_search_vector_idx
  ON episodes USING GIN (search_vector);

CREATE OR REPLACE FUNCTION update_episode_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector(
      'simple',
      concat_ws(
        ' ',
        coalesce(NEW.title, ''),
        coalesce(NEW.description, ''),
        coalesce(NEW.editor_note, ''),
        coalesce(NEW.bible_ref, ''),
        coalesce(array_to_string(NEW.tags, ' '), ''),
        coalesce(NEW.transcript, '')
      )
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS episodes_search_vector_update ON episodes;
CREATE TRIGGER episodes_search_vector_update
  BEFORE INSERT OR UPDATE OF title, description, editor_note, bible_ref, tags, transcript
  ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_episode_search_vector();

UPDATE episodes
SET title = title
WHERE search_vector IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS episodes_azotus_track_id_uidx
  ON episodes (azotus_track_id)
  WHERE azotus_track_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS episodes_bunny_video_id_uidx
  ON episodes (bunny_video_id)
  WHERE bunny_video_id IS NOT NULL;

ALTER TABLE episodes
  DROP CONSTRAINT IF EXISTS episodes_review_status_check;

ALTER TABLE episodes
  ADD CONSTRAINT episodes_review_status_check
  CHECK (review_status IN ('new', 'assigned', 'in_review', 'needs_changes', 'ready', 'published'));

CREATE TABLE IF NOT EXISTS vod_intake_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  azotus_track_id TEXT NOT NULL,
  azotus_job_id TEXT,
  bunny_video_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
  last_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS vod_intake_jobs_azotus_track_id_uidx
  ON vod_intake_jobs (azotus_track_id);

CREATE UNIQUE INDEX IF NOT EXISTS vod_intake_jobs_bunny_video_id_uidx
  ON vod_intake_jobs (bunny_video_id);

CREATE INDEX IF NOT EXISTS vod_intake_jobs_status_idx
  ON vod_intake_jobs (status, created_at DESC);

ALTER TABLE vod_intake_jobs
  DROP CONSTRAINT IF EXISTS vod_intake_jobs_status_check;

ALTER TABLE vod_intake_jobs
  ADD CONSTRAINT vod_intake_jobs_status_check
  CHECK (status IN ('received', 'metadata_pending', 'poster_pending', 'draft_ready', 'needs_attention', 'failed'));

CREATE OR REPLACE FUNCTION touch_vod_intake_jobs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_event_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vod_intake_jobs_touch_updated_at ON vod_intake_jobs;
CREATE TRIGGER vod_intake_jobs_touch_updated_at
  BEFORE UPDATE ON vod_intake_jobs
  FOR EACH ROW
  EXECUTE FUNCTION touch_vod_intake_jobs_updated_at();

CREATE OR REPLACE FUNCTION enqueue_vod_metadata_job(job_payload JSONB)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  msg_id BIGINT;
BEGIN
  SELECT pgmq.send('vod_metadata_jobs', job_payload) INTO msg_id;
  RETURN msg_id;
END;
$$;

ALTER TABLE vod_intake_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on vod_intake_jobs" ON vod_intake_jobs;
CREATE POLICY "Service role full access on vod_intake_jobs"
  ON vod_intake_jobs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE vod_intake_jobs IS
  'Durable Azotus → Omega VOD intake jobs. One row per finished Azotus track/Bunny video handoff.';

COMMENT ON COLUMN episodes.review_status IS
  'Editorial review state inside admin. Public visibility still uses episodes.status.';

COMMENT ON COLUMN episodes.poster_candidates IS
  'Candidate poster frame URLs or descriptors generated during intake. Reviewer chooses thumbnail_custom.';

NOTIFY pgrst, 'reload schema';
