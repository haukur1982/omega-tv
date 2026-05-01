# Omega TV — Admin Guide

> The "how does this all actually work" doc. Bookmark this. Every content
> type on the site has a section here with: how to add it, how to edit it,
> how to delete it, where it appears, and the gotchas.
>
> Companion to [`content-pipeline.md`](./content-pipeline.md), which is
> deeper on the VOD pipeline specifically.

---

## Before anything else: apply pending DB migrations

Three migrations were added in the same pass as this guide. Run them in
the Supabase SQL editor before using the new admin features:

1. [`20260427_episode_status_check.sql`](../supabase/migrations/20260427_episode_status_check.sql) — locks `episodes.status` to draft/published at the DB level.
2. [`20260427_newsletter_double_opt_in.sql`](../supabase/migrations/20260427_newsletter_double_opt_in.sql) — adds verification + unsubscribe tokens to `subscribers` and `sent_at` to `newsletters`.
3. [`20260427_system_events.sql`](../supabase/migrations/20260427_system_events.sql) — observability log used by `/admin/health`.

Open the [SQL Editor](https://supabase.com/dashboard/project/dvzwpwlgucsdyrkhrpah/sql/new), paste each file's contents, click **Run**. Each ends with `NOTIFY pgrst, 'reload schema'` which busts the API cache so the new columns are usable immediately.

---

## The four content shapes (the mental model)

Everything on the site falls into one of these:

| Shape | Examples | Pattern |
|---|---|---|
| **Editorial** (you create → public reads) | Sermons, Articles, Newsletters, Quotes, Featured weeks, Series | Admin creates → DB → public sees on next revalidate |
| **User-submitted** (public submits → you approve → public reads) | Prayers, Testimonials, Subscribers | Public form → DB (unapproved) → admin approves → public sees |
| **External feed** (auto-imported → public reads) | Schedule (XML), Bunny videos | Cron / CLI → DB (with manual override) → public |
| **One-off interaction** | Donations | Public form → callback (no backend yet) |

When something doesn't appear publicly, walk through these:
1. Is the data in the right shape? (admin form filled correctly)
2. Did the lifecycle gate pass? (`status='published'`, `is_approved=true`, `verified_at` set, etc.)
3. Is the public page filtering allow it through?
4. Did the page revalidate? (60s default — wait or hit the URL hard-reloaded)

---

## Sermons / VOD

The most complex subsystem because there are three entry points and two sources of truth (Bunny vs Supabase).

### How to add a sermon

**Native Icelandic** (a sermon recorded in Icelandic, no translation needed):

```bash
pnpm exec tsx --env-file=.env.local scripts/publish-native-is.ts \
  /path/to/sermon.mp4 \
  --transcript /path/to/transcript.txt \
  --show "Sunnudagssamkoma" \
  --title "Trúin sem sigrar" \
  --episode 12
```

What the script does, in order:
1. Uploads the MP4 to Bunny Stream (library 628621)
2. Waits for Bunny to finish encoding (~3 min for a 1-hour sermon)
3. Creates or reuses the series row in Supabase
4. Calls `generateMetadata()` (Gemini) on the transcript → gets title + description + editor_note + bible_ref + chapters + tags
5. Writes a draft episode (`status='draft'`) with all the metadata
6. Prints the `/admin/drafts/<id>` URL

If the transcript is omitted, the draft is created with the filename as the title and you fill in everything manually.

**Foreign content** (e.g. CBN English sermons that need Icelandic):

Drop the MP4 into `~/Projects/Azotus/1_INBOX/`. Azotus runs the full pipeline (transcribe → translate → burn subtitles → upload to Bunny) and writes a draft into Supabase. You then review at `/admin/drafts`.

**One-off (anything else)**:

Upload to Bunny via the [Bunny dashboard](https://dash.bunny.net/stream/628621). Copy the GUID. Go to `/admin/drafts` → **Nýtt drag** → paste the GUID, optionally paste a transcript, click **Búa til drag**.

### How to review and publish

1. Open `/admin/drafts` — every unpublished episode in the inbox.
2. Click **Laga** on a row → opens the full editor at `/admin/drafts/[id]`.
3. The editor is broken into 6 groups:
   - **Titill + lýsing** (title + description)
   - **Ritstjórn og ritning** (editor's note + Bible reference via OSIS picker)
   - **Kaflar** (timestamped chapters)
   - **Flokkar og textar** (tags, caption languages, primary language)
   - **Efnistákn** (thumbnail — see below)
   - **Hvar mun þetta birtast?** (the live checklist of where this episode will surface — see below)
4. The header shows a status pill (DRÖG or BIRT). When BIRT it also shows a **Skoða á vefnum →** link.
5. Bottom right: **Vista drög** (save without publishing) or **Vista og birta** (save + flip to published).

After clicking **Vista og birta**, the green banner shows the public URL. Click through to verify before closing the page.

### "Hvar mun þetta birtast?" — the live diagnostic panel

Four checklist rows tell you exactly where the episode will land:

- **Þáttaröð (Series)** — green if linked, with an inline picker to assign or reassign. Click **+ Ný þáttaröð** to create one in a new tab.
- **Nýlega bætt við (NewestRail)** — green when status='published' and the episode has a Bunny GUID. The "Just added" rail at the top of `/sermons`.
- **Hilla (Shelf)** — green when the linked series has a `category` set. Categories are: Útsendingar Omega, Söfnuðir á Íslandi, Frá útlöndum, Heimildarmyndir, Lofgjörð & tónleikar, Barnaefni, Ísrael. If null, the episode lands in "Annað efni" at the bottom of `/sermons` until you set the category.
- **Sunnudagssamkoma vikunnar** — green only if the linked series has `slug='sunnudagssamkoma'` and this is the latest published episode in the series. Pinned position on `/heim` and `/sermons`.
- **Bein slóð** — the canonical episode URL `https://omega.is/sermons/<bunny_guid>`. Always works once the GUID is set, even before publish.

### How to create a new series

1. Go to `/admin/series` → **Ný þáttaröð**.
2. Fill in title, slug (auto-generated from title), host, description, **category** (the shelf where the series's episodes land on `/sermons`), and a poster image.
3. Click **Stofna þáttaröð**.

Series can be created mid-flow by clicking **+ Ný þáttaröð** in the draft editor's series picker — opens in a new tab.

### Thumbnails

Three layers, in order of preference:

1. **Custom URL** (`thumbnail_custom`) — paste any URL into the "Sérstakt efnistákn" field in the draft editor.
2. **Cinematic generator** — click **Búa til** next to the URL field. Uses [`thumbnail-generator.ts`](../src/lib/thumbnail-generator.ts) to pull a frame from Bunny, color-grade it, add a vignette + bottom gradient, and overlay the series + episode title. Saves to Supabase Storage and writes the URL into `thumbnail_custom` automatically. Disabled until the Bunny encoding chip says **Tilbúið**.
3. **Bunny default** — if `thumbnail_custom` is null, the rail/grid falls back to Bunny's auto-generated frame.

### Editing or unpublishing

- **Edit any field**: open `/admin/drafts/[id]` and edit. Series picker, category picker, status badge all update inline. **Vista** persists.
- **Unpublish**: there's no unpublish button in the editor today. To force-revert: open the episode in the database (Supabase SQL editor) and set `status='draft'`. The DB CHECK constraint allows draft/published only.
- **Delete**: same — Supabase only for now. Be careful: the Bunny video stays in the library; deleting the row leaves an orphan.

### Where sermons appear

| Surface | Required for visibility |
|---|---|
| `/heim` Sunday hero | series.slug='sunnudagssamkoma' AND status='published' AND latest published in series |
| `/sermons` NewestRail | status='published' AND bunny_video_id IS NOT NULL |
| `/sermons` SeriesShelf for category X | series.category='X' AND status='published' |
| `/sermons` "Annað efni" shelf | series.category IS NULL AND status='published' |
| `/sermons/show/[slug]` | series.slug=X AND status='published' |
| `/sermons/[bunny_guid]` | Bunny has the video. **No status filter** — drafts are visible by direct URL. |
| `/israel` (carousel) | series.category='israel' (canonical) OR series/episode title regex matches "Ísrael\|Israel" (legacy fallback) |

### Re-running publish-native-is.ts

Safe. Now preserves `series_id`, `season_id`, `status`, `episode_number`, and `thumbnail_custom` on existing rows — only the metadata fields the generator computes (title, description, chapters, tags, etc.) get overwritten. So if you connect an episode to a series in the admin and then re-run the CLI to fix the description, the link sticks.

---

## Articles / Greinar

### How to add an article

1. Go to `/admin/articles` → click create-new (Plus button).
2. Fill in title, slug (must be unique — duplicate slugs are now rejected with a clear error), content, excerpt, author, featured image, optional category, optional published_at.
3. Save → article is live immediately.

There's no draft state for articles. `published_at IS NOT NULL` is the only gate — leave it blank to keep the article unpublished, set it to a date to make it live.

### Categories

Articles support a freeform `category` string. Three are recognized today:

- `israel` — surfaces on `/israel/greinar`.
- (future) `truin`, `samfelag`, etc. — anything else is just metadata for now.

Set the category from the admin form when creating/editing. The Israel filter on `/israel/greinar` is exact-match on `category='israel'` — case-sensitive.

### How to edit / delete

- Edit: open the article in `/admin/articles`, edit, save. Slug change is allowed but rejected if it conflicts with another article.
- Delete: trash icon in `/admin/articles`. Public visitors hitting the slug afterward get a 404.

### Where articles appear

| Surface | Required |
|---|---|
| `/greinar` index | `published_at IS NOT NULL` |
| `/greinar/[slug]` | same + matching slug |
| `/israel/greinar` | category='israel' AND published_at IS NOT NULL |
| Featured / Editor's picks | depends on order; first 2 articles in the index become picks |

---

## Prayer wall / Bænatorg

### How prayers come in

A visitor fills the form on `/baenatorg`, hits submit. The prayer is inserted with `is_approved=false` and is invisible to other visitors until approved.

### How to approve / reject

1. Go to `/admin/prayers`.
2. Each row shows the prayer text + buttons.
3. Click **Samþykkja** — the prayer becomes public. Click **Eyða** to remove permanently.

### Prayer campaigns (the new admin)

Time-bounded prayer focuses (e.g. "Bæn fyrir Íslandi — apríl 2026"). Show as a banner on `/baenatorg` while active.

1. Go to `/admin/campaigns` → **Ný herferð**.
2. Fill in title, optional description, optional image URL, optional start date (defaults to today), end date.
3. Save → if today is between start and end and `is_active=true`, the banner shows on `/baenatorg`.
4. Toggle visibility: eye/eye-off button on the row. Delete: trash button.

Before today, campaigns could only be created via SQL. Now this admin page handles it end-to-end.

### Where prayers appear

| Surface | Required |
|---|---|
| `/baenatorg` feed | is_approved=true |
| `/baenatorg` campaign banner | active campaign (between start/end + is_active=true) |
| `/live` prayer pulse counter | linked schedule slot exists; counter increments per "tap to pray" |

---

## Testimonials / Vitnisburðir

### How they come in

Public submission via the form on `/vitnisburdur`. Inserted with `is_approved=false`. Now goes through a proper API route — the previous client-side direct DB call has been replaced.

### How to approve / reject

1. `/admin/testimonials`.
2. **Samþykkja** to publish, **Eyða** to delete.

The admin page now uses `/api/admin/testimonials` (GET/PATCH/DELETE) so the service-role client stays server-side.

### Where they appear

`/vitnisburdur` grid — `is_approved=true` only.

---

## Newsletters / Fréttabréf

This subsystem now has a real send pipeline. **Apply the migration first** (`20260427_newsletter_double_opt_in.sql`).

### The lifecycle

1. **Subscriber signs up** via the form on `/frettabref` → row inserted with `verification_token` (UUID generated by DB) and `is_verified=false`. They get a verification email immediately (Resend).
2. **Subscriber clicks the verification link** → `GET /api/subscribers/verify?token=…` flips `verified_at=NOW()`, sets `is_verified=true`, clears the token. Redirects to `/frettabref?verified=1`.
3. **Admin writes the newsletter** at `/admin/newsletters` → **Nýtt bréf**. Write the content, save.
4. **Admin clicks Senda** on the newsletter row → `POST /api/admin/newsletters/[id]/send` → emails to all verified subscribers. Each email has a per-recipient unsubscribe link in the footer (and the `List-Unsubscribe` header for one-click unsubscribe in Gmail/Outlook).
5. **`sent_at` is stamped** on the newsletter row when at least one email goes out. The Senda button hides for already-sent newsletters.
6. **Subscriber clicks the unsubscribe link** (or hits the one-click button in their email client) → `GET/POST /api/subscribers/unsubscribe?token=…` deletes the row.

Verified-only sending is non-negotiable — sending to unconfirmed addresses tanks deliverability.

### How to add / edit / delete

- Add: `/admin/newsletters` → Nýtt bréf, fill in title/content/author, save.
- Edit: open the existing newsletter (Breyta button on hover).
- Delete: same admin page.

### Where they appear

- `/frettabref` (on-site read) — published newsletters in reverse-chrono order.
- Inbox of every verified subscriber when you click **Senda**.

---

## Schedule / Live broadcast

The schedule comes from a daily XML file the playout system uploads to FTP. Vercel Cron pulls it at 5:05 UTC and enriches it via the `programs` catalog.

### How the daily import works

1. Playout system writes `YYYY_MM_DD_00_00_00.xml` to FTP.
2. Vercel Cron hits `/api/cron/sync-schedule-xml` at 5:05 UTC.
3. The route fetches today's XML, parses it, runs each row through `enrichSlotFromTitle()` to copy metadata from the `programs` catalog (host, type, is_live flag) into the slot.
4. Slots are upserted by `xml_source_id`. Manual entries (`xml_source_id=null`) are preserved across re-imports.
5. Result is logged to `system_events` (visible at `/admin/health`).

### How to override the schedule manually

`/admin/schedule` — the weekly grid. Each day shows imported + manual slots. Click a slot to edit:

- Date / time
- Title, subtitle, host, description
- Program type (Sunnudagssamkoma, Bænastund, Fræðsla, etc.)
- Bein útsending flag (live broadcast)
- Úrvalsþáttur flag (featured)
- **Tengt myndband** (NEW) — optional dropdown to link this slot to a published VOD episode. When set, the on-air broadcast and the on-demand version are connected. Used by `/live` to show "watch the recording" once the broadcast ends.

Add a slot manually with the **Bæta við** button on a day's column. Manual slots are preserved across XML re-imports.

### The programs catalog

`/admin/programs` — a lookup table that enriches the bare XML (which only has time + title) with host, description, type, and flags. When the cron hits the same XML title repeatedly, the catalog adds the editorial metadata.

If a slot lands "unlabeled" in the cron import (XML title doesn't match any program), it shows up in `/admin/health` with severity=warn so you can see which titles need to be added to the catalog.

### Where schedule shows

| Surface | Required |
|---|---|
| `/live` current broadcast | a slot with starts_at ≤ now < ends_at |
| `/live` next broadcast | next future slot |
| `/live` timeline | next 6 future slots |
| `/heim` OnAirRibbon | latest current/next slot, falls back to "Sendingar daglega" if empty |

---

## Featured weeks (homepage hero)

`/admin/featured` — curate the homepage hero weekly. Form has hero image URL, kicker, headline (Vaka display serif), body paragraph, two CTAs.

Publishing: clicking **Birta nýja vikuforsíðu** creates a new row with `published_at=NOW()`. The frontend fetches the most recent non-fallback row, so this atomically becomes the live hero. Fallback row (`is_fallback=true`) is the evergreen safety net.

History: every past hero stays in the list; you can re-publish or delete any of them.

---

## Quotes

`/admin/quotes` — admin CRUD exists but I couldn't find a public consumer in the codebase. Likely vestigial today. If you decide to surface quotes (e.g. on `/heim` or `/baenatorg`), the data and admin are ready.

---

## Donations

Currently form-only — no backend. CEO conversation pending. Bank transfer details on `/give` are the working donation path. Form submit transitions to a thank-you state but doesn't persist anything.

---

## Israel section

"Israel" is now defined two ways across the codebase:

1. **Canonical**: `series.category='israel'` (set in the series creation form or the inline picker in the draft editor). Catches future content cleanly.
2. **Legacy**: regex on series/episode title matching `/ísrael|israel/i`. Catches existing CBN content that hasn't been re-tagged yet.

The fallback is on by default (`getIsraelEpisodes` in [vod-db.ts](../src/lib/vod-db.ts)). Once everything is re-tagged with `category='israel'`, remove the regex branch.

`/israel/greinar` filters articles by `category='israel'`. Schedule slots use the regex on `program_title` (no category column on slots).

---

## Courses / Námskeið

The data model is in place (`courses`, `course_modules`, `course_lessons`, `user_lesson_progress`) but **there is no admin UI today**. `/namskeid` and `/namskeid/[slug]` render mock data via the fallback path. Building admin CRUD for courses is a separate piece of work — flagged in the deferred list.

---

## Observability — `/admin/health`

New page. Reads from `system_events` and shows the last 200 events grouped by severity. Filter chips at the top let you isolate warnings + errors quickly.

What's instrumented today:

- **`cron.schedule_xml`** — every nightly XML import logs a row (info on success, warn if any titles unlabeled, error on FTP/parse failure)
- **`newsletter.send`** — every send logs sent/failed counts

Anything else can be added by importing `logEvent` from [`src/lib/system-events.ts`](../src/lib/system-events.ts):

```ts
await logEvent(
    'bunny.upload',           // event_type — name your category
    'error',                  // severity — info | warn | error
    'Encoding timed out',     // message — human-readable summary
    { videoId: '7e36...' },   // payload — structured data (optional)
    'publish-native-is',      // actor — who/what triggered it (optional)
);
```

When something feels broken, this is the first place to look.

---

## What's still pending (parked, not forgotten)

The donations decision blocks one major piece. Beyond that, two architectural calls remain:

1. **Public user accounts** — needed to make course progress meaningful (`user_lesson_progress.user_id` is currently a free-floating string with no FK). Big fork; defer until needed.
2. **Search** — no public search exists. Tag pages, speaker pages, OSIS cross-link pages all need a unified taxonomy first. Foundation is now mostly in place; can build when content volume justifies it.

Three smaller pieces that didn't fit this batch:

- **Courses admin UI** — schema is built, public renders mock; admin CRUD missing entirely.
- **Article slug uniqueness at the DB level** — the API rejects duplicates with a 409, but there's no UNIQUE constraint on the column. Add one once existing data is verified clean.
- **Migration of `featured_weeks` table into Database types** — the lib uses an `as any` cast; regenerate types when convenient.

---

## When something doesn't appear publicly — debug checklist

This is the order to check, top to bottom:

1. Is the row in the database with the right shape? → check via Supabase dashboard or admin page list
2. Does the lifecycle gate pass? (`status='published'`, `is_approved=true`, `published_at IS NOT NULL`, `verified_at IS NOT NULL`, `is_active=true` for campaigns…)
3. Is the public page filtering by something else? (category, slug, regex match)
4. Did the page revalidate? (60-second window — wait or hard-reload `Cmd+Shift+R`)
5. Is there an error in `/admin/health`?
6. If you're looking at a sermon detail and the metadata seems wrong: it's coming from the database `episodes` row, NOT Bunny. Check `/admin/drafts/[id]` to verify what's actually there.

If all five pass and the content still doesn't show, that's a real bug — check `/admin/health` first, then console.

---

## File reference (where the code actually lives)

- **VOD admin**: `src/app/admin/drafts/[id]/page.tsx`, `src/app/admin/series/`, `src/app/api/admin/episodes/`, `src/app/api/admin/series/[id]/route.ts`
- **Articles**: `src/app/admin/articles/`, `src/app/api/admin/articles/route.ts`, `src/lib/articles-db.ts`
- **Prayers + campaigns**: `src/app/admin/prayers/`, `src/app/admin/campaigns/`, `src/app/api/admin/prayers/`, `src/app/api/admin/campaigns/route.ts`, `src/lib/prayer-db.ts`
- **Testimonials**: `src/app/admin/testimonials/`, `src/app/api/admin/testimonials/route.ts`, `src/lib/testimonials-db.ts`
- **Newsletters + subscribers**: `src/app/admin/newsletters/`, `src/app/admin/subscribers/`, `src/app/api/admin/newsletters/[id]/send/route.ts`, `src/app/api/subscribers/{verify,unsubscribe}/route.ts`, `src/lib/email.ts`, `src/lib/subscriber-db.ts`
- **Schedule**: `src/app/admin/schedule/page.tsx`, `src/app/api/cron/sync-schedule-xml/route.ts`, `src/lib/schedule-xml-sync.ts`, `src/lib/schedule-db.ts`
- **Featured weeks**: `src/app/admin/featured/page.tsx`, `src/app/api/admin/featured-weeks/`, `src/lib/featured-db.ts`
- **Health**: `src/app/admin/health/page.tsx`, `src/app/api/admin/health/route.ts`, `src/lib/system-events.ts`
- **Pipeline scripts**: `scripts/publish-native-is.ts`, `scripts/generate-metadata.ts`, `scripts/folder_watcher.py`
