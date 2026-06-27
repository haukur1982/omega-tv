# STATUS.md — Omega TV

**Last Updated:** 2026-06-25 (Claude Opus — three-moves strategy + plan docs)
**Last Agent:** Claude Opus
**Branch:** `feat/faith-library-articles` (omega-tv)

---

## Session — 2026-06-25 (Claude Opus — strategy: from broadcast to home; three build-ready plans)

Hawk opened a vision conversation: he does not want Omega to "just be a website," he wants the place the whole NATION returns to, every generation. He explicitly retired the 60-75-only / iPad framing (see memory `project_omega_audience`). No code changed; the deliverable is strategy + plans.

**Diagnosis** (from a 14-surface walk-through + live prod analytics): a beautiful broadcast, but every surface forgets the visitor (no public identity layer anywhere). Live analytics pulled 2026-06-25 (site 4 days old): ~300 pageviews, a big share internal, real IS traffic a few dozen people; `/live` is the #2 page (the watch instinct transfers); 18 Google referrers and ZERO social; 1 subscriber, 0 prayers. The fire hose (cable, biggest in Iceland) is not pointed at the cup (web).

**Strategy = three moves, in order:** BRIDGE (cable->web + email capture, fastest ROI), RETAIN (the prayer that comes back answered + daily word + weekly letter), REACH (clips + social for off-cable generations, with a Claude Design handoff). Built via deep multi-agent planning with an adversarial review pass.

**Shipped to the repo:** `docs/plans/00-omega-three-moves.md` (overview, foundations, decisions index), `01-bridge.md`, `02-retain.md`, `03-reach.md`. Each has the experience end to end, architecture with concrete file paths, data changes, a phased build with a small first slice, guardrails (cost + privacy + reverence), risks, and the decisions only Hawk can make.

**Two live bugs the review surfaced (fix in Phase 0, before any email/prayer capture):**
- `src/lib/prayer-db.ts` getPrayers/getAllPrayers use `select('*')` and map `row.email` into the public Prayer payload (verified: `select('*')` at lines 62/77, `email: row.email` at line 32). Latent today (0 prayers) but a real sensitive-data exposure the moment a prayer with an email is approved. Fix: public column allow-list + confirm RLS.
- `src/app/api/subscribers/verify/route.ts` redirects unknown/expired tokens to `verified=1` (fake success). Fix before any double opt-in.

**Foundations all three moves need first:** a real `/personuverndarstefna` page (footer currently dead-ends to `/about`), consent logging on subscribers, a VERIFIED Resend sending domain (today it is the sandbox `onboarding@resend.dev`, which cannot reach real inboxes), passwordless magic-link (already wired for admin).

**Waiting on Hawk (hard inputs, not design choices):** Omega's registered legal entity name + Reykjavík postal address (privacy page + every email footer); confirm `omega.is/tv` as the on-air destination; confirm sender addresses (`postur@` general, `baen@` sacred). Then: which move to build first. Recommended order Bridge -> Retain -> Reach; the answered-prayer note inside Retain is the most sacred single artifact and is self-contained.

### Built this session — Phase 0 foundations started (verified locally, NOT deployed)
- **New `/personuverndarstefna` page** (`src/app/personuverndarstefna/page.tsx`): real GDPR privacy policy, data controller = Omega Kristniboðskirkja, kt 630890-1019, Ármúla 15, 108 Reykjavík (confirmed by Hawk + Fyrirtækjaskrá; see memory `reference_omega_legal_entity`). Footer `Persónuverndarstefna` link repointed from `/about` to `/personuverndarstefna`.
- **Fixed the prayer email leak:** `src/lib/prayer-db.ts` getPrayers now selects an explicit `PUBLIC_PRAYER_COLUMNS` allow-list (no email); `mapPrayer` no longer maps email; admin `getAllPrayers` re-adds it. Verified no other public path exposes prayer email (broadcast/sanctuary flow never reads email).
- **Fixed the verify route:** unknown/expired token now redirects to `?verified=expired` (was fake `verified=1`); token kept on the row so double-clicks resolve via `verified_at`.
- **New `/tv` Bridge arrival page** (`src/app/tv/page.tsx` + `src/components/tv/TvWatch.tsx` + `TvCapture.tsx`): stripped, phone-first, watch-first mat for the cable audience. Big "Horfa núna" loads the Restream live embed only on tap; cream weekly-letter capture card (segment `tv`) with an un-ticked consent box linking to the privacy page and submit disabled until consent; quiet doors to /baenatorg and /give; cable continuity line. `/tv` is its own path = free measurement in admin.
- **Verified:** tsc clean; `/personuverndarstefna` and `/tv` render on-brand with clean consoles; play button reveals the live iframe; consent box correctly gates the submit button (disabled→enabled); `/baenatorg` still renders; no server or client errors.
- **Committed** on branch `feat/omega-web-bridge`: `2a34ff2` (Phase 0 foundations) + `a43fce5` (/tv page). NOT deployed (prod gated; awaiting Hawk's explicit go).
- **Consent logging + on-air source split: DONE** (verified against the live DB, test rows cleaned up; 3-lens review = correctness + security clean). Migration `20260625_tv_bridge_consent_and_source` applied (additive, nullable): `subscribers.consent_{text_version,given_at,source}` + `page_views.source`. `/tv` signups now store provable consent (exact wording shown + timestamp + `source='tv'`); a `/tv?q=ls` arrival stores the source bucket so on-air placements are attributable in admin. Still zero login (email + checkbox only). The `?q` is carried by `PageViewTracker` and sanitized in `/api/track` (lowercase, `[a-z0-9_-]`, max 32).
- **Open / not done:** retention periods on the privacy page (18 mánuðir, eða 6 mánuðir eftir svar) are recommended defaults; Hawk to confirm before prod. The one remaining blocker before `/tv` capture can actually SEND email: a VERIFIED Resend sending domain (today the sandbox `onboarding@resend.dev` cannot reach inboxes) + `RESEND_FROM_EMAIL` set. `Skilmálar` footer link still points to `/about` (no terms page yet). Sender addresses (`postur@`/`baen@`) still to confirm. NOT deployed (prod gated; awaiting Hawk's explicit go).

---

## Session — 2026-06-24 (Codex — `/heimakirkja` effectiveness/copy/layout review)

Hawk asked for a judgment pass on `localhost:3010/heimakirkja`. No page code was changed.

### Findings
- **Overall:** strong concept and conversion angle. The core hook works: people who left church but not faith can redirect an existing public payment to build Omega.
- **Copy:** headline is strong. Main weakness is trust/proof: the page says the right things but could use one concrete Omega proof point earlier. Avoid clumsy headline inclusivity like `komin/n`; rewrite that line naturally.
- **Desktop layout:** polished and on-brand, but the hero fills the first viewport without a hint of the next section. The benefits grid leaves one orphan card, making the offer feel thinner than it is.
- **Mobile layout:** hero and benefit cards hold up well. Two inline grids do not collapse: the 3,000/44 million vision grid and the stewardship rows become cramped two-column strips on phone. Fix before launch.
- **Fact check:** Þjóðskrá page confirms the registration is free, same-day, one active registration only, and handles children separately. Still verify the `1.221 kr.` 2026 amount before publishing.

### Next
- Add mobile CSS for `.heimakirkja-vision-grid` and `.heimakirkja-build-row` to collapse to one column under ~900px.
- Consider adding a human proof block near the top: one sentence about 34 years on air plus one concrete line about what Omega already reaches today.
- Tighten the CTA copy and change `Þrjár mínútur og þú ert komin/n í hús.` to a cleaner Icelandic line.

---

## Session — 2026-06-12 (Antigravity — Icelandic language audit & grammar fix)

Hawk requested an audit of the public-facing pages to remove "obvious AI translations" and grammar errors. The site's language now feels more native, authentic, and matches the Omega brand.

### Shipped (live)
- **AI tropes removed:** Scandinavian loanwords (*Glimt* -> *Svipmyndir*) and AI buzzwords (*skapa vettvang* -> *búa til rými*, *stafrænn vettvangur* -> *stafræn miðlun*) replaced with natural Icelandic phrasing.
- **Anglicisms removed:** "Frá Reykjavík til sveitanna" replaced with "Hringinn í kringum landið". Headline capitalization changed from English title-casing ("Hjartað í Starfi Omega") to correct Icelandic sentence-casing ("Hjartað í starfi Omega").
- **Grammar fixed:** Corrected "Þín upplýsingar" to "Þínar upplýsingar" on the donate page. Fixed pronoun mismatch in the prayer ticker placeholder ("Systkin biður fyrir bænarefni sínu").

---

## Session — 2026-06-09 (Claude Opus — FTP /VOD auto-pull watcher)

Built the auto-pull pipeline so Icelandic programs flow to the web without the manual import window. **Lives on the Azotus mini, not this repo.**

- **What:** new `~/Azotus/scripts/ftp_vod_watcher.py` + PM2 service `omega-ftp-vod-watcher` (added to `ecosystem.config.js`, backup `.bak_ftpvod`, `pm2 save`'d). Polls FTP `212.30.195.77:/VOD` (user `upload`) every 90s; waits 60s for size-stability; downloads to `MEDIA_ROOT/.ftp_incoming`; writes native-IS sidecar into `1_INBOX`; atomically moves the video in. `omega_manager` then ingests exactly like the manual Native-Icelandic import. Non-destructive on the FTP; dedups via `.ftp_vod_state.json`.
- **Creds:** in `~/Azotus/.env` (gitignored): `FTP_VOD_HOST/USER/PASSWORD/DIR/REVIEW_MODE`. Same server as the schedule sync; the `upload` account is separate from `MBLuser` (which is schedule-only/chrooted).
- **PROVEN:** Hawk dropped a 2.74 GB program in `/VOD` → watcher pulled it (76s @ 36 MB/s) → landed in `1_INBOX` with native sidecar. (One bug fixed live: must `cwd` into `/VOD` before `RETR`, else `550 Couldn't open the file`.)
- **Going forward:** team uploads Icelandic programs to `/VOD` in Transmit → they appear in the web Innhólf as drafts to review + publish. No import window needed.
- **Open/next:** confirm `omega_manager` pickup of that first file landed in Innhólf (background watch was stopped before confirming — the file was correctly in `1_INBOX`; manager is the existing proven path). `FTP_VOD_REVIEW_MODE=auto` → AUTO mode; set `human` + `pm2 restart` if in-Azotus review is wanted first. **Still NEVER git pull the mini.**

---

## Session — 2026-06-06 (Claude Opus — Drive to launch: real content, images, chapters, comms)

Long session. Goal was Hawk's: **stop polishing, get it launched.** Everything below is committed to `main` and verified live in prod.

### Shipped (live)
- **Real content published.** 4 series (Vonarljós, Máttarstund, Times Square Church, CBN) + 6 episodes, branded posters + Icelandic descriptions. Home hero features a real program (Vonarljós), not a mock Sunday.
- **All fake content removed.** `/sermons` mock shelves hidden (empty categories don't render); `/greinar` + `/namskeid` real-only (gated behind `NEXT_PUBLIC_*_MOCKS` flags); Námskeið removed from nav. Hawk's 2 real articles restored to DB (they were stranded in `mock-articles.ts`).
- **Cohesive image system.** `src/lib/image-set.ts` — one engine: smart-crop (attention/centre), subtitle-band trim, natural warm grade, 16:9/4:5/2:3 variants. Backfilled all episodes + series. Hero-poster tool (`src/lib/hero-poster.ts`) with 5 colour themes in admin (Hetjuspjald) so shows don't look identical. Real Icelandic hero (Kirkjufell sunset) replaced the generic mountain.
- **Real-timestamp chapters FIXED.** Pulled ElevenLabs SKELETON word-timings from the mini, regenerated chapters for all 6 episodes via Gemini with REAL timestamps (was: Gemini guessing → wrong jumps). Bunny chapters synced.
- **Episode page** = the handoff's §4 "watch" surface, now complete: player + chapters + synopsis + scripture threads + related rail + **"Um þáttinn" info table** (added tonight).
- **Giving page accurate.** Only the 2 real ways: Aur **@Omega** + bank transfer (**0113-26-25707**, kt **630890-1019**, "Sjónvarpsstöðin Omega"). Removed fabricated allocation %/tiers. "Sjónvarp Símans · rás 6" now in footer + /live.
- **Newsletter = collect-mode.** Form adds emails straight to the list (no broken verification email until a Resend domain is set up). Honest success messages.
- **Admin bug-fixes.** Series edit page (was 404); episode count fix; Invalid Date fix; edit-from-Videos ("Breyta þátt"); save/publish works when editor reached via Bunny guid (id-or-guid resolution in GET/PATCH/publish). News section hidden until the translation pipeline exists.

### Design handoff verdict (`/design/omega-vod-handoff.md`)
Strong handoff — but **~80% already realized** through this session's work (§1 grade ≈ baked image variants; §2 keyart ≈ hero-poster tool; §4 episode page ≈ done). Remaining, each best as its own deliberate pass: (a) render-time "house grade" — needs re-architecting away from baked variants, taste-sensitive; (b) time-aware hero + countdown — **blocked on stale schedule**; (c) custom player scrubber w/ chapter ticks.

### ⚠️ Flag for next session
- **Schedule data is STALE** — ends ~today (only ~9 future slots). The daily FTP schedule sync (`/api/schedule`, host 212.30.195.77 / MBLuser) may have stalled. Quietly affects the live ribbon, "næsta sending," and any countdown. **Worth investigating first.**

### Hawk's to-dos (not mine)
- Provide **FTP folder paths + native/translate mapping** → unblocks Task #5 (auto-pull watcher; design is locked: same server, 2 folders, reuse MBLuser cred).
- Verify a **Resend domain** + set `RESEND_FROM_EMAIL` → unblocks actually sending newsletters.

### Guardrails to preserve
- NEVER `git pull` the Mac mini (32 uncommitted prod files; scp single files only). Don't rotate the shared FTP credential. Respect the auto-mode classifier blocks (no prod-secret dumps, no inserting attributed content without authorization). Use `open <file>` to show Hawk images — he can't see Read.

---

## Session — 2026-05-30 (Claude Opus — Foundation: auth + launch blockers)

Commissioned to build the platform to a state-of-the-art bar (UI/UX exceptional, Azotus→publish flow effortless). Started with a multi-agent audit (41 confirmed bugs, 1 refuted; design scored per public page), then rebuilt the foundation because a beautiful UI on a broken auth layer is worthless. **Nothing committed yet** — all in the working tree, awaiting Hawk's go to snapshot on a branch.

### Fixed (verified: tsc clean + routes compile/401)

- **Auth, architectural fix.** New `src/lib/admin-fetch.ts` — one `authedFetch()` helper that attaches the Supabase bearer token to every admin API call (this project uses `@supabase/supabase-js`: token in localStorage, NO cookie, so a plain `fetch` 401s). Converted the 6 broken pages: videos, prayers, articles, dashboard, subscribers, newsletters/new. (12 other admin pages already attach the token by hand — migrate them to the helper in a cleanup pass.)
- **Authorization gap closed.** `src/lib/admin-auth.ts` now requires the user's email to be on an allowlist (`ADMIN_EMAILS` env, comma-sep; defaults to `haukur1982@gmail.com` so the gate is closed even if the env var is never set). Before: ANY logged-in Supabase user could moderate prayers / email the list / delete content.
- **Newsletter signup.** `src/lib/subscriber-db.ts` `addSubscriber` moved off the RLS-blocked anon client onto `supabaseAdmin` (it runs in a server action) — the verification token now reads back and the email actually sends.
- **Draft publish, in place.** `src/app/api/admin/videos/link/route.ts` now UPDATES an existing draft when `episodeId` is passed (Azotus path) instead of insert-then-delete — kills the `bunny_video_id` unique-index collision AND preserves all enrichment (transcript/chapters/poster/thumbnail). Both paths now set `published_at` (public queries filter `published_at IS NOT NULL`, so episodes published without it were live-but-invisible). Videos page `handlePublishDraft` rewired to one call (no delete); `handleSaveConnection` (connect-existing) routed through the server route instead of RLS-blocked client writes.
- **Schedule slots preserved.** `schedule-slots` POST and `[id]` PATCH now set `is_manual_override = true` — admin-created/edited slots survive the daily XML sync instead of being purged as stale playout rows.
- **No fake programming on a live channel.** `src/lib/schedule-db.ts` `getScheduleInRange` no longer serves the mock week on a DB error or empty result in production (was masking outages with fabricated shows + feeding non-UUID slot IDs to the prayer-pulse RPC). Mock is now dev-only; prod returns empty → honest off-air.

### Design-system lift (started, verified in-browser)

- **`globals.css` :root** — defined `--radius-xs/sm/md/lg` (8/12/18/28px). ~87 references were undefined → every button/card/input was rendering SQUARE. Now rounded site-wide (confirmed: `--radius-sm`=12px, `--radius-md`=18px computed).
- **Warm accent** — re-pointed `--accent` from `--nordurljos` (cold blue) to `--kerti` (candle) and `--accent-dim` to `--kerti-gloed`. ~93 emotional/CTA/kicker uses went warm at once; genuine wayfinding (44 direct `--nordurljos` uses) stays cold. Verified: `--accent`=`#e9a860`; home hero CTA + framtid "Gerast Bakhjarl" donate CTA are now warm (were blue).
- **`.type-merki`** bumped 11px→13px, tracking 0.18em→0.14em. NOTE: most kickers override font-size inline (nav, logo, page eyebrows compute ~11.2px), so this only helps un-overridden uses. Real 60–75 legibility = per-component Phase 3 work.

### Pipeline unification (done, verified: tsc clean + routes 200)

- **One inbox, no duplicate.** `/admin/videos` is now the Bunny library + upload + connect ONLY — the broken "Drög" tab + insert-then-delete review modal are gone. A pointer card sends Azotus drafts to the Innhólf (`/admin/drafts`), which is the single review-and-publish room (nav already treats it as the spine).
- **Secure draft reads.** New `GET /api/admin/drafts` (list) and `GET /api/admin/episodes/[id]` (single) — both authed + service-role. Converted the inbox (`/admin/drafts`) and the cockpit (`/admin/drafts/[id]`) to read drafts/transcript through these instead of the public anon key. This is the prerequisite that makes the RLS tightening safe (admin lists won't go dark). `series` reads stay on the anon client (public, not sensitive).

### Page polish — Phase 3 (started, verified in-browser)

- **frettabref (was 2/5):** EmailSignupForm — green/red Tailwind states → palette (candle-glow success), faint `placeholder-white/30` → `/55`, neon-glow + `scale-105` button → warm solid (`--accent` fill, `--nott` ink, `--gull` hover, soft shadow). Page's "latest newsletter" card → tokenized the raw hex (#fcfbf9→`--skra`, #1a1a1a→`--skra-djup`, #e5e5e5→warm divider, #888→`--skra-mjuk`). Verified: warm button w/ dark ink, no neon, legible placeholder, tsc clean.
- **framtid (was 2/5):** cold-blue donate CTA + eyebrow/number markers already corrected by the `--accent`→`--kerti` re-alias (verified). REMAINING: heaviness — still a single dark register; add a cream (`--skra`) section so dark→cream reads as dawn not a wall.

### Thumbnails — subtitle-safe (started)

- **Burned-in-subtitle problem:** finished VOD masters have subtitles burned into the bottom band; `resolvePoster` falls back to a raw Bunny frame-grab when no poster exists → captions show on the card. `ThumbnailFrame` now detects the Bunny-proxy fallback (`/api/bunny/thumbnail/`) and renders the img at `height:128%` top-anchored so the bottom ~22% (the caption strip) is clipped (clean posters/`thumbnail_custom` untouched). Verified against a real frame (fb436cc9…): 128% fully clears a 2-line band; hover transform composes fine.
- **Proper fix (next):** generate branded posters (Poster Machine `getCleanVodCrop` + Azotus clean candidate frames) for all episodes so cards use designed key art, not frame-grabs. CSS crop is the stopgap until backfilled.

### Home rail — real metadata + Apple TV text (done, verified)

- **Root cause of "Omega TV / 22":** the home "Nýjustu þættir" rail was calling `getVideos()` — RAW Bunny library files, whose names parse to show="Omega TV" + title="22". It bypassed the curated `episodes` catalog entirely.
- **Fix:** rail now reads `getNewestEpisodes(3)` from the episodes table (real titles, series, duration) and `resolvePoster(e,'portrait_4x5')` for clean key art. `UrDagskranni` card now follows Apple TV+ exactly: **title leads**, then ONE quiet secondary line "series · duration" (was: kicker above + bare title). Removed ~25 junk duplicate `_unused*` imports from page.tsx.
- Verified in DOM: cards read "Trúin sem sigrar / Í Snertingu · 28 mín" etc. (currently mock fallback — 0 published episodes exist; all 8 are drafts. Once a draft is published the rail shows it automatically). tsc clean, no console errors.
- **ThumbnailFrame caption-crop** (128% top-anchor on raw Bunny frames) still applies as the safety net when an episode has no branded poster.

### Poster Machine — backfill route built + proven (2026-05-31)

- **No `canvas` needed** (earlier worry was wrong): the Poster Machine runs on `sharp` + `satori` + `@resvg/resvg-js`, all installed and loading. Nothing in src imports `canvas`.
- **New `POST /api/admin/posters/backfill`** (admin-gated, idempotent): generates branded 16:9 + 4:5 key art for every episode missing a variant. Source priority: selected candidate → first candidate → Bunny auto-frame. `getCleanVodCrop` (72% height) strips the burned-in subtitle band. Mirrors 16:9 into `thumbnail_custom` so every consumer upgrades. Skips episodes with no source; supports `{dryRun, limit}`. tsc clean.
- **Proven end-to-end:** ran `generatePosterVariants` against a real subtitled Bunny frame (TimesSquareChurch) via a throwaway tsx script — produced valid branded PNGs (487KB landscape / 392KB portrait), clean crop + grade + vignette + title overlay. Script removed after.
- **Catalog reality:** 8 episodes, ALL drafts, 0 published; only 2 have a Bunny video (rest are demo drafts w/ no source). So backfill yields ~2 posters now and they're not publicly visible until published. Real payoff is forward-looking: run it (logged in: `POST /api/admin/posters/backfill`) after content is published, and ensure Azotus sends candidate frames so new episodes auto-get posters.
- framtid cream "dawn" Áherslur band added (verified: --skra bg / --skra-djup ink).

### Legibility pass — gull-on-cream (COMPLETE site-wide, browser-verified)

Method: `--gull` kickers are fine on dark (--nott, gold) but ~2.5:1 and illegible on cream.
Swapped to `--mor` (#3F2F23, ~9:1) ONLY where section bg is cream (--skra/--skra-warm),
TEXT colors only — decorative gull rules/dots/fills kept. Verified per page in-browser
(computed color + nearest non-transparent bg) = 0 gull-on-cream.

Pages done (commits de72df1, 774b9e0, 9369c58, 4c8263f, 2bfbcc1, 0b8a6d6, 7b20b24):
give, israel, about, greinar, vitnisburdur, frettir, namskeid. Intentionally kept gull on
cream: 22px Hebrew calligraphy (Icelandic name in dark ink sits directly below) + 76px
decorative drop-cap. Dark mastheads/kickers keep gull everywhere.

Separate audit item, NOT started: low-contrast body/meta on `--steinn` (#7A7268, ~3:1 dark)
→ `--moskva` (#B9B2A6, ~4.5:1). Verify each before swapping. Also: admin inbox/cockpit
visual elevation (Hawk verifies on login — admin gates to sign-in).

### Self-review of the branch (code-review skill, 2026-05-31) — 2 real fixes, rest refuted

Ran adversarial review of the whole branch diff (auth, RLS, pipeline, data). Findings:
- **REAL (fixed):** `getNewestEpisodes` didn't select `poster_candidates`, so the home rail
  couldn't use branded 4:5 posters even after backfill — silently fell back to stretched
  16:9 / raw frame. Fixed (738deee): field flows through type+select+Row+map.
- **REAL (fixed):** poster backfill could exceed the serverless function timeout on a large
  catalog (sequential, 2 renders/episode). Made batch-safe (ced13ba): `scan` vs `batch`
  split, `maxDuration=300`, returns `{more, remaining}` to loop; idempotent so safe to repeat.
- **REFUTED:** `getPublicUrl` `{data:urlData}` destructure — matches the proven live pattern
  (vod-intake:342); supabase-js v2 returns `{data:{publicUrl}}`. `revalidateTag('vod','max')`
  — Next 16.1 signature IS `(tag, profile)`, 2 args valid. `bunnyVideoId!` assertion — guarded
  by the `!sourceUrl && !bunny_video_id` skip above it. supabase lazy-fallback "no throw" — by
  design (loud console.error added; hard-throw would break the build with no env).

### Known-remaining (next sessions)

- **RLS draft leak — CLOSED + verified (2026-05-30, migration `tighten_episodes_public_read_to_published`, Hawk approved).** Dropped the two `USING(true)` public-read policies on `episodes`; replaced with `Public reads published episodes USING (status='published')`. Verified empirically: as the `anon` role, draft visibility = 0 (8 drafts exist); public pages (/, /sermons, /live) still 200. Service-role policy intact → admin inbox still reads all drafts. `series`/`seasons` left public-readable (not sensitive).
- **Still open (minor hardening):** `supabaseAdmin` silent anon fallback warn (`src/lib/supabase.ts:19`); confirm `SUPABASE_SERVICE_ROLE_KEY` set on Vercel; optional gate on `/api/admin/social/generate` (low risk).
- **`/api/admin/social/generate`** has no auth — deliberately deferred: read-only PNG render, no DB access, embedded as `<img src>` (a Bearer gate would break the embed). Low risk (compute only).
- **Two competing draft surfaces** = the real "confusion": `/admin/videos` Drög tab vs `/admin/drafts`. Plan: make `/admin/drafts` THE Azotus inbox (it's richer/correct) and reduce `/admin/videos` to Bunny library + upload only.
- **`supabaseAdmin` silent anon fallback** when `SUPABASE_SERVICE_ROLE_KEY` missing (`src/lib/supabase.ts:19`) — add a loud warn. Key IS set locally; confirm it's set on Vercel.

### Phase plan (task list)

1. ✅ (mostly) Foundation — auth + launch blockers. 2. Design system lift (tokens: define `--radius-*`, raise small-text floor off `--steinn`, reclaim `--nordurljos` for wayfinding, dawn transitions). 3. Azotus→publish pipeline experience (centerpiece — unify the inbox, visual state clarity). 4. Page-by-page design polish (worst-first: framtid 2/5, frettabref 2/5).

---

## Session — 2026-05-20 (Antigravity — Integration Quality Audit)

Audited the quality of the Azotus-to-Omega VOD intake and poster integration pipeline.

### Findings & Insights

- **Code Quality**: Integration is production-grade. Security (HMAC + timestamp validation), DB hygiene (base64 moved to Storage), trigger-based search indexing (`search_vector`), and editorial edit preservation are solid.
- **Queue Overlap Warning**: Webhook POST enqueues to a PGMQ queue (`vod_metadata_jobs`) but still processes everything (Gemini metadata + poster generation) inline. If the queue is never consumed, messages will pile up. Blockers on inline processing (e.g. slow LLM calls) could trigger request timeouts in serverless contexts.

### Next Steps

- Monitor PGMQ table size or hook up a background worker to consume `vod_metadata_jobs` off the HTTP thread.

---

## Session — 2026-05-19 (DISPATCH-003 — Poster Machine V1)

Built the Poster Machine: one selected source frame → branded variants → each public surface gets the right aspect. No schema change — the whole model lives in the existing `episodes.poster_candidates` JSONB column (the dispatch explicitly preferred this over a migration).

### What was built (Omega side, branch `experiment/vellum-prayer-cards`)

- **`src/lib/poster.ts`** (new) — the poster model: `PosterModel` type, `normalizePosterModel()` (accepts the legacy bare array, the full object, or null — old rows and the clean single-frame fallback never break), and `resolvePoster(ep, aspect)` with the full fallback chain (branded variant → other variant → `thumbnail_custom` → Bunny proxy → null).
- **`src/lib/thumbnail-generator.ts`** — extended backward-compatibly: optional `sourceImage` Buffer (use a reviewer-chosen frame instead of the auto Bunny frame), new `portrait_4x5` (1080×1350) format, `getCleanVodCrop` generalized by target ratio (Codex's subtitle-band clean crop preserved), new `generatePosterVariants()` that fetches the source once and grades 16:9 + 4:5. The existing `bunnyVideoId`/`landscape` path (i2620, `api/admin/videos/thumbnail`) is untouched.
- **`src/app/api/admin/posters/route.ts`** (new, admin-auth) — `GET ?episodeId` returns the normalized model; `POST` `select` | `generate` | `manual`. `generate` fetches the chosen frame, brands both variants, uploads to the existing Supabase `thumbnails` bucket, writes the model, and **mirrors the 16:9 into `thumbnail_custom`** so every existing public surface upgrades with zero other changes.
- **`src/app/api/azotus/vod-intake/route.ts`** — new `ingestPosterCandidates()`: Azotus sends candidate frames inline as base64; intake moves each into Supabase Storage and stores only compact descriptors + URLs (base64 never touches the DB). Re-delivery never clobbers reviewer poster work (poster_candidates dropped from the update path, same pattern as `thumbnail_custom`). Degradable: no candidates → empty model, single-frame fallback still works.
- **`src/components/admin/PosterStudio.tsx`** (new) + mounted in `src/app/admin/drafts/[id]/page.tsx` — candidate grid (pick a frame), Generate button, 16:9 + 4:5 previews, manual URL override. Self-contained so the big draft page only needed a one-line mount.

### Decisions made (flagged for the architect)

- **Candidate transport = base64 inline over the existing signed intake.** No new GCS bucket/ACL or second credential — reuses the one signed Azotus→Omega pipe and the existing Supabase `thumbnails` bucket. ~10×~40 KB JPEGs ≈ ~0.5 MB POST, one-shot per delivery. Forward-compatible: `ingestPosterCandidates` also accepts a pre-hosted `url` if Azotus later moves to GCS-hosted frames.
- **Public consumption for V1 = the `thumbnail_custom` mirror** (universal, zero-risk — upgrades sermons list, show page, all `ThumbnailFrame` consumers automatically). Aspect-correct portrait wiring (`resolvePoster` into the `4/5` shelves) needs the search-projection / show-page query to also select `poster_candidates` — clean follow-up, intentionally not done in V1 ("keep the first version practical").

### Verification (honest)

- `pnpm exec tsc --noEmit` → exit 0, zero errors (Omega).
- Azotus `python3 -m py_compile workers/vod_publisher.py tests/test_vod_publisher.py` clean.
- NOT run here (sandbox): live image generation (Sharp), a real Azotus→Omega delivery, the `.venv` pytest suite. Operator steps below.

### Next / operator

- Run one live track from the Mac mini and confirm candidates appear in `/admin/drafts/[id]` → pick → Generate → 16:9 + 4:5 render and the card updates.
- `.venv/bin/python -m pytest tests/test_vod_publisher.py -q` (Azotus) — existing tests should stay green (the <60s guard keeps `test_build_omega_intake_payload` hermetic).
- Follow-up (not a blocker): wire `resolvePoster` into the `4/5` portrait shelves once their queries select `poster_candidates`.

---

## Session — 2026-05-19 (DISPATCH-002 — Azotus-side, no Omega changes)

Claude Code built DISPATCH-002's two-station VOD delivery guardrails — **entirely Azotus-side**, branch `codex/vod-intake-http`. **No Omega code changed**: `/api/azotus/vod-intake` already satisfies the handoff ("only change Omega if missing"). Codex's intake, idempotency, draft gate, Bunny thumbnail proxy and clean crop are preserved/untouched.

Azotus commits `56c5533 54d2b92 3b60bbe fd6dedd 3fc3eef`: canonical track-UUID as `azotus_track_id` (never a filename/alias like i2620); `OMEGA_VOD_DELIVER_ROLE` one-deliverer gate (Mac mini=production, Mac Studio=dev); durable per-station delivery log; `sync_pipeline_to_macmini.sh` now ships the VOD code to the Mac mini (secrets stay on-box); guard unit tests. Full detail in Azotus `STATUS.md` + the `DISPATCH-002` Response (left in `queue/` as `partial` — pytest + live run are operator/venv steps, flagged from the start).

**For Codex:** Omega intake enqueues `enqueue_vod_metadata_job` AND processes metadata inline in the same request — confirm the queued job isn't double-consumed. Optional (needs Hawk's ok, schema): unique index on `episodes(bunny_video_id)` to make dedup race-proof.

---

## Session — 2026-05-19 (Clean i2620 thumbnail)

Hawk reported that the generated i2620 thumbnail was ugly: it used a raw Bunny frame with burned Icelandic subtitles and part of the scripture slide.

### Fixed

- Updated Apple TV thumbnail generation to crop finished VOD frames away from the lower subtitle band and bias toward the live video side instead of the slide/text side.
- Fixed the Sharp processing bug where `gamma(0.95)` was invalid; it now uses a valid correction value.
- Added cache-busted thumbnail filenames so regenerated thumbnails do not keep showing stale images.
- Generated a clean local preview at `/private/tmp/i2620-clean-thumb-v2.png`.
- Uploaded the clean thumbnail to Supabase Storage and updated i2620 draft `43580ebe-85aa-442c-b196-a0e94e436515`:
  - `https://dvzwpwlgucsdyrkhrpah.supabase.co/storage/v1/object/public/thumbnails/43580ebe-85aa-442c-b196-a0e94e436515_landscape_1779193909098.png`

### Verification

- `pnpm exec tsc --noEmit` passed.
- Pushed commit `50df406` to `experiment/vellum-prayer-cards`.
- Deployed to temp Vercel: `https://omega-tv-lovat.vercel.app`.
- Verified the new Supabase thumbnail URL returns `200 image/png`.

### Next

- Refresh the i2620 draft modal in `/admin/drafts` and visually confirm the thumbnail is acceptable.
- If a future frame still catches a lower-third or slide, the next step is multi-frame candidate selection rather than relying on one Bunny default frame.
- Coordination handoff for Claude was created at `/Users/haukur/Projects/.dispatch/queue/DISPATCH-001-omega-vod-thumbnail-handoff.md`.

---

## Session — 2026-05-19 (Azotus/Omega delivery package queued)

Hawk clarified the Azotus mental model: Azotus receives original ministry videos, transcribes, translates, creates subtitles, burns subtitles when needed, and exports a processed delivery video. Omega should not replace Azotus; Omega should receive Azotus's completed delivery package as a reviewed VOD draft.

### Coordination

- Created Claude build dispatch: `/Users/haukur/Projects/.dispatch/queue/DISPATCH-002-azotus-omega-delivery-package.md`.
- The requested build is the dependable Azotus completed-track handoff:
  - final delivery video
  - transcript/subtitles
  - language/source metadata
  - Bunny upload/idempotency
  - signed Omega intake
  - one gated Omega draft

### Guardrails

- Keep using `https://omega-tv-lovat.vercel.app` until Hawk says the real domain is ready.
- Preserve the Bunny thumbnail proxy and clean subtitle-avoiding thumbnail crop.
- No VOD auto-publish.

---

## Session — 2026-05-19 (Two-station VOD guardrails)

Claude flagged the corrected production model: the Mac mini in Iceland is the primary studio station, not a translation-only satellite. Hawk's Mac Studio is dev/secondary.

### Updated Dispatch

- Amended `/Users/haukur/Projects/.dispatch/queue/DISPATCH-002-azotus-omega-delivery-package.md` with:
  - Mac mini = primary production VOD deliverer.
  - Mac Studio = dev/secondary, not normal production deliverer.
  - Mac mini sync/deploy must include VOD delivery code.
  - Secrets stay excluded from sync; provision the Mac mini `.env` directly on-box.
  - Only one station should deliver a given production program to Omega/Bunny.
  - Production trigger must pass the real Azotus track UUID as `azotus_track_id`, not a filename/test alias like `i2620`.

### Local Check

- Confirmed `workers/vod_publisher.py` sends `"azotus_track_id": track_id`.
- Confirmed `/tracks/{track_id}/publish-vod` passes the route `track_id` through to `workers.vod_publisher.publish_to_vod(track_id, None)`.
- Confirmed Azotus track IDs are UUID-based. `omega_db._generate_id()` uses UUID4; the FastAPI create-track route uses deterministic UUID5 from `program_id|language|subtitle`.

---

## Session — 2026-05-19 (Poster system queued)

Hawk clarified that Omega's front page and VOD surfaces use different aspect ratios and graphic treatments, so the current single generated thumbnail is only V1 fallback behavior.

### Coordination

- Created Claude build dispatch: `/Users/haukur/Projects/.dispatch/queue/DISPATCH-003-omega-poster-system.md`.
- Poster Machine V1 target:
  - Azotus extracts 8-12 frame candidates from the finished delivery video.
  - Reject obvious bad frames: black, blurry, too dark, subtitle/lower-third heavy, mostly slide/text when live frames exist.
  - Omega reviewer picks the source frame.
  - Omega generates branded variants for current UI needs, especially `16:9` and `4:5`.
  - Public VOD/front-page components use the correct variant instead of stretching one image everywhere.

### Guardrails

- Preserve the current clean thumbnail fallback.
- Do not block VOD delivery on perfect poster automation.
- Keep manual override available.
- No auto-publish.

---

## Session — 2026-05-19 (VOD thumbnail/metadata fixes deployed)

Hawk reported that the admin draft thumbnail was broken and the i2620 description was just raw subtitle lines.

### Fixed in code

- Added `/api/bunny/thumbnail/[videoId]`, a Bunny thumbnail proxy that fetches the CDN image with the Bunny player referer. Direct CDN requests return `403` and the old `iframe.mediadelivery.net/thumbnail/...` path returns `404` for i2620.
- Switched admin/public VOD thumbnail fallbacks to use `/api/bunny/thumbnail/{bunnyGuid}` instead of direct Bunny URLs.
- Updated Apple TV thumbnail generation to use the same Bunny thumbnail fetch path.
- Improved `scripts/generate-metadata.ts` mock fallback so missing Gemini never produces raw SRT cue text as the description.

### Verification

- `pnpm exec tsc --noEmit` passed.
- Pushed commit `16d89ee` to `experiment/vellum-prayer-cards`.
- Added/confirmed `GEMINI_API_KEY` in Vercel Production from local `.env.local`.
- Deployed to temp Vercel: `https://omega-tv-lovat.vercel.app`.
- Verified `https://omega-tv-lovat.vercel.app/api/bunny/thumbnail/2b386fa3-3862-486f-8074-65e91c8cc7f3` returns `200 image/jpeg`.
- Repaired existing i2620 draft `43580ebe-85aa-442c-b196-a0e94e436515` with Gemini-generated metadata:
  - Title: `Bænin: Lykill að andlegu lífi`
  - Description length: 840 characters
  - Tags: `bæn-og-trú`, `andlegt-líf`, `guðsrækt`, `kristið-líf`

### Next

- Open i2620 in `/admin/drafts` and visually review the generated title/description/tags.
- Generate/select the Apple TV thumbnail now that the Bunny thumbnail proxy works.
- Run the next completed Azotus track through the VOD intake.

---

## Session — 2026-05-18 (VOD Factory deployed)

Codex pushed and deployed the VOD Factory M1 work after Hawk approved Vercel CLI login.

### Deployment

- Pushed Omega branch `experiment/vellum-prayer-cards` to GitHub at `c0ee403`.
- Added `AZOTUS_WEBHOOK_SECRET` to Vercel Production.
- Deployed production through Vercel CLI.
- Production URL returned by Vercel: `https://omega-9fwkws5cf-haukur1982-1838s-projects.vercel.app`
- Active Vercel alias: `https://omega-tv-lovat.vercel.app`
- Rollout decision from Hawk: keep using the temporary Vercel URL until the VOD library has several reviewed videos and the site is ready to go live on the real domain.

### Intake smoke test

- `POST https://omega-tv-lovat.vercel.app/api/azotus/vod-intake` without signature returns `401`, which confirms the endpoint is live and protected.
- `POST https://omega.is/api/azotus/vod-intake` currently returns `404`, but this is not blocking the current rollout because Hawk does not want the real domain live yet.
- Until Hawk explicitly decides to switch the public domain over, Azotus should use:
  - `OMEGA_VOD_INTAKE_URL=https://omega-tv-lovat.vercel.app/api/azotus/vod-intake`

### Next

- Keep the VOD factory on the temporary Vercel URL while building up the first reviewed videos.
- Fix/switch the public `omega.is` domain only when Hawk says the site is ready to be live.
- Review the existing i2620 draft in `/admin/drafts`.
- Run the next manual VOD publish with a new completed track after review.

---

## Session — 2026-05-18 (VOD Factory M1 implemented)

Hawk asked to implement the 90-day VOD Factory plan. This session shipped the first production spine: Azotus now hands finished videos to Omega over HTTP, Omega receives them through a signed intake API, creates draft episodes, and the admin/public VOD surfaces know about review state and discovery.

### Shipped in Omega

- Added migration `20260518000000_vod_factory_intake.sql` and applied it to Supabase.
- Added `vod_intake_jobs` plus episode fields: `azotus_track_id`, `azotus_job_id`, `source_language`, `review_status`, `assigned_to`, `review_notes`, `metadata_confidence`, `poster_candidates`, `search_vector`.
- Added `POST /api/azotus/vod-intake`:
  - HMAC auth via `AZOTUS_WEBHOOK_SECRET`
  - idempotent by Azotus track + Bunny GUID
  - stores intake job
  - generates metadata from transcript
  - creates/updates Omega draft episode
- Added `POST /api/bunny/stream-webhook` for Bunny Stream event logging/status updates.
- Added `POST /api/admin/episodes/[id]/regenerate` so the draft editor can regenerate metadata from stored transcript.
- Draft inbox now shows queue stats, review status, assignment, Azotus origin, metadata confidence, poster count, and review notes.
- Draft edit page now has review status, assigned-to, internal notes, Azotus/source metadata, transcript preview, and enabled "Fylla út sjálfvirkt".
- Episode publish now revalidates VOD public pages/tags.
- `/sermons` now has first-pass VOD discovery search/filter UI backed by Postgres full-text search.
- Chapter saves push approved chapters back to Bunny best-effort.

### Shipped in Azotus

- Worker agent updated `workers/vod_publisher.py` to POST signed intake payloads to `OMEGA_VOD_INTAKE_URL` instead of shelling into the Omega repo.
- `workers/bunny_upload.py` supports per-call Bunny library/API-key overrides.
- Added `tests/test_vod_publisher.py`; Azotus VOD publisher tests pass.

### Verification

- `pnpm exec tsc --noEmit` ✅
- `pnpm build` ✅ after rerun with network access for Google fonts
- `supabase db push` for isolated VOD migration ✅
- `supabase migration list` confirms `20260518000000` applied ✅
- Browser QA: `http://localhost:3010/sermons?q=trú&language=is` rendered search/results UI ✅
- Azotus: `python3 -m py_compile workers/vod_publisher.py workers/bunny_upload.py tests/test_vod_publisher.py` ✅
- Azotus: `.venv/bin/pytest tests/test_vod_publisher.py` → 2 passed ✅

### Important operational notes

- Matching secrets were set locally and in Vercel Production. Azotus currently points to `https://omega-tv-lovat.vercel.app/api/azotus/vod-intake` because `omega.is` returns `404` for the new endpoint.
- The normal `supabase db push` is still blocked by old duplicate local migration versions (`20260417`, etc.). This session applied only the new VOD migration from an isolated temp workdir to avoid touching old history.
- Poster candidate extraction is not built yet. The schema/admin path is ready; Azotus still sends an empty list.
- Auto-triggering from Azotus `COMPLETED` is still intentionally off. Run one more manual track first.

---

## Session — 2026-05-18 (Azotus → Omega VOD bridge proved)

Hawk handed off the stalled VOD bridge test from Claude. Codex used the committed Azotus branch `omega-vod-handoff` in a separate worktree so the dirty Azotus `main` checkout was left untouched.

### Shipped operationally

- Ran the VOD publisher against the real i2620 Azotus track:
  - Track ID: `9cfd8236-d1f6-4c36-a9bd-6f717252af17`
  - Job ID: `i2620_intluk_h264-1080p25-aac-20260516T122859784056Z`
  - Video: `4_DELIVERY/VIDEO/i2620_intluk_h264-1080p25-aac-20260516T122859784056Z_SUBBED.mp4` (2.1 GB)
- Uploaded the finished video to Omega's VOD Bunny library `628621`.
- Bunny GUID: `2b386fa3-3862-486f-8074-65e91c8cc7f3`
- Omega draft episode created:
  - Episode ID: `43580ebe-85aa-442c-b196-a0e94e436515`
  - Status: `draft`
  - Language: `is`
  - Series: `null` for human assignment in `/admin/drafts`
- Azotus track moved from `COMPLETED` to `DELIVERED` with `vod_published=true`.

### Notes

- Claude's handoff said the command was `python -m workers.vod_publisher i2620`, but the DB lookup requires the real track UUID. Bare `i2620` did not resolve.
- The generated Omega draft title is still filename-like. The metadata bridge works, but the editorial quality of title/description/poster/chapter generation needs the next pass.
- No code was changed in Omega TV during this session.

### Recommended next pass

Build the real draft-review workflow around this proven bridge: better `/admin/drafts` screen, regenerate metadata, poster candidates, series assignment, publish/schedule. After one or two more manual successes, add the Azotus auto-trigger on eligible `COMPLETED` tracks.

---

## Session — 2026-04-26 (design system + cohesion polish)

Hawk asked for a "designer's-eye" pass to make the site cohesive. Site has good bones now; this session locked the system and rippled polish across the redesigned pages.

### Shipped

**Design system documented** at [`docs/design-system.md`](docs/design-system.md):
- Type ladder (Editorial vs Display H1, three H2 tiers, kicker/deck/drop-cap/meta specs)
- Color hierarchy rules ("amber appears once per page", gull on cream, nordurljos on dark mastheads)
- Card grammar (4:5 poster, 16:9 rail, 16:10 featured, list row, door tile)
- Ornament vocabulary (3 patterns: §4.1 section opener, §4.2 centered, §4.3 byline rule)
- Transition + motion language (hard cuts, hover -3px, scale 1.04, 320ms cubic-bezier)
- Hub commitments (persistent live signal, cross-media wayfinding, equal citizenship for video/article/course)
- Drift log with file paths

**Polish ripples applied:**
- H2 size lock: UrDagskranni 48→40px, NewestRail 38→40px, /greinar Brennidepill 48→44px (Featured H2 tier)
- /greinar Brennidepill image aspect 4:3 → 16:10 (matches FeaturedSunday)
- SeriesShelf hover normalized -2→-3px, scale 1.03→1.04 (matches all poster cards)
- Amber-once rule on /heim — StyrkjaBand button ghosted, FeaturedSunday added `ctaAccent` prop (ghost on /heim, primary on /sermons)
- Section ornament (gold rule + dot) added to SeriesShelf, Ritstjórarval, Safnið headers
- PullQuote ornament swapped to §4.2 centered design
- OnAirRibbon fallback ribbon — live signal never disappears (shows "Sendingar daglega" when no slot data)

**/namskeid full redesign:**
- Dark masthead → cream body cathedral rhythm
- New `CoursePosterCard` component (4:5 poster, matches /sermons SeriesCard aesthetic)
- Old `CourseCard.tsx` (Apple-TV-Netflix-era with Ken Burns + framer-motion) left in tree but unmounted

### What's still on the drift log (next session)

1. ~~`/give`~~ ✅ Full cathedral redesign across all 5 sub-components — dark masthead → pergament Sowing → cream DonationClient (with allocation sidebar) → cream OtherWays → dark ScriptureFooter. Every visual token swept (torfa → skra-warm, ljos → skra-djup, moskva → skra-mjuk, border → cream hairlines). State logic (cadence toggle, tier cards, custom amount, form, payment method, anonymous, submit handler) untouched. Real form-backend integration (Valitor/SaltPay/Stripe) remains a separate task.
2. ~~`/vitnisburdur`~~ ✅ Full cathedral redesign + TestimonialForm token cleanup
3. ~~`/about`~~ ✅ Five-section cathedral sandwich (dark hero → cream pull-quote → cream timeline → pergament values → dark gallery)
4. ~~`/sermons/[id]`~~ ✅ Targeted token sync (h1 weight 700→400, gold byline rule). Stays dark — watching surfaces work in dark per video-platform convention.
5. ✅ `/namskeid/[slug]` — full individual-course detail redesign with cinematic hero + cream curriculum body + pergament support card. Lesson-state UX preserved (completed/current/locked/free-preview).
6. Section kicker drift sweep (mostly false-positive from initial grep — most 0.18em / 11.5px usages are spec-compliant meta lines / card tags; only deliberate kickers need 0.22em / 11px). Punching this is a 30-min targeted job, not a full session.

**Cathedral redesign is now complete across the public-facing site.** Every reading and watching surface is in cohesion. Remaining work is content (Hawk-authored articles, real Sunday sermons, course content) and the deferred backend pieces (donation processor, episode → series tagging).

### Build state
- `pnpm build` green
- ~50+ uncommitted files since the morning commit (4 sessions of work this calendar week)
- Branch name `experiment/vellum-prayer-cards` is now misleading — the work is the full cathedral redesign

### Key memory established this session
[`feedback_verify_visual_changes_in_browser.md`](../.claude/projects/-Users-haukur-Projects-omega-tv/memory/) — after any visual change, navigate Chrome MCP and read computed styles BEFORE describing the result. Don't trust theoretical contrast math.

---

## Earlier session — 2026-04-25 (long evening continuation)

[Previous evening continuation entry follows below]

---

## Evening continuation — 2026-04-25 (after the first commit)

Picked up after the 39-file morning commit. Touched four more surfaces: /sermons full redesign with mock data, /greinar dark→cream port, /israel section refinements, and /heim full redesign as the "punchline."

### Shipped (all uncommitted on `experiment/vellum-prayer-cards` — needs commit)

**/sermons (Þáttasafn) — full redesign**
- 8-section editorial flow: masthead → Sunday featured → newest rail (Apple-TV-up-next style) → 6 series shelves by category (Útsendingar Omega, Söfnuðir á Íslandi, Frá útlöndum, Heimildarmyndir, Lofgjörð, Barnaefni)
- New per-series page route at `/sermons/show/[slug]` with full episode catalog
- Migration on disk: `20260425_series_category.sql` (Hawk applied via dashboard)
- Mock fallback data at `src/lib/mock-series.ts` so empty categories preview correctly
- Poster-style 4:5 cards with hover lift + play-button reveal
- New components: `SermonsMasthead`, `FeaturedSunday`, `NewestRail`, `SeriesShelf`

**/greinar — dark→cream port**
- Was the only reading-content surface still all-dark. Now matches the cathedral rhythm
- Dark masthead with magazine-issue stamp ("Hefti 17 · Apríl 2026")
- Cream Brennidepill (cinematic featured), pergament Ritstjórarval, cream Safnið
- `ArticleListRow` and `LetterPlaceholder` made register-aware (used by /israel/greinar too)

**Pergament-section bug fix (palette-level)**
- All section-level pergament backgrounds were using `rgba(212,194,162,0.18)` transparent overlay. On pages with `<main>` bg `--mold` (dark), this rendered as DARK warm-brown, not cream.
- New solid token `--skra-warm: #EBE2D0` in globals.css. Replaced section-level usages across:
  /greinar, /israel Hátíðir rail, /sermons SeriesShelf register='pergament'
- Empty-state cards inside cream sections kept their rgba (intentional subtle hint)

**/israel — refinements (continuation of morning's work)**
- Added doors grid (4 chapter-numbered tiles) between broadcast band and Foundation
- Hátíðir rail with Hebrew script + niqqud (Shavuot/Rosh Hashanah/Yom Kippur/Sukkot/Hanukkah)
- Documentaries surface (`/israel/heimildarmyndir`) with poster-style 4:5 cards
- Embedded "Næsta sending" ribbon in masthead — solved the dark→dark clash
- Foundation + Prophecy got drop caps + ornamental openers
- Prayer call got centered ornamental opener
- All Bible references verified against 2007 Biblían at biblian.is

**/heim (homepage) — full redesign — "the punchline"**
- 10-section composition with dark→cream→dark sandwich
- Order: Hero → OnAirRibbon → PrayerTicker → **FeaturedSunday (NEW)** → UrDagskranni → BaenDagsins → PullQuote → IsraelTeaser → StyrkjaBand → Legacy34Years
- New: `IsraelTeaser` component (quiet dark band acknowledging /israel section)
- New: FeaturedSunday on homepage (latest Sunnudagssamkoma as cinematic moment, reuses /sermons component)
- PrayerTicker, BaenDagsins, UrDagskranni, PullQuote made register-aware
- UrDagskranni now uses 4:5 poster cards matching /sermons aesthetic
- BaenDagsins refactored to manuscript-page composition (centered single column, smaller drop cap, ornamental opener tight to kicker)
- Legacy34Years token cleanup (was using deprecated `--accent`/`--text-primary`)
- Ornamental openers added to UrDagskranni section header

### Discipline established this session

**Verify visual changes in Chrome MCP before declaring done.** Saved as feedback memory at `~/.claude/projects/.../memory/feedback_verify_visual_changes_in_browser.md`. After every visual/CSS change, navigate Chrome and read computed styles — don't trust theoretical contrast math. Lesson learned the hard way when I told Hawk a fix had landed without verifying, and the fix had landed in his browser but my confident language was based on math, not observation.

### What needs to happen next

1. **Commit this batch** — `experiment/vellum-prayer-cards` branch has 30+ uncommitted files from the evening continuation. Hawk hasn't asked yet.
2. **Branch rename** — branch name still says "vellum-prayer-cards" but it's the cathedral-redesign branch now
3. **Real Sunnudagssamkoma series + episodes seeded** — FeaturedSunday on /heim and /sermons currently shows mock; needs `getLatestEpisodeBySeriesSlug('sunnudagssamkoma')` to return real data
4. **Tag existing series with categories** in the `series.category` column so /sermons shelves populate from real data instead of mock fallback
5. **Articles content** — Hawk writes Israel articles + tags `category='israel'` to populate `/israel/greinar`
6. **Sanctuary code cleanup** — `src/components/sanctuary/*` is dead, `is_broadcast_prayer` flag could be replaced by `broadcast_slot_id IS NOT NULL`
7. **Quick-prayer auto-approve fix** — `submitQuickPrayerAction` bypasses moderation for "national" prayers
8. **Deploy** — none of today's evening work is live yet

### Migrations applied this session
- ✅ `20260425_articles_category.sql` — adds `articles.category` column
- ✅ `20260425_series_category.sql` — adds `series.category` column
- ✅ `20260425_live_prayer_pulse.sql` — applied earlier in the day

---

## Morning session — 2026-04-25

[unchanged from previous STATUS update — Bænatorg + Live + Israel section overhaul commit ceee838]

---

## Session — 2026-04-25 (full day)

Long session covering 4 surfaces: Bænatorg, Live, Israel, plus a small data cleanup. Required multiple iterations on most pieces — flagging clearly where I miscalibrated so future sessions don't repeat the same mistakes.

### Bænatorg redesign (early-day)
- **Banner overhaul** — replaced photographed dark banner that wasn't landing with a typographic article-cover pattern (kicker / serif title / italic excerpt / gold rule / byline-row + right-side Scripture epigraph)
- **Cream body register** — body section uses `--skra` cream, dark→cream hard cut, exit gradient removed
- **Matt 11:28 epigraph verified** against 2007 Biblían at biblian.is — text + reference format both corrected (was wrong on first pass: had older 1981 wording + period instead of colon)
- **Site reference convention** for Bible refs: `Matteus 5:3–10` (colon, short book name) per `src/lib/passages.ts:165`. Hawk approved using full form `Matteusarguðspjall 11:28` for the prayer-wall epigraph as a deliberate reverent treatment; inline refs elsewhere stay short
- **Footer fix** — `<main>` background was set to `var(--skra)` cream, which made the footer's `linear-gradient(to bottom, var(--bg-deep), #05040350)` (50 = ~31% alpha at the bottom) wash out. Reverted `<main>` to `--mold` to match every other page
- **Data cleanup** — `scripts/clean-prayer-junk.ts` repaired Anna's mojibake prayer (MacRoman→UTF-8 roundtrip via fixed mapping table) and unapproved a duplicate "leiðtogum landsins" prayer. Idempotent, re-runnable

### Live page (mid-day)
- **In-broadcast prayer pulse** — new `LivePrayerPulse` component on /live during on-air. One tap → one count, Postgres atomic via `increment_live_prayer_count` RPC, polls every 15s. Migration: `supabase/migrations/20260425_live_prayer_pulse.sql` adds `live_prayer_count` column + RPC + grants to anon/authenticated. **Hawk applied this migration via Supabase dashboard.**
- **In-place prayer submission** — replaced two `<Link href="/baenatorg#senda">` triggers in LiveMeta + OnAirEditorial with `<SendaBaenButton variant="…">` that opens the same Bænatorg `PrayerSubmissionModal` over the player. Viewer never leaves the broadcast. Submissions still flow to the same moderation queue
- **Architectural recommendation captured but not built**: deleting the dead `src/components/sanctuary/*` folder + `/api/broadcast-prayers/submit` route + `is_broadcast_prayer` flag (use `broadcast_slot_id IS NOT NULL` instead) + the auto-approve leak on `submitQuickPrayerAction` for "national" prayers. **Follow-up task.**

### Israel section — full redesign (late-day, multiple iterations)
**Required ~5 escalations from Hawk before it was right. Failure pattern was scope-cutting features he explicitly named into "Phase 2" — saved as feedback memory `feedback_no_scope_cut_when_vocational.md`.** When Hawk frames work as vocational/calling/important, build the whole vision in one push, not a phase 1.

Final composition (8 sections):
1. **Dark masthead** — Isaiah 62 watchman tone, kicker/title/italic excerpt/gold rule/byline + right-side full-verse epigraph, dawn-light radial + ornamental flourish, **embedded "Næsta sending" ribbon at the bottom** (solves the dark→dark clash by keeping schedule signal inside the header)
2. **Cream doors grid** — 4 typographic tiles with chapter numbers (01–04), per-tile warm tint, links into Foundation / /israel/greinar / /israel/heimildarmyndir / Prayer call
3. **Cream Foundation** — Genesis 12 covenant teaching (preserved verbatim from prior page), ornamental opener + 3-line drop cap on first paragraph, pull-quote with verified 2007 wording
4. **Cream Greinar rail** — articles tagged `category='israel'`, with empty state when none yet (still a dashed placeholder — flagged for redesign)
5. **Pergament Hátíðir rail** — 5 upcoming Hebrew/biblical holidays (Shavuot, Rosh Hashanah, Yom Kippur, Sukkot, Hanukkah), each with **Hebrew script with niqqud** + Icelandic name + biblical ref + pastoral 1-line meaning. Data in `src/lib/israel-holidays.ts` — needs annual update
6. **Cream Documentaries** — `getIsraelEpisodes()` filters episodes joined with series by title pattern. **Poster-style 4:5 thumbnails** with title overlaid, series tag top-left, runtime top-right
7. **Cream Prophecy** — Ezekiel 37 dry-bones, ornamental opener + drop cap on "Árið 1948" paragraph, pull-quote with verified 2007 wording (older 1981 "vor/yðar" replaced with 2007 "okkar/ykkur")
8. **Dark Prayer call** — Psalm 122:6 with centered ornamental opener (gold 8-point star flanked by hairlines)

All Bible refs verified against 2007 Biblían at biblian.is (Jesaja 62:6, 1. Mósebók 12:2, Esekíel 37:11–12). Psalm 122:6 fragment used as-is — fetcher dodged the full verse on copyright grounds, but the opening clause is unchanged across translations.

### Migrations applied
- ✅ `20260425_live_prayer_pulse.sql` — Hawk applied via dashboard
- ✅ `20260425_articles_category.sql` — applied via dashboard (added `articles.category TEXT NULL` + partial index)

### Database state (audited via `scripts/check-israel-data.ts`)
- Series with "Ísrael" in title: **0** — documentaries section will render empty until seeded
- Published Israel episodes: **0**
- Israel-tagged articles: **0** — Hawk writes these
- Israel schedule slots (last 90d + next 30d): **8** — masthead ribbon will populate from these

### What needs to happen next (priority order)

1. **Seed Israel series + episodes** so /israel/heimildarmyndir + the Documentaries rail aren't empty. Three options documented in chat (manual seed / Azotus pipeline extension / schedule_slots auto-link). Hawk hasn't picked one yet.
2. **Hawk writes first 1–2 Israel teaching articles** so the Greinar rail populates. Articles MUST stay Hawk's voice — no auto-generation (project standing rule).
3. **Greinar rail empty state redesign** — currently a dashed placeholder; should be more editorial when no content yet. Flagged but not built.
4. **Doors hover polish** — gold line transition on hover. Flagged but not built.
5. **Sanctuary code cleanup** — delete `src/components/sanctuary/*` + `/api/broadcast-prayers/submit` + `is_broadcast_prayer` flag. Pure dead code removal.
6. **Quick-prayer auto-approve fix** — `submitQuickPrayerAction` (`src/actions/prayer.ts:36`) auto-approves "national" prayers, bypassing moderation. Should go through one consistent moderation path.
7. **`pnpm build` smoke test** — wasn't run this session. Verify before merging this branch.
8. **Branch is `experiment/vellum-prayer-cards`** but contains far more than vellum prayer cards now. Either rename or merge to main once verified.

### What I learned (kept in memory for future sessions)

- **`feedback_no_scope_cut_when_vocational.md`** — when Hawk frames work as vocational/calling/important or names ≥3 content types together, build the whole vision in one push. Don't punt features into phases. Don't call something "done" while named content types are missing.
- Verify Bible refs against biblian.is (2007 Biblían) — never trust training-data wording for theological copy.
- Site Bible reference convention: colon (`Matteus 5:3–10`), short book name in inline use, full liturgical name (`Matteusarguðspjall`) for reverent display moments.
- Hawk's existing dev server holds port 3005 — Preview MCP can't take over without killing his process. HMR is the verification path.

---

## Prior session — 2026-04-24 (Codex — Greinar article cover redesign correction)
**Branch:** `claude-design-rebrand` (active redesign branch, pushed to origin)
**Build Status:** all pages 200, tsc clean, `pnpm build` green across all redesigns.

---

## Codex session — 2026-04-24 evening

**Correction after Hawk review:** first pass still looked bad on desktop. The full-bleed ash photo/fade treatment was removed entirely.

What changed in the correction:

- Replaced the giant image-over-vellum hero with a dark editorial article cover.
- Desktop now uses a two-column opening: article metadata/title/excerpt/author on the left, ash image as supporting media on the right.
- Narrow/mobile view now opens with the article title first, then the image. No more waiting through a large photo before knowing what page you are on.
- Cream reading frame starts cleanly after the cover instead of being pulled into a foggy image fade.

Verification:

- `pnpm build` passed after rerun with network access for Google font fetches.
- Browser QA checked `http://localhost:3005/greinar/aska` in the in-app browser.

Earlier first pass, kept for history:

Hawk flagged `/greinar/aska` as feeling visually off. The issue was mainly proportion and opening typography:

- Article hero was too tall on mobile, which delayed the actual article title/body and made the page feel like an image followed by a separate article.
- The cream vellum frame now overlaps the photo fade, so the masthead feels attached to the image.
- The title scale was tightened slightly and negative tracking removed on the article title/excerpt.
- Removed the decorative drop cap from article bodies. For this article, the first paragraph is a short opening line, so the drop cap split "Allir" awkwardly. First paragraph now reads as a clean lead sentence.

Verification:

- `pnpm build` passed after rerun with network access for Google font fetches.
- Browser QA checked `http://localhost:3005/greinar/aska` in the in-app browser.

Next:

- Hawk should eyeball this page on desktop too before merging the wider redesign branch.
- If the article detail direction lands, consider applying the same "clean lead, no drop cap" rule intentionally across all future Omega long-read pages.

---

## Daytime continuation — 2026-04-24 (after overnight Beint + Bænatorg)

**4 of 5 prototypes implemented.** Episode explicitly deferred with rationale.

### New commits on `claude-design-rebrand` today

| Commit | What |
|---|---|
| [`7d6188f`](https://github.com/haukur1982/omega-tv/commit/7d6188f) | **Heim redesign** — 8-section editorial homepage replaces Netflix-rail (HeroV2, OnAirRibbon, PrayerTicker, BaenDagsins, UrDagskranni, PullQuote, StyrkjaBand + preserved Legacy34Years) |
| [`c49d75f`](https://github.com/haukur1982/omega-tv/commit/c49d75f) | **Styrkja redesign** — unified donation flow (cadence toggle + tier cards + custom amount + form + live allocation sidebar + honest thank-you + other ways + bank transfer preserved) |

### Full 5-prototype status

| Prototype | Status | Commit | Notes |
|---|---|---|---|
| **Beint** | Shipped | `7165ce0` | Two first-class states (on-air / off-air) with `?state=off-air` dev escape hatch |
| **Bænatorg** | Shipped | `1a30b15` | Altar reframe, single-column feed, modal submission |
| **Heim** | Shipped | `7d6188f` | 8 editorial sections; old Hero/DagskraStrip/PrayerPresence kept in tree for future /dagskra revival |
| **Styrkja** | Shipped | `c49d75f` | Visual + state complete. Payment backend NOT wired — submit goes to honest thank-you state, bank transfer details preserved |
| **Episode** | **Deferred** | — | See reasoning below |

### Why Episode was deferred (important)

The Episode prototype is simpler than the current `/sermons/[id]` page. The current page is already "the highest-impact surface on the whole site" (Phase 2 plan) with:
  - ThreadsSidebar connecting passage → prayer → article → next broadcast
  - ChapterList (chapter-level navigation within each episode)
  - Caption switcher
  - Related episodes rail

Fully adopting the prototype would REGRESS these features to match a simpler design. That's wrong.

The prototype's one genuinely new idea is **"Bænir úr þessum þætti"** — prayers tied specifically to one episode's broadcast (distinct from passage-linked prayers which the current page already has). That needs:
  - Schema addition: `episode_id` or `schedule_slot_id` column on `prayers` table
  - Admin flow to approve these episode-linked prayers for display
  - Data capture during live broadcast so prayers land on the right episode

That's its own follow-up. **Do not** try to lift the prototype's UI without the data layer — it would render empty every time.

Log: the prototype's `EmptyStateInvite` component (candle glow + italic "Þú mátt vera sú, eða sá, fyrsta sem ritar bæn við þennan þátt" + Skrifa bæn button) is genuinely beautiful and should be reused when the data model is ready.

### Follow-ups still live

From the overnight + daytime sessions combined:

1. **featured_prayers table** — enables BaenDagsins (home), FeaturedPrayer (Bænatorg), and a consistent "prayer of the day" across pages.
2. **episode_prayers or schedule_slot_id on prayers** — enables Bænatorg ShowPrayerCluster + Episode "Bænir úr þessum þætti".
3. **pull_quote field on articles** — so PullQuote (home) doesn't have to heuristic-extract from excerpt.
4. **scripture_refs on episodes/schedule_slots** — so OnAirEditorial (Beint) shows real "Ritningarstaðir í dag" instead of silently hiding the column.
5. **"Minna mig á" backend** — NaestaSending CTA on Beint off-air state. Either .ics download or push/email subscribe.
6. **Styrkja payment backend** — submit currently flips to honest thank-you. Either server action emailing admin the donor's intent (cheapest), or Valitor/SaltPay/Stripe integration.
7. **Styrkja off-palette blue fully fixed** — audit §2 addressed via token swap; if Hawk wants a richer visual treatment on the Styrkja hero, it's a separate design pass.
8. **Dedicated /dagskra page** — would revive the retained DagskraStrip + PrayerPresence + WeekSchedule components in a broadcast-aware full-schedule layout. Not a regression since the tree still has them.
9. **Mobile sweep** — each page designed desktop-first with responsive fallbacks. A dedicated mobile QA pass across Heim / Beint / Bænatorg / Styrkja would catch anything that broke at small viewports.
10. **Visual QA by Hawk** — all 4 redesigned pages are on `claude-design-rebrand` but not merged to main. He needs to eyeball them before merge.

### When Hawk merges

- Branch is ready. Suggest squash-merge per redesign page OR a single merge commit (preserve granular history via individual commits in merge message).
- No destructive ops needed — every replaced component stays in the tree, just unmounted from its page.
- After merge, the skill bundle `~/.claude/skills/omega-stodin-design/` stays available for future sessions to reference.

---

---

## Active session — 2026-04-24 overnight (Beint + Bænatorg implementation)

**Summary:** Claude Design finished its working session and produced an 8.4 MB handoff bundle — the `omega-stodin-design` skill — with 5 page prototypes (Beint, Bænatorg, Heim, Styrkja, Episode) as real React JSX plus the complete design system (colors_and_type.css, fonts, assets, 18 preview cards, website UI kit, 2,195-line chat transcript). Tonight implemented **two full page redesigns** (Beint, Bænatorg) and **site-wide pattern corrections** (Navbar, Ísrael, Styrkja hero wash) from that bundle. 3 prototypes still on the follow-up list (Heim, Styrkja full redesign, Episode).

### What shipped on branch `claude-design-rebrand` tonight

| # | Commit | What |
|---|---|---|
| 1 | `063ed14` (main) | README rewrite — AI-collaborator entry point |
| 2 | `f089ae3` | STATUS.md session log (prior session) |
| 3 | `67f83b6` | **Navbar fix** — active-state underline + "Næsta sending" indicator swap from `--kerti` amber to `--nordurljos` slate (audit §3 root cause) |
| 4 | `7165ce0` | **Beint redesign** — two first-class states (on-air / off-air) with proper editorial composition |
| 5 | `1a30b15` | **Bænatorg redesign** — altar reframe, single-column feed, modal submission, corrected CTA discipline |
| 6 | `3e00b60` | **Site-wide palette cleanup** — Styrkja off-palette blue + Ísrael amber headings + pure-black backgrounds |

Install of `omega-stodin-design` skill to `~/.claude/skills/omega-stodin-design/` — any future Claude Code session can now reference the design system directly.

### Architecture decisions that future sessions should know

1. **Claude Design JSX prototypes are NOT drop-in React components.** The skill's own README is explicit: *"Don't copy ui_kits/website/\*.jsx into production — those files are cosmetic recreations for design work, not production React."* Each page needs to be re-authored as Next.js Server Components wired to Supabase, using the JSX prototypes as a visual spec. That's what was done for Beint and Bænatorg.

2. **Client vs server split on Bænatorg:** server component fetches approved prayers + counter + campaign; passes prayers down to `<BaenatorgClient>` which owns filter state, modal state, and optimistic `bið-með-þér` updates. Clean boundary.

3. **Beint has a dev escape hatch:** `?state=off-air` forces State B so the off-air composition can be QA'd without waiting for a schedule gap. Remove when real prod data reliably produces both states.

4. **Custom SVG icons, NEVER Lucide.** The brand rule is hard. `src/components/prayer/PrayerIcons.tsx` is the new pattern — hand-authored inline SVG with `strokeWidth=1.6`, `round` caps/joins, `currentColor` fill/stroke. Follow this shape for any new icons added to the system.

5. **Mobile modal = full-height sheet, not centered dialog.** At ≤640px, `PrayerSubmissionModal` becomes a bottom sheet. Apply this pattern to any future modal dialogs — the 60–75 audience on iPads + phones does not tolerate centered 480px dialogs.

### Audit items NOT addressed tonight (deferred on purpose)

- **§5.3 Home card sub-labels** — contrast marginal, needs visual inspection, not a palette bug per se.
- **§6 UTF-8 mojibake on Bænatorg** — one Anna/Heilsa prayer record. Data-layer fix (Supabase row), not a code fix.
- **§7d Beint empty state when live stream iframe is null** — currently shows a quiet italic sentence; could be richer. Low priority.
- **"Minna mig á" backend** — NaestaSending CTA is visual-only. Needs either .ics download (static, cheap) or push/email subscribe (real). See commit `7165ce0` message.
- **Ritningarstaðir data** — OnAirEditorial accepts an optional `scriptures` prop but no data wiring yet. Needs a scripture_refs join on episodes or schedule_slots.
- **FeaturedPrayer on Bænatorg** — deferred; needs a `featured_prayers` table.
- **ShowPrayerCluster on Bænatorg** — deferred; needs a `schedule_slot_id` relation on `prayers`.
- **SharePanel on Bænatorg** — using `navigator.share()` native API for now. A proper slide-out dialog is a second pass.

### Prototypes from Claude Design NOT yet implemented

1. **Heim (homepage)** — prototype exists at `~/.claude/skills/omega-stodin-design/prototypes/heim/`. 677 lines of components (heim-components.jsx). No detailed chat direction proposal was written (unlike Beint + Bænatorg) so this will need more interpretive work.
2. **Styrkja (giving page)** — prototype at `~/.claude/skills/omega-stodin-design/prototypes/styrkja/`. 754 lines. No written direction proposal.
3. **Episode (individual archive page)** — prototype at `~/.claude/skills/omega-stodin-design/prototypes/episode/`. 513 lines. No written direction proposal.

### Critical context on Omega that was clarified this session

Hawk shared this 2026-04-24. Saved to memory files for future sessions (see `~/.claude/projects/-Users-haukur-Projects-omega-tv/memory/`):

- **Hawk is the closest friend to Omega Stöðin's founder/owner** (Eiríkur Sigurbjörnsson). This is vocational stewardship, not a client project.
- **Actual audience is 60–75 yr old** — NOT mixed-age with grandchildren bridge. Design serves them, don't optimize for hypothetical younger users.
- **Omega is cable + donations**, not a standalone web product. The web is additive modernization; design work = donor-facing stewardship evidence ("we are serious"), not aesthetic indulgence.
- **Hawk built a subtitle/translation pipeline** (Azotus + Book System) — 20-min turnaround, Icelandic + Norwegian, feeding VOD + cable playout. Potentially licensable to other small-country Christian broadcasters. **Separate business conversation pending** about monetizing this — he asked for it explicitly.

### Next session pickup

**Priority order:**

1. **Push `claude-design-rebrand` to origin** — it's 5 commits ahead locally. `git push -u origin claude-design-rebrand` to get it visible. (NOT done tonight because Hawk should see the work before it's in remote history; local commits are safe.)
2. **Hawk QA** — take the branch through a browser pass before merging anything to main. He should see Beint on-air/off-air (use `?state=off-air` for the latter), Bænatorg feed + modal + filter tabs, Ísrael section headings now `--ljos`, Styrkja hero wash.
3. **Decide on Heim redesign approach** — the Claude Design prototype has no written direction proposal. Options: (a) implement prototype verbatim; (b) re-engage Claude Design for a direction proposal first; (c) write the direction proposal here and implement.
4. **Styrkja + Episode** — same question as Heim. If one of them has clear visual continuity with what's already shipped, it's cheap to do. If both need fresh design thinking, it's one Claude Design session per page.
5. **Merge plan** — when Hawk approves, squash-merge `claude-design-rebrand` into main, or rebase + merge the individual commits to preserve granular history.

### Pending non-Omega thread

**Subtitle system monetization conversation.** Hawk explicitly asked to have this as a separate conversation. Positioning a B2B product to small-country Christian broadcasters (Faroes, Greenland, Baltics, other Nordic nets) — pricing, licensing model, outreach strategy ("how to get into the doors"). Different audience from Omega work; different deliverables. Do not bring Omega branding context into that conversation.

---

## Prior session — 2026-04-23 Claude Design handoff

**What was done tonight:**

1. **README rewrite** — replaced Next.js boilerplate with an orientation doc that points AI collaborators at `docs/brand-guide.md`, `src/app/globals.css`, and `src/app/layout.tsx` as the locked system. Committed `063ed14` on main.
2. **Branch `claude-design-rebrand`** pushed for Claude Design to work against.
3. **Claude Design project set up** — "Omega Stöðin Design System":
   - GitHub repo linked
   - Brand assets uploaded (logo SVGs)
   - Company blurb + gotchas-list filled in (palette, italics-as-voice, warm-don't-lift, Icelandic diacritics)
   - Design system published (⚠️ "Default" checkbox may still need ticking — left as TODO)
   - Font warning: Fraunces/Newsreader/Inter must be uploaded as .ttf files from fonts.google.com (TODO tomorrow)
4. **PDFs → PNGs** — 9 site screenshots converted from PDF and saved to `/Users/haukur/Downloads/pAGES/images/`
5. **Site audit received from Claude Design** — genuinely strong work. Summary below.

**Audit headline finding:**

The amber/slate roles are **inverted site-wide**. Amber (`--kerti`) is doing wayfinding (nav active state, "NÆSTA SENDING" indicator, even section headings on Ísrael page). Slate (`--nordurljos`) is doing CTAs (prayer form button, newsletter signup, "NÝJAST" badge, Styrkja hero arch). This is the *root cause* of both the "cornflower blue button" bug and the "amber fatigue" feel. Fix the inversion and five separate bugs collapse together.

**Also flagged:**

- Styrkja hero arch is `#5B8ABF` — a completely off-palette blue, not even `--nordurljos`.
- One UTF-8-mojibaked prayer record on Bænatorg ("Anna" entry, Heilsa category) — isolated, data-layer issue.
- Three specific tight-type spots: prayer card body, Greinar card meta row, Home card sub-labels.
- Live page empty-state = blank canvas (design problem, not a bug).
- Possible lazy-load misses on Styrkja "Tvær leiðir." and Um okkur (unverified).
- Italics verified clean — Newsreader italic holding everywhere, italic-as-human-voice rule intact.

**Decision made:** go with option (b) — the Live page redesign will establish the corrected patterns (nav→slate, CTA→amber, section-headings→ljos) that the rest of the site adopts. Not option (a) Live-only fixes.

**Next session pickup:**

1. Tomorrow morning: tick "Default" on the Claude Design system, upload the three Google Fonts (.ttf files) to clear the substitute-font warning.
2. Paste the approval response (in the conversation log above) into Claude Design to kick off the Live page redesign spec.
3. Claude Design will propose design direction first; review before any screens are generated.
4. Hold: Priority 3 (human warmth), Priority 4 (mobile + TV extension), Priority 5 (design system doc).

**Important for future code work:** once Claude Design proposes the corrected patterns, the *code* needs the same inversion fix applied. That's a Claude Code job on `claude-design-rebrand`, not a Claude Design job. Likely affects: Navbar, PrayerWall form, NewsletterSignup, ArticleCard "Lesa grein" link, "NÝJAST" badge component, Styrkja hero section.

---

## Historical context below — keep for reference


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

## Brand identity session — 2026-04-19 (late evening)

### 🎨 Major milestone: Omega visual identity, locked

After ~30 iterations in a single session, the brand identity system is complete and documented:

**Shipped:**
- `brand-assets/omega-mark.svg` — final mark (v10). Outer ring + Greek Ω (Source Serif 4 Bold, size 235) with feet flowing into ring, 6px transparent horizontal cut flush with Ω baseline.
- `brand-assets/omega-lockup-horizontal.svg` — primary lockup: [Ω mark] MEGA + tagline
- `brand-assets/omega-lockup-stacked.svg` — vertical lockup for profile photos, footers
- `brand-assets/facebook-cover.svg` — ready-to-upload Facebook cover (820×360)
- `brand-assets/preview.html` — live preview of all lockups at multiple scales on all color variants
- **`docs/brand-guide.md` — comprehensive brand authority document** (~450 lines). Covers strategy, identity, typography, color, lockups, content strategy, platform mix, rhythm, technical reference, captured decisions. Must be consulted before any future design work.

**Three key decisions (captured in brand-guide §7):**
1. Keep the Ω mark, retire the chrome treatment. Preserves 34 years of audience recognition.
2. Horizontal rectangle mask cut (not angular arcs) — v10.1 was tried and rejected because angular arcs broke the O silhouette.
3. Four social posts per week anchored to real data — Ritningin vikunnar (Mon), Bænakvöldið (Wed), Sunnudagssamkoma announcement (Sat), editor's-voice sermon cards (ad hoc).

**Platform call:**
- Facebook + Instagram only. TikTok/X/LinkedIn/Pinterest explicitly rejected.
- Phase 1: manual posting (Hawk downloads PNGs, posts himself)
- Phase 2 (month 2): Meta Graph API + auto-scheduling

**Commits today (in brand session order):**
- `5e2d1b8` — Omega mark + lockup system (v10 final)
- `d34e8d9` — Facebook cover v1 using locked lockup
- `(next commit)` — comprehensive brand guide at docs/brand-guide.md + STATUS update

### 🔜 Next session — Milestone 4: Satori social templates

**Immediate next steps:**
1. Install `satori` + `@resvg/resvg-js` — server-side JSX → PNG rendering
2. Bundle Source Serif 4, Libre Baskerville, Inter as TTF files in `public/fonts/social/`
3. Build `/admin/social` page showing candidate posts as PNG previews
4. Add `/api/admin/social/generate` endpoint — takes template ID + data + format, returns PNG bytes
5. First template: **Ritningin vikunnar** (Passage of the Week) reading from `featured_weeks.featured_passage_id` + `bible_passages.text_is`
6. If quality bar holds, templates 2-4 (broadcast card, editor's voice, prayer night invite)

**Also on list before resuming templates:**
- Hawk to upload `facebook-cover.svg` as new Omega FB cover (export to PNG at 1640×720)
- Hawk to update FB profile photo to mark-only (export `omega-mark.svg` at 512×512)
- Facebook about-section rewrite in Hawk's voice

## Earlier today (2026-04-19, full-day arc)

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

- **2026-05-16:** Launch polish pass on `localhost:3010` for desktop, widescreen laptop, and mobile. Fixed the Sunday featured CTA dead-end by adding a mock sermon detail fallback for `mock-sunday-latest`; changed schedule links away from missing `/dagskra` to `/live#dagskra`; fixed mobile FeaturedSunday stacking; fixed PrayerInvitationRow mobile overflow; added global `box-sizing: border-box`; removed mobile horizontal scroll on `/give`, `/baenatorg`, and `/sermons`; replaced client/server-sensitive Icelandic date/number formatting in prayer cards and Styrkja flow. Verified with in-app browser at 390x844 and 1728x1000. `pnpm build` passes with network access for Google fonts. Build still logs existing Supabase warning: `public.news_items` table missing, likely unrelated to this visual pass.
- **2026-05-16:** Added `docs/poster-system.md` and linked it from `docs/design-system.md`. This locks the Omega image/poster direction: article posters, show posters, sermon thumbnails, course posters, and Israel/documentary banners all get the same warm charcoal/vellum finish instead of raw stock/Bunny imagery. Next practical step: build `src/lib/poster-renderer.ts` on top of the existing Sharp thumbnail generator, then add admin buttons for each content type.
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
