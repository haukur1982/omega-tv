# Claude Design handoff — social assets + clip visuals

**For:** the Claude Design workstream · **From:** engineering · **Written:** 2026-06-27
**Branch to work on:** `design/social-clips` (cut off the current feature branch)
**Plan this serves:** [`docs/plans/03-reach.md`](plans/03-reach.md) (MOVE 3 — Reach)

This is the cold-session entry point. Read it before touching anything. It says what to build, where the line is between Design and engineering, and how to not break the render pipeline.

## The mission, in one line

Omega's content should travel past the cable wall to the generations who never turn on rás 6, without the gospel ever becoming content that performs. Reach is a side effect of faithfulness, not the target.

### Non-negotiables (these are values, not preferences)

- **Reverent, not reels-chrome.** Warm, timeless, unmistakably Omega. The data is on our side: over-produced video gets far fewer views; lo-fi-but-real wins. Restraint is the brand advantage, not a limitation.
- **No vanity surfaces.** Never design a like count, view count, follower stack, or "most-watched" into anything. A clip ends on the gospel and one quiet door (omega.is), never a follow/subscribe wall.
- **Icelandic is the discipline.** Correct diacritics (þ ð æ ö ý á é í ó ú) verified in-browser at the target font weight, every time. Mojibake instantly reads cheap. Icelandic words run long, so caption lines stay short. No em dashes in any copy (Hawk reads them as AI).
- **No karaoke captions, no auto subject-tracking** in v1. Static 2-line caption blocks and a steady centre-crop on the face read more reverent on sacred content.

## What already exists (do not rebuild)

A working static-asset pipeline renders React templates to PNG via Satori + resvg, served from the admin:

- `src/app/admin/social/page.tsx` — the admin surface where the team generates + downloads cards.
- `src/lib/social/render.ts` — the render entry (Satori/resvg). **Engineering owns this. Do not edit it.**
- `src/lib/social/templates/` — four live templates: `ritningin-vikunnar.tsx`, `a-morgun.tsx`, `ritstjoraroedd.tsx`, `baenakvoldid.tsx`. These are the pattern to follow.
- `src/lib/social/fonts.ts`, `typeface.ts`, `format-date.ts` — font loading + helpers.

## The stable interface (the seam you design to, and must NOT change)

Everything Design produces plugs into these contracts in `src/lib/social/types.ts`. Treat them as fixed:

- **`SocialFormat`** = `'square' | 'story' | 'landscape'`.
- **`FORMAT_DIMENSIONS`** — `square` 1080×1080, `story` 1080×1920, `landscape` 1200×628. Design within these exact canvases.
- **`ALTINGI`** — the locked palette constant. Use these tokens; do not introduce new hex values. (Mirrors the site's `globals.css`: night `#14120F`, dark earth `#1B1814`, candle `#E9A860`, gold `#C88A3E`, vellum `#F3EDE0`, light `#F6F2EA`.)
- **`SocialTemplateRegistry`** — each template declares its `id`, `label`, and the `formats` it supports.
- **Type system:** Fraunces (display), Newsreader (serif body/quotes), Inter (labels/kickers). Loaded via `fonts.ts`/`typeface.ts`.
- **Wordmark:** the ΩMEGA mark lives in `src/components/brand/` (`OmegaMark`). Use it; do not redraw it.

Also reference the `omega-stodin-design` skill for the full brand system (palette names, type scale, do/don't).

## Ownership split

**Design owns (this handoff):**
- The **visual design** of the still templates (new + refinements to the four existing).
- The **clip end-card** (the ~1.5s closing frame: ΩMEGA mark + omega.is + "Sjá alla ræðuna").
- The **clip caption visual spec** that the video renderer composites (font, weight, size, colour, the candle accent on key words, safe-zone position, max 2 lines).
- The **per-platform profile kit** (cover, avatar, pinned-post look) for Facebook / Instagram / YouTube.

**Engineering owns (not this handoff):**
- `render.ts`, the data shapes, and the palette/format constants (the seam above).
- The clip MP4 path entirely: moment selection, the Azotus ffmpeg render, the `clips` table, the `/augnablik` landing surface, and the posting workflow.
- Anything that reads or writes data.

If you find yourself needing to change a type, a constant, or `render.ts`, stop and flag it in this doc / to engineering instead of editing it. That seam is what lets both workstreams move without colliding.

## Assets to produce (priority order)

1. **Testimony card** (`square` + `story`) — Newsreader italic pull-quote on vellum or night, candle citation kicker, from the existing testimonials. Testimony travels widest of any teaching content; do this first.
2. **Live / Bridge card** (`story` + `square`) — "Í beinni núna" / "Á morgun á omega.is". The blóð live-dot ONLY when actually on air.
3. **9:16 verse cover** — a `story` variant of `ritningin-vikunnar`.
4. **Clip end-card** — the closing frame spec (see Design-owns above).
5. **Clip caption visual spec** — the burned-caption look the renderer will composite.
6. **Profile kit** — per platform (Facebook first; it is the bridge to the loyal base and the Icelandic church ecosystem).

## Platform reality (so nothing is designed for a channel we can't post to)

- **v1 posting is manual** — a human downloads the asset/master and posts it. No platform API auto-posting on the critical path (TikTok/Meta/YouTube API access needs multi-week audits). Design for download-and-post.
- **Scope:** Facebook (Tier 1) + ONE 9:16 master fanned to Instagram Reels / YouTube Shorts / TikTok (Tier 2). Skip Snapchat. Don't design four bespoke variants; design one master that travels.
- Vertical safe zones: keep text out of the top ~10% and bottom ~15% (platform UI overlaps there).

## How to verify (every asset, before it's "done")

1. Render it in the admin (`/admin/social`) or a preview and **look on a phone-sized viewport**.
2. **Check Icelandic diacritics** at the actual font weight (þ/ð/æ/ö/ý must render cleanly, not as boxes).
3. Confirm it reads reverent and premium muted-and-small, not loud. If it looks like every other church's reel, pull back.
4. No vanity element, no em dash, no promise the system can't keep (the `/augnablik` landing's email capture belongs to MOVE 2 and promises only the weekly letter today).

## Workflow

Work on `design/social-clips`. This doc is the contract. When an asset is ready, it should drop into the existing template/registry pattern without engineering having to touch `render.ts` or the types. Keep commits scoped to `src/lib/social/templates/`, brand assets, and this doc.
