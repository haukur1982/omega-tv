# LAUNCH.md — Omega TV go-live protocol

> Goal: get a real, honest MVP **on air** fast, then fill gaps live.
> Philosophy: ship the spine (live TV + working pipeline + giving + prayer),
> hide what's still fake, iterate in public. Don't wait for 100%.

**Status legend:** ⬜ todo · 🔄 in progress · ✅ done · ⏭️ post-launch (fine to ship without)

---

## The one-line definition of "ready to go on air"

A visitor can: **watch live TV**, **see the real schedule**, **give**, **submit a prayer**,
and **sign up for the newsletter** — and nothing on screen is visibly fake or broken.
Everything else (deep VOD catalog, courses, articles) can fill in over the following weeks.

---

## PHASE 1 — Pre-flight (do before the first production deploy)

### 1A. Vercel environment variables (BLOCKING)
The app reads these. Confirm each is set in the Vercel project (`omega-tv`,
prj_FpxS6A41sMiukyY8FHH5ZlPsCcYa) for **Production**. Local `.env.local` has most;
Vercel is separate and MUST be checked.

- ⬜ `NEXT_PUBLIC_SUPABASE_URL`
- ⬜ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ⬜ `SUPABASE_SERVICE_ROLE_KEY` ← **critical**: without it, admin writes (intake, publish, moderation) silently fail under RLS. (Code now logs a loud error if missing.)
- ⬜ `BUNNY_API_KEY`, `NEXT_PUBLIC_BUNNY_LIBRARY_ID`, `NEXT_PUBLIC_BUNNY_CDN_HOSTNAME`, `NEXT_PUBLIC_BUNNY_LIVE_STREAM_ID`
- ⬜ `NEXT_PUBLIC_LIVE_STREAM_EMBED_URL` ← the actual live player. Verify it points at the real Omega live feed, not a placeholder.
- ⬜ `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (newsletter + verification emails)
- ⬜ `AZOTUS_WEBHOOK_SECRET` (must match what the Mac mini / Azotus sends)
- ⬜ `CRON_SECRET` (schedule sync cron auth)
- ⬜ `FTP_SCHEDULE_HOST` / `FTP_SCHEDULE_USER` / `FTP_SCHEDULE_PASSWORD` (playout XML)
- ⬜ `ADMIN_EMAILS` (defaults to haukur1982@gmail.com if unset — fine, but set it explicitly so co-admins can be added)
- ⏭️ `UNSPLASH_ACCESS_KEY`, `GEMINI_API_KEY` / `NEXT_PUBLIC_GEMINI_ENABLED` (nice-to-have; metadata auto-fill + stock images)

> Quick check (after `vercel link`): `vercel env ls production`

### 1B. Merge the PR
- ⬜ Review + merge PR #1 (`experiment/vellum-prayer-cards` → `main`). 15 commits, build green, self-reviewed.
- ⬜ Confirm Vercel auto-deploys `main` to production.

### 1C. Domain
- ⬜ Decide launch domain: keep `omega-tv-lovat.vercel.app` for soft launch, or connect `omega.is` now.
- Note: `layout.tsx` `metadataBase` is already `https://omega.is` — fine either way, but social-share previews will point at omega.is until the domain resolves.

---

## PHASE 2 — Pipeline proof (the heart — test BEFORE relying on it)

This is the "next on the agenda" Hawk named. Two real runs, end to end.

> **Omega receiving-end PRE-VERIFIED (2026-06-01, simulated signed delivery):**
> A byte-accurate signed Azotus payload (HMAC-SHA256 over `{ts}.{body}`) for a
> Hour-of-Power EN→IS program was POSTed to `/api/azotus/vod-intake` locally.
> Result, all confirmed in DB:
> - intake returned `{ok:true, status:'draft_ready'}` with real episode_id
> - draft landed: source=azotus, source_language=en→language_primary=is, transcript stored, 4 chapters parsed
> - **duration float 1648.7 → stored 1649** (the old `22P02` crash class — proven fixed live)
> - publish-in-place: status→published + published_at set, **transcript + chapters preserved** (no metadata loss)
> - anon role sees the published row (public surfacing works; RLS still hides drafts)
> Test rows cleaned up afterward. **Conclusion: the Omega side is solid; the real
> Mac-mini run only needs to exercise the Azotus side (subtitle/burn/deliver).**

### 2A. English program (translated) — Type 1
- ✅ Omega receiving end verified via simulated signed delivery (see box above).
- ⬜ Pick one real English source (Hour of Power / In Touch).
- ⬜ Run it through Azotus on the Mac mini → it subtitles to Icelandic, burns in, delivers to `/api/azotus/vod-intake`.
- ⬜ Confirm a draft lands in `/admin/drafts` (Innhólf) with: title, description, transcript, chapters, poster candidates.
- ⬜ In the cockpit: pick a poster frame → Generate → confirm clean branded 16:9 + 4:5 (no burned subtitles in the poster).
- ⬜ Assign series + publish. Confirm it appears on `/sermons` and the home rail with real title + clean poster.

### 2B. Icelandic original — Type 2
- ⬜ One real Icelandic recording (Máttarstund / Bænatorg) → Azotus (chapters + search only, no translation) OR `scripts/publish-native-is.ts`.
- ⬜ Same confirmation: draft → review → publish → visible.

### 2C. Pipeline acceptance criteria
- ⬜ No "Unknown intake failure" — if a delivery fails, `/admin/health` shows the real error.
- ⬜ Published episode has a clean poster (not a subtitled frame-grab).
- ⬜ Once ≥1 real episode is published, run `POST /api/admin/posters/backfill` (logged in) to brand any remaining frame-grabs. It's batch-safe — loop until `{more:false}`.

---

## PHASE 3 — Hide what's still fake (so launch looks honest, not broken)

The site currently falls back to **mock data** when real content is absent. For launch,
either seed real content or gracefully empty the section. Decision per section:

- ⬜ **Home "Nýjustu þættir" rail** — shows MOCK_VIDEOS (Unsplash stock) when 0 published. After Phase 2 it shows real episodes. If still thin at launch, that's OK — they're dignified placeholders, but prefer ≥3 real.
- ⬜ **Sermons / Þáttasafn** — mock series shelves. Needs a few real published episodes or the page reads as empty/fake.
- ⬜ **Greinar (articles)** — `mock-articles.ts`. Either publish 2–3 real articles or hide the section from nav for launch.
- ⬜ **Námskeið (courses)** — mock courses. Likely ⏭️ post-launch; consider hiding from nav.
- ⬜ **Frettir (news)** — has the `news_items` schema-cache warning. Verify the table exists in prod or hide.
- ✅ **Live, Give (Styrkja), Bænatorg (prayer), Frettabref, About, Framtid, Israel** — these are real/static and launch-ready.

**Launch-nav decision:** ⬜ trim the top nav to only sections with real content. Hide Greinar/Námskeið if empty — an empty section is worse than no link.

---

## PHASE 4 — Smoke test on production (after deploy, before announcing)

Walk these on the real production URL:
- ⬜ Home loads; live ribbon shows current/next program (real schedule, not mock).
- ⬜ `/live` plays the actual stream.
- ⬜ `/give` — submit flow shows correct bank details (reikn. 0113-26-25707, kt. 630890-1019).
- ⬜ `/baenatorg` — submit a test prayer → it appears in `/admin/prayers` for moderation → approve → shows publicly.
- ⬜ `/frettabref` — sign up → **verification email actually arrives** (this was broken, now fixed — must confirm in prod).
- ⬜ `/admin` — log in; confirm only your email gets in (try a non-admin if possible).
- ⬜ Mobile: home + live + give on a phone (the 60–75 audience uses tablets/phones).
- ⬜ No console errors on the main pages.

---

## PHASE 5 — Go live
- ⬜ Announce / point the audience at the URL.
- ⬜ Watch `/admin/health` and Vercel logs for the first 24h.
- ⬜ Keep the weekly cadence: publish the Sunday service every week — that alone justifies the site.

---

## Post-launch backlog (fill as you go — NOT blocking)
- ⏭️ Real articles, courses, deeper VOD catalog
- ⏭️ `--steinn` → `--moskva` legibility on ~30 minor caption files
- ⏭️ Admin inbox/cockpit visual polish
- ⏭️ Gate `/api/admin/social/generate` (low risk)
- ⏭️ Replace remaining Unsplash/stock imagery with real Omega photography

---

## The 5 things that would actually stop launch (if any are NO, don't go live)
1. ⬜ Live stream plays on `/live` in production.
2. ⬜ Schedule shows real programming (not the dev mock).
3. ⬜ Giving page shows correct, real bank details.
4. ⬜ Prayer submit → moderate → publish works in production.
5. ⬜ `SUPABASE_SERVICE_ROLE_KEY` set in prod (or the whole admin silently breaks).

Everything else can be fixed while live.
