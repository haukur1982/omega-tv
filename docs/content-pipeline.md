# Omega TV — Content Pipeline Protocol

> **Mental model:** drop video → draft appears → review → publish.
> One inbox. Two ingestion paths. No thinking required about which one.

## The three entry points into `/admin/drafts`

### 1. Azotus (foreign content, subtitled)
Videos in a language other than Icelandic go through Azotus's full pipeline:
- Transcribe (ElevenLabs)
- Translate (Gemini)
- Burn Icelandic subtitles
- Upload `_SUBBED.mp4` to Bunny
- Call `omega-tv/scripts/generate-metadata.ts` with the Icelandic transcript
- Upsert draft episode to Supabase (status=`draft`)

Existing at `~/Projects/Azotus/workers/vod_publisher.py`.
Needs one change (see "Azotus native-IS mode" below) and one wiring update (subprocess call to omega-tv's metadata script).

### 2. Native Icelandic — `scripts/publish-native-is.ts` (shipped 2026-04-19)
Videos already in Icelandic skip Azotus entirely for now. Hawk runs one CLI command:

```bash
pnpm exec tsx --env-file=.env.local scripts/publish-native-is.ts \
  /path/to/sermon.mp4 \
  --transcript /path/to/transcript.txt \
  --show "Sunnudagssamkoma" \
  --title "Trúin sem sigrar" \
  --episode 12
```

What happens:
1. Uploads the raw MP4 to Bunny Stream (library 628621)
2. Waits for Bunny to finish transcoding
3. Creates or reuses the series row in Supabase
4. Calls the shared `generateMetadata()` helper (Gemini-backed) against the transcript
5. Upserts a draft episode (`status='draft'`) with full Gemini metadata —
   title, description, editor_note, bible_ref, chapters, tags, transcript
6. Prints the `/admin/drafts/<id>` review URL

Transcript formats supported: `.txt`, `.vtt` (WebVTT timings stripped), or Azotus's `skeleton.json` (extracts from `lines[]` or `segments[]`).

If `--transcript` is omitted, the draft is created with minimal metadata (filename-based title only) and the reviewer fills in everything manually.

**Azotus auto-invocation is a follow-up** — will wire into `omega_manager.py`'s pipeline in a dedicated Azotus session so native-IS folder drops trigger this automatically. See below for the design.

### 3. Manual "Nýtt drag" (everything else)
For one-offs that aren't in any Azotus folder watcher:
- Phone recording, guest contribution, archive cleanup
- Upload to Bunny manually via [Bunny dashboard](https://dash.bunny.net/stream/628621)
- Copy the GUID
- In Omega admin, go to `/admin/drafts` → **Nýtt drag** button
- Paste GUID. Optionally paste transcript (enables auto-metadata) and pick series
- Click **Búa til drag** → redirects to edit form

Web-based, works from anywhere.

## Review flow (identical for all three paths)

1. `/admin/drafts` shows the inbox with readiness chips per row.
2. Click **Laga** on a draft → full edit form (`/admin/drafts/[id]`).
3. Fix whatever's missing:
   - **Bible ref** (OSIS picker — prevents drift)
   - **Editor note** (40-80 word italic voice line)
   - **Chapters** (timestamp + title rows)
   - **Tags** (comma-separated)
   - **Caption languages** (`is, en`)
   - **Title + description** overrides
4. Click **Vista og birta** → status flips to `published`, episode goes live.

Target review time: 2-3 minutes per draft (30 seconds when metadata was auto-generated and accurate).

## The metadata generator (`scripts/generate-metadata.ts`)

Shared by all three entry points. Two modes:

- **Mock (default)** — extracts title from filename, takes first 320 chars as description, leaves `bible_ref`/`chapters`/`editor_note` empty. Mock mode intentionally does NOT guess the high-risk fields.
- **Gemini (when `GEMINI_API_KEY` is set in `.env.local`)** — real LLM generation with an Icelandic system prompt. Produces structured JSON with full metadata including chapter segmentation and OSIS canonical passage refs.

Enable Gemini:
```bash
# Add to .env.local
GEMINI_API_KEY=your_gemini_key_here

# Optional: override model
GEMINI_METADATA_MODEL=gemini-2.0-flash
```

Test end-to-end:
```bash
pnpm exec tsx --env-file=.env.local scripts/generate-metadata.ts path/to/transcript.vtt <bunny_guid>
```

## Broadcast schedule enrichment — playout XML + programs table (shipped 2026-04-19)

The playout system posts a daily XML schedule to FTP (same file the cable
network reads). The website auto-imports and enriches it:

```
Playout system → YYYY_MM_DD_00_00_00.xml → FTP (212.30.195.77)
                                              │
                                              ├→ Cable network (unchanged)
                                              │
                                              └→ POST /api/admin/schedule/sync-xml
                                                     │
                                                     ├─ fetch XML via basic-ftp
                                                     ├─ parse (handles _x0032_ encoding)
                                                     ├─ compute end-times from next starts
                                                     ├─ title → programs.title lookup
                                                     ├─ enrich with type / host / desc /
                                                     │  is_live / is_featured / series_id
                                                     └─ upsert into schedule_slots
                                                        (is_manual_override=FALSE,
                                                         xml_source_id = XML <ID>)
```

### The `programs` enrichment catalog

Defined once per recurring show in `/admin/programs`. Fields:
- `title` (unique, matches XML title exactly)
- `program_type` ('service' | 'prayer_night' | 'teaching' | 'broadcast' | 'rerun' | 'special' | 'filler')
- `host_name`
- `description`
- `is_usually_live` (live by default when this show airs)
- `is_featured_default`
- `default_bible_ref` (optional OSIS)
- `default_tags`
- `series_id` (optional link into series table)

Seeded with ~31 Omega shows via `scripts/seed-programs.ts`. When new
titles appear in the XML that don't have a `programs` row, the sync
endpoint returns them as `unlabeled` — the `/admin/schedule` page
shows a banner: *"5 óþekktar sýningar — skráðu þær í Sýningarskrá."*

### Manual overrides survive sync

Slots created in `/admin/schedule` manually get `is_manual_override=TRUE`.
The XML sync only purges rows with `is_manual_override=FALSE` before
re-importing, so ad-hoc admin edits (special events, guest bookings)
stay put across daily syncs.

### Hands-free daily sync — Vercel Cron (shipped 2026-04-19)

The admin "Flytja inn XML" button is for one-off resyncs. The day-to-day
sync runs automatically via Vercel Cron:

```
Vercel Cron (05:05 UTC daily)
   │  Authorization: Bearer $CRON_SECRET
   ▼
GET /api/cron/sync-schedule-xml
   │
   └─ delegates to syncScheduleXmlForDate(today)
       (shared core with the admin endpoint)
```

`vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/sync-schedule-xml", "schedule": "5 5 * * *" }
  ]
}
```

**One-time setup in Vercel → Project → Settings → Environment Variables:**

1. Generate a long random secret (e.g. `openssl rand -hex 32`).
2. Add `CRON_SECRET` with that value to Production (and Preview if you
   want cron hitting preview deploys — usually no).
3. Redeploy. Vercel automatically sends
   `Authorization: Bearer $CRON_SECRET` on cron invocations; the endpoint
   refuses anything else with 401.

**Manual testing from the terminal:**
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
     https://omega.is/api/cron/sync-schedule-xml
# ?date=2026-04-20  to force a specific day
```

**Behavior on a missing XML file:** if the playout system hasn't
uploaded today's file yet (weekends, late upload), the cron logs
"not on FTP yet" and returns 200 with `{ok: false, reason: 'not_found'}`
— no alert, no failure. The admin UI still shows yesterday's data and
Hawk can click the manual button later if needed.

**Behavior on manual overrides:** identical to the admin path. The
sync core purges only `is_manual_override=FALSE` rows before
re-inserting, so ad-hoc admin edits survive the nightly cron forever.

### Standing rule: non-ASCII SQL is always service-role path

The Supabase SQL editor clipboard pipeline corrupts UTF-8 into mojibake
(observed 2026-04-18). **Never paste Icelandic text through the SQL
editor.** Instead:
1. Keep DDL (CREATE TABLE, ALTER, policies) in migration files — pure ASCII.
2. Write seeds in `scripts/seed-*.ts` TypeScript, run via
   `pnpm exec tsx --env-file=.env.local scripts/seed-*.ts`.
3. The service-role client preserves UTF-8 end-to-end.

See `scripts/seed-programs.ts` for the current reference pattern.

## Azotus native-IS mode (shipped 2026-04-19)

The Azotus side of the pipeline now has a first-class native-Icelandic
branch so source files that are already in Icelandic skip translate +
subtitle burn entirely, still producing an omega-tv draft.

### How Hawk triggers it

Three equivalent ways — pick whichever's lowest friction for the file
at hand:

1. **Filename marker.** Rename the file to include `_NATIVE_IS`
   anywhere in the stem and drop it in `~/Projects/Azotus/1_INBOX/`:
   ```
   sunnudagssamkoma_2026_04_19_NATIVE_IS.mp4
   trúin_sem_sigrar_NATIVE_IS.mp4
   ```
   Case-insensitive. Works with or without a sidecar JSON.

2. **Sidecar JSON.** Drop the video alongside a `.json` file:
   ```json
   { "native_mode": true, "show_slug": "sunnudagssamkoma", "client": "omega-is" }
   ```
   Useful when you want to also set program metadata from the wizard.

3. **`source_language` field.** If a sidecar JSON sets
   `"source_language": "is"`, that triggers native-mode too.

### What happens under the hood

```
sermon_NATIVE_IS.mp4 drops in 1_INBOX
   │
   ├─ ingest: native_mode=True flagged on track.meta
   │
   ├─ transcribe: ElevenLabs produces {stem}_SKELETON.json
   │      (transcript still runs — we need the text for metadata)
   │
   ├─ dispatcher short-circuit (omega_manager.py):
   │      TRANSCRIBED → FINALIZED
   │      (skips translate + review + burn entirely)
   │
   └─ operator clicks "Publish to VOD" in the Azotus UI
          │
          ├─ vod_publisher.publish_to_vod branches on meta.native_mode
          │
          ├─ _find_native_video() locates the raw source MP4
          │      (no _SUBBED.mp4 exists)
          │
          ├─ bunny_upload.create_video + upload_video + wait_for_encoding
          │
          ├─ _supabase_insert creates the episode row
          │
          └─ _call_omega_metadata subprocess:
                 pnpm exec tsx scripts/generate-metadata.ts \
                     {stem}_SKELETON.json <bunny_guid>
                 → Gemini writes title/description/chapters/bible_ref/tags
                 → draft lands in /admin/drafts for 2-3 min review
```

### Safety

Four guardrails — all must hold before the native-IS short-circuit
fires in the Azotus dispatcher:
1. Stage is exactly `TRANSCRIBED` (never interrupts a mid-translation)
2. `target_language` resolves to `"is"` (belt-and-suspenders vs. CBN Dutch)
3. `meta.native_mode` was set at ingest
4. `OMEGA_NATIVE_IS_ENABLED` env var is on (defaults on; set to `0` to kill-switch)

Transition uses the legal state-machine path `PROCESSING → FINALIZING`,
not `skip_validation`. Zero changes to cloud-worker files, so no cloud
rebuild needed. CBN Europe Dutch pipeline is structurally isolated:
three of the four guardrails independently reject any non-IS target.

### Implementation references

- Orchestrator: `~/Projects/Azotus/omega_manager.py`
  - Helpers: `_native_is_enabled()`, `_is_native_is_source()`
  - Ingest flag: `_run_ingest()`
  - Dispatcher short-circuit: translation-stage `for job in jobs` loop
- Publisher: `~/Projects/Azotus/workers/vod_publisher.py`
  - `_find_native_video()` — source-MP4 finder
  - `publish_to_vod()` — `meta.native_mode` branch
  - `_call_omega_metadata()` — subprocess handoff to omega-tv

### Fallback

If Azotus isn't available (e.g. running from a different Mac, or the
Mac Mini's down), the same end-state can be produced in one step via
the standalone omega-tv CLI:

```bash
pnpm exec tsx --env-file=.env.local scripts/publish-native-is.ts \
    /path/to/sermon.mp4 --transcript /path/to/transcript.txt \
    --show "Sunnudagssamkoma" --title "Trúin sem sigrar" --episode 12
```

Same result: Bunny upload + Gemini metadata + draft row. See §2 above.

## Future enhancements (not in scope right now)

- **File upload directly in admin** — multipart → Bunny TUS resumable upload from the browser. Would let Hawk drop a file right in `/admin/drafts/new` without touching the Bunny dashboard.
- **Thumbnail generator** — `sharp` + Source Serif 4 to composite a branded title card over a Bunny frame. 2-3 variants per episode, pick one.
- **ElevenLabs in-admin transcription** — if admin user doesn't have a transcript handy, click a button, server transcribes from the Bunny MP4 URL, fills the transcript field.
- **Notifications** — push / email when drafts land so the review flow is prompt-driven instead of refresh-driven.
