# Omega Stöðin — Redesign Handoff

**Period:** 2026-04-23 → 2026-04-26
**Branch:** `experiment/vellum-prayer-cards` (renaming pending)
**Build status:** `pnpm build` green — 56 pages, no type errors
**Companion docs:**
- [`design-system.md`](./design-system.md) — locked house style (read this first)
- [`brand-guide.md`](./brand-guide.md) — brand identity, palette, typography roles
- [`content-pipeline.md`](./content-pipeline.md) — how content gets into the site
- [`STATUS.md`](../STATUS.md) — running session log

---

## What this redesign is

Omega Stöðin — Iceland's only Christian television network since 1992 — moved from a four-eras patchwork (Netflix-clone homepage, brochure-style about, transactional dark forms, mixed token systems) to **one cohesive editorial publication**. Every reading and watching surface now uses the same cathedral rhythm: dark mastheads frame, cream sanctuary holds the body, dark anchors close.

The site is a **24/7 broadcast network + media hub** — not a magazine, not a streaming service, but both. The design system has to make video, articles, and courses (growing in 12 months) all feel like full citizens.

---

## The locked system (one-paragraph version)

**Two H1 registers** — Display Fraunces 60–144px on cinematic broadcast pages (`/heim`, `/live`); Editorial Newsreader 40–70px on cathedral mastheads everywhere else. **Three H2 tiers** — Section anchor 32–48px (long-form openers), Featured 28–44px (featured cards), Shelf 28–40px (rails/grids). **Section kickers** strict 11px / 0.22em / uppercase, gold on cream sections, slate-blue on dark mastheads. **Single amber CTA per page** — `--kerti` reserved for the page's primary action; everywhere else amber appears it's a status accent (live pulse, active states). **Three ornament patterns** — gold rule + dot opener (sections), centered rule + mark (closing/featured moments), 52px byline-rule (mastheads). **Cream registers** — `--skra` for body sanctuary, `--skra-warm` solid token for pergament tonal variation (never rgba pergament tints at section level — they bleed through to dark page wrappers). **Card grammar** locked to specific aspects: poster 4:5, episode rail 16:9, editorial featured 16:10, list row 1:1 thumb. **Motion** — hover lift -3px, image scale 1.04, 320ms cubic-bezier(0.2,0.7,0.3,1).

The full spec is in `design-system.md`. Apply it on every new component.

---

## What got redesigned (every surface)

| Surface | What changed | Notes |
|---|---|---|
| **`/heim`** (homepage) | 10-section sandwich: dark Hero → dark OnAirRibbon → cream PrayerTicker → cream FeaturedSunday → cream UrDagskranni (poster cards) → cream BaenDagsins (manuscript page, ornament + drop cap) → pergament PullQuote → dark IsraelTeaser → dark StyrkjaBand (ghost CTA — amber-once rule) → dark Legacy34Years | OnAirRibbon falls back to "Sendingar daglega" when no schedule data — live signal never disappears |
| **`/live`** | LivePrayerPulse (in-broadcast tap-to-pray counter, atomic Postgres RPC, 15s polling), in-place SendaBaenButton modal so viewers don't leave the broadcast | Migration `20260425_live_prayer_pulse.sql` applied |
| **`/baenatorg`** (prayer wall) | Editorial cover masthead with verified Matt 11:28 epigraph (2007 Biblían), cream feed with prayer cards, magazine convention hard-cut (no gradient transitions). Mojibake repair script for legacy data | `scripts/clean-prayer-junk.ts` repaired Anna's prayer + unapproved a duplicate |
| **`/israel`** | 8-section watchman composition: Isaiah 62 masthead with embedded "Næsta sending" ribbon, doors grid (4 chapter-numbered tiles), Genesis 12 Foundation, Greinar rail, Hátíðir rail (Hebrew script + niqqud), Documentaries (poster style), Ezekiel 37 Prophecy, Psalm 122 Prayer call | Every Bible reference verified against 2007 Biblían at biblian.is |
| **`/israel/greinar`** | Filtered article list with cream body, magazine masthead | Articles tagged `category='israel'` populate it |
| **`/israel/heimildarmyndir`** | Documentary archive, poster-style cards, cream body | `getIsraelEpisodes()` filters episodes by series title pattern |
| **`/sermons`** (Þáttasafn) | 9-section editorial library: masthead → FeaturedSunday → NewestRail (16:9 Apple-TV-up-next) → 6 SeriesShelves by category (Útsendingar Omega, Söfnuðir á Íslandi, Frá útlöndum, Heimildarmyndir, Lofgjörð, Barnaefni) | Migration `20260425_series_category.sql` applied. Mock fallback at `src/lib/mock-series.ts` so day-1 page renders populated |
| **`/sermons/show/[slug]`** | Per-series catalog page with cinematic masthead + episode list | New route — links from any series card |
| **`/sermons/[id]`** (sermon detail) | Token sync (h1 weight 700→400, 52px gold rule between title and description). Stays dark — watching surfaces work in dark like Apple TV/YouTube | Did NOT regress ChapterList / ThreadsSidebar / share rail / GluggiCard related — those keep their feature-rich layouts |
| **`/greinar`** | Magazine front: dark masthead with "Hefti X · Apríl 2026" issue stamp → cream Brennidepill (cinematic featured, 16:10 image) → pergament Ritstjórarval picks → cream Safnið list rows. Token-aware ArticleListRow + LetterPlaceholder | Articles category column added (`articles.category`), used by /israel/greinar |
| **`/greinar/[slug]`** | Cream reading frame (was already settled before this sweep) | Drop cap removed from article body per Codex correction earlier |
| **`/namskeid`** (courses index) | Cathedral grid of CoursePosterCard (new component, 4:5 poster matching /sermons aesthetic). Old CourseCard.tsx Apple-TV-Netflix era stays in tree but unmounted | LeidCard with module ladder reserved for course detail |
| **`/namskeid/[slug]`** | Cinematic dark hero with poster backdrop → cream curriculum body (modules + lessons with state markers: completed / current / locked / free preview) → pergament support card | Lesson state UX preserved from older design |
| **`/give`** (Styrkja) | Full 5-section cathedral: dark hero → pergament Sowing → cream DonationClient (cadence toggle + tier cards + custom amount + form + allocation sidebar) → cream OtherWays + bank transfer block → dark ScriptureFooter. State logic untouched | Real payment processor integration (Valitor/SaltPay/Stripe) remains a separate task |
| **`/vitnisburdur`** | Dark masthead → cream form section on pergament card → cream testimonial cards. TestimonialForm rewrote from Tailwind+lucide to inline cream-aware styling | Form chrome reads on cream now |
| **`/about`** | 5-section cathedral: dark Iceland hero → cream pull-quote → cream timeline (4 milestones with archival photo) → pergament 4-pillar values → dark grayscale gallery (12 photos) | Token cleanup from old `--accent`/`--text-primary` system |

**8 layout-level components** built from scratch during this period:
- `CoursePosterCard`, `IsraelMasthead`, `IsraelBroadcastBand`, `IsraelDoorsGrid`, `IsraelHolidaysRail`, `IsraelDocumentaries`, `IsraelPrayerCall` (Israel section), `SermonsMasthead`, `FeaturedSunday`, `NewestRail`, `SeriesShelf` (sermons section), `IsraelTeaser` (homepage)

**3 components made register-aware** (work on dark and cream):
- `ArticleListRow`, `LetterPlaceholder`, `PrayerTicker`, `BaenDagsins`, `UrDagskranni`, `PullQuote`

**Migrations applied** (additive, safe):
- `articles.category TEXT` — section-tag column
- `series.category TEXT` — section-tag column
- `schedule_slots.live_prayer_count INT` + `increment_live_prayer_count(uuid)` RPC

---

## Major decisions (worth preserving)

These are non-obvious choices that shaped the work. If a future agent or designer is tempted to undo any of them, here's why they exist.

**1. Cream sanctuary, dark anchors.** Reading content lives on cream (`--skra` body, `--skra-warm` pergament for tonal breathing). Dark frames it as masthead and closing anchor. The cathedral psychology: cream = warmth, hospitality, sustained attention; dark = gravity, contemplation, arrival. Sustained dark reads as oppressive; sustained cream reads as alive. Redesigned pages mostly run cream-leaning.

**2. Sermon detail and donation form stay dark.** Watching pages and transactional pages work in dark — same logic Apple TV / YouTube / Netflix follow. Light spill on a watching surface fights the video; checkout-stack chrome on cream feels like a mismatch. Two exceptions to the cream-leaning rule, both deliberate.

**3. Amber appears once per page.** `--kerti` is reserved for the single primary action — Hero Horfa, Senda bæn, Styðja, etc. Every other place amber wants to appear (cards' active states, tier card borders, allocation bar gradient) it's a status accent, not a CTA. /heim originally had three amber CTAs (Hero + StyrkjaBand + FeaturedSunday); now has one.

**4. No gradient section transitions.** Dark→cream uses `border-bottom: 1px solid var(--border)` (hard cut, magazine convention). Long photo-to-cream gradients caused visual banding earlier in development that no amount of opacity-stop tweaking fixed. Hard cuts are the rule.

**5. No rgba pergament at section level.** Pergament tonal variation uses solid `--skra-warm: #EBE2D0`. Earlier code used `rgba(212,194,162,0.18)` which on a page with `<main>` bg `--mold` (dark) computed to dark warm-brown, not cream. The transparent overlay only works inside an explicitly-cream parent — i.e. for empty-state cards inside a cream section.

**6. Bible references verified.** Every Scripture quote in the site was fetched from biblian.is (2007 Biblían) before shipping. Hawk specifically holds this standard. The earlier 1981 wording (e.g. Matt 11:28 with "allir...hlaðnir") was replaced everywhere with 2007 wording ("öll...hlaðin"). When adding new verses: verify against biblian.is before committing.

**7. Articles stay Hawk's voice.** No auto-generation from sermons. Every article on `/greinar` or `/israel/greinar` is human-authored. Empty-state placeholders honor this ("Greinar eru skrifaðar af sannfæringu, ekki af áætlun").

**8. No Star of David / flag motifs on `/israel`.** The section voice is biblical-pastoral, not partisan. Restraint is the rule. Hebrew script *with niqqud* is used (cultural respect), but no flag iconography.

**9. Mock data fallback pattern.** Empty database categories show curated mock data so pages render populated on day one. When real data exists for a category, mocks for that category drop. See `src/lib/mock-series.ts` for the pattern. Don't replace mocks with `coming soon` cards — empty-state cards are a different thing (used when an entire content type is empty, like `/israel/greinar`).

**10. Live signal never disappears.** OnAirRibbon falls back to "Sendingar daglega" when no schedule data exists. The heartbeat of a TV network homepage shouldn't blink off; it just gets quieter.

---

## What remains — none of it is design work

The cathedral redesign is complete across every public surface. What's left is content and backend:

| Item | Type | Notes |
|---|---|---|
| Hawk-authored Israel articles | Content | Once 1–2 are tagged `category='israel'`, /israel and /israel/greinar both populate |
| Real Sunnudagssamkoma episodes | Content | Once seeded into `series` + `episodes` with `slug='sunnudagssamkoma'`, FeaturedSunday on /heim and /sermons goes from mock to real |
| Tag existing series with `category` | Data | Cheat sheet in design-system.md §1.4 audit table or design-system.md §2.1. Manual SQL or admin UI |
| ONE FOR ISRAEL email response | External | Pending — see drafted email earlier in conversation |
| Donation processor integration | Backend | Valitor / SaltPay / Stripe. Submit currently flips to honest thank-you state |
| Branch rename / merge to main | Git | `experiment/vellum-prayer-cards` is now misleading. Rename to `feat/cathedral-redesign` or merge straight |
| `pnpm build` smoke test on every page | QA | Already green, but visual QA across all 16 surfaces is worth a final pass |

---

## How to add a new page (or component) without breaking cohesion

**The 5-step recipe:**

1. **Pick a register** — is this a reading surface (cream body) or a watching/transactional surface (dark)?
2. **Build a masthead** — article-cover pattern: kicker (`--gull` on cream, `--nordurljos` on dark) + Editorial H1 (Newsreader 400, clamp 40–70px) + italic Newsreader deck + 52px gold rule + byline meta line. Look at `/baenatorg` or `/israel` for the canonical version.
3. **Build the body** — for reading: cream `--skra` sections separated by hairline borders, optional pergament `--skra-warm` for tonal breathing. For watching: stay dark.
4. **Section ornaments** — gold rule + dot opener (§4.1 in design-system.md) above shelf headers. Centered ornament (§4.2) for closing or featured moments.
5. **Cards** — use the locked grammar: poster 4:5, rail 16:9, featured 16:10, list row. Hover -3px / scale 1.04 / 320ms cubic-bezier.

**Avoid:**
- New ornament shapes (we have three; that's enough)
- New H2 sizes (we have three tiers; that's enough)
- Multiple amber CTAs per page (one per page)
- Gradient transitions between section registers
- rgba pergament at section level (use the solid `--skra-warm` token)
- Tailwind classes mixed with inline styles (the rest of the redesign is inline styles for predictability — pick one and stick with it)

---

## Saved memories worth knowing

These are written feedback memories the system carries across sessions:

- **No scope-cut when vocational** (`feedback_no_scope_cut_when_vocational.md`) — When Hawk frames work as personally important, build the whole vision, not phases.
- **Verify visual changes in browser before declaring done** (`feedback_verify_visual_changes_in_browser.md`) — After any visual change, navigate Chrome MCP and read computed styles. Don't trust theoretical contrast math.
- **Lead when given lead** (`feedback_lead_when_given_lead.md`) — When handed scope, execute without step-by-step check-ins; recalibrate honestly when context changes.

---

## Where the next eyes should land

When Hawk launches the site publicly, the surfaces that get the most scrutiny in order:

1. `/heim` — first impression. The 10-section sandwich is the showpiece.
2. `/sermons` (Þáttasafn) — the library is where viewers spend time. Posters need to come from real designed art (currently using curated Unsplash IDs as placeholders).
3. `/baenatorg` — community presence. The prayer-of-day, prayer wall, in-broadcast pulse all signal "alive."
4. `/israel` — vocational cornerstone. The watchman frame.
5. `/give` — donor stewardship. The cathedral-cream donation form is the unusual choice; verify it lands.
6. `/sermons/[id]` — every episode click goes here. Stays dark by design.
7. `/namskeid/[slug]` — course detail. As courses ramp up over 12 months, this is the most-used course surface.

The remaining surfaces (`/greinar`, `/israel/greinar`, `/israel/heimildarmyndir`, `/vitnisburdur`, `/about`, `/sermons/show/[slug]`, `/namskeid`) are settled but lower-traffic.

---

## Designer review (2026-04-26) — calibration

A second pair of eyes walked the cathedral and called it correctly: **strong but slightly undisciplined at the edges**. Editorial direction is right (cathedral rhythm, restrained amber, calm spacing); a few pages had crept louder or thinner than the rest.

**The four launch fixes (all applied):**

| Fix | Was | Now |
|---|---|---|
| `/about` H1 | `clamp(48, 8vw, 110px)` — chest-thumping, exceeds Editorial cap | `clamp(40, 5vw, 70px)` — sits inside §1.2 Editorial H1 |
| `/live` H1 | inline override capped `.type-vaka` at 72px — under-scaled for a broadcast hero | inline override removed; `.type-vaka` runs at its native 56–120px Display range |
| 44px H2 drift | UrDagskranni / FeaturedSunday / Brennidepill at 44, undocumented | Codified as **§1.4.5 Featured H2** (`clamp(30, 3.5vw, 44px)`) — a real tier between Section anchor (32–48) and Shelf (28–40). Hierarchy, not sameness. |
| `/baenatorg` deck | Designer flagged "missing italic deck" — actually present at [page.tsx:95–109](../src/app/baenatorg/page.tsx) | Deck exists. Open question: tone is instructional ("Deildu… berðu… ritaðu") rather than inviting. Worth a Hawk-authored rewrite if warmth is the goal. **Not auto-changed.** |

**The bigger concern — "museum editorial."**

The reviewer named the real risk: too much cream / pergament / serif and the site becomes beautiful but sleepy. Omega is a 24/7 broadcaster, not a memorial volume. Three surfaces have to stay alive:

- `/heim` — the punchline. OnAirRibbon, PrayerTicker, IsraelTeaser need to feel like motion. Don't strip movement in pursuit of restraint.
- `/live` — the front door of the channel. Now sized correctly for arrival.
- Sermon CTAs — Horfa moments must feel signal-bright. Amber-once stays, but the one amber has to land hot.

When future polish is applied, the test is: *does this make the page more contemplative or more alive?* For a media hub, contemplative-without-alive is a regression.

**Cohesion items still worth a sweep (P3):**
- Meta-line letter-spacing at 0.14em vs kicker at 0.22em — sweep meta to 0.18em across the site so they read as one family.
- `/sermons` NewestRail h2 at 38px → 40px (Shelf, no ornament; ornament reserved for Featured/Section anchor).
- "FYRIR 1 VIKUM" pluralization on prayer cards (singular: "1 VIKU").
- Door-tile kickers on `/israel` at 0.18em → 0.22em (strict §1.8).
- Navbar OMEGA wordmark — document as logo-treatment exception OR normalize to 11px / 0.22em.

**Score:** Reviewer: ~8.5. Path to 9+ is the four launch fixes (now applied) + the cohesion sweep above + protecting warmth/motion on the broadcast surfaces. The foundation is good; what's left is discipline.

---

## Final word

The site reads as one publication now. The system is locked, the components are register-aware, the typography ladder is enforced, the ornament vocabulary is canonical. From here forward, polish is mechanical: apply spec, verify, ship.

What it's missing isn't more design. It's content. Hawk writes a few articles, the CBN translation pipeline ramps up Israel documentaries, the Sunday service starts hitting `series.slug='sunnudagssamkoma'` in the DB — and the page surfaces that have empty-state placeholders today come alive.
