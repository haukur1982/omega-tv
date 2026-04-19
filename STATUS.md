# STATUS.md — Omega TV

**Last Updated:** 2026-04-19 (evening)
**Last Agent:** Claude Code — admin editors + playout XML enrichment session
**Branch:** main
**Build Status:** Dev on :3010, all pages 200, tsc clean. Seven commits on origin/main; three new today (Vikuforsíða editor, Schedule editor, Playout XML sync + programs catalog).

## Where things stand right now

Seven phases of work shipped + pushed across three days. The site went from "Netflix clone with Ken Burns hero" to a broadcast-aware Christian media platform with a fully-automated content + schedule pipeline:

1. **Phase 1** — Altingi palette, Source Serif 4, Broadcast Hero ✓ pushed
2. **Phase 2** — Scripture as connective tissue (sermon detail rebuilt) ✓ pushed
3. **Phase 3** — Broadcast schedule + courses un-hidden ✓ pushed
4. **Phase 4** — Prayer as the soul of /beint (candles dropped, PrayerHall full-width) ✓ pushed
5. **Phase A** — `/admin/drafts` inbox + metadata generator (Gemini) + "Nýtt drag" ✓ pushed
6. **Admin editors** — Vikuforsíða + Schedule CRUD in-browser (no more Supabase dashboard clicks) ✓ pushed
7. **Playout XML sync + programs catalog** — daily FTP pull auto-enriches schedule slots from `programs` table; manual overrides protected ✓ pushed

Plus ongoing docs:
- `~/.claude/plans/twinkling-mapping-pizza.md` — full 4-phase plan
- `docs/content-pipeline.md` — three-entry-point ingestion protocol
- `docs/tv-app-considerations.md` — Samsung/LG/Apple TV/Android TV app plan (four-platform Tier 1)
- `docs/icelandic-market-strategy.md` — **NEW 2026-04-18** — strategic reference: telco aggregation, device priorities, payment architecture, infrastructure roadmap. Distilled from deep-research summary.

## Content pipeline is real and proven

**Gemini-powered metadata generation works end-to-end.** Tested 2026-04-18 on a native Icelandic sermon transcript — Gemini correctly identified `ISA.40.31` as the bible_ref (Jesaja 40:31), wrote a warm first-person editor note, segmented 6 pastoral chapters, produced 4 Icelandic thematic tags. Two demo drafts exist in Supabase:

- `/admin/drafts/25ee50f6-36d5-46c2-ae94-800d222e02ea` — **Vonin sem endurnærir** (full Gemini output — the proof)
- `/admin/drafts/3e898925-fc57-444b-822c-d356c6c1e560` — demo of mock fallback for comparison

Three entry paths (all landing in the same `/admin/drafts` inbox):
1. **Azotus** (foreign content, subtitled) — needs native-IS branch added in Azotus project
2. **Azotus Lite** (native Icelandic, no translation) — pending Azotus change
3. **Manual "Nýtt drag"** — shipped today, `/admin/drafts/new`

Review flow: open draft → fix fields → **Vista og birta** → live on omega.is in 2–3 minutes.

## Today's key decisions (2026-04-19)

### ✅ Shipped + pushed today
- **Vikuforsíða editor** (`/admin/featured`) — weekly home hero curation in-browser, replaces hand-editing `featured_weeks` in Supabase.
- **Schedule editor** (`/admin/schedule`) — weekly Dagskrá CRUD with day switcher + inline forms. Manual slots marked `is_manual_override=TRUE` so they survive the XML sync.
- **Programs enrichment catalog** (`/admin/programs`) — one row per recurring show (title/type/host/description/live+featured defaults). 31 Omega shows seeded via service-role Node script. Matches XML titles exactly for daily auto-enrichment.
- **Playout XML importer** — `POST /api/admin/schedule/sync-xml`: fetches today's XML from FTP `212.30.195.77`, parses (handles `_x0032_` Access encoding), computes end-times from next starts, enriches via `programs` lookup, purges non-manual slots for the day, re-inserts. `/admin/schedule` surfaces unlabeled titles as a banner nudge.
- **Standing rule captured:** never paste Icelandic text through Supabase SQL editor clipboard — it silently corrupts UTF-8 into MacRoman-stored-as-UTF-8 mojibake. DDL migrations stay pure ASCII; seeds live in `scripts/seed-*.ts` via service-role client. See §Standing rule below + `docs/content-pipeline.md`.

### 💡 Hawk's aesthetic call (2026-04-19 afternoon)
- **Brown/warm palette is not his favorite after 3 days of sitting with it.** "Not my favorite" but he's explicit that the functional work is great — chapters, descriptions, prayer wall, content pipeline polish. My recommendation: don't piecemeal-redesign the palette in-chat. Wait for a proper design pass with better tooling. The Altingi tokens all route through CSS custom properties, so a palette swap later is a one-file change.

## Earlier decisions (2026-04-18)

### ✅ Shipped + pushed
- **Phase 4 rework**: candles dropped entirely. Prayer is the soul of /beint. Full-width `PrayerHall` with multi-column masonry, real "bið með" pray-along (cookie-rate-limited, atomic via `increment_prayer_count` RPC). `PrayerPresence` module on home. Three-cell + submission form flow on /beint.
- **Phase A**: `/admin/drafts` inbox with readiness chips; full edit form with OSIS picker (drift-proof) + ChaptersEditor; `/admin/drafts/new` manual entry; `scripts/generate-metadata.ts` pluggable Gemini/mock generator.
- **Content pipeline protocol** documented in `docs/content-pipeline.md`.
- **Admin auth reset**: used service-role key to set a temp password for `haukur1982@gmail.com`. Hawk logged in successfully and saw the Gemini-generated draft in the inbox.

### 🛑 Scrapped (from Hawk feedback)
- **Article generation from sermons — scrapped.** Hawk was explicit: *"I would rather create my articles myself and have real content that I believe in."* Articles must stay Hawk's voice, written from conviction. `scripts/generate-article.ts` was built and deleted in-session. Respect this going forward.
- **AirPlay/Chromecast as TV fallback — scrapped.** Hawk's audience is 80% over 50. They don't do phone-to-TV mirroring. The right TV path is native apps (Samsung Tizen + LG webOS), not a phone-cast workaround. See `docs/tv-app-considerations.md`.

### 💡 Hawk's aesthetic/editorial affirmations (keep these locked in)
- **"I love chapters and descriptions"** — the Gemini chapter segmentation + description generation is the central win. Protect this behavior, don't let future refactors break the quality.
- **"The CEO is a man of prayer"** — prayer is Omega's theological backbone, not UI decoration. Any prayer UI must reflect this seriously.
- **"Bridge young and old, but 80% over 50"** — every design decision weighted toward tablet/TV readability, big tap targets, hover-independent interaction.

### 🔜 Left on disk, not yet committed (Phase A+ groundwork)
- `supabase/migrations/20260418_episode_transcript.sql` — adds `episodes.transcript` column for storing source text. Useful for future regeneration of chapters/descriptions + transcript search. **Not yet applied to Supabase.**
- `scripts/generate-metadata.ts` + `src/app/api/admin/drafts/create/route.ts` — updated to persist transcript on upsert. Backward-compatible with rows that don't have it.
- These changes are low-risk; can be committed whenever (haven't pushed because session pivoted into TV conversation).

## Outstanding to-dos (in rough priority order)

### Quick wins (next focused session, small)
1. **Test the XML sync end-to-end in-browser.** Visit `/admin/schedule`, click **"Flytja inn XML"**, confirm today's slots come in from FTP, verify enrichment (host names, descriptions, live/featured flags), and check the unlabeled-programs banner if unfamiliar titles appear. This is the only unverified piece of the XML pipeline — everything else is typecheck-clean but hasn't been run against the live FTP end-to-end.
2. **Apply `20260418_episode_transcript.sql`** to Supabase (one ALTER TABLE, ASCII-safe). Adds `episodes.transcript` column for future regeneration of chapters/descriptions + transcript search.
3. **Rotate the Gemini key** — the one ending `CHnPE` was pasted in chat and is compromised. Delete at https://aistudio.google.com/app/apikey, create a replacement, update `.env.local` directly.

### Medium-priority UX improvements for the 50+ audience
4. **Tablet / iPad polish pass on omega.is** — hover → tap conversions, bump the smallest labels above 0.75rem, enforce 44×44px tap targets, verify nav clarity. ~30–45 min session. Called out as prerequisite in `docs/tv-app-considerations.md`.
5. **Chapter click-to-seek on sermon detail player** — Player.js bus + ChapterList shipped; chapter click seeks the Bunny iframe, and active chapter highlights from `timeupdate`. Leaving this line in the TODO list only to flag the follow-up work: verify active highlighting on a real long sermon with real chapter data, and decide whether to persist last-watched-chapter in a cookie.

### Cross-project
6. **Merge the Azotus feature branch.** `feat/native-is-orchestrator` is pushed to `haukur1982/Azotus` — adds ingest detection + dispatcher short-circuit so native-IS files skip translate + burn and land straight at FINALIZED, ready for the existing "Publish to VOD" flow. Zero cloud-worker changes (no rebuild needed), four independent guardrails isolate the CBN Dutch pipeline. PR URL: https://github.com/haukur1982/Azotus/pull/new/feat/native-is-orchestrator. Ready to merge once Hawk reviews.
7. **Add `GEMINI_API_KEY` to the Azotus Mac Mini's environment** — the subprocess call to `generate-metadata.ts` runs with `--env-file=.env.local` inside `~/Projects/omega-tv`, so the Mac Mini needs `omega-tv/.env.local` to carry the key. Already true for the dev laptop; verify on the Mac Mini before the first native-IS job drops.

### Medium — programs catalog follow-up
8. **Label the 7 unlabeled programs that today's XML surfaced.** First real cron run on 2026-04-19 imported 29 slots and flagged these titles as missing from `/admin/programs`:
    - `CBN fréttir`
    - `I AM Equipping Center`
    - `Gegnumbrot`
    - `Krakkaefni`
    - `CBN - Fréttir frá Ísrael`
    - `Vegur Meistarans`
    - `Hinir útvöldu`

    Add each via `/admin/programs` → Ný sýning. Once labeled, the next cron run enriches them with host/description/type automatically.

### Bigger future projects
9. **Native TV app (Samsung Tizen + LG webOS)** — documented in `docs/tv-app-considerations.md`. Timeline estimate: 7–10 weeks. Prerequisites: item #4 above should be done first. Skip Apple TV / Google TV / Roku for v1.
10. **In-admin file upload (Bunny TUS)** — multipart upload of MP4 directly from `/admin/drafts/new` without touching the Bunny dashboard.
11. **In-admin ElevenLabs transcription** — so the "Nýtt drag" flow doesn't require a pre-made transcript for native Icelandic one-offs.
12. **Admin CRUD for programs catalog beyond basics** — the seed covers 31 shows but when new Icelandic titles land in XML, ergonomics for labeling them from the banner would save clicks. Currently: banner shows unlabeled titles → Hawk clicks into `/admin/programs` and adds them. Could be one-click from the banner.

### Done (recently)
- ✅ **Admin CRUD for `schedule_slots` + `featured_weeks`** — Vikuforsíða + Schedule editors shipped 2026-04-19.
- ✅ **Chapter click-to-seek** — shipped via `playerBus.ts` + Player.js integration.
- ✅ **Vercel Cron for hands-free daily XML sync** — shipped `b4ce426` + deployed to production. Shared sync core at `src/lib/schedule-xml-sync.ts`, cron endpoint at `/api/cron/sync-schedule-xml`, `vercel.json` declares `5 5 * * *`. `CRON_SECRET` generated via `openssl rand -hex 32`, stored encrypted in Vercel Production env + mirrored to local `.env.local` for manual curl testing. First live run on 2026-04-19 imported 29 real slots from the playout XML — proof the whole chain works end-to-end (FTP → parse → enrich → insert).
- ✅ **Transcript persistence on draft episodes** — shipped `f86c563`. `episodes.transcript` migration + updated metadata generator + draft-create API. Unlocks future regeneration of chapters/descriptions without re-pasting source text.
- ✅ **Azotus native-IS orchestrator integration** — shipped on `feat/native-is-orchestrator` branch in `~/Projects/Azotus` (commit `b18420b`). Three additive changes to `omega_manager.py`: detection helpers, ingest flag, dispatcher short-circuit TRANSCRIBED → FINALIZED. 123 lines, zero cloud-worker files touched. 8 helper assertions pass. See `docs/content-pipeline.md` §"Azotus native-IS mode (shipped)".

### Intentionally deferred / never
- **Article auto-generation from sermons** — do NOT revisit (Hawk scrapped it). Articles are Hawk's voice, written by hand.
- **Candle presence mechanic** — do NOT revisit. Doesn't land culturally in Lutheran Iceland.
- **AirPlay/Chromecast as primary TV path** — do NOT push. Wrong for the 50+ audience.
- **Comments on any surface** — plan §10 flagged this as a management burden Hawk doesn't need.
- **React Native Apple TV / Google TV / Roku apps** — deferred until Samsung/LG prove demand.

## Security debt

**Rotate the Gemini API key.** The one ending `CHnPE` was pasted in chat 2026-04-18 and must be considered compromised. Steps:
1. Go to https://aistudio.google.com/app/apikey
2. Delete the key ending `CHnPE`
3. Create a replacement (scope to `sermon-translator-system` project)
4. Update `GEMINI_API_KEY` in `~/Projects/omega-tv/.env.local` directly (editor, not chat)
5. Delete this debt line from STATUS.md

**Future key-sharing pattern with Claude:** paste directly into `.env.local` via editor yourself, then tell Claude *"I added <KEY_NAME> to .env.local"*. Claude uses it without ever seeing the value.

## Known Issues

- **Bunny library `628621`** returned 0 videos in local dev when last tested. Home + sermon detail fall back to mock data. Check when Azotus publishes to the same library — might be a local env thing.
- **`episodes.transcript` column not yet applied** in Supabase (migration on disk but not run). Code gracefully handles missing column.
- **Typegen stale** — `featured-db.ts`, `threads-db.ts`, `schedule-db.ts`, `sanctuary-db.ts`, `passages.ts` use untyped Supabase handles. Low priority; working as intended.

### Fixed 2026-04-18 (late)

- **UTF-8 double-encoding in `bible_passages` — FIXED.** When the original seed SQL was pasted via the Supabase SQL editor, the clipboard → paste → editor pipeline re-encoded UTF-8 as MacRoman, storing literal mojibake (`"Matteus 5:3‚Äì10"`, `"S√¶lir eru f√°t√¶kir √≠ anda..."`) as real UTF-8 bytes. Browser then faithfully rendered the mojibake. Fixed by UPDATEing all 5 seed rows directly via the service-role client from a Node script (bypassing the clipboard). Migration file `supabase/migrations/20260418_fix_bible_passages_encoding.sql` captures the correct text for reproducibility on fresh installs. **Lesson: avoid clipboard paste for SQL containing Icelandic text. Use `supabase db push`, Supabase CLI, or a direct Node script with the service role key.**

### ✅ UTF-8 mojibake fix — COMPLETE (2026-04-19 morning)

All seeded Icelandic text is now clean across every table:

- **`featured_weeks`** — 1 fallback row fixed. Hero headline now renders *"Von og sannleikur fyrir Ísland."*
- **`schedule_slots`** — all 27 rows fixed. Program titles (`Morgunbæn`, `Bænakvöld`, `Sunnudagssamkoma`, `Ísrael í brennidepli`, etc.) + descriptions + host names all clean.
- **`prayers`** (broadcast prayers) — 3 rows fixed. Anna / Jón / Sigrún render correctly in the PrayerHall.
- **`bible_passages`** — 5 rows fixed previously (see earlier entry).

Fix tool: `scripts/fix-utf8-encoding.ts` — reusable repair script. Run via `pnpm exec tsx --env-file=.env.local scripts/fix-utf8-encoding.ts`. Idempotent; safe to re-run. Bypasses the clipboard entirely via service-role client.

### 📋 Standing rule — non-ASCII SQL pipeline

Never use the Supabase SQL editor clipboard paste for seed data containing Icelandic/UTF-8 characters. Safe alternatives:

1. **Direct service-role Node script** (what worked for bible_passages):
   ```
   node --env-file=.env.local -e "const sb = require('@supabase/supabase-js').createClient(...); sb.from('table').update({col: 'íslenskt text'}).eq(...)"
   ```
2. **Supabase CLI** (`supabase db push`) — reads local files directly, preserves encoding end-to-end.
3. **psql connection** — bytes flow over TLS to Postgres without browser interpolation.

The SQL editor clipboard paste is the ONE unsafe path and also the one I kept defaulting to because it's "easy." It's not easy — it's silently corrupting data.

## Session Log

- **2026-04-19 (evening):** Three big ships: (1) Vikuforsíða editor `/admin/featured` with create/edit/delete + fallback flag. (2) Schedule editor `/admin/schedule` with week navigation + day switcher + inline CRUD, `is_manual_override` protection. (3) Playout XML sync + programs enrichment catalog — daily FTP pull from `212.30.195.77`, 31 Omega recurring shows seeded via service-role script, auto-enrichment on import, manual slots protected. Hot UTF-8 mojibake incident during programs seed (Hawk spotted commented mojibake SQL: *"I usually never look at your coat, but is this correct?"*) — cleaned migration to DDL-only-ASCII, moved seed to service-role Node script, standing rule documented in `docs/content-pipeline.md` §"Standing rule: non-ASCII SQL is always service-role path". Fixed 27 already-corrupted `schedule_slots` rows + 3 prayer rows + 1 `featured_weeks` row with `scripts/fix-utf8-encoding.ts`. Three commits pushed: `5a27426`, `e5bd095`, `ed574b5`.
- **2026-04-18 (late):** Phase A shipped ("/admin/drafts" inbox, manual "Nýtt drag", Gemini metadata generator). Phase 4 reworked per Hawk feedback (candles dropped, prayer-first). Gemini key added + proven on real Icelandic sermon (correctly identified ISA.40.31). Admin password reset for haukur1982@gmail.com. Article generator considered, built, scrapped per Hawk's direction. TV app future plan documented in `docs/tv-app-considerations.md`. Four commits pushed to origin/main.
- **2026-04-17 (latest):** Phase 3 — schedule DB + day switcher + Dagskráin strip + Leið course cards + /namskeid un-hidden.
- **2026-04-17 (mid):** Phase 2 — Scripture connective tissue, sermon detail rebuilt.
- **2026-04-17 (early–mid):** Navbar + SectionHeader reworked after initial visual review.
- **2026-04-17 (early):** Phase 1 — Altingi palette, Source Serif 4, Broadcast Hero, motion rules.
- **2026-04-12:** Initial onboarding into Architect system.

## Notes for Cowork / memory.md

- **Pattern to reuse across all Hawk projects**: **database-first with in-memory dev mock fallbacks**. Lets design and backend progress in parallel.
- **Pattern to reuse**: **pluggable LLM script with mock fallback** (see `scripts/generate-metadata.ts`). Mock mode for design + no-API testing; real Gemini when keyed. Mock intentionally refuses to guess high-risk fields (`bible_ref`). Drift prevention is load-bearing.
- **Vocabulary now locked in**: Altingi palette (nótt/mold/torfa/reykur/norðurljós/kerti/gull/skrá/ljós/moskva/steinn/blóð), Vaka/Kveða/Greinar/Tilvísun/Yfirskrift/Efni/Lestur/Merki/Meta/Kóði/Ritskrift typography roles, Gluggi/Síða/Leið/Blik card archetypes, Dagskráin/Sending/Bréf content types.
- **Omega's theological backbone is prayer.** Design decisions must reflect this — prayer is the soul, not a feature.
- **Omega's audience is 80% over 50.** Every UX decision weighted toward tablet/TV readability, big tap targets, hover-independent interaction. AirPlay/Chromecast is NOT a valid TV fallback for this audience.
- **Articles stay Hawk's voice.** No auto-generation from sermons, ever.
- **Pattern to reuse: XML-driven schedule with manual-override safety.** Daily import pulls bare schedule from upstream, enriches via lookup table, purges only non-manual rows before re-insert. Ad-hoc admin edits survive forever. Generalizes to any project where one upstream system owns the source-of-truth but humans want to override locally.
- **Pattern to reuse: programs catalog as enrichment lookup.** One row per recurring entity with all the rich metadata defaulted once. Inbound feeds carry only the match key (title). Matching on a TEXT unique constraint keeps it cheap and idempotent. When unmatched rows appear, surface them as a banner nudge rather than silently dropping enrichment.
