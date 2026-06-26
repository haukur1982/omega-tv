# Move 3 — REACH: clips that travel

**Scope:** reach the generations who never turn on the cable, by turning Omega's 16 published episodes into short reverent vertical clips and pointing a real but tiny social presence back at omega.is. Sequenced last on purpose, and scoped small, because there is no point building a video factory before the cheap bridge is connected and the static social pipeline is even being posted. Includes the Claude Design handoff.

## North star

Lift up Jesus for the whole nation by letting Omega's content travel past the cable wall to the 20s through 50s who will never turn on rás 6, without ever letting the gospel become content that performs. A clip's job is not reach for its own sake. It is to put one true, whole moment of the gospel in front of a stranger's phone and a quiet door back to the full program. Reach is a side effect of faithfulness, not the target. We measure lives touched and doors opened, never likes.

## Principles

- **Ordering is the strategy.** Bridge first, Retain next, Reach last. Zero social referrers today means floor 1 has no tenant. Pointing the hose at the cup beats building a video factory.
- **Prove the cheap thing before the expensive thing.** Post the four static templates that already render in `/admin/social` for two weeks and watch for the first non-zero social referrer. If a tiny team can't sustain even that, don't build clips.
- **Reverence over polish, and the data agrees.** Over-produced video gets far fewer views; lo-fi but real wins. Omega's warm restraint is an advantage on vertical, not a liability. No motion-graphics gold-plating.
- **Two human gates on every clip, always.** A human picks the moment (theology and taste). A human approves the rendered clip before it goes public. The model proposes; the editor confirms. Nothing auto-publishes.
- **Choose clips for what is true and whole, never for predicted spread.** No selecting a moment because emotion travels further. No trend-jacking the season. Drop that vocabulary from the brief entirely.
- **Clips source only from Bunny VOD episodes.** Never the live Restream feed, never the prayer wall. No sensitive prayer text ever touches a clip.
- **No vanity metrics on the reach surface.** No like counts, no view counts shown to users, no follower chrome, no leaderboard. The clip ends on the gospel and one quiet door, not a follow/subscribe stack.
- **Cost-safe by construction.** Every render job inherits one canonical guard set. Manual-trigger only; no auto-propose cron until the guards have run clean for weeks. The runaway must not recur.
- **v1 posting is a human posting the rendered master.** No platform API audits on the critical path; they are weeks of latency.
- **Icelandic is the language and the discipline.** Institutional voice, no em dashes, correct diacritics verified in-browser at every render, short caption lines because Icelandic words run long.

## The experience, end to end

**A stranger's side.** A 28-year-old in Reykjavík who has never watched Omega scrolls a feed and a 35-second clip autoplays muted: the strongest line of a sermon opens on the speaker's face, eye-level, with burned Icelandic captions in the safe middle band. No intro, no chrome. The clip ends on a 1.5-second Omega card: the Ω mark, omega.is, "Sjá alla ræðuna."

If the moment lands, they tap. The caption links to `omega.is/augnablik/[slug]`, Omega's own page, not a dead repost. It loads fast (poster as the first paint, video on tap), shows the clip, then one dominant card: "Horfðu á allan þáttinn" with the episode poster, linking to `/sermons/[id]?t=[startSec]` so the full program opens already seeked to where the moment lives. The click continues the moment instead of dumping them on a homepage. On the full episode they meet the Retain rails (save, daily word, pray) that Move 2 built. Reach's job ends at delivering a warm stranger to that door.

The stranger who does not tap is still counted: the tracker records the clip-sourced referrer, so Omega sees "someone came from Instagram, watched, left," the first trace even without an email.

**Omega's side.** A weekly batch session, about 30 to 45 minutes on a Sunday evening. The editor opens `/admin/social`, generates the week's four static cards from real data, approves, downloads, posts to Facebook (mirrors to Instagram). That is Tier 1 and it ships first.

For clips (Tier 2, after the render path exists): on a published episode the editor clicks "Finna augnablik." One model call over the existing transcript and chapters proposes two or three candidate moments (single-speaker teaching only in v1), each with a hook line, a "why it lands" reason, the verbatim excerpt, and in and out timecodes snapped to caption-cue edges. The editor watches each candidate inline, nudges in and out with a crop-offset slider, edits the hook (with a live Icelandic line-count warning), picks one, and clicks "Samþykkja augnablik." That writes an approved spec. Gate one. Nothing renders yet.

The editor clicks "Búa til klippu." omega-tv posts the job to Azotus (the Mac Mini that owns ffmpeg), which validates the source, crops 9:16 from the Bunny VOD, burns the edited Icelandic captions in the safe middle band, composites a restrained ΩMEGA corner mark, uploads the MP4 to the Bunny clip library, and calls back. The editor reviews the finished clip inline. Gate two. Clicks "Birta." The clip goes live on `/augnablik` and on the parent episode, and a "Sækja fyrir samfélagsmiðla" panel appears: download the master plus the pre-written institutional-voice caption (ending in the loop-back URL) plus two or three stable hashtags. A human posts it.

Hawk watches three numbers climb in admin: clip-sourced referrers (reach landing), `/augnablik` views, and tv/saved-segment subscribers growing from 1 (reach converting to memory). The loop is visible end to end.

## Architecture

omega-tv (Vercel) orchestrates and publishes. Azotus (the Mac Mini) renders. Bunny stores. This split mirrors the existing VOD intake pipeline and is not negotiable: do not add ffmpeg to omega-tv (Vercel functions are the wrong place for multi-second transcodes).

- **Tier 1 static (already built, ships first, zero new infra).** React templates rendered to PNG, served from `/admin/social`. Four templates exist; the format dimensions and Altingi palette live in `src/lib/social/types.ts`. New stills (testimony, 9:16 verse cover, live/bridge) plug in unchanged.
- **Tier 2 clip engine (new).**
  - *Propose:* a new `generateMomentCandidates()` next to `generateMetadata` in `scripts/generate-metadata.ts`, reusing the proven Gemini fetch-and-parse harness over `episodes.transcript` and `chapters`. Manual trigger, synchronous, one LLM call.
  - *Timing:* fetch the Bunny WebVTT caption track (`getCaptionUrl` in `src/lib/bunny.ts`) for cue-level start and end. Clips source only from Bunny VOD, never the live Restream embed.
  - *Render:* a new Azotus `workers/clip_render.py` using a real ffmpeg filtergraph (crop, scale, burn captions in one pass). Do NOT reuse the existing `subs_render_overlay.py` PIL-per-frame path; it extracts every frame to a PNG and would take minutes per clip with CPU contention behind the live subtitle autopilot. Reverse HMAC webhook reusing the existing Azotus-to-omega secret.
  - *Store:* a dedicated Bunny clip library (or a `clips/` tag) so clip egress is metered separately, on the same dashboard the runaway was caught on.
  - *Publish:* a new `/augnablik` index and `/augnablik/[slug]` landing (server components), each with `generateMetadata` mirroring the sermon page and a real 1200x630 share image (Sharp, reusing `hero-poster.ts`; there is no `ImageResponse` usage yet, so this is greenfield).
- **Measurement.** `/api/track` already records path, referrer, country, and an anonymous hash. The `/augnablik` path is automatically a distinct row; a small additive change carries `clip_id` and `utm_source` so an Instagram-sourced view is attributable. No new cookie, no new identity.
- **Jobs.** A manual clip-propose trigger (no nightly cron in v1) and a clip-render dispatch cron (batch of at most 2 per run, same shape as `polish-posters`) gated by `CRON_SECRET`. `system_events` rows on every transition so `/admin/health` shows did-it-run and did-it-fail.

**Claude Design handoff.** Branch `design/social-clips` off the current feature branch (same pattern as `design/thumbnails`). Commit `docs/social-clip-handoff.md` as the cold-session entry point. Design works to the existing `SocialFormat` union and `FORMAT_DIMENSIONS` as the stable seam and must not touch `render.ts`, the data shapes, or the palette and format constants. Engineering owns the clip MP4 path. Design owns the still templates, the end-card, and the caption visual spec the renderer composites.

## Data changes

- **New table `clips`** (flat and queryable, so the landing page, feed, and admin can index and paginate): `id`, `episode_id` FK, `bunny_source_id` (parent GUID, for the loop-back URL), `clip_bunny_id` (the rendered 9:16 MP4's own GUID), `start_sec`, `end_sec` with a CHECK that the length is between 15 and 90 seconds (so a bad proposal can't request a two-hour transcode), `hook_line`, `why_it_lands`, `caption_text` (editable Icelandic), `caption_copy` (the social post caption, ending in the loop-back URL), `passage_ref`, `poster_url`, `og_image_url`, `slug` unique, `status` ('proposed' | 'queued' | 'rendering' | 'rendered' | 'published' | 'failed' | 'rejected'), `social_status`, `candidates` jsonb (the raw model proposals for audit and re-pick), `render_attempts`, `idempotency_key` unique (a hash of episode and in/out, blocks duplicate renders), `approved_by`, `approved_at`, `error_message`, timestamps. RLS: service-role write; public select only where status is published.
- **New table `clip_render_jobs`** (durable queue, mirrors `vod_intake_jobs`): carries the cost guards, per-day cap in the dispatch cron, attempts capped at 2 then terminal failed.
- **Extend `/api/track` insert** with optional `clip_id` and `utm_source`. Same anonymous hash. This is the only change to the tracking path.
- **No change to the live-stream path, no ffmpeg in omega-tv, no clip ever reads or writes prayer data.** Clips source exclusively from episodes.

## Phases

**Phase 0 — prove the cheap thing (no new code).** Connect the firehose and confirm a tiny team will actually post, before building any video engine.
- Confirm Omega's Instagram is a Business account linked to the existing Facebook Page (step zero, the whole future API path and posting Reels at all depend on it).
- Rebrand the Facebook Page first impression (cover, avatar, about, one pinned post) from the existing render pipeline.
- Post the four existing static templates on the existing cadence for two straight weeks. A human posts; nothing new is built.
- Watch the tracker for the first non-zero social referrer. This is the go/no-go gate for the entire clip engine.

*Outcome:* a rebranded Facebook presence and the first measurable social referrers into omega.is. If a tiny team can't sustain this for two weeks, stop. Do not build the clip engine.

**Phase 1 — two new static cards and the Design handoff.** Widen the static pipeline and start Claude Design on the clip templates in parallel, all on infra that already exists.
- Build the testimony card (1:1 and 9:16) from the 6 existing testimonials. Testimony travels widest of any teaching content.
- Build the live/bridge card from the schedule, with the live dot only when actually on air.
- Build the 9:16 cover variant of the weekly-scripture card.
- Cut `design/social-clips`, commit `docs/social-clip-handoff.md`, hand Claude Design the six templates: clip end-card, clip caption visual spec, 9:16 verse cover, testimony card, live/bridge card, profile kit per platform.

*Outcome:* six static asset types live in `/admin/social` and a durable Claude Design handoff. Tier 1 is complete and posting weekly.

**Phase 2 — moment selection (no rendering, zero video risk).** Prove the model picks good moments and the editor flow feels right against one real episode, before adding any video dependency.
- Add `generateMomentCandidates()`, reusing the proven Gemini harness. Open on the strongest line, prefer self-contained windows, single-speaker only, align to caption-cue edges, clamp 30 to 90 seconds.
- Add the propose route that fetches the WebVTT, calls the model, writes a `clips` row at proposed.
- Add the "Augnablik fyrir klippu" panel to the draft editor: candidate cards, inline seek-and-play of the window, nudge fields with a crop-offset hint, hook edit with the live line-count warning, and a "Samþykkja augnablik" confirm.
- Degrade gracefully when an episode has no caption track: chapter-anchored approximate times, force manual in/out, never guess silently.

*Outcome:* against one real episode, a human-approved {start, end, hook} spec in the table, inspectable and correct, with zero render or publish risk.

**Phase 3 — one hand-built clip and the public surface.** Prove the look reads reverent on a phone and the loop closes, by hand-rendering one clip end to end before automating.
- Before any cadence: time one real 60-second clip end-to-end on the actual Mac Mini with a real ffmpeg filtergraph. If it isn't clean and fast, the engine doesn't ship as designed.
- Manually crop 3 or 4 episodes from different shows to 9:16 and look: do the 34-year-old broadcast lower-thirds or station bugs intrude into the vertical frame? If yes, v1 is graphics-clean shows only, or needs per-show crop presets.
- Hand-build one finished clip to spec: strongest 30 to 40 second single-speaker moment, steady center-crop on the face (no auto subject-tracking in v1), burned captions with full Icelandic diacritic coverage verified, restrained corner wordmark, omega.is end-card with the single CTA, clean audio, no music. Upload to the Bunny clip library.
- Build `/augnablik/[slug]` with metadata and a real share image, the player, the dominant "Horfðu á allan þáttinn" CTA deep-linking to the seeked sermon, and the loop-back. Build a minimal warm index (not reels-chrome).
- Post that one clip to Facebook Reels with the institutional-voice caption ending in the loop-back URL. Add `clip_id` and `utm_source` to the tracker.

*Outcome:* one real, polished, reverent clip live on `/augnablik` and posted to social. The visual contract Claude Design matches, and the first time Omega can watch a stranger arrive from a clip and reach the full program.

**Phase 4 — render automation behind the cost guards, then fan out.** Turn the proven hand-build into an admin-triggered pipeline, then expand cadence.
- Build the Azotus render worker, the reverse webhook, and the durable queue. Inherit the canonical guard set: source validation and quarantine, a per-day cap (start at 20), unique idempotency key, attempts capped at 2, batch dispatch of at most 2 per run, the DB length CHECK. `system_events` on every transition.
- Wire the two gates: "Búa til klippu" to the render job, then clip review and "Birta" to publish.
- Add YouTube Shorts and Instagram Reels to the manual rotation. Publish full sermons to YouTube too (evergreen search home for Omega's actual product).
- Scale to 2 clips a week (1 sermon, 1 testimony) fanned to all three verticals via the weekly batch. Scale to 3 or 4 a week only after render is one click. No nightly auto-propose cron, manual-initiated permanently until the guards prove out over weeks.

*Outcome:* a cost-safe, human-gated pipeline producing 2 reverent clips a week across Facebook, Instagram, and YouTube, each looping a stranger back to the full program and into the Move 2 capture.

## Guardrails

- Never auto-publish a clip. Two human gates, always.
- Never select a clip because it will spread. Choose for what is true and whole. Strip "trend-jack the season" and "predicted spread" from the strategy entirely; keep the craft advice (safe zones, eye-level, clean audio), drop the optimize-for-spread posture.
- Never source a clip from the live feed or the prayer wall. Bunny VOD only.
- No auto-propose cron and no cron-on-publish until the cost guards have run clean for weeks. The runaway was an unattended loop over video; do not recreate its shape.
- Never add ffmpeg to omega-tv. Render lives on Azotus.
- No vanity metrics on the reach surface. The clip ends on the gospel and one quiet door.
- No karaoke word-by-word caption highlight in v1, and no auto subject-tracking crop. Both are the most reels-chrome, most-likely-to-look-auto-generated elements on sacred content. Static 2-line blocks and a steady center-crop read more reverent.
- No clip caption ships before Icelandic diacritics are verified in-browser at the target font weight. Mojibake instantly reads cheap.
- Do not promise on a clip or its landing page anything the system can't deliver. The landing page's capture rails belong to Move 2.
- Do not scale to four platforms. Facebook (the bridge to the loyal base and the Icelandic church ecosystem) plus one vertical master fanned to Reels, Shorts, and TikTok. Skip Snapchat.
- Update the brand guide with the dated rationale for overriding the earlier "no TikTok / no reels" call, so a future agent doesn't silently revert it.
- Prod is live. Stage on a branch, verify in-browser, no breaking changes. Bunny and FTP credentials are shared; coordinate, never rotate.

## The biggest risks, named

- **Building the factory before the bridge.** Zero social referrers today is the tell. Phase 0 is a hard gate: post the four existing templates for two weeks, only build clips if the first social referrer appears and the cadence is sustainable.
- **The render approach.** Azotus does not already render clips the cheap way; the existing PIL-per-frame path would take real minutes per clip on the Mac Mini behind the live autopilot. Write a real ffmpeg filtergraph and time one clip before committing to any cadence.
- **Crop.** Auto subject-tracking is 0% built and multi-week ML, and sermon footage is the worst case. Drop it from v1; one editor crop-offset slider, steady center-on-face, blurred-warm fill only for wide worship shots.
- **Old broadcast graphics.** Source episodes may carry burned-in lower-thirds or a station bug that a 9:16 crop half-cuts. Audit a few shows by hand in Phase 3; if graphics intrude, v1 is graphics-clean shows only.
- **Reverence becomes performance.** The whole apparatus is the native grammar of the attention economy pointed at sermon clips. Forbid choosing by predicted spread, keep the human moment-gate, never put a count on a clip, treat reach as a side effect of faithfulness, and encode that as a stated value a future agent can't override.
- **The tiny team is the bottleneck.** Keep posting manual for launch, one weekly batch session, start at 2 clips a week, name a posting owner and a fallback for when momentum stalls.

## Decisions for you

- **Sequencing: build Reach now, or hold it until the Bridge and the static-posting habit are proven?** Recommended: hold. Phase 0 first (rebrand the Page, post the existing templates two weeks, watch for the first social referrer), then build clips. The bridge is an afternoon; the clip engine is weeks.
- **Platform scope.** Recommended: Facebook as Tier 1 plus one 9:16 master fanned to Reels, Shorts, and TikTok as Tier 2, skip Snapchat. Start with the discipline of one master posted by a human, beginning with YouTube Shorts and Facebook, adding Instagram and TikTok once render is one click. This overrides the earlier "Facebook and Instagram only" call; record the dated rationale in the brand guide.
- **Brand on every clip vs near-bare.** Recommended: bare body, a restrained corner wordmark at reduced opacity, and a 1.5-second branded end-card carrying the single door home. Definitely no karaoke caption highlight in v1.
- **Crop strategy.** Recommended: steady editor-set center-on-face with a manual offset slider, blurred-warm fill only for wide worship. Add tracking later only if manual proves limiting.
- **Captions and moment source.** Recommended: static 2-line blocks from Bunny WebVTT timing, single-speaker teaching only. Test one clip with real long Icelandic clauses before locking the font size.
- **Per-clip end-card destination.** Recommended: the on-screen card says "Sjá alla ræðuna á omega.is" (text, max restraint); the post caption links `/augnablik/[slug]`, which routes to the parent sermon seeked to the moment, so the click continues the moment.
- **Per-day render cap and trigger.** Recommended: 20 a day, manual-trigger only, no auto-propose cron, until the guards run clean for weeks.

## Success signals

- A stranger who never watched Omega taps a clip, lands on `/augnablik`, and opens the full sermon at the moment that reached them. The door opened and they walked through it.
- The first non-zero social referrer into omega.is appears. The hose is finally, even slightly, pointed at the cup.
- A clip-sourced visitor becomes someone Omega remembers: a tv/saved/augnablik email that traces back to a clip.
- A loyal cable viewer's grandchild sends a reverent 35-second clip to a friend. The gospel travels one hop past the cable wall to a generation that would never have turned on rás 6.
- A testimony clip reaches someone in a hard season and they respond.
- Omega's own people say the clips "look like us," reverent and warm, not like every other church's reels-chrome.
- A sustainable weekly rhythm holds for a month (4 static posts and 2 clips) without burnout. The tiny team can keep the pipe connected, which matters more than any single viral number.
