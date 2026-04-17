# STATUS.md — Omega TV

**Last Updated:** 2026-04-17
**Last Agent:** Claude Code (Phases 1–3 redesign)
**Branch:** main (uncommitted changes)
**Build Status:** Dev server runs on :3005, home / live / sermon detail / namskeid all 200, tsc clean

## Current State

- **Redesign plan:** `~/.claude/plans/twinkling-mapping-pizza.md` — full 4-phase spec.
- **Phase 1 shipped:** Altingi palette, Source Serif 4, Broadcast Hero, Styrkja ribbon. Navbar + SectionHeader reworked.
- **Phase 2 shipped:** Scripture as connective tissue. Sermon detail page rebuilt end to end with passage anchor, caption switcher, chapters, editor note, threads-of-Scripture sidebar.
- **Phase 3 shipped:** Broadcast awareness + courses un-hidden. Schedule moved to DB with a realistic seed week. Homepage "Dagskráin" strip. /live page rebuilt as server-rendered with day switcher. /namskeid un-hidden, rebuilt editorial-first with new Leið cards. Added Námskeið back to nav.
- **Nothing committed yet.** Three migrations written, none applied.

## Phase 3 — What landed

### New files
- `supabase/migrations/20260417_phase3_schedule.sql` — `schedule_slots` table (starts/ends, title/subtitle, program_type, episode_id/series_id FKs, host_name, description, is_live_broadcast, is_featured, reminder_count) + indexes + RLS public-read + service-role-write + **27 seed rows** covering a realistic Mon–Sun Omega schedule (Morgunbæn, Í Snertingu reruns, Bænakvöld live Wed, Sunnudagssamkoma live Sun, plus teaching, Ísrael, Tónleikakvöld, etc.).
- `src/lib/schedule-db.ts` — `ScheduleSlot` type, `getScheduleInRange`, `getScheduleForDay`, `getScheduleForWeek`, `getCurrentAndNext`, `groupByDay`, plus formatter helpers (`formatClockUtc`, `durationMinutes`, `weekdayIs`, `shortWeekdayIs`). Ships a **two-week mock fallback** that kicks in when `schedule_slots` is empty — mirrors the migration seed exactly so the UI is fully usable pre-migration, and drops out the moment even one real row lands.
- `src/components/live/DaySwitcher.tsx` — client island, 7-tab strip Mán→Sun driven by `?day=YYYY-MM-DD` URL param. Active day gets `--reykur` background + amber `--kerti` weekday label.
- `src/components/live/WeekSchedule.tsx` — server component, renders the day switcher + the selected day's slots as a timeline (HH:MM in tabular-nums + title + live/beint badge + description + duration). Graceful empty state. Icelandic weekday/month names.
- `src/components/home/DagskraStrip.tsx` — server component, three-cell strip for the homepage: **Núna / Næst / Seinna**. Self-hides when no data. Each cell shows clock range, serif title, italic description, live badge when applicable. Links to /live.
- `src/components/courses/LeidCard.tsx` — new course card archetype §3.3. 4:3 split: instructor portrait left half, `--torfa` panel right half with META · title · instructor · description · **module ladder** (filled bars for completed modules) · progress text. On hover, the ladder rungs pulse warm in sequence (50ms stagger, killed under `prefers-reduced-motion`).

### Files changed
- `src/app/live/page.tsx` — rewrote as a **server component** (was client-only). Player embed + now/next info bar (live badge when current exists, otherwise "Dagskrá" kicker + next-up teaser) + send prayer + give CTAs + WeekSchedule. Reads `?day=` to drive the day switcher.
- `src/app/page.tsx` — imports `DagskraStrip`, mounts it as the first block after the Broadcast Hero. The home is now unmistakably broadcast-aware on first paint.
- `src/app/namskeid/page.tsx` — full rewrite. Dropped the "Akademía"-badged masterclass hero + stacked-card pattern (Netflix-y, off-brand). New editorial hero — kicker `OMEGA · NÁMSKEIÐ` + Vaka display headline *"Lærðu af þeim sem ganga með Guði."* + intro paragraph. Responsive grid of Leið cards (4 cards in the mock set, auto-fill 320px min). Fallback mock courses still render before Supabase has rows.
- `src/components/layout/Navbar.tsx` — un-hid `Námskeið` in the primary nav. It sits between Greinar and Bænatorg per plan §6 IA.
- `src/app/globals.css` — added `.leid-card:hover .leid-rung` sequential pulse (ladder animation), fully disabled under `prefers-reduced-motion`.

### What the user sees now

**Home** (`/`):
- Broadcast Hero (unchanged from phase 1).
- **Dagskráin strip** — three cards *Núna / Næst / Seinna* with real program names, clock windows, italic descriptions. "Heil vika →" link in the header.
- Then the Nýtt efni rail, Sunnudagssamkomur rail, Omega Tímaritið bento, Styrkja ribbon, Legacy 34 years.

**/live**:
- Full-width broadcast player (unchanged embed).
- Info bar: when the schedule places "now" inside a program, shows red "Í beinni" pill + program title in serif + italic description. When off-air, shows "Dagskrá" kicker + "Omega Stöðin" default title.
- Below: `Dagskrá vikunnar` section. Day switcher (Mán Þri Mið Fim Fös Lau Sun, amber label on active day). Timeline of that day's programs: `07:00 · Morgunbæn · 60 mín`, `18:00 · Bænakvöld · [BEINT badge] · 90 mín` etc. Features the Wed Bænakvöld and Sun Sunnudagssamkoma as live.

**/namskeid** (un-hidden, linked from top nav as "NÁMSKEIÐ"):
- Editorial hero: small amber kicker + Vaka serif *"Lærðu af þeim sem ganga með Guði."* + 58ch serif paragraph.
- Grid of four Leið cards. Each: instructor image on the left, right panel has `NÁMSKEIÐ · 6 EININGAR` kicker, serif title, italic instructor name, description, and a ladder of 6 grey bars at the bottom with "6 einingar · byrjaðu í dag" below. Hover the card → ladder rungs pulse warm one after another.

**Navbar**:
- Now: **BEINT · ÞÁTTASAFN · GREINAR · NÁMSKEIÐ · BÆNATORG · UM OKKUR · STYRKJA**
- Seven items. Was six.

## What's NOT finished

- **Migration `20260417_phase3_schedule.sql` not applied.** Dev mock renders — prod needs the SQL run against project `dvzwpwlgucsdyrkhrpah`.
- **No admin UI for `schedule_slots`.** Edit in Supabase for now.
- **Course progress is always 0.** `LeidCard` takes `moduleProgress` but nothing passes real values yet — needs light-auth + `user_lesson_progress` reads (Phase 4).
- **Course detail page (`/namskeid/[slug]`) still uses the old design.** I didn't touch it this session — focused on the index. It still renders, just doesn't match the Leið card language. Worth a follow-up pass.
- **Auto-VOD banner on broadcast end — deferred.** Plan §4.3 spec'd it; it needs a cron/webhook that watches `schedule.ended_at` and creates an episode draft. Real infra, not a one-file change.
- **.ics export per schedule slot — deferred.** The "Áminning" button per slot. Small but out of scope this session.
- **The old `/api/schedule` FTP route still exists** and still points at 212.30.195.77. Not called by any current component. Safe to leave in place as a deprecated fallback; worth cleaning up when someone has context on that FTP source.

## What should happen next

**Phase 3 tail** (small follow-ups):
1. Apply the 3 pending migrations (`20260417_featured_weeks.sql`, `20260417_phase2_passages.sql`, `20260417_phase3_schedule.sql`).
2. Redesign `/namskeid/[slug]` detail page to match the new system — Reading Column (vellum) for lesson text, new sidebar, instructor card, module ladder view.
3. Add admin CRUD for `schedule_slots`, `featured_weeks`, and the `bible_ref`/`editor_note`/`chapters` fields on episodes. One screen per table, simple forms.
4. .ics export on schedule rows ("Áminning" button).

**Phase 4 — "The Sanctuary"** (plan §8):
- Candle presence indicator + prayer wall on /live.
- Light auth + watch progress + course module progress wiring.
- Real search: tags + passage + title + transcript.
- English content pipeline (language switcher in nav, EN article variants, subtitle preference persisted).
- Postulasögur short-form sermon clip surface.
- Auto-VOD banner on broadcast end.

## Known Issues

- Bunny library `628621` returned 0 videos in local dev — home + sermons fall back to mock data.
- All three Phase 1–3 tables (`featured_weeks`, `bible_passages`, `schedule_slots`) not yet created in Supabase — UI renders from in-memory dev mocks.
- Typegen stale — `featured-db.ts`, `threads-db.ts`, `schedule-db.ts`, `passages.ts` use untyped Supabase handles.

## Session Log

- **2026-04-17 (latest):** Phase 3 shipped. `schedule_slots` migration + seed + DB helper + two-week mock fallback. `WeekSchedule` server component with 7-day switcher. `DagskraStrip` broadcast-aware home module (Núna/Næst/Seinna). `LeidCard` course archetype with pulsing module ladder. /live rewritten as server component; /namskeid rewritten with editorial hero + Leið grid; Navbar un-hid Námskeið. All 200s, tsc clean.
- **2026-04-17 (mid):** Phase 2 — Scripture as connective tissue. Migration + passage helpers + threads DB + SermonPlayer with passage badge + caption switcher + ChapterList + ThreadsSidebar (Ritningin/Bæn/Lestur/Næsta útsending) + GluggiCard + ShareCopyLink. Sermon detail page rebuilt. Graceful empty states everywhere.
- **2026-04-17 (early–mid):** Navbar + SectionHeader reworked after first visual review. Nav goes transparent over hero, warms on scroll. Ω wordmark in cream, no blue disc. Active-route kerti underline.
- **2026-04-17 (early):** Phase 1 shipped — Altingi palette, Source Serif 4, Broadcast Hero, Styrkja ribbon, ink-arrive + warm-hover motion rules.
- **2026-04-12:** Initial onboarding into Architect system.

## Notes for Cowork / memory.md

- **Pattern to reuse across all Hawk projects**: **database-first with in-memory dev mock fallbacks**. Both `schedule-db.ts` (Phase 3) and `sermons/[id]/page.tsx` (Phase 2) use the same pattern: query Supabase, fall back to a small hand-curated mock that mirrors the migration seed when the query returns empty. Lets design and backend progress in parallel without blocking.
- **Phase 3 vocabulary**: *Dagskráin* (the programming, the new home strip), *Leið* (course card — the "path" with visible module ladder), *Í beinni / Beint* (live broadcast; amber-on-red pill next to the time).
- The Leið card's **module ladder is load-bearing design**. It turns "course" from a passive trailer (Netflix "Start watching" card) into an active path with visible milestones. Worth lifting to any Hawk project with multi-step content — Cross Formation discipleship tracks, NHRM Youth reading plans.
- Navbar is now at **seven items**. Any more and it'll need a second tier. Keep an eye on it.
