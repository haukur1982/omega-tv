# Omega TV + Azotus — System Audit

> Hand-off doc for a third opinion. Written to be picked apart, not
> defended. Every claim names a file/commit so the auditor can verify or
> refute it directly. Date written: 2026-05-19.

---

## 1. What this system is, in one paragraph

**Omega TV** is the public Icelandic Christian television network's website
and admin portal. The audience is roughly 60–75 year-old Icelandic donors
and viewers — cable subscribers being modernised to an additive online VOD.
**Azotus** is the AI subtitling/translation pipeline that turns
English-language Christian programming into finished Icelandic broadcast
video. Together they form the "Omega media ecosystem": Azotus is the
factory at the back, Omega TV is the storefront at the front. The
connection between them is a single signed HTTP webhook.

The website is on Vercel; the pipeline runs on two Mac stations
(Hawk's Mac Studio = dev, an Iceland Mac mini = production deliverer)
plus Google Cloud (Cloud SQL Postgres, GCS, Cloud Run jobs, Gemini /
ElevenLabs).

---

## 2. Omega TV — the storefront

### 2.1 Stack
- Next.js 16.1.0 (App Router), React 19, TypeScript
- Supabase (auth, Postgres, storage)
- Bunny.net Stream (video CDN, library `628621`)
- Resend (email)
- Tailwind 4, Framer Motion
- pnpm
- Vercel: project `prj_FpxS6A41sMiukyY8FHH5ZlPsCcYa`, team
  `team_FwdMyHJVjb7wq7wesliBryvV`, slug `haukur1982-1838s-projects`,
  current production URL `omega-tv-lovat.vercel.app` (intended to move to
  `omega.is`).

### 2.2 Public surfaces
- `/` home (Sunday-broadcast hero, newest rail, course/article shelves)
- `/sermons` library + `/sermons/[bunny_video_id]` watch page
- `/sermons/show/[slug]` per-series page
- `/live` (live stream embed)
- `/give` — **online banking only**, no card processor (deliberate;
  donor-trust call)
- `/baenatorg` (prayer board), `/vitnisburdur` (testimonies),
  `/framtid` (vision/future), `/about`, `/greinar` (articles),
  `/namskeid` (courses)
- `/frettir` (news) — **deliberately dormant**, hidden from nav

### 2.3 Admin surfaces (`/admin/...`)
- `drafts` (review queue) and `drafts/[id]` (the 2-minute review form;
  auto-fill metadata from transcript, Poster Studio, publish)
- `drafts/new` (manual upload-by-Bunny-GUID for content that never went
  through Azotus)
- `series`, `videos`, `articles`, `news`, `newsletters`, `prayers`,
  `testimonials`, `quotes`, `campaigns`, `subscribers`, `schedule`,
  `featured-weeks`, `programs`, `health`, `settings`
- Single admin auth via Supabase (Hawk's email).

### 2.4 Branches
- `main` — last designed pass + integrations baseline.
- `experiment/vellum-prayer-cards` — the **current launch line**.
  Lightening pass over the brown rebrand; donor /give honest; HMAC intake
  in place; DISPATCH-003 Poster Machine V1. Intended clean merge into
  `main` once smoke-tested in prod.

---

## 3. Azotus — the factory

### 3.1 Stack
- Python 3.11, FastAPI, SQLAlchemy
- Cloud SQL Postgres (single shared source of truth across stations)
- GCS (cloud worker artifacts), Cloud Run jobs
- Gemini (vision + LLM), ElevenLabs (TTS), ffmpeg
- PM2 for service supervision

### 3.2 Two stations (Tailscale-linked)
- **Hawk's Mac Studio** — development. `OMEGA_VOD_DELIVER_ROLE` unset or
  `dev`. Refuses to deliver to production VOD by design.
- **Iceland Mac mini** (`omegatv@100.69.58.70`, dir `/Users/omegatv/azotus`)
  — production deliverer. Now provisioned `OMEGA_VOD_DELIVER_ROLE=production`.

Both stations talk to the same Cloud SQL DB, so a track UUID is global.
"Which station" is a runtime question, not an identity question.

### 3.3 Pipeline stages (a track at a time)
1. **Ingest** — `workers/upload_ingest.py`, drops a source MP4 into the
   pipeline. Creates a `program` (parent) + `tracks` (one per target
   language). The DB is the registry.
2. **Transcribe** — `workers/transcriber*.py` (ElevenLabs / Gemini path).
3. **Translate** — `workers/translation_engine.py` plus the editor /
   critic loop (`workers/editor.py`, `workers/qa_reviewer.py`, scripture
   fidelity layer in `workers/scripture/`).
4. **Finalize** — `workers/finalizer/` produces a burned-in
   `_SUBBED.mp4` in `4_DELIVERY/VIDEO/` and a `.vtt` transcript.
5. **Deliver** — `workers/vod_publisher.py` uploads to Bunny + POSTs the
   signed intake to Omega.

Native-IS path: when the source is already Icelandic, the pipeline only
transcribes and uploads the raw MP4 (no translate/burn). Same delivery.

### 3.4 Multi-language output
The pipeline emits one track per target language per source program. The
live backlog includes `is` (Icelandic — what omega.is consumes), `no`
(Norwegian), `sv` (Swedish), `nl` (Dutch). Today only `is` is delivered;
the other languages are presumably for a possible "licence to other small
Christian broadcasters" play that Hawk has flagged but not productised.

---

## 4. How they connect — the signed HTTP intake

`workers/vod_publisher.py` (Azotus) → `POST /api/azotus/vod-intake`
(Omega). One pipe.

- HMAC-SHA256 over `{timestamp}.{rawBody}`, headers
  `x-azotus-signature` + `x-azotus-timestamp`, shared secret
  `AZOTUS_WEBHOOK_SECRET`.
- 10-minute replay window. `timingSafeEqual` comparison.
- Idempotency: `vod_intake_jobs.azotus_track_id` (unique) and
  `episodes.bunny_video_id`. Re-deliveries short-circuit.
- **Draft gate**: every intake creates `episodes.status='draft'`. Nothing
  publishes automatically — Hawk hits "Vista og birta" in admin.
- Best-effort by design: Bunny upload is load-bearing; intake failure
  does not prevent Azotus marking the track DELIVERED. The Mac mini's
  `_record_delivery` JSONL log captures the outcome.

---

## 5. What's been built recently (commits worth diffing)

### Omega TV (`experiment/vellum-prayer-cards`)
- `6357de8` cross-note: DISPATCH-002 done Azotus-side, no Omega change
- `f5012de` **feat(poster): Poster Machine V1** — source frame → branded
  16:9 / 4:5 (DISPATCH-003)
  - `src/lib/poster.ts` (model + `normalizePosterModel` + `resolvePoster`)
  - `src/lib/thumbnail-generator.ts` extended (optional `sourceImage`,
    `portrait_4x5`, ratio-generalised clean crop)
  - `src/app/api/admin/posters/route.ts` (select/generate/manual)
  - `src/app/api/azotus/vod-intake/route.ts` (`ingestPosterCandidates` —
    moves inline base64 candidates into Supabase Storage `thumbnails`
    bucket, stores normalised `PosterModel` object in
    `episodes.poster_candidates` JSONB; never clobbers reviewer poster
    work on re-delivery)
  - `src/components/admin/PosterStudio.tsx` (admin review UI)
  - `src/app/admin/drafts/[id]/page.tsx` (one-line mount)
- Earlier: launch-line work (lightening pass, honest /give, three
  security tweaks per the launch plan; FTP creds intentionally left as
  shared infra)

### Azotus (`codex/vod-intake-http`)
- `56c5533` `54d2b92` `3b60bbe` `fd6dedd` `3fc3eef` — **DISPATCH-002 two-
  station delivery hardening**: canonical track UUID as
  `azotus_track_id`, `OMEGA_VOD_DELIVER_ROLE` gate
  (production/dev/off), durable per-station JSONL delivery log,
  `sync_pipeline_to_macmini.sh` updated to carry the VOD code, unit
  tests
- `a2b6ec2` **feat(vod): poster candidate frame extraction**
  (DISPATCH-003) — `_extract_poster_candidates`, ffmpeg sample +
  signalstats reject + base64 inline
- `d6ccb73` `7622e04` `cff7b1b` `8e9cf08` `b139ddd` — backlog deliverer,
  sync-script update, bash 3.2 fix, and **one-command Mac mini
  provisioning script** (`scripts/provision_macmini_vod.sh`)

### Dispatches
- `DISPATCH-001` (thumbnail handoff) — done.
- `DISPATCH-002` (two-station delivery) — done.
- `DISPATCH-003` (Poster Machine V1) — done.
All in `/Users/haukur/Projects/.dispatch/done/`; protocol in `PROTOCOL.md`.

---

## 6. Where it actually stands right now (empirical, not optimistic)

- ✅ Mac mini reachable; provisioning script ran end-to-end.
- ✅ Mini `.env` now has `OMEGA_VOD_DELIVER_ROLE=production`,
  `OMEGA_VOD_BUNNY_LIBRARY_ID=628621`,
  `OMEGA_VOD_BUNNY_API_KEY`, `OMEGA_VOD_INTAKE_URL`,
  `AZOTUS_WEBHOOK_SECRET`. Webhook-secret parity with Omega
  `.env.local` was hash-verified (match).
- ✅ Hardened delivery code synced to the mini via the sanctioned
  `sync_pipeline_to_macmini.sh`.
- ✅ Backlog deliverer + curation on the mini: 94 → 38 real Icelandic
  tracks after filters (held back: 40 other-language, 12 test/retry, 4
  duplicate program/title).
- ⚠️ Verification trio delivery (`I2619`, `I2618`, `Máttarstund 17 maí
  2026`):
  - Máttarstund (4.2 GB): Bunny entry created `f024b403-...`, upload
    complete, **Bunny encoding timed out at the 30-minute
    `wait_for_encoding` window (Bunny continues asynchronously)**, then
    `/api/azotus/vod-intake` **returned HTTP 500**. Azotus still
    transitioned the track to DELIVERED (intake is best-effort by
    design) and reported `✓ delivered` — but **no Omega draft was
    created.**
  - I2618 / I2619: `✗ No _SUBBED.mp4 found in
    /Users/omegatv/Azotus/4_DELIVERY/VIDEO`. Those subbed files are not
    on the mini at the expected path. Likely on the external drive Hawk
    referenced, or processed on the Mac Studio.

### 6.1 The current blocker — read this part carefully, it is a hypothesis

**My high-confidence diagnosis** (which I could not directly verify from
the sandbox, and which a third opinion should test):
the intake route's first DB write is
`upsertIntakeJob` into `vod_intake_jobs` with `onConflict:
'azotus_track_id'`. The `vod_intake_jobs` table, the unique index on
`azotus_track_id`, the new `episodes.poster_candidates / azotus_track_id
/ review_status / metadata_confidence` columns, and the
`enqueue_vod_metadata_job` function are all created by **one migration**:
`supabase/migrations/20260518000000_vod_factory_intake.sql`.

Supabase migrations are NOT auto-applied by a Vercel deploy. If that
migration was never pushed to the prod Supabase project
(`dvzwpwlgucsdyrkhrpah`), every intake authenticates fine, then the
first write throws, the catch returns 500 with a JSON body — which is
exactly what happened. The Azotus client used `requests.raise_for_status`
which prints only the generic `500 Server Error: Internal Server Error`
and discards the JSON body, so the actual error string is not in the
mini's log.

**What I could not do from this sandbox** (correctly walled off, not
worked around):
1. Direct query of the prod Supabase DB to read
   `system_events` where `event_type='vod_intake.failed'` (the route
   logs the real error there).
2. Read Vercel runtime logs for the intake function (the token
   available to me has scope `haukur1982-1838s-projects` and returned
   403 on `list_deployments` / `get_runtime_logs`).

A **third opinion** has two cheap ways to confirm or refute the
migration-missing hypothesis:
- Supabase Dashboard → SQL Editor:
  ```sql
  select to_regclass('public.vod_intake_jobs') as jobs_table,
   (select count(*) from information_schema.columns
    where table_name='episodes' and column_name='poster_candidates') as poster_col;
  ```
  `jobs_table` null and/or `poster_col` 0 → diagnosis correct → apply
  the migration (idempotent — all `IF NOT EXISTS` / `CREATE OR
  REPLACE`).
- Vercel Dashboard → Project `omega-tv` → Logs (filter `/api/azotus/
  vod-intake`, status 500). The thrown error message is visible there.

If the migration IS already applied, the bug is elsewhere — most likely
candidates (in priority order):
1. Supabase Storage bucket `thumbnails` missing (used by
   `ingestPosterCandidates` and `/api/admin/videos/thumbnail` and
   `/api/admin/posters`).
2. My DISPATCH-003 intake change (`ingestPosterCandidates`) throwing on
   a real payload — though it's wrapped in try/continue per-candidate
   and a top-level try/catch in the route.
3. `generateMetadata` (scripts/generate-metadata) throwing without
   degrading.

### 6.2 What I am NOT sure about
- **Which branch Vercel currently auto-deploys.** I got 403 on
  `list_deployments`. If prod is `main`, my DISPATCH-003 intake changes
  are not live; if prod is `experiment/vellum-prayer-cards`, they are.
  The migration-missing diagnosis holds either way (both branches'
  intake routes write to `vod_intake_jobs` early).
- **Whether `pnpm build` is currently green** against `experiment/
  vellum-prayer-cards@f5012de`. I only ran `pnpm exec tsc --noEmit` (exit
  0). Build was last verified green on `2026-05-18` (per Omega
  `STATUS.md`).
- **Whether the prod Supabase has the `thumbnails` Storage bucket.**
- **Where the I-series `_SUBBED.mp4` files for I2607..I2619 physically
  live right now.** Máttarstund's was on the mini at the expected path;
  I2618/I2619 weren't.

---

## 7. Honest gap list — the audit ammunition

### 7.1 Things definitely missing or wrong
- **Reporting bug in the backlog deliverer.** `publish_to_vod` returns
  `success:True` after a successful Bunny upload even when the Omega
  intake POST 500'd. `scripts/deliver_vod_backlog.py` then prints `✓
  delivered`. That is misleading — the goal is content in Omega, not
  blobs in Bunny. Should distinguish "Bunny ok / Omega draft missing".
- **Public 4:5 portrait surfaces are not yet aspect-correct.** Poster
  Machine V1 generates `portrait_4x5` and stores it in
  `episodes.poster_candidates.variants`, but the 4/5 shelves
  (`UrDagskranni`, `SeriesShelf`, `NewestRail`, `CoursePosterCard`) still
  receive the mirrored 16:9 via `thumbnail_custom`. The fallback chain
  via `resolvePoster()` is shipped and ready; the queries that feed
  those shelves don't currently select `poster_candidates`. Documented
  follow-up, not done. (See STATUS Decisions Made section.)
- **No `episodes(bunny_video_id)` unique index.** Idempotency is enforced
  in app code (`findExistingEpisode` checks by bunny_video_id then
  azotus_track_id). A race could create two episodes for the same Bunny
  GUID. Flagged in DISPATCH-002 Response. Adding the index would need
  Hawk's ok (small migration).
- **Bunny encoding wait at 30 min is too short for ~4 GB files.** For
  Máttarstund (4.2 GB), `wait_for_encoding` returned False; the
  delivery continued (Bunny finishes async), but the Omega draft will
  show "encoding in progress" until Bunny finishes. Worth raising or
  making the wait soft (already logs warning, doesn't fail).
- **`/admin/drafts/[id]` already has a "0 poster candidates" indicator**
  that reads `Array.isArray(episode.poster_candidates) && length > 0`.
  After DISPATCH-003, `poster_candidates` is an OBJECT
  (`PosterModel`) — that check will always be false until the page
  starts using `normalizePosterModel(...).source_candidates.length`.
  Cosmetic, not functional. Fix is one line.

### 7.2 Things untested in this session
- The full `.venv/bin/python -m pytest tests/test_vod_publisher.py -q`
  suite (sandbox has system Python without pytest; Azotus tests can
  only run from the venv on a real station).
- `pnpm build` against the latest HEAD.
- The Omega `/api/admin/posters` route exercised against a real
  candidate set (no draft has been created yet because of the intake
  500).
- The PosterStudio admin UI visually walked through a real episode.
- A live, real, end-to-end delivery completing with an Omega draft.

### 7.3 Security posture worth a second pair of eyes
- HMAC over `{timestamp}.{body}` with 10-minute replay window, no nonce
  store. Replay within the window is theoretically possible. V1
  acceptable; should be flagged.
- Shared secret rotation story: `AZOTUS_WEBHOOK_SECRET` lives in
  Omega's Vercel env AND every Azotus station's `.env`. Rotation must
  be atomic across all of them; no current automation.
- `.claude/settings.local.json` (in the Omega repo) reportedly contains
  the Supabase service-role key and Postgres pooler passwords as
  plain-text allow rules. Documented for awareness; rotation is on the
  no-rotate list per Hawk's explicit decision about shared/infra
  credentials.
- FTP credentials in `src/app/api/schedule/route.ts` (line ~22) are
  hard-coded as a deliberate, Hawk-acknowledged choice (shared infra
  outside Omega's ownership, would break other consumers if rotated).
- Three pre-launch security tweaks listed in `~/.claude/plans/okay-it-
  s-been-a-snuggly-tarjan.md`: cron auth (`CRON_SECRET` on
  `/api/cron/sync-schedule-xml`), Resend fallback removal, FTP creds.
  Status in this session: FTP intentionally left as-is; cron auth and
  Resend fallback — not verified in this session, audit them against
  current code.

### 7.4 Operational shape
- The Mac mini's git working tree is on branch `main` but selected
  pipeline files (`workers/vod_publisher.py`, `workers/bunny_upload.py`,
  `scripts/deliver_vod_backlog.py`, etc.) have been rsync-overlayed by
  `sync_pipeline_to_macmini.sh` to the `codex/vod-intake-http`
  versions. This is the **intended deployment model** (rsync from
  Hawk's checked-out branch), but it means `git status` on the mini
  shows modified tracked files and a future naïve `git pull` could
  conflict. Worth documenting on the mini.
- No monitoring beyond per-station `vod_delivery_log.jsonl` and the
  Supabase `system_events` table. An auditor may want at least a daily
  "drafts created / failed" summary.

### 7.5 Architectural questions worth a fresh read
- Candidate-frame transport. V1 chose **inline base64 over the existing
  signed intake** — zero new credentials/infra/buckets, sub-MB payload,
  fully degradable. The cleaner long-term store is GCS-hosted candidate
  URLs (Azotus already has GCS for jobs). `ingestPosterCandidates`
  already accepts a pre-hosted `url` so v2 is forward-compatible. Worth
  a deliberate v2 decision.
- Multi-language outputs. The pipeline emits is/no/sv/nl per source.
  omega.is only consumes `is`. Is the "license other small Christian
  broadcasters" idea worth a real data path (a `consumer` table; a
  per-consumer delivery target), or stays as a future business
  conversation?
- Single-tenant assumption. Everything assumes Omega is the only
  consumer. The product is correct for now; flagging in case v2
  multi-tenancy is on the table.
- The draft → publish gate is in the Omega admin and is manual. No
  publish queue or scheduler. Acceptable for a 60–75 yr-old donor
  audience; ask if planned-publish is wanted.

---

## 8. File map (where to look first)

### Omega (`~/Projects/omega-tv/`)
- `CLAUDE.md` — project overview, service IDs.
- `STATUS.md` — most recent session log; the place that's *supposed* to
  be true.
- `docs/ORIENTATION.md` — committed system map.
- `docs/design-system.md`, `docs/admin-guide.md`,
  `docs/content-pipeline.md`, `docs/poster-system.md`.
- `src/app/api/azotus/vod-intake/route.ts` — the intake.
- `src/app/api/admin/posters/route.ts` — the Poster Studio API.
- `src/lib/poster.ts` — model + normaliser + resolver.
- `src/lib/thumbnail-generator.ts` — Sharp-based brand treatment.
- `src/components/admin/PosterStudio.tsx` — the admin review UI.
- `src/app/admin/drafts/[id]/page.tsx` — the 2-minute review form.
- `src/app/admin/drafts/new/page.tsx` — manual non-Azotus path.
- `supabase/migrations/20260518000000_vod_factory_intake.sql` — the
  blocker.
- `~/.claude/plans/okay-it-s-been-a-snuggly-tarjan.md` — the launch line
  (closed checklist).
- `~/Projects/.dispatch/done/DISPATCH-001..003*.md` — inter-agent task
  records; each ends with a Response that reads as a small spec.

### Azotus (`~/Projects/Azotus/`)
- `AGENTS.md`, `STATUS.md` — current state.
- `workers/vod_publisher.py` — delivery, role gate, canonical UUID,
  poster candidate extraction.
- `workers/bunny_upload.py` — shared Bunny upload utilities.
- `scripts/deliver_vod_backlog.py` — list / `--deliver` / curation /
  `--ids`.
- `scripts/provision_macmini_vod.sh` — the one-command provisioning.
- `scripts/sync_pipeline_to_macmini.sh` — the sanctioned code-deploy
  path to the mini.
- `tests/test_vod_publisher.py` — guard invariants.

### Dispatch
- `~/Projects/.dispatch/PROTOCOL.md` — how the inter-agent file system
  works.
- `~/Projects/.dispatch/done/DISPATCH-001-omega-vod-thumbnail-handoff.md`
- `~/Projects/.dispatch/done/DISPATCH-002-azotus-omega-delivery-package.md`
- `~/Projects/.dispatch/done/DISPATCH-003-omega-poster-system.md`

---

## 9. How to verify each headline claim

| Claim | Command / where |
|---|---|
| Webhook secret parity (Omega vs Azotus) | `grep -m1 AZOTUS_WEBHOOK_SECRET= ~/Projects/omega-tv/.env.local ~/Projects/Azotus/.env`, sha256 compare, do NOT print values |
| Auth gate works | `curl -i -X POST https://omega-tv-lovat.vercel.app/api/azotus/vod-intake -d '{}'` → 401 "Invalid Azotus signature." |
| Migration applied (the current bug hypothesis) | Supabase SQL Editor: `select to_regclass('public.vod_intake_jobs')` |
| Mini provisioned | `ssh omegatv@100.69.58.70 'grep -oE "^(OMEGA_VOD_[A-Z_]+\|AZOTUS_WEBHOOK_SECRET)=" /Users/omegatv/azotus/.env \| sort -u'` (names only) |
| Mini reaches the dry-run list | `ssh omegatv@100.69.58.70 'cd ~/azotus && .venv/bin/python scripts/deliver_vod_backlog.py'` |
| Code on mini matches local hardened version | `ssh omegatv@100.69.58.70 'grep -c OMEGA_VOD_DELIVER_ROLE /Users/omegatv/azotus/workers/vod_publisher.py'` (>0 means hardened) |
| The verification trio outcome | `cat /private/tmp/claude-501/.../tasks/beunqsnrf.output` (the file referenced in the task notification) |
| Vercel deploy branch | Vercel Dashboard → Project `omega-tv` → Settings / Git |
| Storage bucket `thumbnails` exists in prod | Supabase Dashboard → Storage |
| `episodes.poster_candidates` exists and is JSONB | `select data_type from information_schema.columns where table_name='episodes' and column_name='poster_candidates'` |
| pnpm build green | `cd ~/Projects/omega-tv && pnpm build` |
| Azotus tests green | `cd ~/Projects/Azotus && .venv/bin/python -m pytest tests/test_vod_publisher.py -q` |

---

## 10. Open questions worth a fresh outside read

1. Is the migration-missing hypothesis correct, or is the 500 something
   else (Storage bucket, generateMetadata, the new
   `ingestPosterCandidates`)? Run the SQL check first, then either fix
   it or chase the next layer.
2. Should `publish_to_vod` consider an Omega intake failure a *failure*
   (so retry semantics + the backlog deliverer's `✓` reporting are
   honest), or keep "Bunny upload is load-bearing" as the source of
   truth and surface intake separately?
3. Is the inline-base64 candidate transport an acceptable v1, or should
   GCS-hosted candidate URLs be in v2 immediately?
4. Should the pipeline's no/sv/nl outputs go to a real consumer/delivery
   target table, or stay as test data in the DB until the licence
   conversation matures?
5. Should the `episodes(bunny_video_id)` unique index be added now to
   make idempotency race-proof?
6. Is HMAC + 10-minute replay window without a nonce store strong enough
   for a single-tenant signed webhook?
7. Are the three pre-launch security tweaks (cron auth, Resend
   fallback, FTP) all in the state Hawk intended? Worth a re-walk.
8. What is the right monitoring / alerting story for delivery failures
   (none today beyond the JSONL log and `system_events`)?

---

## 11. The shortest possible "what's blocking everything right now"

One DB migration on production Supabase
(`supabase/migrations/20260518000000_vod_factory_intake.sql`,
idempotent). Until that's applied:
- the website renders fine,
- the admin works fine,
- the pipeline runs fine,
- Bunny uploads succeed,
- **but no Omega draft can be created from an Azotus delivery**, so the
  VOD page is empty.

Run the SQL paste. Re-run the verification trio. If drafts appear, run
the curated 38. If they don't, this audit doc's section 6.1 lists the
next two suspects to chase.
