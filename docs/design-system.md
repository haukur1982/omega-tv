# Omega Stöðin — Design System

**Status:** Audit + locked specs · 2026-04-26
**Owner:** Haukur (final word on aesthetic decisions)
**Purpose:** Single source of truth for typography, color, cards, ornament, motion, and cross-page language. Apply when polishing or building any surface. Catch drift in PR review against this doc.

The site is a 24/7 Christian TV network and media hub for Iceland. Three primary content types — **video** (live + VOD), **articles**, **courses** (growing). The design system has to make all three feel like full citizens, not video-with-bonus-text.

---

## 1. Typography ladder

Two H1 registers exist and should stay distinct:

### 1.1 Display H1 — broadcast/hero pages
Used on cinematic pages where typography is the main visual moment over photographic backgrounds.

```
font-family: var(--font-display)   /* Fraunces */
font-weight: 300
font-size:   clamp(60px, 9vw, 144px)
line-height: 0.94
letter-spacing: -0.032em
```

**Locked usage:** `/heim` HeroV2, `/live` page title, `/namskeid` masthead.

### 1.2 Editorial H1 — cathedral mastheads
Used on the section-landing pattern (kicker / title / italic deck / gold rule / byline).

```
font-family: var(--font-serif)     /* Newsreader */
font-weight: 400
font-size:   clamp(40px, 5vw, 70px)
line-height: 1.04
letter-spacing: 0
text-wrap: balance
max-width: 14ch — 15ch
```

**Locked usage:** `/baenatorg`, `/israel`, `/sermons`, `/greinar`, `/israel/greinar`, `/israel/heimildarmyndir`, `/sermons/show/[slug]`, `/about`.

**Drift to fix:**
- `/give` H1 currently 76px Newsreader — bring into one of the two registers (it's a stewardship page, probably **Editorial H1**).

### 1.3 Section anchor H2 — long-form openers
Used on contemplative reading sections (Foundation, Prophecy on /israel) — these open a deep teaching block.

```
font-family: var(--font-serif)     /* Newsreader */
font-weight: 400
font-size:   clamp(32px, 4vw, 48px)
line-height: 1.08
letter-spacing: -0.01em
```

**Locked usage:** /israel Foundation, /israel Prophecy, anywhere a section is opening a long-form reading block.

### 1.4 Shelf H2 — grids, rails, lists
Used on standard shelf/rail/list-section headers (Greinar rail, Hátíðir, Útsendingar Omega, NewestRail, Safnið).

```
font-family: var(--font-serif)     /* Newsreader */
font-weight: 400
font-size:   clamp(28px, 3.2vw, 40px)
line-height: 1.1
letter-spacing: -0.005em
```

### 1.4.5 Featured H2 — single-card showcase sections
Used on sections that lead with one big editorial card (one image, one block of copy) rather than a grid. Sits visually one tier above Shelf H2; one tier below Section anchor H2. Hierarchy, not sameness.

```
font-family: var(--font-serif)     /* Newsreader */
font-weight: 400
font-size:   clamp(30px, 3.5vw, 44px)
line-height: 1.08
letter-spacing: -0.008em
```

**Locked usage:** `/heim` UrDagskranni, `/heim` FeaturedSunday, `/sermons` FeaturedSunday, `/greinar` Brennidepill.

**Drift to fix:**
- `/sermons` NewestRail h2 is **38px** — round to **40px** (Shelf H2 — it's a horizontal rail of equal-weight cards, not a featured single-card section).

### 1.5 Featured card title (H2 used inside featured cards)
The big italic prayer / featured-article title on cream:

```
font-family: var(--font-serif)
font-weight: 400
font-style: italic on prayers, normal on article featured
font-size:   clamp(22px, 2.4vw, 30px)  /* prayer */
font-size:   clamp(28px, 3vw, 40px)    /* featured editorial */
```

### 1.6 Card H3 — poster cards, episode cards, article picks

```
/* Standard card title */
font-family: var(--font-serif)
font-weight: 400
font-size:   clamp(18px, 1.6vw, 22px)
line-height: 1.2 — 1.25
letter-spacing: -0.005em
text-wrap: balance
```

**Locked usage:** Series cards on /sermons, episode cards everywhere, article PickCard, IsraelGreinarRail cards.

### 1.7 Larger pick H3 — article featured picks (Editor's picks)

```
font-size: clamp(22px, 2vw, 28px)
```

**Locked usage:** /greinar Ritstjórarval PickCards.

### 1.8 Section kicker — small caps tracked uppercase
The single most reused unit on the site. Lock these specs and police drift.

```
font-family: var(--font-sans)
font-size:   11px           /* NOT 11.5, NOT 11.52 — strictly 11 */
font-weight: 700
letter-spacing: 0.22em       /* 2.42px at 11px */
text-transform: uppercase
margin-bottom: 14px (default) / 24px (masthead)
```

**Color rule:**
- Cream sections → `var(--gull)` (gold)
- Dark mastheads (kicker that names the page section like "Bænatorg" / "Ísrael" / "Þáttasafn") → `var(--nordurljos)` (slate-blue, wayfinding)
- Dark closing/anchor sections (StyrkjaBand, Legacy34Years, IsraelTeaser kicker) → `var(--gull)` (gold, since it's a content kicker not navigation)

**Drift to fix:**
- Multiple kickers across site at 11.5px and 11.52px sizes; tighten to strict 11.
- Some kickers using `letter-spacing: 0.18em` instead of 0.22em — pick one (recommend 0.22em as the canonical, 0.18em reserved for *dense data* contexts like episode card series tags).

### 1.9 Italic deck (subhead under H1)

```
font-family: var(--font-serif)     /* Newsreader */
font-style: italic
font-size:   clamp(20px, 1.8vw, 25px)  /* masthead */
font-size:   clamp(17px, 1.5vw, 19px)  /* shelf subtitle */
line-height: 1.48 — 1.55
text-wrap: pretty
max-width: 36rem
```

### 1.10 Body — long-form prose

```
font-family: var(--font-serif)
font-size:   clamp(17px, 1.55vw, 19px)
line-height: 1.7
color: var(--ljos) on dark / var(--skra-djup) on cream
column max-width: 46rem (article body) / 50rem (Foundation/Prophecy)
```

### 1.11 Drop cap — when used

Two-tier system. Don't mix.

```
/* Standard editorial drop cap (Foundation, Prophecy, BaenDagsins) */
float: left
font-family: var(--font-serif)
font-style: normal (NOT italic, even if surrounding paragraph is italic)
font-size:   clamp(46px, 5vw, 62px)   /* ~2.5 line-heights */
line-height: 0.85
color: var(--gull)
opacity: 0.85
margin-right: 12px
margin-top: 4px — 6px
letter-spacing: -0.02em
```

The earlier 64–96px drop cap was too big and was drifting toward "logo" not "drop cap." Locked at smaller scale.

### 1.12 Meta line — author/date/duration

```
font-family: var(--font-sans)
font-size: 11px (small) / 11.5px (medium) / 12px (in cards with more breathing)
font-weight: 600 — 700
letter-spacing: 0.18em       /* canonical — was 0.14em, swept 2026-04-26 */
text-transform: uppercase
color: var(--steinn) on dark / var(--skra-mjuk) on cream
gap: 10px — 14px between items
separator: span with opacity 0.4 — 0.5
```

**Rationale for 0.18em:** Sits one notch below the §1.8 kicker (0.22em) so meta lines and kickers read as one tracked-uppercase family rather than two textures. The earlier 0.14em was technically in spec but visibly looser than the kicker, breaking cohesion on every page.

---

## 2. Color hierarchy — the rules

### 2.1 Token roles (locked)

| Token | Role | Usage |
|---|---|---|
| `--nott` `#14120F` | Cathedral arrival, mastheads | Page mastheads, hero sections |
| `--mold` `#1B1814` | Page chrome / `<main>` bg | Always set as `<main>` bg so footer gradient blends |
| `--torfa` warm-medium-brown | Card chrome on dark | OnAirRibbon ribbons, prayer cards on dark |
| `--skra` `#F3EDE0` | **Cream sanctuary body** | The default for any reading/browsing surface |
| `--skra-warm` `#EBE2D0` | **Pergament tonal variant** (solid) | Section breathing between cream sections — never use rgba pergament tints at section level |
| `--skra-djup` `#1B1814` | Ink on cream | Body text on cream |
| `--skra-mjuk` `#4A4339` | Soft ink on cream | Secondary text, captions, meta |
| `--ljos` `#F6F2EA` | Light text | Primary text on dark |
| `--moskva` `#B9B2A6` | Mist text | Secondary text on dark |
| `--steinn` slate | Tertiary on dark | Captions on dark |
| `--gull` gold | Ornament + cream-section kicker | Section openers, gold rules, kickers on cream |
| `--kerti` amber | **CTA only, once per page** | Primary action button (Horfa, Skrifa bæn, Senda inn, Styðja) |
| `--nordurljos` slate-blue | Wayfinding | Page-section kickers on dark mastheads, navigation |
| `--blod` red | Live signal | NÚ Í BEINNI pill, live broadcast indicator |

### 2.2 The "amber appears once per page" rule

`--kerti` amber is reserved for the **single primary action** on each page. Never multiple amber CTAs on the same page.

**Audit findings:**
- /heim has amber on Hero "Horfa í beinni" CTA. Then StyrkjaBand "Styðja Omega" is also amber. **Two amber CTAs on /heim → tension.** Either:
  - StyrkjaBand stays amber (donor anchor is the page's true single CTA) and Hero Horfa becomes ghost
  - OR Hero Horfa stays amber and StyrkjaBand becomes ghost with amber accent line only
- Hero is the bigger signal. **Recommendation: Hero gets the amber. StyrkjaBand becomes ghost button** with kerti-tinted gradient backing (which it already has — the gradient is already kerti, just the button needs to ghost out).

### 2.3 Section background sandwich

Locked rhythm for **reading-focused** pages (/baenatorg, /israel, /sermons, /greinar):

```
DARK masthead (--nott)
  ↓ hard cut (border-bottom 1px solid var(--border))
CREAM body (--skra)
  ↓ optional pergament shelf (--skra-warm) for tonal breathing
CREAM body (--skra)
DARK closing anchor (--nott or --mold)
  ↓ Footer
```

For **broadcast-focused** pages (/heim, /live):

```
DARK Hero (Fraunces display, photographic)
DARK utility chrome (OnAirRibbon)
  ↓
CREAM sanctuary (4-5 sections)
  ↓
DARK closing (Israel teaser, donor band, legacy)
  ↓ Footer
```

---

## 3. Card grammar

### 3.1 Poster card (4:5) — series shows, documentaries, homepage VOD

The standard "show" card across the site. Used wherever a single series or documentary is the focus.

**Spec:**
```
aspect-ratio: 4 / 5
border-radius: var(--radius-sm)
background: rgba(63,47,35,0.1) (cream context) / var(--nott) (dark context)
box-shadow: 0 14px 32px -22px rgba(20,18,15,0.4)
overflow: hidden

/* Image fills */
img { object-fit: cover; transition: transform 600ms cubic-bezier(0.2,0.7,0.3,1); }

/* Bottom gradient for title legibility */
.gradient {
  position: absolute; left:0; right:0; bottom:0; height: 60%;
  background: linear-gradient(to bottom, rgba(20,18,15,0) 0%, rgba(20,18,15,0.85) 100%);
}

/* Series tag — top left */
.tag {
  position: absolute; top: 12px; left: 12px;
  padding: 5px 10px;
  background: rgba(20,18,15,0.7); backdrop-filter: blur(8px);
  color: var(--ljos);
  font: 700 10px var(--font-sans);
  letter-spacing: 0.18em; text-transform: uppercase;
  border-radius: 3px;
}

/* Duration tag — top right (same shape, different content) */

/* Title overlay — bottom-left, 14px from each edge */
h3 {
  position: absolute; left: 14px; right: 14px; bottom: 14px;
  font: 400 clamp(17px, 1.5vw, 22px)/1.2 var(--font-serif);
  color: var(--ljos);
  text-shadow: 0 1px 14px rgba(0,0,0,0.55);
  text-wrap: balance;
}
```

**Hover (lock):**
```
transform: translateY(-3px);
img: scale(1.04);
play-button overlay: opacity 0 → 1;
box-shadow deepens
transition-duration: 320ms cubic-bezier(0.2,0.7,0.3,1)
```

**Drift to fix:**
- /sermons SeriesShelf cards use translateY(-2px) — should align to -3px (or pick one and apply uniformly).
- /heim UrDagskranni cards (just built) use translateY(-3px). Lock /sermons to match.
- Hover image scale: SeriesShelf 1.03, UrDagskranni 1.04 — **lock at 1.04**.

### 3.2 16:9 episode rail card — newest/recent

The "Apple-TV-up-next" rail style.

**Spec:** Same structure as 3.1 but **aspect-ratio: 16/9** + horizontal-scroll snap container.

**Locked usage:** /sermons NewestRail. (Could be added to /heim as a "Vikan á Omega" rail later.)

### 3.3 Editorial featured card — large image + text right
The "featured Sunday / featured article" hero card pattern.

**Spec:**
```
display: grid;
grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
gap: clamp(32px, 5vw, 64px);
align-items: center;

.image {
  aspect-ratio: 16/10;        /* lock — same on /sermons FeaturedSunday and /greinar Brennidepill */
  border-radius: var(--radius-md);
  box-shadow: 0 30px 60px -32px rgba(20,18,15,0.4);
}

/* Body side: kicker → title → italic excerpt → gold rule (40px) → byline → CTA */
```

**Drift to fix:**
- /greinar Brennidepill uses 4:3 image. **Change to 16:10** to match /sermons FeaturedSunday and /heim FeaturedSunday.

### 3.4 List row — chronological archive

```
display: grid;
grid-template-columns: 120px 1fr auto;
gap: clamp(20px, 3vw, 32px);
padding: clamp(18px, 2vw, 22px) 20px;
border-bottom: 1px solid var(--border) | rgba(63,47,35,0.12);

.thumb { aspect-ratio: 1/1; max-width: 120px; }
h3   { clamp(18px, 2vw, 22px); }
.meta { 11px tracked uppercase 0.1em; }
arrow → on right (≥ 640px viewport)
```

**Locked usage:** /greinar Safnið, /israel/greinar list.

### 3.5 Door tile — section navigation grid (4-up)

The /israel doors pattern. Used for "what's inside this section" navigation.

**Spec:**
```
min-height: 280px;
padding: clamp(24px, 2.5vw, 32px);
background: <warm cream tint, varied per door>;
border: 1px solid rgba(63,47,35,0.16);
border-radius: var(--radius-md);

/* Top row: kicker (left) + chapter number (right, italic 14px) */
/* Title h3 */
/* Italic descriptor */
/* Bottom row: 32px gold rule + "Áfram" tracked uppercase */
```

**Locked usage:** /israel doors. Could be replicated on a future hub-style /heim "doors" row if needed.

---

## 4. Ornament vocabulary

Currently four ornament patterns exist; canonicalize to **three** with locked usage.

### 4.1 Section opener — gold rule + dot + faded rule (asymmetric)

```jsx
<div aria-hidden style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
  <span style={{ width: '32px', height: '1px', background: 'var(--gull)' }} />
  <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2" fill="var(--gull)" /></svg>
  <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.18)' }} />
</div>
```

**Locked usage:** Section anchor H2 openings. /israel Foundation, /israel Prophecy, /heim UrDagskranni. 
**Apply also to:** /sermons SeriesShelf headers (currently no ornament), /greinar Ritstjórarval/Safnið headers.

### 4.2 Centered ornament — short rule + small mark + short rule (symmetric)

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '20rem', margin: '0 auto' }}>
  <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.22)' }} />
  <svg ... centered mark (circle dot or 8-point star) />
  <span style={{ flex: 1, height: '1px', background: 'rgba(200,138,62,0.22)' }} />
</div>
```

**Locked usage:** Centered editorial moments — /heim BaenDagsins (small dot), /israel PrayerCall (8-point star).

### 4.3 Byline rule — 52px gold hairline

```css
width: 52px; height: 1px; background: var(--gull); margin: 34px 0 20px;
```

**Locked usage:** Mastheads — between byline-row and the kicker-rule (under italic excerpt). Used on every editorial H1 masthead.

**Drift to fix:**
- PullQuote currently uses *inline* "—— NÝJASTA GREIN ——" pattern (kicker between two short rules). This is a 4th ornament. **Replace with 4.2 centered ornament** above the kicker — single ornament vocabulary.

---

## 5. Transition language

### 5.1 Dark → cream

```css
border-bottom: 1px solid var(--border);   /* on the dark section */
/* Cream section starts cleanly with no overlap */
```

Hard cut. Magazine convention. No gradient transitions (those caused the Bænatorg banner nightmare earlier in development).

### 5.2 Cream → cream-warm (pergament)

```css
border-top: 1px solid rgba(63,47,35,0.12);   /* on the pergament section */
```

### 5.3 Cream-warm → cream (back to cream)

Same hairline as 5.2, on the next cream section's top.

### 5.4 Cream → dark (closing)

Cream section ends; dark section starts cleanly. **Optional gold-rule flourish** (4.2 centered ornament) at end of cream OR top of dark, never both.

---

## 6. Motion language

```css
/* Standard editorial transitions */
transition-duration: 320ms;
transition-timing-function: cubic-bezier(0.2, 0.7, 0.3, 1);

/* Card hover */
transform: translateY(-3px);             /* lift */
img: transform: scale(1.04);              /* zoom */
box-shadow: 0 28px 56px -28px rgba(20,18,15,0.55);  /* deepen */
play-button-overlay: opacity 0 → 1;       /* reveal */
duration: 320ms (lift) / 600ms (image scale) / 280ms (play reveal)

/* Live pulse — breathing animation on prayer/live dots */
@keyframes candle-breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}
```

**Drift to fix:** /sermons SeriesShelf hover `translateY(-2px)` should be -3px to match the rest of the site.

---

## 7. Hub commitments — what every page must communicate

This is the part the cathedral aesthetics doesn't naturally cover. The site is a 24/7 broadcast hub — these signals are non-negotiable on every page:

### 7.1 Live presence — visible from any page

The Navbar already has a "NÆSTA SENDING" link with a slate-blue dot. **That's the persistent live signal across all pages.** Verify it's:
- Always visible in the navbar
- Color: `--blod` (red) when on-air, `--nordurljos` (slate-blue) when off-air
- Text updates: "NÚ Í BEINNI" / "NÆSTA SENDING"

The `OnAirRibbon` on /heim shows the program-level signal when data exists. **When schedule data is missing, show a fallback:** "Næsta sending: Sunnudagssamkoma · Sunnudagur kl. 11" or similar — never let the ribbon disappear, it's the heartbeat.

### 7.2 Cross-media wayfinding — three clicks rule

From any page, a viewer should reach all four content types in ≤ 3 clicks:
- **Live** → /live (navbar, always visible)
- **VOD (Þáttasafn)** → /sermons (navbar)
- **Articles (Greinar)** → /greinar (navbar)
- **Courses (Námskeið)** → /namskeid (navbar)

Verify navbar carries all four. ✓ (already does)

### 7.3 Community presence — alive signals

The site is a hub. It should feel inhabited.

- **Prayer wall traffic** — `/baenatorg` shows total count; /heim PrayerTicker rotates anonymized prayer lines. ✓ exists
- **Live prayer pulse** on /live ("X bænir með þessari útsendingu núna"). ✓ built earlier today
- **Newsletter signup** somewhere — currently scattered. Should it have a persistent home?

### 7.4 Equal citizenship — articles + courses NOT second-class

Currently /greinar got the cathedral redesign, /namskeid did not. /namskeid is the **e-course surface** Hawk just confirmed will be major in 12 months.

**Action:** /namskeid needs the same redesign treatment as /greinar/sermons. Editorial cathedral H1, cream body with course cards, dark closing anchor.

---

## 8. Drift log — fix list

Sorted by impact, not by file.

| Priority | Page | What | File |
|---|---|---|---|
| 🔴 High | /namskeid | Untouched by redesign — still uses old `var(--accent)` and old layout. Needs full cream-rhythm redesign | `src/app/namskeid/page.tsx` |
| 🔴 High | /give | Untouched — H1 76px Newsreader, no body sections, all dark | `src/app/give/page.tsx` |
| 🔴 High | /vitnisburdur | Untouched | `src/app/vitnisburdur/page.tsx` |
| 🔴 High | /about | Untouched | `src/app/about/page.tsx` |
| 🟡 Med | /heim | UrDagskranni h2 at 48px; should be 40px (Shelf H2) | `src/components/home/UrDagskranni.tsx:79` |
| 🟡 Med | /heim | Hero amber CTA + StyrkjaBand amber CTA = two amber moments. Decide which keeps amber, ghost the other | `src/components/home/HeroV2.tsx` + `StyrkjaBand.tsx` |
| 🟡 Med | /sermons | NewestRail h2 at 38px; should be 40px | `src/components/sermon/NewestRail.tsx` |
| 🟡 Med | /sermons | FeaturedSunday h2 at 44px; either lock at 40 (Shelf) or 44 (introduce "Featured H2" tier and apply to /heim too) | `src/components/sermon/FeaturedSunday.tsx` |
| 🟡 Med | /sermons | SeriesShelf headers have NO ornament; add §4.1 gold-rule-and-dot opener | `src/components/sermon/SeriesShelf.tsx` |
| 🟡 Med | /sermons | SeriesShelf hover translateY(-2px); align to -3px | `src/components/sermon/SeriesShelf.tsx` |
| 🟡 Med | /greinar | Brennidepill image aspect 4/3; change to 16/10 to match featured-card grammar | `src/app/greinar/page.tsx` (FeaturedArticle component) |
| 🟡 Med | /greinar | Ritstjórarval/Safnið headers have NO ornament; add §4.1 | `src/app/greinar/page.tsx` |
| 🟡 Med | /heim | OnAirRibbon disappears when no schedule data — add fallback text so the live signal is never absent | `src/components/home/OnAirRibbon.tsx` |
| 🟡 Med | /heim | PullQuote ornament (word-between-rules) is a 4th ornament pattern; replace with §4.2 centered-mark above kicker | `src/components/home/PullQuote.tsx` |
| 🟢 Low | All | Section kickers drift between 11 / 11.5 / 11.52 px and 0.18 / 0.22 em letter-spacing — sweep and lock | site-wide |
| 🟢 Low | /baenatorg | Right-side epigraph reference is `Matteusarguðspjall 11:28` (full liturgical), site convention is `Matteus 5:3–10` (short). Decide: full as deliberate reverent treatment OR consistent short. Currently inconsistent | `src/app/baenatorg/page.tsx` |
| 🟢 Low | /heim | OnAirRibbon when populated — verify it visually matches Live ribbon styling | `OnAirRibbon.tsx` |
| 🟢 Low | All sermon-detail | `/sermons/[id]` page hasn't been audited or brought into the cathedral rhythm. Currently uses ChapterList/ThreadsSidebar — should keep features but match new tokens | `src/app/sermons/[id]/page.tsx` |

---

## 9. Polish ripple — proposed execution order

Once Hawk approves this doc, execute in this order to maintain coherence:

1. **Sweep kicker drift** (§1.8 lock) — single-file find/replace `11.5px → 11px`, `0.18em → 0.22em` where applicable.
2. **Lock H2 sizes** (§1.4 Shelf H2) — UrDagskranni, NewestRail, FeaturedSunday, Brennidepill alignment.
3. **Add §4.1 ornament to /sermons SeriesShelf and /greinar Ritstjórarval/Safnið.**
4. **Fix amber-once rule** on /heim — pick which CTA keeps amber.
5. **Brennidepill image aspect 4:3 → 16:10.**
6. **Hover lift -2 → -3** on SeriesShelf.
7. **OnAirRibbon fallback text** so live signal never disappears.
8. **PullQuote ornament** swap to §4.2.
9. **Sermon detail page audit + token sync** (`/sermons/[id]`).
10. **/give, /vitnisburdur, /about, /namskeid** — full cathedral-rhythm redesigns. /namskeid is highest priority since courses are growing content type.

After step 10 the site will feel made by one hand.
