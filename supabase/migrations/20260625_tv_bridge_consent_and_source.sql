-- BRIDGE Phase 0: provable consent on subscribers + on-air source on page_views.
-- All additive + nullable, no backfill, no behavior change to existing rows.
-- Applied to prod 2026-06-25 via Supabase MCP (migration: tv_bridge_consent_and_source).

ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS consent_text_version text,
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_source text;

COMMENT ON COLUMN public.subscribers.consent_text_version IS 'Exact consent wording shown to the subscriber at opt-in (proof of consent, GDPR Art. 7).';
COMMENT ON COLUMN public.subscribers.consent_given_at IS 'When the subscriber opted in.';
COMMENT ON COLUMN public.subscribers.consent_source IS 'Where the opt-in happened (e.g. segment: tv, newsletter).';

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS source text;

COMMENT ON COLUMN public.page_views.source IS 'On-air / campaign source bucket from ?q= (e.g. ls=lower-third, ec=end-card) so cable-driven /tv arrivals are attributable.';
