# Omega Image System — comprehensive plan

> Goal: every poster, thumbnail, and frame across the whole site looks **cohesive,
> natural, and dignified** — one recognizable Omega look, correct aspect on every
> surface, no cut-off heads, no burned subtitles, no sepia, no stock photos, no
> letter placeholders. Built once, applied everywhere, automatic for new content.

## 1. Why it looks bad today (root causes — audited)

1. **No single image model.** Images come from 5 different places used inconsistently:
   `series.poster_vertical`, `series.poster_horizontal`, `episodes.thumbnail_custom`,
   `episodes.poster_candidates.variants`, and the raw Bunny proxy frame.
2. **Aspect chaos.** Surfaces ask for different shapes but get one stored image,
   then cover-crop it (top-anchored), cutting the subject:
   - Home `UrDagskranni` → **4:5**, via `resolvePoster(portrait_4x5)`
   - `/sermons` series shelf → **4:5**, via `poster_horizontal` (wrongly set to a 2:3 poster)
   - `/sermons` newest rail → **16:9**, via `thumbnail_custom`
   - `/sermons/show/[slug]` episode cards → portrait-ish, via `thumbnail_custom`
   - `/sermons/[id]`, Israel pages → `thumbnail_custom`
3. **Quality defects.** `sharp.tint()` desaturates to sepia; titles baked into posters
   are redundant with the UI title rendered below; many frames are mid-word; translated
   shows have burned-in subtitles + promo/phone-number lower-thirds.
4. **Stock/mock imagery** still on courses (`/namskeid`, Unsplash) and various fallbacks.

## 2. The system (principles — the "one look")

1. **One recipe, one look.** Every image is a **natural-colour graded frame** (NO tint/sepia),
   **subtitle/promo-safe** (trim the bottom band on translated shows), **subject-aware
   cropped** (sharp `attention` strategy keeps the face), with a **subtle Omega treatment**
   (light edge vignette + small Ω mark). **No baked text** — the UI renders every title,
   so images never duplicate the title and stay reusable.
2. **Generate the full aspect set per item, from one frame.** Each episode and series gets:
   - **16:9** (landscape rails, episode detail, hero backdrops)
   - **4:5** (portrait cards: home rail, series shelves, show-detail episode cards)
   - **2:3** (tall key art: show-detail hero, future "poster wall")
   Each is smart-cropped from the SAME source so they're consistent and subject-safe.
3. **Single source of truth + consistent consumption.** Store the set in
   `poster_candidates.variants` (episodes) and the `poster_*` fields (series). EVERY
   surface reads through `resolvePoster(aspect)` so it always gets the right-aspect,
   subject-safe image. Fix surfaces that bypass it.
4. **Good source frames.** Use full-res **1920×1080** frames (not 640px previews) and
   pick **eyes-up** moments. Smart-crop + grading rescue imperfect frames; flagship
   shows get a hand-picked frame.
5. **Optional premium hero layer.** Flagship shows may also get a *designed* key-art
   poster (title baked, via the Hero Poster tool) used ONLY on the show-detail hero and
   social sharing — never in-grid, so titles never double up.

## 3. The build (phases)

### Phase 1 — Generation engine (everything depends on this)
- One library `lib/image-set.ts`: `generateImageSet(sourceFrame, opts) → { landscape_16x9, portrait_4x5, portrait_2x3 }`.
  - natural grade (modulate sat ~1.1, brightness ~1.03, gentle contrast) — **no `tint`**
  - `trimBottomPct` to remove burned subtitles / promo bars
  - **subject-aware crop** per aspect: `resize(w,h,{fit:'cover',position:sharp.strategy.attention})`
  - subtle vignette + small Ω mark overlay (resvg, bundled fonts)
- Replaces the ad-hoc `hero-poster`/episode-thumb scripts with one consistent recipe.

### Phase 2 — Consumption consistency
- Route **every** surface through `resolvePoster(aspect)`:
  - `/sermons` `SeriesShelf` → `resolvePoster(series, 'portrait_4x5')` (stop using `poster_horizontal` as a 2:3)
  - `/sermons/show/[slug]` episode cards → `resolvePoster(ep, 'portrait_4x5')`
  - `/sermons/[id]`, Israel, home → confirm correct aspect requested
- `ThumbnailFrame`: keep top-anchored cover ONLY for the raw-Bunny fallback (subtitle clip);
  branded variants are already exact-aspect → set `objectPosition:center` for them (no double-crop).

### Phase 3 — Backfill existing content
- Regenerate the full variant set for the **7 episodes + 4 series** from full-res frames
  (hand-pick eyes-up frames for the person-shows: Hour of Power, Times Square).
- Write `poster_candidates.variants` (episodes) + `poster_vertical`/`poster_horizontal`/4:5 (series).

### Phase 4 — Pipeline automation (so new content is cohesive automatically)
- Azotus delivers a **full-res frame** (ties to the candidate-resolution upgrade: send
  full-res candidate frames via storage URLs, ≤4.5 MB-safe — see tasks).
- On VOD intake, auto-run `generateImageSet` → store all variants + `thumbnail_custom`.
- Result: every future program is on-brand with zero manual work.

### Phase 5 — Stock / mock cleanup
- `/namskeid` (courses): hide until real, or real images — no Unsplash.
- Replace any remaining Unsplash/stock fallbacks site-wide; audit each page.

## 4. Definition of done
Across **home, /sermons, show-detail, episode pages, Israel, courses**: every card and hero
shows a natural-colour, subject-centred, Omega-treated image at the **correct aspect** —
no burned subtitles or phone numbers, no sepia, no cut-off heads, no letter placeholders,
no Unsplash. New deliveries get the same automatically.

## 5. Sequencing note
Phase 1 (engine) unblocks everything. Phase 3 (backfill) is the visible win on the live
site. Phase 4 (pipeline) makes it permanent and pairs with the full-res-frame work already
tracked. Phases 2 + 5 are correctness/cohesion cleanups that can land alongside.
