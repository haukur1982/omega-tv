-- 20260425_live_prayer_pulse.sql
--
-- Live prayer pulse — per-broadcast prayer-of-agreement counter.
--
-- During an on-air broadcast, viewers can tap "Bið með" on /live to
-- add to a counter scoped to that specific schedule slot. It's the
-- digital equivalent of saying amen — one tap per agreement, no form,
-- no text, anonymous. The number ticks up live as others tap.
--
-- Per-slot scope means each broadcast accumulates its own count
-- independently and that count survives as a small historical record
-- after the show ends ("237 bænir á samkomunni 19. apríl").
--
-- Atomic increment via plpgsql function so concurrent taps from
-- multiple devices don't lose updates. Returns the new count.

ALTER TABLE schedule_slots
  ADD COLUMN IF NOT EXISTS live_prayer_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_live_prayer_count(slot_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE schedule_slots
  SET live_prayer_count = live_prayer_count + 1
  WHERE id = slot_id
  RETURNING live_prayer_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION increment_live_prayer_count(UUID) TO anon, authenticated;
