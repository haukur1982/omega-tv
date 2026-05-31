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

**How it works (M1 + M2 + M3 shipped):**
Azotus finishes translating a video → uploads the subtitled MP4 to Omega's
**VOD Bunny library (628621)** → POSTs an HMAC-signed payload to
`/api/azotus/vod-intake` → a **DRAFT episode** appears in `/admin/drafts`
with Gemini title/description/chapters + 8–12 poster candidate frames →
PosterStudio in `/admin/drafts/[id]` brands 16:9 + 4:5 from your pick →
you review and hit **Vista og birta**. Nothing goes public automatically.

**Actual state — current truth (2026-05-20):**
- **Committed and deployed.** `workers/vod_publisher.py` is on Azotus
  branch `codex/vod-intake-http`; Omega intake + PosterStudio are on
  `experiment/vellum-prayer-cards`, deployed to `omega-tv-lovat.vercel.app`.
- **Proved end-to-end on one real track:** i2620 (Charles Stanley),
  2026-05-18. Bunny GUID `2b386fa3-3862-486f-8074-65e91c8cc7f3`,
  Omega draft `43580ebe-85aa-442c-b196-a0e94e436515`.
- **One delivery failed** on 2026-05-19 18:12 with the generic catch
  message "Unknown intake failure." Commit `e0a2d87` now captures the
  real error in the catch — but Azotus hasn't retried, so we don't yet
  know what broke. Next action: re-fire that one track from the Mac mini
  (`5346e83b-9296-4a3d-87d8-6e65b68ef39c`) and read the real error.
- **Two-station guardrails live:** Mac mini = production deliverer
  (`OMEGA_VOD_DELIVER_ROLE=production`), Mac Studio = dev. Mac Studio
  refuses to deliver unless `OMEGA_VOD_ALLOW_DEV_DELIVERY=1`.
- **Backlog deliverer ready:** `scripts/deliver_vod_backlog.py` on the
  mini will run every COMPLETED Icelandic track through once the one
  stuck delivery is unstuck.
- **No auto-trigger yet (M3 deferred).** Today: manual command per track.

**The path forward:** (1) unstick the 2026-05-19 18:12 failure
(re-fire from the mini, read the now-captured error) → (2) run the
backlog deliverer once that's confirmed clean → (3) only then add the
auto-trigger on Azotus `FINALIZED`.

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

**Strategy — DONE at the nav/IA level (2026-05-17).** The admin sidebar
(`src/components/admin/AdminLayout.tsx`) is now grouped into the four jobs,
**Efni & dagskrá (content pipeline) first** — it's the daily path where
Azotus lands (Innhólf → Þáttaraðir → publish). Four sections that had no
nav entry at all (Bænaátak, Fréttir, Tilvitnanir, Kerfisheilsa) are now
reachable instead of URL-only. Nav-only change — no admin screens
redesigned. On `vellum`, not yet on prod.

What's still open here: the per-screen workflows themselves (esp. the
draft→review→publish flow and the series-cover field) — separate passes.

---

## Immediate decisions (your call — nothing is mid-flight)

1. ~~**Save the Azotus M1 work**~~ — DONE. Committed on
   `codex/vod-intake-http`, two-station guardrails in place.
2. ~~**Prove the VOD feed**~~ — DONE. i2620 went end-to-end 2026-05-18.
3. **Unstick the 2026-05-19 failure** — re-fire from the mini, read the
   now-captured real error from commit `e0a2d87`. ~30 minutes.
4. **Run the backlog** — `scripts/deliver_vod_backlog.py --deliver` on
   the mini to push the existing Icelandic backlog through. Each lands
   as a draft for 2–3 min review.
5. **Pick the thumbnail path** — curated series covers (needs the small
   admin field + photo curation) vs. living on the typographic fallback
   for now.

Remaining design-doc items (not blocking, your pace): `FeaturedSunday`,
the big blue-`--accent` sweep (large, regression-risky — branch-first).
