# Thumbnail Generator — Design Handoff

You (Claude Design) own the **look** of Omega TV's VOD thumbnails. A separate
workstream owns the pipeline that *calls* this generator. This doc is the
contract so the two never collide. Read it fully before changing anything.

## Mission

Make the auto-generated VOD thumbnails genuinely on-brand and beautiful —
warm, editorial, **light** (not heavy), consistent with the rest of the
rebuilt site. And make the **portrait** variant first-class.

## You own

- `src/lib/thumbnail-generator.ts` — the visual engine (frame grab, colour
  grade, vignette, gradient, SVG text overlay, layout, typography).
- The series-preset thumbnail map / fallbacks inside that file.
- Anything purely visual it depends on.

Iterate freely *inside* these. Verify in the browser (see below).

## You must NOT change (hard contract — the other workstream depends on it)

1. The **exported function signature** of the generator (its inputs/outputs).
2. The `src/app/api/admin/videos/thumbnail/route.ts` request/response shape:
   `{ bunnyVideoId, seriesName, episodeTitle, episodeId }` in, current JSON out.
3. The `episodes.thumbnail_custom` column it writes to, and the Supabase
   Storage `thumbnails/` bucket path convention.
4. Anything in the **Azotus** repo (`~/Projects/Azotus`), the drafts/VOD
   ingest pipeline, or launch work. Out of scope. Don't touch.

If you think the contract itself must change, stop and flag it — don't just
change it. Another agent is wiring to it in parallel.

## Current state & the real gap

- The generator already does cinematic grading + an SVG title/series overlay
  and uploads a PNG, landscape only.
- **Portrait is supported in code but never used** — the admin UI only ever
  requests landscape, so portrait rails fall back to junk auto-frames.
  Making portrait first-class and good is the highest-value win.
- Series without a preset fall back to Bunny's 5-second auto-frame (ugly).

## Brand references (follow these — they're authoritative)

- `docs/brand-guide.md`
- `docs/design-system.md` (locked palette + type tokens)

The site's direction is warm/brown but **psychologically light, generous
breathing room** — the first design pass was too heavy and that was a
defect, not a style. Thumbnails should feel like that, not cinematic-dark.

## How to verify (required before "done")

Thumbnails are pure visual — **screenshot-verify, don't trust the math.**
Generate real samples (landscape + portrait, with and without a series
preset) and look at them in the browser. The contrast/legibility of the
title overlay over real frames is the thing that breaks; check it empirically.

## Branch & handoff back

You're on `design/thumbnails` (branched from the live truth,
`experiment/vellum-prayer-cards`). Commit here. When the look is signed off,
it merges back — keeping it on its own branch is what lets the pipeline and
launch work proceed in parallel without conflicts.
