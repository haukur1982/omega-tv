-- ══════════════════════════════════════════════════════════════════════
-- Migration: subscriber double-opt-in + newsletter send tracking
-- ══════════════════════════════════════════════════════════════════════
-- Subscribers were being collected with `is_verified=false` but nothing
-- ever set it to true and there was no unsubscribe link. Adds the two
-- token columns + verified_at timestamp so the verification + unsubscribe
-- flows can run end-to-end. Also adds `newsletters.sent_at` so the admin
-- can tell at a glance which newsletters have actually been emailed
-- (vs just published on-site).

ALTER TABLE subscribers
    ADD COLUMN IF NOT EXISTS verification_token UUID DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid();

COMMENT ON COLUMN subscribers.verification_token IS
  'Single-use token included in the verification email link. Cleared once verified_at is set.';
COMMENT ON COLUMN subscribers.verified_at IS
  'Timestamp the subscriber confirmed their email via the verification link. Required before sending newsletters.';
COMMENT ON COLUMN subscribers.unsubscribe_token IS
  'Permanent token for one-click unsubscribe. Stays stable for the lifetime of the subscriber row.';

CREATE INDEX IF NOT EXISTS subscribers_verification_token_idx
    ON subscribers (verification_token)
    WHERE verification_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscribers_unsubscribe_token_idx
    ON subscribers (unsubscribe_token);

ALTER TABLE newsletters
    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

COMMENT ON COLUMN newsletters.sent_at IS
  'Timestamp the newsletter was emailed to verified subscribers. NULL = not sent (on-site read only).';

NOTIFY pgrst, 'reload schema';
