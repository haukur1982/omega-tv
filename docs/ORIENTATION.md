# Omega TV — Orientation Map

**This is the "where is everything" doc. Read this when you're lost.**
STATUS.md is the running log (volatile, long). This is the map (stable, short).
Last reconciled against real git/repo state: 2026-05-17.

---

## You are here

- **Live at omega-tv-lovat.vercel.app** (`main` = `b27b150`): the full
  rebrand + lightening, honest `/give` (bank transfer only), security
  hardened, news dormant, and the **cinematic card system live on the
  homepage, /sermons, and /namskeid**.
- **Nothing meaningful is pending deploy.** The `vellum` branch only
  differs from prod by the dawn-transition experiment **and its revert**
  (they cancel out — dawn transition is dead, not coming back).
- **Parked, not lost-but-fragile:** the Azotus→VOD pipeline (see below).

---

## 1. Feeding the VOD (Azotus → Omega) — the real status

**How it's designed to work (M1, code-wired):**
Azotus finishes translating a video → uploads the subtitled MP4 to Omega's
**VOD Bunny library (628621)** → calls Omega's metadata generator → a
**DRAFT episode** appears in `/admin/drafts` with AI title/description/
chapters for your 2–3 min review → you assign a series and hit Publish.
Nothing goes public automatically.

**Actual state — be honest about this:**
- The code is written but **UNCOMMITTED** in `~/Projects/Azotus`
  (`workers/vod_publisher.py`, `workers/bunny_upload.py`). **Risk: it can
  be lost.** First action should be: commit it on its own branch.
- It has **never been run on a real finished job.** Unproven.
- **No auto-trigger** (M3). Today it's a manual command:
  `cd ~/Projects/Azotus && python -m workers.vod_publisher <track_id>`.

**The path:** (1) commit M1 → (2) prove it on ONE real track → (3) then,
only if it works, add the auto-trigger on Azotus `FINALIZED`. Don't
auto-fire into the live VOD before one manual run proves it.

---

## 2. Thumbnails — the strategy (3 tiers)

There are three separate things people call "thumbnails." This is why it
feels unclear. They are:

| Tier | What | State |
|---|---|---|
| **Display frame** | `ThumbnailFrame` — cinematic grade + vignette + glow, title below the art | ✅ Built + LIVE (homepage, /sermons, /namskeid) |
| **Curated series cover** | One hand-picked photo per series (doc's "Tier 1", ~15 photos) | ❌ **The real gap** — not created, no admin field to set it |
| **Branded fallback** | Typographic letter card when a series has no cover | ✅ Built (it's what most series show now) |

There is also a 4th, separate thing: `src/lib/thumbnail-generator.ts` +
`/api/admin/videos/thumbnail` — a server-side generator that grabs a Bunny
frame and grades it. Exists, manual button, landscape-only. Treat it as
"nice later," not the primary strategy.

**Recommended strategy (matches the design doc):** curated cover photos for
the handful of real series + the branded typographic fallback for the
rest. Concretely this needs: (a) a `series` cover field + a place in
`/admin/series` to set it, (b) ~15 curated photos in `public/series-art/`.
That's the actual "make thumbnails for the series" work — it's content +
one small admin field, not a code-heavy project.

---

## 3. Admin — needs a strategy (18 sections, no organizing principle)

`/admin` has 18 sections with no grouping — that's the disorientation.
They cluster into four jobs:

- **Content pipeline (how video gets in):** `drafts` → `episodes` →
  `series` → `videos`. *This is where the Azotus feed lands and where
  series covers should be set. The spine of the operation.*
- **Communication:** `newsletters`, `subscribers`, `prayers`,
  `campaigns`.
- **Site curation:** `featured`, `articles`, `news`, `quotes`, `social`.
- **Operations:** `schedule`, `programs`, `health`, `settings`,
  `testimonials`, `dashboard`.

**Strategy recommendation:** group the admin nav by these four jobs and
make the **Content pipeline** group the primary one (drafts is the inbox
for Azotus). Don't redesign all 18 — just group them and make the
content-flow path obvious: *Azotus → draft → review (set series + cover) →
publish.* That single flow ties VOD-feeding + thumbnails + admin together.

---

## Immediate decisions (your call — nothing is mid-flight)

1. **Save the Azotus M1 work** — commit it (own branch, not main) so it
   can't be lost. Recommended: do this first, it's fragile.
2. **Prove the VOD feed** — run the one-track manual command when you have
   a finished job to test with.
3. **Pick the thumbnail path** — curated series covers (needs the small
   admin field + photo curation) vs. living on the typographic fallback
   for now.
4. **Admin grouping** — a small, low-risk pass to group the 18 sections by
   the four jobs, content-pipeline first.

Remaining design-doc items (not blocking, your pace): `FeaturedSunday`,
the big blue-`--accent` sweep (large, regression-risky — branch-first).
