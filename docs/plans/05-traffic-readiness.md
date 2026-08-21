# Plan 05 — Traffic readiness (2026-08-21)

The moment: Birkir/Pikk ads are weeks away, the devotional package is arriving
from BookForge, and the site hasn't had attention in ~7 weeks. The strategy
docs (00-04) still stand; this is the execution list that makes the site
READY TO CATCH what the ads bring. Guiding rule from the research pack:
paid traffic without capture is worthless — everything below serves capture,
rhythm, or credibility.

## A. The catch — build before a single ad runs

1. **Devotional machine** (the centerpiece):
   - Dedicated landing page: one promise, one field, one button, one sample
     devotional visible. This is THE ad destination; cost-per-signup is the
     metric.
   - Daily sender: Vercel cron 07:00 Reykjavík → today's daily_words entry →
     all confirmed subscribers in the 'daglegt-ord' segment. Brand template,
     credit line, one-click unsubscribe (exists).
   - Re-enable double opt-in (was disabled only because the domain wasn't
     verified; mail.omega.is is verified now). Deliverability depends on it.
   - Resend plan: 100 subscribers × daily = 3k emails/mo = free-tier ceiling.
     Success requires the $20/mo plan. Budget it on day one.
2. **BookForge intake**: onboard omega-tv as a consumer (protocol at
   ~/Claude Cowork/Consumers/) and build the import for the devotional
   package → daily_words with future dates. Load a 30+ day runway before
   launch. Open content questions: titles? length? exact credit line/rights?
3. **Deploy** — activates the production Resend fix (key + from-address are
   set in Vercel env but only take effect on next deploy).
4. **Hero banner v2** (Hawk's request): new words that point the front door
   at the daily rhythm + signup, not just identity. Proposal below; image
   family stays cinematic.
5. **Facebook facelift applied** (Hawk's 10 minutes; kit ready since July in
   design/facebook/). The page must match the brand before ads send people
   near it.

## B. Credibility cleanup — the "been a while" list

6. **File the 37 orphan episodes.** 37 of ~57 published episodes have no
   series. This is why the same faces repeat in hero + rails. I file them
   via transcripts, create missing series with make-show-poster, verify
   /sermons. Fixes variety everywhere at once.
7. **Thumbnails**: UrDagskranni forces TV frames into 4/5 portrait — faces
   become passport photos. Switch the rail to 16:9 ThumbnailFrame (one-line
   fix), and re-pick the worst frames via the poster machine (human-select
   flow proven in July).
8. **Description sweep**: regenerate the pre-July "Í þessum kraftmikla
   þætti…" descriptions with the improved prompt (live in prod since the
   player-fix deploy). The visible cards on /sermons still carry the old
   cheese.
9. **Featured-picker variety guard**: hero feature and rail should not show
   the same series/speaker twice when alternatives exist.

## C. Compliance — before pixel, before scale

10. **GDPR consent banner: confirmed MISSING (checked 2026-08-21).** Must
    ship before Birkir installs a Meta pixel. Keep it honest and minimal:
    no tracking cookies today → a lightweight banner only when the pixel
    arrives, but build it now so it's not the blocker.
11. **Ljósið hygiene** (ads phase 2, not now): clear demo gifts, real budget
    from Eiríkur, before any paid traffic points at /studio.

## D. Measure

12. Signups/day + consent source visible in /admin (subscribers table
    already records consent_source — surface it). The four numbers weekly:
    verified emails, prayer requests, social→site sessions, letter opens.
    Birkir's campaign objective: cost per signup on the landing page.

## Execution order

Week 1: A1 + A2 + A3 (machine + intake + deploy), 6 (orphans) in parallel.
Week 2: 7 + 8 (thumbnails + descriptions), A4 hero after Hawk picks words,
A5 facelift, 10 banner. Then launch rhythm when the 30-day runway is loaded.

## Decisions Hawk owns

1. BookForge consumer onboarding — say yes and it's 2 minutes.
2. Devotional content: titles? typical length? exact credit line + rights?
3. Hero words — proposal: keep the prayer line's warmth but point forward:
   kicker stays; H1 "Orð Guðs inn í daginn þinn." sub: "Bein útsending,
   bænatorg og orð dagsins í pósthólfið þitt, á hverjum morgni." CTA →
   the signup. (Alternates on request.)
4. Launch date ambition for the daily email (drives the runway math).
