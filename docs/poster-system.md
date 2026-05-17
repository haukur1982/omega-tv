# Omega Poster System

**Status:** Production direction · 2026-05-16  
**Purpose:** Make every article image, show poster, course poster, sermon thumbnail, and documentary banner feel like one Omega world instead of a mix of decent source images.

## Current Rating

**Overall: 7/10.**

The best images already have the right soul: ash, smoke, stone, warm darkness, vellum, old light, Icelandic restraint. The weak images feel like they were found rather than made. They may be good photos, but they do not yet carry the Omega finish.

The goal is not sameness. The goal is continuity. A viewer should move from articles to shows to courses and feel: *this all belongs to one house.*

## What Works

- **Mood over literalism.** `Aska` works because it is symbolic, tactile, and serious without shouting.
- **Dark editorial banners.** The charcoal masthead treatment gives the site dignity and weight.
- **Cream body contrast.** Dark arrival into vellum reading areas gives the site a publication rhythm.
- **Texture.** Smoke, paper, stone, shadows, and old light feel more Omega than glossy studio imagery.
- **Restrained color.** Warm black, vellum, gold, and slate-blue are strong enough. The imagery should not introduce loud new palettes.

## What Is Off

- Source images are from different visual worlds: generic worship, landscape, stock documentary, course imagery, and article symbolism.
- Some images are too literal; others are too generic.
- Not every poster has the same crop discipline, title-safe area, overlay weight, or color grade.
- Some thumbnails are still acting like raw Bunny/Unsplash frames rather than finished Omega assets.

## The Omega Finish

Every image, regardless of source, should receive the same finishing pass:

1. **Warm charcoal grade**
   - Pull blacks toward `--nott` / `--mold`, never blue-black.
   - Reduce bright stock-photo color.
   - Keep skin and candle light warm.

2. **Controlled saturation**
   - Slightly desaturate most imagery.
   - Let amber fire/candle/light survive.
   - Avoid neon blue, bright green, bright red, and cheerful stock palettes.

3. **Soft vignette**
   - Darken edges, especially top and bottom.
   - Keep the center readable.
   - Do not make it look like a filter effect.

4. **Subtle grain**
   - 2–4% paper/film grain.
   - Enough to unify digital photos, not enough to look dirty.

5. **Title-safe composition**
   - Leave one calm area for type.
   - Faces, hands, fire, cross, altar, or object should not sit under important text.

6. **Single accent family**
   - Wayfinding blue: `--nordurljos`.
   - Emotional/CTA amber: `--kerti`.
   - Ornament gold: `--gull`.
   - No extra brand colors introduced by posters.

## Template Family

### 1. Article Poster

**Use for:** `/greinar`, article detail mastheads, related article cards.

**Feeling:** symbolic, quiet, close-up, theological.  
**Best sources:** ash, water, paper, window light, old table, hands, road, empty chair, doorway, fire after burning, Bible pages, stone.

**Ratio rules:**
- Detail masthead: full-bleed landscape, 16:9 or wider.
- Featured card: 16:10.
- List row thumbnail: 1:1 crop from the same source.

**Treatment:**
- Strongest charcoal overlay of all templates.
- Type-safe area usually left third.
- No smiling stock portraits.
- No obvious AI fantasy imagery.

**Good example direction:** `Aska`.

### 2. Show / Series Poster

**Use for:** `/sermons` SeriesShelf, show pages, Apple TV-style library browsing.

**Feeling:** recognizable program identity, but still Omega.  
**Best sources:** speaker portrait, sanctuary, worship, studio, repeated show symbol, recurring ministry visual.

**Ratio rules:**
- Primary: 4:5 vertical poster.
- Optional landscape: 16:9 for featured/show mastheads.

**Treatment:**
- Consistent bottom gradient for title readability.
- Small top-right episode-count chip allowed.
- Show title should sit in the lower safe zone.
- If a show has a real host, use a restrained host portrait. If not, use a symbolic image.

**Avoid:** random landscape posters for teaching shows unless the show itself is about place/travel.

### 3. Sermon Episode Thumbnail

**Use for:** latest sermon, episode rails, sermon detail poster behind player.

**Feeling:** live, immediate, watchable.  
**Best sources:** Bunny frame, speaker at pulpit, worship shot, sanctuary shot, congregation, scripture slide.

**Ratio rules:**
- Primary: 16:9.
- Optional portrait cutdown: 4:5 for rails if needed.

**Treatment:**
- More video-real than article posters.
- Bottom gradient for text.
- Slightly higher contrast than articles.
- Do not over-style faces.

**Current tool:** `src/lib/thumbnail-generator.ts` is the starting point. It should be evolved from “Apple TV-inspired” into this Omega finish.

### 4. Course Poster

**Use for:** `/namskeid`, course detail pages.

**Feeling:** formation, learning, calm authority.  
**Best sources:** open Bible, notebook, table, classroom, quiet window, path, hands writing, group in soft focus.

**Ratio rules:**
- Primary: 4:5 vertical poster.
- Detail hero can use a blurred/dimmed landscape crop from same source.

**Treatment:**
- Brighter than show posters.
- More vellum/pergament influence.
- Less cinematic darkness.
- Keep course posters welcoming for older users.

### 5. Documentary / Israel Poster

**Use for:** `/israel`, documentaries, history/archive content.

**Feeling:** archival, watchman, covenant, place, memory.  
**Best sources:** stone, Jerusalem, desert, map, manuscript, archival photo, candle, old paper, documentary still.

**Ratio rules:**
- Documentary cards: 4:5 poster.
- Article rails: 16:10 or 1:1 depending component.

**Treatment:**
- Warmer parchment grade.
- More dust/grain acceptable.
- Less blue.
- Gold/amber should feel like old paper or candle, not a button.

## Source Selection Rules

Choose sources in this order:

1. Real Omega stills / Bunny frames.
2. Real location/documentary imagery.
3. Curated stock imagery that is quiet and symbolic.
4. Generated image only when the concept is specific and no real source fits.

Reject images that are:

- obviously stock-smiling
- too corporate
- too glossy
- too saturated
- modern worship-concert generic unless the show is actually worship/concert
- AI-looking faces, hands, Bibles, crosses, or text
- visually loud in colors outside the Omega palette

## Crop Rules

| Surface | Ratio | Primary Safe Area |
|---|---:|---|
| Article masthead | full-bleed landscape | left third |
| Article featured | 16:10 | center/left, no text over face |
| Article row | 1:1 | center object |
| Show poster | 4:5 | lower third title zone |
| Episode thumbnail | 16:9 | lower third title zone |
| Course poster | 4:5 | lower third, calm center |
| Documentary poster | 4:5 | lower third or top-left label |
| Hero background | 16:9+ | center/right subject, left type-safe |

## Overlay Tokens

Use these as defaults when generating or hand-editing:

```ts
const POSTER_FINISH = {
  baseOverlay: 'rgba(20,18,15,0.28)',
  edgeVignette: 'rgba(20,18,15,0.55)',
  bottomGradient: 'rgba(20,18,15,0.86)',
  paperGrainOpacity: 0.03,
  warmAccent: '#E9A860',
  goldAccent: '#C88A3E',
  blueWayfinding: '#6FA5D8',
};
```

## Production Templates

### Article Prompt Template

Use when generating or sourcing an article image:

> Quiet symbolic editorial photograph for an Icelandic Christian magazine. Warm charcoal shadows, vellum undertone, restrained color, one tactile subject, no text, no faces unless essential, no glossy stock feeling. Leave the left third calm for typography. Mood: [MOOD]. Subject: [SUBJECT].

### Show Poster Prompt Template

> Premium streaming series poster for an Icelandic Christian TV network. Warm dark cathedral lighting, restrained documentary realism, one clear identity image, lower third safe for title, subtle film grain, no neon colors, no generic stock smile. Series: [TITLE]. Visual symbol or subject: [SUBJECT].

### Course Poster Prompt Template

> Calm formation-course poster for older Icelandic viewers. Vellum and warm paper tones, quiet learning atmosphere, clear symbolic object, soft natural light, restrained dark edges, lower third safe for title. Course: [TITLE]. Subject: [SUBJECT].

### Documentary Poster Prompt Template

> Archival Christian documentary poster. Warm parchment, stone, map, desert, manuscript, or historical texture. Serious but inviting. Subtle grain, restrained contrast, lower third safe for title. Topic: [TOPIC].

## Implementation Plan

### Phase 1 — Lock the Spec

- Keep this file as the source for poster decisions.
- Link it from `docs/design-system.md`.
- Stop approving new raw Unsplash/Bunny images without the Omega finish.

### Phase 2 — Shared Renderer

Create a reusable poster renderer around Sharp:

```txt
src/lib/poster-renderer.ts
```

It should support:

- `kind: 'article' | 'series' | 'episode' | 'course' | 'documentary'`
- output ratios: `16:9`, `16:10`, `4:5`, `1:1`
- crop focus: `left`, `center`, `right`, `top`, `bottom`
- optional title/kicker overlay
- consistent grade/vignette/grain

### Phase 3 — Admin Buttons

Add admin actions:

- Articles: “Búa til Omega mynd”
- Series: “Búa til poster”
- Videos: replace current cinematic generator with Omega Episode Thumbnail
- Courses: “Búa til námskeiðsposter”

### Phase 4 — Backfill

Backfill in this order:

1. Article hero images.
2. Series posters.
3. Course posters.
4. Episode thumbnails.
5. Israel/documentary posters.

Do the real Hawk-written articles first because they set the editorial bar.

## Launch Bar

For public launch, a poster passes if:

- it feels like Omega within 1 second
- it does not look like generic stock
- it works on desktop and mobile crops
- text remains readable
- it does not add new brand colors
- it feels calm enough for a 60–75 year-old viewer
- it has one clear subject or mood

If it only looks “nice,” it is not done yet.
