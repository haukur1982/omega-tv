-- Pre-warmed wording suggestions for the Hugleiðingar review desk.
--
-- The assistant costs a Gemini call and about ten seconds, and today the
-- reviewer pays both in the middle of reading a paragraph. scripts/warm-suggestions.ts
-- pays them beforehand for the flagged paragraphs and parks the answer here;
-- the suggest route serves the row instantly when it still matches.
--
-- body_hash is what keeps this honest: it is taken over the exact Icelandic
-- paragraph the suggestions were computed for (whitespace-normalised), so the
-- moment that paragraph is edited the row stops matching and the next ask
-- regenerates. Nothing here is ever shown for text it was not written for.
--
-- RLS-locked exactly like devotionals and devotional_corrections: no policies
-- at all, so only the service role (supabaseAdmin, server-side) can read or
-- write it. This is editorial scaffolding, never public.
create table if not exists public.devotional_suggestions (
  id uuid primary key default gen_random_uuid(),
  devotional_id uuid not null references public.devotionals(id) on delete cascade,
  paragraph_index integer not null,
  body_hash text not null,
  suggestions jsonb not null,
  created_at timestamptz not null default now(),
  unique (devotional_id, paragraph_index)
);

-- The route can look a paragraph up by its text alone (the editor does not
-- always know which piece it is asking about), so the hash needs its own index.
create index if not exists devotional_suggestions_hash_idx
  on public.devotional_suggestions (body_hash);

alter table public.devotional_suggestions enable row level security;
