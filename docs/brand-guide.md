# Omega Brand Guide

> **Last updated:** 2026-04-19
> **Owner:** Hawk (Haukur Sigurbjörnsson)
> **Authority:** this document supersedes any conflicting guidance. If you're about to make a visual, typographic, or content decision on anything Omega-related, read this first.

---

## Part 1 — Strategic Foundation

### Who Omega is

Omega is Iceland's only Christian television network. Founded 1992, 34 years of unbroken broadcasting. A platform for the kingdom of God serving video, articles, e-courses, and prayer across Icelandic and English audiences.

This is not a Christian Netflix. This is a broadcast-aware sanctuary on the internet — a cathedral, a living broadcast, and a letter. Every design decision is judged against that direction.

### Audience truth

- **80% over 50.** Predominantly Icelandic. Tablet and TV over phone. Facebook over everything else.
- **The children and grandchildren of the current audience are on Instagram.** That's the bridge to younger — not a new audience, an extension of the existing one.
- **Iceland-first niche.** We reach Iceland well before we expand back to Scandinavia / UK / Middle East (where Omega broadcast historically before contracting).

### The one-sentence direction

> Omega is a quiet, cinematic sanctuary on the internet — a Christian media platform that feels like a living broadcast, a cathedral, and a letter, not a store.

Every design decision is judged against this. When in doubt, cut the thing that contradicts it.

### The three shifts (adopted April 2026)

1. **From rails of content to a living broadcast** — no other Christian streaming platform can do this because they don't have a broadcast. Omega does. The homepage and social presence lean into it.
2. **From content types in silos to threads of Scripture** — every sermon anchors to one Bible passage. That passage connects it to articles, prayers, courses, the next live broadcast on the same text.
3. **From cold Nordic to warm sanctuary with cold wayfinding** — dark base warms, Nordic blue demotes to wayfinding only, candle amber becomes the emotional accent. *Iceland outside, kingdom inside.*

### The tagline system

Three scales for every context. Each carries the same meaning at a different register:

| Scale | Line | Use |
|---|---|---|
| **Short** (4 words) | **Ljós og von fyrir Ísland** | Under the wordmark, social avatars, any compact lockup |
| **Medium** (9 words) | **Ljós og von fagnaðarerindisins á hvert íslenskt heimili** | Facebook cover subhead, about-page header, website hero |
| **Long** (heritage) | **Sjónvarpstöðin Omega — ljós og von á Íslandi síðan 1992** | Footer, email signature, press release |

---

## Part 2 — The Visual Identity

### The Mark

**The Omega mark is the Greek letter Ω enclosed in an outer O**, with a small transparent horizontal cut carved out flush with the bottom of the Ω. The mark preserves 34 years of audience recognition while retiring the chrome/glossy treatment that made the original feel dated.

**Canonical file:** `brand-assets/omega-mark.svg`

**Anatomy:**

```
 ╭──────────╮     ← outer ring (complete circle)
 │  ╭────╮  │
 │  │    │  │     ← Greek Ω letter (Source Serif 4 Bold)
 │  │ Ω  │  │        feet flow into the outer ring
 │  ╰────╯  │
 │───────── │     ← 6px transparent cut, flush with Ω baseline
 ╰──────────╯     ← small remaining bottom arc (original's crescent, through negative space)
```

**Construction (exact SVG geometry):**

- ViewBox: `240 × 240`
- Outer ring: `<circle>` at `(120, 120)`, radius `104`, stroke-width `22`, fill none, complete circle
- Ω letter: `<text>` at `x=120, y=202`, font `Source Serif 4` weight `700`, size `235`, anchor `middle`
- Transparent cut: via SVG `<mask>` — black rectangle at `(0, 202)` size `240×6`
- Everything uses `currentColor` so parent CSS `color` property changes the mark's color

**Why the mark is structured this way:**

- **Outer O + inner Ω** = "Alpha and Omega" nested reading (Rev 1:8: *"Ég er Alfa og Ómega"*). Whether or not the original 1990s designer intended this theological reading, the mark supports it iconographically.
- **Feet flowing into the ring** = integration. The Ω is not a decoration floating inside a decorative border; letter and ring are one continuous mark.
- **Transparent cut flush with Ω** = rediscovers the original's "bottom crescent" detail through negative-space geometry. The remaining bottom arc is a natural consequence of the cut, not a separate drawn element.

**There is a tiny visible step where the cut meets the ring** because cutting a curved stroke with a straight horizontal rectangle creates geometric mismatch. This is known and accepted — the trade for preserving the mark's clean silhouette. Do not try to "fix" it with angular arcs; that was tried (v10.1) and removed too much ring, breaking the composition.

### Typography

Three fonts, assigned to specific roles. Never substitute.

**v2 typography (locked 2026-04-20):** the original Source Serif 4 + Libre Baskerville stack was tasteful but ubiquitous in 2024–2026 premium design — used by half the dark-mode sites you'd compare Omega against. We swapped for **Fraunces + Newsreader + Inter**: less common, more distinctive, still free and well-engineered. The change applies everywhere — website, social templates, lockup SVGs, brand assets. Set typeface query param `?typeface=classic` on the social generator API to render with the old stack for direct comparison.

| Role | Font | Weights | Use |
|---|---|---|---|
| **Display / Wordmark** | Fraunces (Undercase Type) | 300 (Vaka), 400, 500, 600, 700, 900 + italics | Hero headlines, OMEGA wordmark, the Ω inside the mark. Variable optical sizing — letterforms automatically adapt as size scales. Use weight 300 (Vaka) at hero/Scripture sizes. |
| **Editorial** | Newsreader (Production Type) | 400, 400 italic, 500, 600, 700 | Article body, pull quotes, editor's voice lines. Designed specifically for digital long-form reading. Use italic 400 for the "human voice" treatment (editor notes, host attribution, Scripture citations). |
| **UI / Tagline** | Inter | 400, 500, 600 | Tagline caps, UI labels, meta, metadata. Tagline always uses Inter SemiBold at 0.22em tracking in all-caps. |

**Loading:** `src/app/layout.tsx` loads all three from Google Fonts via Next.js's `next/font/google`. The variables are exposed as CSS custom properties — `--font-display` (Fraunces), `--font-serif` (Newsreader), `--font-sans` (Inter). For server-side social rendering see `src/lib/social/fonts.ts`.

**Why these specifically:**
- **Fraunces** has a *hand* — sculpted "S", characterful "f" terminals, the "ð" glyph feels at home rather than added-on. Source Serif 4 is well-mannered but unremarkable; Fraunces feels designed.
- **Newsreader** was designed for screen reading from the start (Production Type built it for editorial use). It's slightly more distinctive than Libre Baskerville and pairs visually with Fraunces.
- **Inter** is kept because nothing free beats it for UI labels, and its ubiquity disappears at small caps sizes anyway.

**Italic = human voice** rule still applies — Newsreader italic is now the canonical "editor voice" face. Less calligraphic than Libre Baskerville italic (which we acknowledged was more characterful in isolation), but the typeface family coherence with Fraunces matters more.

**Icelandic diacritics (þ, ð, æ, ö, ý):** test every new render. Source Serif 4 and Libre Baskerville have them. Inter has them. Never use a font that lacks Icelandic glyphs.

**Italics = human voice.** Libre Baskerville italic is reserved for the editor's voice, pull quotes, Scripture citations. Never italicize UI body or labels.

### Color System — "Altingi" palette

Named after places, weather, and objects Icelanders know. Warm-toned blacks (never cool black). Cold structural accent. Warm emotional accent. Vellum cream reading frame.

**Defined in code at:** `src/app/globals.css`

**Surfaces (warm-black family):**

| Token | Hex | Role |
|---|---|---|
| `--nott` (Night) | `#14120F` | Primary background for social, broadcasts, hero wells, footer |
| `--mold` (Dark earth) | `#1B1814` | Site background, secondary surface |
| `--torfa` (Turf) | `#242019` | Card backgrounds, elevated surfaces, sidebars |
| `--reykur` (Smoke) | `#2E2921` | Hover/pressed state |

Rule: all surfaces carry **warm black**. Side-by-side with pure `#1C1C1E`, these look slightly brown. That's correct.

**Structural accent — wayfinding only (links, focus, selection):**

| Token | Hex | Role |
|---|---|---|
| `--nordurljos` (Northern Light) | `#6FA5D8` | Links, focus rings, progress bars, scrub position |
| `--nordurljos-mist` | `rgba(111, 165, 216, 0.10)` | Tinted blocks for link emphasis |

**Emotional accent — warm, rare, meaningful:**

| Token | Hex | Role |
|---|---|---|
| `--kerti` (Candle) | `#E9A860` | **Primary brand gold** — logo, live-broadcast glow, prayer counter, seasonal markers, editor signature |
| `--kerti-gloed` | `rgba(233, 168, 96, 0.14)` | Soft radial behind warm moments (hover glow) |
| `--gull` (Gold-foil) | `#C88A3E` | Once-per-page max — section flourish, seasonal dropcap, "Bænheyrsla" (answered-prayer) badge |

**Reading frame:**

| Token | Hex | Role |
|---|---|---|
| `--skra` (Vellum) | `#F3EDE0` | Article pages, newsletter frame, course reader. The background we use for any text meant to be *read*, not scrolled past. |
| `--skra-djup` (Vellum-deep) | `#1B1814` | Body ink on vellum |

**Text on dark:**

| Token | Hex | Role |
|---|---|---|
| `--ljos` (Light) | `#F6F2EA` | Primary text on dark, warmed off-white |
| `--moskva` (Mist) | `#B9B2A6` | Secondary text, captions |
| `--steinn` (Stone) | `#7A7268` | Muted text, timestamps |

**Signal:**

| Token | Hex | Role |
|---|---|---|
| `--blod` (Blood) | `#D84B3A` | **Live broadcast dot ONLY.** Not for errors, not for CTAs. |

**Retired (never use):**

- `#5B8ABF` — old cold accent
- Pure `#FFFFFF` for text on dark
- Layered gray-blue shadows — replaced by warm-black shadow `0 24px 48px rgba(10,8,5,0.55)`

### The one-paragraph color rule

> Norðurljós is for wayfinding — it tells you where you are. Kerti is for meaning — it tells you this is holy. Blóð is only used for one thing: the red dot when we are on the air. Everything else is night, turf, and vellum.

### Logo color usage

| Context | Mark color | Background |
|---|---|---|
| **Primary** (social, broadcast, hero) | Kerti `#E9A860` | Night `#14120F` |
| **Inverse** (article, print, light UI) | Night `#14120F` | Vellum `#F3EDE0` |
| **Secondary** (article reading, admin) | Ivory `#F6F2EA` | Mold `#1B1814` |

**Never:**
- Chrome, metallic, bevel, drop-shadow
- Gradients (of any kind, for the logo)
- Multi-color variants
- The old blue `#5B8ABF` era treatment

**Flat color only, forever.** This is the single most important brand rule. If you violate it, everything else collapses.

### Lockups

Three variants, all built from the canonical mark.

**1. Horizontal lockup (primary)** — `brand-assets/omega-lockup-horizontal.svg`

```
[Ω mark] MEGA
         LJÓS OG VON FYRIR ÍSLAND
```

The mark substitutes for the "O" in OMEGA. `MEGA` wordmark in Source Serif 4 Bold at font-size `235` (matching the Ω's cap-height inside the mark, so the composition reads as one continuous word). Tagline `LJÓS OG VON FYRIR ÍSLAND` in Inter SemiBold, size `26`, tracking `0.22em`.

Used for: website header, Facebook cover, email headers, newsletters, standard contexts where horizontal space is available.

**2. Stacked lockup** — `brand-assets/omega-lockup-stacked.svg`

```
[Ω mark]
 OMEGA
 LJÓS OG VON FYRIR ÍSLAND
```

Mark on top. Full `OMEGA` wordmark underneath in Source Serif 4 Bold size `74` (no mark substitution because the mark is already shown above). Tagline at the base, Inter SemiBold size `22`, tracking `0.22em`.

Used for: social profile photos (Instagram, Facebook), newsletter masthead, print footer, any vertical context.

**3. Mark-only** — `brand-assets/omega-mark.svg`

Just the Ω-in-O mark. Used for: favicons, tiny avatars, broadcast corner idents, any context below 64px wide. Works down to 16px before the Ω becomes illegible.

### Typography detail for lockups

- **Mark + MEGA horizontal spacing:** MEGA starts at `x=248` in the lockup viewBox (giving ~8px visual gap after the mark's viewBox edge). `letter-spacing: -0.005em` tightens MEGA slightly to feel kerned, not spaced.
- **Wordmark/Ω cap-height alignment:** both at font-size 235 so they align exactly. This is the single most important visual unity rule.
- **Tagline baseline:** 50px below wordmark baseline (in the horizontal lockup). Enough breathing room without orphaning the tagline.
- **Tagline tracking:** 0.22em is the magic number. Lower and it looks normal; higher and it looks decorative. This tracking gives institutional dignity.

---

## Part 3 — Content Strategy

### Platform call

**Two platforms, done excellently:**

1. **Facebook** — non-negotiable primary. 80% over-50 Icelanders live here. Icelandic church ecosystem runs on Facebook (event invites, shared posts, prayer groups). If the Facebook presence is weak, nothing else matters.

2. **Instagram** — the "bridge young and old" platform. Not primary audience, but:
   - The children and grandchildren of current viewers are here
   - Aesthetic excellence builds credibility
   - Young converts often find ministry here first
   - Cross-posting costs nothing extra (same generator serves both)

**Skipping (deliberately):**

- **TikTok** — wrong voice, wrong audience, requires totally different production pipeline. One soul argument doesn't hold up because a TikTok account that posts once a week with typography-led stills just dies silently. If ever done, it's a separate workstream with different producers and different content.
- **X / Twitter** — not a growth channel for Christian media in Iceland. Ministry accounts whisper into the void.
- **LinkedIn, Pinterest** — not where souls are reached. Skip.
- **YouTube** — deserves its own plan eventually (Omega's content *is* video). Parked for a separate workstream.

### Cadence — four posts per week, always anchored

Christian media fails by posting too much generic filler. Omega does the opposite — four posts per week, each one tied to something real that's actually happening.

| Day | Iceland time | Post | Data source |
|---|---|---|---|
| **Monday** | 09:00 | Ritningin vikunnar (Passage of the Week) | `featured_weeks.featured_passage_id` + `bible_passages.text_is` |
| **Wednesday** | 09:00 | Bænakvöldið í kvöld (Tonight's Prayer Night) | `schedule_slots` (that day's prayer night) |
| **Saturday** | 17:00 | Á morgun: Sunnudagssamkoma (Tomorrow's Service) | `schedule_slots` + `programs` |
| **Sermon publish day** | variable | Ritstjórarödd (Editor's Voice) | `episodes.editor_note` |

**Why four:**
- Sustainable forever — Hawk doesn't burn out, the system keeps running
- No filler — every post has a reason to exist
- Silence on Tue/Thu/Fri/Sun is a *feature*. Omega doesn't look desperate.

**Why anchored to real data:**
- Posts Omega can make that nobody else can (broadcast schedule is unique to Omega)
- No AI-generated filler (Hawk's voice stays in; Tozer quotes stay out)
- Quality rises above the Christian-Instagram noise floor

### Content templates (priority order)

**1. Ritningin vikunnar — Passage of the Week**

- **Source:** `featured_weeks.featured_passage_id` + `bible_passages.text_is`
- **Composition:** pure typography — the Icelandic verse set in Source Serif 4 Vaka weight 300, Altingi palette background (Night Black or Vellum Cream), small Kerti amber citation kicker at top. No image. No decoration.
- **Why first:** most unique to Omega (curated Icelandic Bible text), highest typographic bar, exercises the full rendering stack. If this template is right, everything else follows the same pattern.
- **Format:** three sizes — 1:1 (Instagram feed), 9:16 (Story/Reel), 1.91:1 (Facebook).

**2. Á morgun / Í kvöld — Broadcast Card**

- **Source:** `schedule_slots` + `programs` (the enriched daily XML import, live now via Vercel Cron)
- **Composition:** kicker `"Á MORGUN · LAUGARDAGUR 20. APRÍL"`, title (program name in Source Serif 4), host line, one-sentence hook from `programs.description`.
- **Why second:** highest daily utility (always fresh data), proves the broadcast-pipeline integration, impossible for competitors to replicate.
- **Format:** primarily 9:16 (Story-native) and 1:1 (feed).

**3. Ritstjórarödd — Editor's Voice**

- **Source:** `episodes.editor_note` (Hawk's curated 40-80 word voice line per sermon, Gemini-assisted in Icelandic)
- **Composition:** pull quote in Libre Baskerville italic (the "editor voice" treatment from the design system), sermon title beneath, Bible ref citation, QR code to watch on omega.is.
- **Why third:** turns every published sermon into a post automatically. No new content invention required.
- **Format:** 1:1 feed-native.

**4. Bænakvöldið á miðvikudag — Prayer Night Invite**

- **Source:** `schedule_slots` for the week's Wednesday prayer night
- **Composition:** quiet — a single sentence invitation, sparse typography, emphasis on Kerti amber warmth.
- **Why fourth:** weekly rhythm, grounds the brand in prayer identity, doesn't feel performative.
- **Format:** 9:16 Story.

### What Omega does NOT post

This list is as important as the list of what it does. Every item on it was considered and rejected with reasoning.

- **Generic inspirational quotes** (Tozer, Spurgeon, Oswald Chambers on unrelated backgrounds). Every Christian Instagram account does this. It's the "cheap" bucket. Not Omega.
- **Stock photos with overlaid text.** Sunset + white-text verse = universal Christian-Instagram aesthetic. Indistinguishable from every other account. Skip entirely.
- **Auto-generated articles from sermons.** *Hawk's direction is explicit: "I would rather create my articles myself and have real content that I believe in."* Articles stay Hawk's voice. Never auto-generated.
- **Vertical 9:16 reels with music/motion.** Contradicts the direction ("end scrolling, not start it"). Different workstream if ever done; not part of this template system.
- **Comments** on any Omega-authored post (prayers, articles, sermons). Management burden Hawk doesn't need.
- **AirPlay / Chromecast CTAs.** Audience is 80% over 50; they don't phone-cast.
- **Multiple colors on the logo.** Flat single color only.

### Posting workflow

**Phase 1 (current — weeks 1-4):** Manual. Admin at `/admin/social` renders the week's four candidates as PNGs. Hawk downloads and posts manually. You stay in control of every post, build confidence in the output quality.

**Phase 2 (month 2):** Meta Graph API integration + scheduling. The generator creates each week's four posts on Sunday evening. Hawk approves each one in `/admin/social` (~30 seconds total). They auto-post at scheduled Iceland times. Human review every post; automation of the "remember to post" burden.

**Phase 3 (later, optional):** Skip review for lowest-risk posts (e.g. broadcast cards pulled directly from schedule). Manual-only for anything with theology weight.

### Facebook rebrand (the prerequisite)

**Before any new posts ship, the Facebook page itself must look Omega-level.** First impressions are the cover + pinned post. If those are cheap, individual high-quality posts still feel cheap by association.

Required:
1. **Cover photo** — the new `facebook-cover.svg`, exported at 1640×720 PNG
2. **Profile photo** — the mark-only SVG, exported at 512×512 PNG
3. **About section** — rewritten in Hawk's voice, uses the medium-length tagline
4. **Pinned post** — Omega direction statement, visual
5. **Archive old cheap-looking posts** — especially anything with the chrome-era logo

---

## Part 4 — What Makes This Not Cheap

Six layers of quality. Each is load-bearing.

### 1. Real typography, server-rendered

Source Serif 4 + Libre Baskerville + Inter embedded as TTF files in the render pipeline (Satori, coming in Milestone 4). Every post composes with correct font metrics, correct kerning, correct Icelandic diacritics. No fallback to system fonts. No broken canvas rendering (the old `/admin/quotes` version fell back to Georgia because HTML Canvas can't see Google Fonts — that's the #1 reason the old version looked cheap).

### 2. The Altingi palette, consistently

Warm blacks (not cool black). Kerti amber for meaningful moments only. Vellum cream for reading contexts. Never deviate. The palette is defined once in `src/app/globals.css` as CSS custom properties and propagates everywhere.

### 3. Composed layouts, not "image + text overlay"

Typography-led asymmetric compositions. Generous negative space. Kicker → headline → citation hierarchy. No stock imagery — solid warm backgrounds, maybe a subtle paper grain at 2% opacity, maybe one decorative serif flourish in Gull (gold-foil). Never more.

### 4. Real content provenance

Every post attributes to a real sermon, passage, or broadcast with a deep link to the actual omega.is page. QR code in the corner goes somewhere meaningful. No invented content, no decontextualized quotes.

### 5. Icelandic typography done right

`þjóðin`, `Sælir`, `Sunnudagssamkoma`, `Guðs orð` — tested at every size before ship. Proper kerning. No broken diacritics. Icelandic first, English as subtitles. This alone separates Omega from content generators that treat Icelandic as an afterthought.

### 6. The "quality over frequency" rule

4 posts per week, sustained, is better than 14 posts per week of variable quality. The silence between posts is part of the brand. Audiences trust accounts that don't beg for engagement. Omega is never begging.

---

## Part 5 — File Library & Technical Reference

### Brand assets (the canonical files)

| File | Purpose | When to use |
|---|---|---|
| `brand-assets/omega-mark.svg` | Mark-only Ω-in-O | Favicons, tiny avatars, corner idents |
| `brand-assets/omega-lockup-horizontal.svg` | `[Ω] MEGA + tagline` | Primary — website, Facebook cover, email, newsletters |
| `brand-assets/omega-lockup-stacked.svg` | Mark over wordmark over tagline | Profile photos, print footer, vertical contexts |
| `brand-assets/facebook-cover.svg` | Ready-to-upload Facebook cover (820×360) | Facebook page cover |
| `brand-assets/preview.html` | Interactive preview of all the above at multiple sizes | Design review |
| `brand-assets/reference/` | Original 1990s logo references | Historical only — don't ship these |

### Design tokens in code

| Location | What it defines |
|---|---|
| `src/app/globals.css` | Altingi palette CSS custom properties, typography role classes (`.type-vaka`, `.type-yfirskrift`, etc.) |
| `tailwind.config.*` | Maps Altingi tokens to Tailwind utilities |
| `src/app/layout.tsx` | Google Fonts CSS link (Source Serif 4, Libre Baskerville, Inter) |

### How to render an SVG as PNG (for upload)

**Easiest (macOS):** open the SVG in Safari or Chrome, right-click → Save Image As. Sufficient for profile photos and one-off uploads.

**Highest quality:** open the SVG in Inkscape, File → Export PNG, pick 2x resolution of the target dimensions (e.g. 1640×720 for a 820×360 Facebook cover).

**Future (Satori, coming in Milestone 4):** `/admin/social` page will render all templates server-side via Satori + @resvg/resvg-js, outputting PNGs directly with real fonts bundled. No manual export.

### How to theme a mark (CSS)

All mark SVGs use `currentColor` on strokes and fills. To render on any background, set the parent's `color` CSS property:

```css
/* Primary: Kerti gold on Night Black */
.omega-primary { color: #E9A860; background: #14120F; }

/* Inverse: Night Black on Vellum Cream */
.omega-inverse { color: #14120F; background: #F3EDE0; }

/* Secondary: Ivory on Mold */
.omega-secondary { color: #F6F2EA; background: #1B1814; }
```

Then embed the SVG inline or via `<img>` with `currentColor` respected:

```html
<div class="omega-primary">
  <!-- SVG uses currentColor, inherits #E9A860 -->
</div>
```

---

## Part 6 — Roadmap & Status

### Shipped — 2026-04-19 (this session)

**Visual identity (brand-assets/):**
- ✅ `omega-mark.svg` — final locked version after ~30 iterations. v10 with horizontal-rectangle mask cut, Ω at font-size 235 with feet flowing into ring.
- ✅ `omega-lockup-horizontal.svg` — primary lockup with MEGA wordmark + tagline
- ✅ `omega-lockup-stacked.svg` — vertical lockup with full OMEGA + tagline
- ✅ `facebook-cover.svg` — ready-to-upload Facebook cover (820×360) with heritage line
- ✅ `preview.html` — live preview of all lockups at multiple sizes on all color variants

**Documentation:**
- ✅ `docs/brand-guide.md` — this file (the authority for all future brand decisions)

**Commits:**
- `5e2d1b8` — Omega mark + lockup system (v10 final)
- `d34e8d9` — Facebook cover v1 using locked lockup
- `(this commit)` — comprehensive brand guide + STATUS update

### Next — Milestone 4 (when session resumes)

**Satori template infrastructure:**
- Install `satori` + `@resvg/resvg-js` for server-side JSX → PNG rendering
- Bundle Source Serif 4, Libre Baskerville, Inter as TTF files in `public/fonts/social/`
- Build `/admin/social` page that shows the week's candidate posts as PNG previews
- Add API route `/api/admin/social/generate` that takes template ID + data + format, returns PNG bytes

**First template — Ritningin vikunnar:**
- JSX component at `src/lib/social/templates/ritningin-vikunnar.tsx`
- Reads from `featured_weeks` + `bible_passages`
- Renders 1:1, 9:16, 1.91:1 variants
- Preview + download from `/admin/social`

**If it clears the quality bar:**
- Template 2: Á morgun / Í kvöld broadcast card
- Template 3: Ritstjórarödd editor's voice
- Template 4: Bænakvöldið prayer night invite

### Later — Milestone 5

**Phase 2 automation:**
- Meta Graph API integration for Facebook + Instagram direct posting
- Scheduling — posts generated Sunday evening, auto-post at configured times
- Admin approval step (30-second review per post)
- OAuth Meta app review (~1 week process)

**Facebook rebrand completion:**
- About-page rewrite in Hawk's voice
- Pinned post design
- Archive old chrome-era posts

### Deferred (intentionally)

- **TikTok content** — separate workstream if ever done, not this system
- **YouTube Shorts** — separate workstream
- **Auto-generated articles** — Hawk's explicit direction: never
- **Comments on posts** — management burden
- **Reels/vertical video** — contradicts direction statement
- **Chrome/glossy logo treatment** — retired permanently

---

## Part 7 — Brand Decisions Captured (for future agents)

If you're an agent reading this in a future session, these decisions were made deliberately after thorough discussion. Do not "improve" them without Hawk's explicit direction.

| Decision | Reasoning |
|---|---|
| Keep the Ω mark, retire the chrome treatment | 34 years of audience recognition preserved. Chrome was the only cheap part. |
| Source Serif 4 for wordmark, not custom-drawn | Ties into the rest of the brand typography system on omega.is. Consistency > uniqueness at this level. |
| Horizontal-rectangle cut, not angular arcs | Angular arc version (v10.1) removed too much ring and broke the O silhouette. The tiny visible step at the cut boundary is accepted trade. |
| Tagline in Inter caps, not Libre Baskerville small-caps | Sans-serif tagline creates visual hierarchy against the serif wordmark. Libre Baskerville small-caps was considered and rejected as too stylized. |
| Short tagline "Ljós og von fyrir Ísland" (4 words) | Tested against 9-word and heritage versions. Short version earns its place under the wordmark; longer versions reserved for subheads and footers. |
| Facebook + Instagram only (for now) | TikTok explicitly rejected — wrong voice, wrong audience, would require separate production pipeline. X/LinkedIn not growth channels. |
| 4 posts/week anchored to real data, not daily filler | Sustainability beats frequency. Silence is a feature. |
| Never generate articles from sermons | Hawk's explicit direction: articles stay his voice. |
| Never use stock photos with overlay text | Generic Christian-Instagram aesthetic. Omega rises above it by typography-first composition. |
| Prayer is the soul, not a feature | Omega's CEO is a man of prayer. UI and content must reflect this seriously. |
| AirPlay/Chromecast is not a TV strategy | Audience is 80% over 50. They don't phone-cast. Native TV apps (Samsung Tizen, LG webOS) is the correct path — separate workstream. |

---

## Part 8 — Voice and Writing

Brand voice follows Hawk's personal writing rules documented in `~/Claude Cowork/About Me/writingrules.md`. Key excerpts relevant to Omega:

- **Never sound like an AI.** No "delve", "tapestry", "landscape", "testament", "crucial", "pivotal", "leverage", "utilize", "facilitate", "foster", "cultivate", "showcase", "furthermore", "moreover".
- **Write like you talk.** Short sentences mixed with longer. Use contractions.
- **Be specific, not grand.** Say what the actual things are.
- **Warm, direct, faith-grounded, action-oriented.**
- **Icelandic diacritics rendered correctly, always.** Never strip `þ, ð, æ, ö, ý` to ASCII. The UTF-8 mojibake episode (2026-04-18) cost us hours. All Icelandic text goes through service-role Supabase client or stays in source files — never pasted through the SQL editor clipboard.

---

## Part 9 — Version History

| Date | Event | Commit |
|---|---|---|
| 2026-04-20 | Typography v2 — Fraunces + Newsreader replace Source Serif 4 + Libre Baskerville everywhere; OmegaMark React component built; mark wired into Navbar / Footer / AdminLayout | this commit |
| 2026-04-20 | Four social templates complete (Ritningin / Á morgun / Ritstjórarödd / Bænakvöldið) | `021278d` |
| 2026-04-19 | Brand guide written | `97ab9c0` |
| 2026-04-19 | Facebook cover v1 shipped | `d34e8d9` |
| 2026-04-19 | Mark + lockup system locked (v10 final) | `5e2d1b8` |
| 2026-04-19 | Design session started — 30+ iterations on the mark | — |

---

**End of Brand Guide.** If you're about to make a visual or content decision and you're not sure what to do, re-read Part 1 (strategy), confirm against Part 4 (quality layers), and check Part 7 (captured decisions). If the answer isn't here, ask Hawk.
