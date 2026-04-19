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

## TODO — Azotus native-IS mode

**Project**: `~/Projects/Azotus`
**Where**: likely in `workers/vod_publisher.py` or the pipeline orchestrator

**Change**: add a branch that skips translation + subtitle burn when the input language matches the target language. Simplest form:

```python
# In the pipeline entry / config
native_mode = input_language == target_language  # or: filename ends with _NATIVE_IS

if not native_mode:
    transcribe_and_translate_and_burn_subtitles(...)  # existing flow
else:
    transcribe_only(...)   # still call ElevenLabs for the transcript
    upload_to_bunny(raw_mp4)  # no subtitle burn

# Then (regardless of mode):
call_omega_metadata_generator(transcript, bunny_guid)  # new subprocess call
```

The `call_omega_metadata_generator` invocation:
```python
subprocess.run([
    'pnpm', 'exec', 'tsx', '--env-file=.env.local',
    'scripts/generate-metadata.ts',
    transcript_path,
    bunny_guid,
], cwd=os.path.expanduser('~/Projects/omega-tv'), check=True)
```

Or — more robustly — a tiny HTTP POST to `/api/admin/drafts/create` on `omega.is` (or local dev) once we expose that as a service-role-authenticated endpoint. The subprocess path is simpler for same-Mac-Mini setups.

## Future enhancements (not in scope right now)

- **File upload directly in admin** — multipart → Bunny TUS resumable upload from the browser. Would let Hawk drop a file right in `/admin/drafts/new` without touching the Bunny dashboard.
- **Thumbnail generator** — `sharp` + Source Serif 4 to composite a branded title card over a Bunny frame. 2-3 variants per episode, pick one.
- **ElevenLabs in-admin transcription** — if admin user doesn't have a transcript handy, click a button, server transcribes from the Bunny MP4 URL, fills the transcript field.
- **Notifications** — push / email when drafts land so the review flow is prompt-driven instead of refresh-driven.
