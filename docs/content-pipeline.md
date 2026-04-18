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

### 2. Azotus Lite (native Icelandic, no translation)
Videos already in Icelandic still need a transcript for metadata generation. They go through Azotus with a "native" flag that:
- Transcribes (ElevenLabs) — always
- **Skips** translation + subtitle burn — saves tokens + time
- Uploads the raw MP4 to Bunny
- Calls `generate-metadata.ts` with the transcript
- Upserts draft episode

This is the `TODO` change in Azotus. See below.

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
