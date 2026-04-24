# STATUS.md — Omega TV

**Last Updated:** 2026-04-24 (overnight — Beint + Bænatorg implementation)
**Last Agent:** Claude Code — Claude Design handoff execution
**Branch:** `claude-design-rebrand` (5 commits ahead of main on this branch, NOT pushed yet — see "Next session pickup")
**Build Status:** Dev on :3005, all pages 200, tsc clean, `pnpm build` green.

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
