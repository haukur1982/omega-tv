-- "Orð dagsins": one Scripture-anchored daily word, paired with "Bæn dagsins".
-- verse text is optional (filled from Omega's licensed Bible / sourced content);
-- the reflection is Omega's short word for the day. Public-read; service-role writes.
-- Applied to prod 2026-06-28 via Supabase MCP (migration: daily_words).
create table if not exists public.daily_words (
  id uuid primary key default gen_random_uuid(),
  feature_date date not null unique,
  reference text not null,           -- citation, e.g. "Sálmur 46:11"
  verse text,                        -- the verse text (optional; licensed source)
  reflection text not null,          -- the short word for the day
  source text not null default 'Omega',
  created_at timestamptz not null default now()
);

alter table public.daily_words enable row level security;
drop policy if exists "daily_words_public_read" on public.daily_words;
create policy "daily_words_public_read" on public.daily_words for select using (true);

-- STARTER examples (reflection + reference only; Hawk to review/replace and add
-- verse text from the licensed Bible, or load translated devotional content).
insert into public.daily_words (feature_date, reference, reflection) values
  ('2026-06-28', 'Sálmur 46:11', 'Áður en dagurinn tekur þig með sér, staldraðu við eitt andartak. Guð er Guð, og þú mátt hvíla í því.'),
  ('2026-06-29', 'Matteus 6:34', 'Náðin er gefin einn dag í senn. Þú þarft ekki að bera morgundaginn í dag.'),
  ('2026-06-30', 'Jósúabók 1:9', 'Þú gengur ekki einn inn í þennan dag. Hann fer á undan þér og er með þér.')
on conflict (feature_date) do nothing;
