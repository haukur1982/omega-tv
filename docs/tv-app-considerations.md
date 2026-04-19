# Omega TV — Native TV App Considerations

> **Status: planning / future work.** No code commitment yet.
> Written 2026-04-18 from a conversation with Hawk about bridging the
> generation gap for Omega's viewers (80% over 50).

## The core insight

**Omega's audience is not Gen Z.** 80% of supporters are over 50. Key
implications:

- **AirPlay / Chromecast are non-starters** — these require phone literacy
  + setup friction that alienates the core audience
- **Smart TV apps matter more for Omega than for a typical streaming
  startup** — the 50+ demographic is comfortable on their TV, less so
  on phones/laptops
- **Linear TV broadcast still does heavy lifting** — Omega already
  reaches this audience via cable/satellite. The app is about extending
  that, not replacing it
- **iPad / tablet is the secondary device** — 50+ viewers read and
  watch on iPads, not phones. Responsive web is already well-suited

## The architectural principle — ONE source of truth

Hawk's absolute non-negotiable: *"I don't want to maintain two
systems."* Every content surface (web, TV app, broadcast schedule)
reads from the same Supabase + Bunny backend. The admin flow stays:

```
    /admin/drafts  →  Publish  →  Live on all three surfaces simultaneously
```

```
               ┌─ Supabase + Bunny (single source of truth) ─┐
               │                                              │
       ┌───────┼──────────┬─────────────────┬─────────────────┤
       │       │          │                 │                 │
   omega.is    │      TV App             Linear TV      Mobile / iPad
   (web)       │      (Samsung/LG)       broadcast      (uses web)
               │
        Same episodes,
        same schedule,
        same prayers,
        same Bunny videos
```

The TV app is a **thin client** — UI layer only. Zero duplicate content
management.

## Which TV platforms

**UPDATED 2026-04-18** after market research (see `docs/icelandic-market-strategy.md`).
Earlier recommendation deferred Apple TV and Android TV. That was wrong
for the Icelandic market specifically — they're Tier 1.

**All four are Tier 1:**

- **Apple TV (tvOS)** — iOS has 56.46% Icelandic mobile share; Apple TV is the natural living-room extension. All three major telcos (Sýn, Síminn, Nova) treat it as primary. Swift/SwiftUI.
- **Android TV** — Sýn migrates legacy STBs to Android TV via AminoOS. Being on Google Play Store = automatic distribution into Sýn subscriber fleet + retail Sony/Philips/TCL hardware. Kotlin or React Native.
- **Samsung Tizen** — dominant native Smart TV brand in Iceland (~40% retail). Web-tech (HTML5/JS) — significant code reuse from omega.is.
- **LG webOS** — second native brand (~30% retail). Also web-tech. Code reuse.

**Skip (research-confirmed):**
- Roku — near-zero Icelandic presence, no telco backing. Specific finding: "Allocating development resources to build a proprietary Roku application would yield a negligible return on investment."
- Amazon Fire TV — lacks deep local support.

## Code reuse strategy across four platforms

Samsung Tizen + LG webOS are web-based → one web shell covers both.

Apple TV + Android TV need different approaches:
- **Option A — React Native with TV support** covers both Apple TV and Android TV from one codebase. Single React/TypeScript codebase targeting four platforms (tvOS, Android TV, + wrapped builds for Tizen and webOS).
- **Option B — Native (Swift for tvOS, Kotlin for Android TV)** — highest quality UX per platform but four codebases.

**Recommendation: Option A (React Native + TV).** Rationale:
- Hawk works in TS ecosystem, not Swift/Kotlin
- Code reuse with omega.is is meaningful (business logic, Supabase queries, Bunny embed)
- TV UX doesn't need native-level quality the way an iPhone app does — lean-back UX is simpler than mobile
- Samsung + LG still get their HTML/JS wrappers

Total: **one React Native shell + two web wrappers**. Closer to "one codebase, four distribution targets" than "four separate apps."

## Architecture — the TV app shell

**Build ONE TV-optimized web shell**, then wrap it for each platform with
minimal platform-specific code.

```
omega-tv-app/                (new sibling project or subfolder)
├── shell/                   shared TV-UI codebase (React/Next-lite or vanilla)
│   ├── components/
│   │   ├── TVHome/          lean-back home screen
│   │   ├── TVSchedule/      vertical day list
│   │   ├── TVPlayer/        Bunny player with remote controls
│   │   ├── TVFocus/         D-pad navigation primitives
│   │   └── TVPrayerList/    read-only prayer wall
│   ├── lib/                 re-uses omega-tv/src/lib where possible
│   │   ├── supabase.ts      same client, different env
│   │   └── schedule-db.ts   imported verbatim
│   └── pages/ (or routes)
│       ├── index.tsx        home / featured week / Sunday service
│       ├── beint.tsx        live
│       ├── horfa.tsx        archive browse
│       └── samfelag.tsx     prayer wall (view-only)
│
├── platforms/
│   ├── tizen/               Samsung wrapper (config.xml, splash, icons)
│   └── webos/               LG wrapper (appinfo.json, splash, icons)
│
└── package.json
```

Key design constraints for the shell:

1. **D-pad navigation** — all interactive elements must receive focus from
   arrow keys. Visible focus outlines (4px amber border).
2. **No hover states** — replace all `:hover` with `:focus`. The
   warm-hover pattern becomes warm-focus.
3. **Large typography** — minimum 1.2rem body, 2rem+ headlines. The
   existing Altingi palette + Source Serif 4 scale up well.
4. **Big tap targets** — 60×60px minimum for D-pad selection comfort.
5. **No forms** — signed-out viewers can't submit prayers on the TV. The
   prayer wall shows QR code: "Scan with phone to send a prayer." This
   respects the 50+ audience — a grandchild helps once, done.
6. **Resume state** — remember where viewers left off per video (cookie
   or lightweight account).
7. **Smooth scrolling** — CSS `scroll-behavior: smooth` + momentum on
   focus changes. Don't let the TV feel janky.

## What would differ from omega.is

| Feature                    | Web (omega.is)           | TV App                      |
|----------------------------|--------------------------|-----------------------------|
| Schedule (Dagskráin)       | Horizontal 3-card strip  | Vertical day list, big rows |
| Sermon detail              | 2-col with threads side  | Single col, chapters as big clickable cards |
| Prayer submit              | Inline form              | QR code — "scan to pray"    |
| Nav                        | Top bar, tap/mouse       | Left rail, D-pad focus      |
| Hover effects              | Warm underglow on cards  | Amber focus outline         |
| Search                     | Full-text                | Voice search if platform supports |
| Articles / Magazine        | Reading column           | Skip for v1 — reading is a web task |
| Admin                      | Full                     | None — TV app is read-only  |

Same Supabase, same Bunny, same data, same editorial control. Different
rendering.

## Timeline estimate (UPDATED for four-platform Tier 1)

Assuming Hawk is in the background for review/testing, Claude builds:

| Phase                                            | Duration    |
|--------------------------------------------------|-------------|
| React Native + TV shell architecture + D-pad focus | 2 weeks   |
| TV-optimized Home, Beint, Horfa, Samfelag pages  | 2 weeks     |
| Apple TV (tvOS) wrapper + TestFlight + App Store submission | 2 weeks |
| Android TV wrapper + Play Store submission       | 1–2 weeks   |
| Samsung Tizen wrapper + config + icons + submission | 1–2 weeks |
| LG webOS wrapper + config + icons + submission   | 1–2 weeks   |
| Buffer (Apple review especially can be unpredictable) | 2–3 weeks |
| **Total**                                        | **10–14 weeks** |

Meaningful commitment, but the shared shell means each additional platform
is mostly packaging + submission, not a full rebuild.

## What to NOT do (yet)

- **Don't build a dedicated backend.** The TV app talks directly to the
  same Supabase + Bunny the web uses. No new API layer.
- **Don't gate TV content behind auth v1.** Omega is free. The TV app
  browses the same public VOD. Personal features (watch history,
  favorites) come only after the basic browsing experience is proven.
- **Don't skip the tablet-polish pass first.** An iPad-friendly omega.is
  probably covers a big chunk of the 50+ audience for lower cost than
  launching TV apps. Do the iPad polish before committing to TV.
- **Don't build for Roku or Amazon Fire TV.** Research-confirmed as
  zero-ROI in Iceland.

## Alternative / parallel strategy — telco aggregation

See `docs/icelandic-market-strategy.md` §"Alternative go-to-market".

**Short version:** Omega is already a broadcast network with a signal.
Síminn's Sjónvarp Símans aggregates third-party channels via the Red Bee
Channel Store. Getting Omega carried as a channel in Sjónvarp Símans
Premium reaches 44% of Icelandic households **without building any app**.
Similar opportunities with Sýn and Nova.

This is a Hawk-led business-development track, parallel to (not instead of)
the app build. Potentially faster time-to-reach than our own apps.

## Prerequisites before we start the TV app

Things that should be shipped on omega.is first so the TV app has a
solid base to reflect:

1. ✅ **Content pipeline** — /admin/drafts inbox (shipped today)
2. ✅ **Broadcast-aware home (DagskraStrip)** (shipped)
3. ✅ **Prayer wall** (shipped)
4. ✅ **Scripture threads** (shipped)
5. ⏳ **Tablet polish pass** — big-tap, big-type audit for 50+ viewers
6. ⏳ **Chapter click-to-seek** — nice on web, *essential* on TV
7. ⏳ **Azotus native-IS mode** — so the content pipeline handles 100%
   of video input with no manual upload

Once 5–7 are done, the TV app build can start.

## Answers to Hawk's two explicit questions (2026-04-18)

> **"Can you do a native app?"**

Yes. Primary target: Samsung Tizen + LG webOS (both HTML/JS). Deferred:
Apple TV + Google TV + Roku. Approximate build time: 7–10 weeks with
Hawk in the background.

> **"My main concern is to maintain content so it syncs with what is online."**

Not a concern. Single source of truth architecture: TV app reads from
the same Supabase + Bunny that omega.is reads from. Publish a draft
once at /admin/drafts → appears on all three surfaces (web + TV +
broadcast schedule). No duplicate content management.

## Next step when you revisit this

When you come back to this and decide to build:

1. Read this doc + `STATUS.md` + `docs/content-pipeline.md`
2. Confirm prerequisites above (tablet polish + chapter seek + Azotus)
3. Create a new session scoped to "Omega TV App — Tizen + webOS shell"
4. Start with the focus-navigation primitives in `omega-tv-app/shell/`
