-- Bænaþjónustan: three doors (phone, web, broadcast), one prayer stream.
-- See docs/plans/09-prayer-ministry.md.
--
-- Every prayer — typed on the wall, taken down by a volunteer on the phone
-- line, or gathered during a broadcast — lands in the SAME prayers table with
-- a source tag. This migration adds the tag, the on-air consent, and the
-- producer stack the studio prays from.
--
-- NOT YET APPLIED as of 2026-09-01 (no DB password on the build machine).
-- The application is written to survive that, exactly like admin_staff was:
--   - the public wall tries the wide select and falls back to the current
--     column set, with the new features simply off;
--   - prayer inserts retry without the new columns;
--   - the producer stack, the phone intake and the settings card show
--     "keyrðu SQL-ið fyrst" guidance instead of erroring.
-- Applying this file is what switches those features on. Everything is
-- additive with defaults, so existing rows stay valid.

-- ── prayers: the tag, the consent, the stack ────────────────────────────
ALTER TABLE public.prayers
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'vefur',
  ADD COLUMN IF NOT EXISTS air_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS broadcast_queue integer,
  ADD COLUMN IF NOT EXISTS aired_at timestamptz,
  ADD COLUMN IF NOT EXISTS aired_program text;

DO $$
BEGIN
  ALTER TABLE public.prayers
    ADD CONSTRAINT prayers_source_check
    CHECK (source IN ('vefur', 'simi', 'utsending'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.prayers.source IS 'Which door the prayer came through: vefur (the wall), simi (phone line, typed by a volunteer), utsending (gathered during a broadcast).';
COMMENT ON COLUMN public.prayers.air_consent IS 'The person said this prayer may be prayed for ON AIR. Web: a never-pre-ticked box in the form. Phone: spoken consent, ticked by the volunteer. Never inferred, never defaulted true.';
COMMENT ON COLUMN public.prayers.broadcast_queue IS 'Position in the producer stack during a prayer program. NULL = not in the stack.';
COMMENT ON COLUMN public.prayers.aired_at IS 'When this prayer was actually prayed on air.';
COMMENT ON COLUMN public.prayers.aired_program IS 'Which program prayed it (free text typed by the producer).';

-- Producer stack reads: the eligible list and the stack itself.
CREATE INDEX IF NOT EXISTS prayers_broadcast_queue_idx
  ON public.prayers (broadcast_queue)
  WHERE broadcast_queue IS NOT NULL;

-- ── ministry_settings: the phone number, the hours, the live override ───
-- One row, keyed by a fixed id so "the settings" is never ambiguous.
-- RLS on with NO policies: the anon client cannot read it. The public wall
-- reads it server-side through supabaseAdmin, like fundraising does.
CREATE TABLE IF NOT EXISTS public.ministry_settings (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  prayer_phone text,
  phone_hours text,
  schedule_note text,
  live_now boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ministry_settings ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.ministry_settings IS 'Single-row settings for the prayer ministry: the phone number spoken on air, the hours it is answered, the schedule note, and a live-now override. Server-only (RLS on, no policies).';

-- The row exists from the start so the admin card is an edit, never a create.
INSERT INTO public.ministry_settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;
