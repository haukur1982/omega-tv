-- ═══════════════════════════════════════════════════════════════════
-- Migration: Phase 4 — Broadcast prayer wall
--
-- Prayer community pinned to live-broadcast slots. Submissions enter
-- moderation; approved prayers surface in the sanctuary drawer on /beint.
--
-- See plan §4.3. Candle mechanic was dropped after Hawk feedback — prayer
-- alone is the soul of the broadcast. If you're reviewing an older tree
-- that has candle_lightings, see 20260418_drop_candles.sql.
-- ═══════════════════════════════════════════════════════════════════

-- ── prayers → link to a broadcast slot ────────────────────────────
ALTER TABLE prayers
  ADD COLUMN IF NOT EXISTS broadcast_slot_id    UUID REFERENCES schedule_slots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_broadcast_prayer  BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN prayers.broadcast_slot_id IS
  'When a prayer is submitted during a live broadcast, this points at the schedule_slots row it was prayed over. Drives the broadcast prayer wall on /beint.';
COMMENT ON COLUMN prayers.is_broadcast_prayer IS
  'TRUE if the prayer was submitted through the broadcast drawer (vs the standalone /baenatorg form).';

CREATE INDEX IF NOT EXISTS idx_prayers_broadcast_slot
  ON prayers (broadcast_slot_id)
  WHERE broadcast_slot_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════
-- Seed a handful of approved prayers on the next upcoming live slot
-- so the drawer has content out of the box. No-ops if the slot is
-- missing (fresh dev DB) or if prayers already exist for that slot.
-- ═══════════════════════════════════════════════════════════════════
DO $$
DECLARE
  target_slot UUID;
  existing_prayers INT;
BEGIN
  SELECT id INTO target_slot
  FROM schedule_slots
  WHERE is_live_broadcast = TRUE
    AND starts_at > NOW()
  ORDER BY starts_at ASC
  LIMIT 1;

  IF target_slot IS NULL THEN
    SELECT id INTO target_slot
    FROM schedule_slots
    WHERE is_live_broadcast = TRUE
    ORDER BY starts_at ASC
    LIMIT 1;
  END IF;

  IF target_slot IS NOT NULL THEN
    SELECT COUNT(*) INTO existing_prayers
    FROM prayers
    WHERE broadcast_slot_id = target_slot;

    IF existing_prayers = 0 THEN
      INSERT INTO prayers (name, topic, content, is_approved, is_broadcast_prayer, broadcast_slot_id, pray_count, created_at) VALUES
        ('Anna',   'Heilsa',   'Bið fyrir heilsunni hennar móður minnar — hún fór í aðgerð í dag.',                  TRUE, TRUE, target_slot, 3,  NOW() - INTERVAL '1 hour 10 minutes'),
        ('Jón',    'Þakklæti', 'Þakka Guði fyrir hvernig hann hefur leitt mig í gegnum síðustu vikuna.',             TRUE, TRUE, target_slot, 7,  NOW() - INTERVAL '45 minutes'),
        ('Sigrún', 'Vakning',  'Bið fyrir unglingum á Íslandi — að þeir finni veg Drottins áður en það er of seint.', TRUE, TRUE, target_slot, 12, NOW() - INTERVAL '20 minutes');
    END IF;
  END IF;
END $$;
