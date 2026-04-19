# STATUS.md — Omega TV

**Last Updated:** 2026-04-18 (late)
**Last Agent:** Claude Code — content pipeline + TV app consideration session
**Branch:** main
**Build Status:** Dev on :3005, all pages 200, tsc clean. Four commits pushed to origin/main today.

## Where things stand right now

Six phases of work shipped + pushed in the last two days. The site is in a very different place than it was 48 hours ago:

1. **Phase 1** — Altingi palette, Source Serif 4, Broadcast Hero ✓ pushed
2. **Phase 2** — Scripture as connective tissue (sermon detail rebuilt) ✓ pushed
3. **Phase 3** — Broadcast schedule + courses un-hidden ✓ pushed
4. **Phase 4** — Prayer as the soul of /beint (candles dropped, PrayerHall full-width) ✓ pushed
5. **Phase A** — `/admin/drafts` inbox + metadata generator (Gemini) + "Nýtt drag" ✓ pushed
6. **Catch-up commit** — pre-existing drift folded in ✓ pushed

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

## Today's key decisions (2026-04-18)

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
1. **Apply `20260418_episode_transcript.sql`** to Supabase (copy-paste in SQL editor; one ALTER TABLE). Already has the column for future use.
2. **Commit the uncommitted transcript-persistence changes** (`generate-metadata.ts` + `drafts/create/route.ts`) — small, low-risk.
3. **Rotate the Gemini key** — the one ending `CHnPE` was pasted in chat and is compromised. Delete at https://aistudio.google.com/app/apikey, create a replacement, update `.env.local` directly.

### Medium-priority UX improvements for the 50+ audience
4. **Tablet / iPad polish pass on omega.is** — hover → tap conversions, bump the smallest labels above 0.75rem, enforce 44×44px tap targets, verify nav clarity. ~30–45 min session. Called out as prerequisite in `docs/tv-app-considerations.md`.
5. **Chapter click-to-seek on sermon detail player** — currently chapters are visual only. Making them actually seek the Bunny iframe (via postMessage `setCurrentTime`) is the single highest-leverage move for 50+ viewers. Small session, huge UX win. Hawk specifically loves the chapter feature.

### Cross-project
6. **Azotus native-IS mode** — in `~/Projects/Azotus/workers/vod_publisher.py`, add a branch: if input_lang == target_lang, skip translate + subtitle-burn, just transcribe and upload. Plus subprocess call to omega-tv's `generate-metadata.ts`. See `docs/content-pipeline.md` for exact instructions. ~20 min in the Azotus project.
7. **Add `GEMINI_API_KEY` to Azotus if it's going to call omega-tv's metadata generator** — or make the subprocess call pass through the omega-tv `.env.local` (cleaner, since the generator script reads it directly).

### Bigger future projects
8. **Native TV app (Samsung Tizen + LG webOS)** — documented in `docs/tv-app-considerations.md`. Timeline estimate: 7–10 weeks. Prerequisites: items #4 and #5 above should be done first. Skip Apple TV / Google TV / Roku for v1.
9. **Admin CRUD for `schedule_slots` + `featured_weeks`** — currently edited in Supabase directly. Simple forms would speed up weekly curation.
10. **Chapter click-to-seek implementation** — postMessage to Bunny iframe on chapter click.
11. **In-admin file upload (Bunny TUS)** — multipart upload of MP4 directly from `/admin/drafts/new` without touching the Bunny dashboard.
12. **In-admin ElevenLabs transcription** — so the "Nýtt drag" flow doesn't require a pre-made transcript for native Icelandic one-offs.

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

## Session Log

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
