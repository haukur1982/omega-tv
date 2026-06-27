-- "Bæn dagsins" rotation: one prayer per date, shared for the whole nation.
-- Closes the BaenDagsins hardcoded-date TODO. Public-read; writes via service role.
-- Applied to prod 2026-06-27 via Supabase MCP (migration: featured_prayers).
create table if not exists public.featured_prayers (
  id uuid primary key default gen_random_uuid(),
  feature_date date not null unique,
  body text not null,
  scripture text,
  author text not null default 'borið fram af Omega',
  created_at timestamptz not null default now()
);

alter table public.featured_prayers enable row level security;
drop policy if exists "featured_prayers_public_read" on public.featured_prayers;
create policy "featured_prayers_public_read" on public.featured_prayers for select using (true);

-- Starter pool (STARTER / REVIEW: short, scripture-anchored, Omega voice; Hawk to
-- review and extend via the admin curation page). ON CONFLICT keeps re-runs safe.
insert into public.featured_prayers (feature_date, body, scripture) values
  ('2026-06-27', 'Drottinn, kenn mér að þekkja rödd þína í dag, í hávaðanum og í kyrrðinni. Lát mig ekki flýta mér fram úr þér, heldur ganga við hlið þér.', 'Sálmur 95:7-8'),
  ('2026-06-28', 'Faðir, ég legg áhyggjur dagsins í hendur þínar. Hjálpa mér að treysta þér af öllu hjarta og styðjast ekki við eigin skilning.', 'Orðskviðirnir 3:5'),
  ('2026-06-29', 'Drottinn, þú ert hirðir minn. Í dag skortir mig ekkert sem ég þarfnast. Leið mig að vötnum þar sem sál mín fær hvíld.', 'Sálmur 23:1-2'),
  ('2026-06-30', 'Guð, þar sem kvíðinn vex, gef mér frið þinn sem er æðri öllum skilningi. Ég færi þér bænir mínar með þakklæti.', 'Filippíbréfið 4:6-7'),
  ('2026-07-01', 'Drottinn, þegar ég er þreyttur, endurnýja þú kraft minn. Lát mig hefja mig sem örninn og þreytast ekki á veginum.', 'Jesaja 40:31'),
  ('2026-07-02', 'Jesús, þú býður þeim sem erfiða og þunga eru hlaðnir að koma til þín. Í dag kem ég, og ég tek á móti hvíld þinni.', 'Matteus 11:28'),
  ('2026-07-03', 'Skapa í mér hreint hjarta, ó Guð, og endurnýja réttan anda í brjósti mínu. Lát mig byrja daginn í þér.', 'Sálmur 51:12')
on conflict (feature_date) do nothing;
