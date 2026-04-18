-- ═══════════════════════════════════════════════════════════════════
-- Migration: Drop the candle mechanic + add atomic "bið með" increment
--
-- Hawk's direction (2026-04-17): the "light a candle" metaphor doesn't
-- register with Icelandic Lutheran viewers. Prayer alone is the soul
-- of the broadcast — candles were a UI ornament we're cutting.
--
-- Also adds `increment_prayer_count` RPC so the bið-með action is
-- atomic (avoids races when multiple people pray along simultaneously).
-- ═══════════════════════════════════════════════════════════════════

-- 1. Drop the candle table (no-op on fresh installs that never had it)
DROP TABLE IF EXISTS candle_lightings CASCADE;

-- 2. Atomic "pray along" increment.
-- Returns the new pray_count, or NULL if the prayer doesn't exist or
-- isn't approved. Only approved prayers can be prayed along with.
CREATE OR REPLACE FUNCTION increment_prayer_count(prayer_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE prayers
  SET pray_count = COALESCE(pray_count, 0) + 1
  WHERE id = prayer_id
    AND is_approved = TRUE
  RETURNING pray_count INTO new_count;

  RETURN new_count;
END;
$$;

-- Let anon + authenticated clients call the RPC. The function is
-- SECURITY DEFINER so it can update prayers regardless of RLS shape.
GRANT EXECUTE ON FUNCTION increment_prayer_count(UUID) TO anon, authenticated;
