# Omega TV — Icelandic Market Strategy Reference

> Based on deep-research summary shared by Hawk 2026-04-18.
> This doc is the strategic anchor for distribution, device, and
> monetization decisions. Updates to `docs/tv-app-considerations.md`
> should reference this source of truth.

## Market fundamentals that matter to Omega

- **Population:** ~382,000 with 99% internet penetration
- **Mobile penetration:** 140% (multi-device households)
- **Over-50 digital fluency is high:** 88% of 70+ use Ísland.is, 20% of 65–79 watch streaming TV daily. The digital divide assumption is WRONG for Iceland. Design for all ages, not "young vs. old."
- **Media revenue split:** 62% user subscriptions, 35% advertising (declining 8% since 2010). Private media is a consolidated oligopoly — 5 firms hold 85% of private revenue.
- **Broadcast split:** RÚV (public) has 41% of broadcasting revenue. Remaining market is fragmented among private players.

## The telecommunications oligopoly (the distribution gatekeepers)

The three major telcos aren't just ISPs — they're **content aggregators** and hardware distributors. Their market position directly determines who reaches Icelandic living rooms.

| Telco | Fixed broadband share | Consumer app | Hardware & aggregation |
|---|---|---|---|
| **Síminn** | 44.4% | Sjónvarp Símans Premium | Uses XroadMedia (Ncanto) for AI recommendations + FAST channels. Uses Red Bee Channel Store for signal aggregation. Available on Apple TV, Android TV, Samsung Tizen, LG webOS, web, mobile. |
| **Sýn (Vodafone)** | 24.8% | Vodafone Play / SÝN TV | Hybrid DVB-T2 + IPTV. Legacy Samsung STBs being upcycled to Android TV via AminoOS (24i partnership). Apple TV + Android TV. |
| **Nova** | 18.4% | NovaTV | Digital-first, youth-oriented. Apple TV, Android TV, Samsung Tizen, LG webOS. Heavy use of **Direct Carrier Billing** — subscriptions appear on monthly telco bill, not a separate card charge. |

**Strategic implication:** reaching 88% of Icelandic households means either building apps for all four native device ecosystems (Apple TV, Android TV, Samsung Tizen, LG webOS) OR negotiating signal distribution into one or more of these telco apps via Red Bee / XroadMedia aggregators.

## Device targeting — definitive priorities

| Platform | Tier | Rationale |
|---|---|---|
| **iOS + Android mobile** | Tier 1 | iOS 56.46%, Android 43.07% share. Must ship concurrently. Cross-platform (React Native) probably right. |
| **Apple TV (tvOS)** | **Tier 1** ← UPDATED | iOS ecosystem dominance + all three telcos treat Apple TV as primary living-room surface. Cannot skip. |
| **Android TV** | **Tier 1** ← UPDATED | Sýn actively migrates legacy STBs to Android TV via AminoOS. Google Play Store presence = automatic reach into Sýn subscriber fleet + retail Sony/Philips/TCL devices. |
| **Samsung Tizen** | Tier 1 | Dominant native Smart TV brand in Iceland. Web-tech (HTML5/JS) — code reuse from omega.is possible. |
| **LG webOS** | Tier 1 | Second native brand. Also web-tech. Code reuse. |
| **Web (omega.is)** | Tier 1 | Foundation for acquisition + account management. Already built. Chrome 56.21%, Safari 22.16%, Edge 8.04%. |
| **Roku** | **Tier 3 (skip)** | Near-zero Icelandic presence. No telco support. Allocating Roku effort = wasted resources. |
| **Amazon Fire TV** | Tier 3 (skip) | Similar — lacks deep localized support. |

**Previous TV app plan said to defer Apple TV + Android TV. That was wrong.** Updated `docs/tv-app-considerations.md` to reflect four-platform Tier 1.

## Payment architecture (for when Omega monetizes)

Omega is currently donation-funded. This section applies when we build:
1. Recurring monthly donations (ongoing work)
2. Future premium tiers (early access, downloadables, study packs)
3. Pay-what-you-can episode/course unlocks

**The tri-modal pattern the Icelandic market rewards:**

1. **Native IAP on mobile + TV apps** — Apple/Google keep ~30% but the biometric-auth-in-3-seconds flow converts dramatically better than card entry. Mandatory for App Store / Play Store distribution of any premium tier.
2. **Direct Carrier Billing with local telcos** — the secret weapon. Nova already supports this for NovaTV. Síminn and Sýn likely do too. Adds "donate to Omega" directly to monthly phone bill. For an older audience that trusts their telco invoice, this is the lowest-friction conversion path in Iceland. **Potentially the single biggest conversion-rate move Omega could make** when launching recurring donations.
3. **Web gateway — Adyen + Straumur, or Rapyd** — for direct web signups. Straumur is the Icelandic acquiring bank (subsidiary of Kvika Bank); Adyen partners with them for local acquiring. This handles the 78% of users who prefer cards.

**Not Stripe-first.** Stripe works globally but doesn't have the local acquiring relationships or DCB integration. For Iceland-native deployments, Adyen+Straumur or Rapyd are stronger.

## Infrastructure — the national backbone

**Today:**
- Origin: Vercel (US/EU edge, probably Amsterdam for Iceland traffic)
- Video: Bunny.net (global CDN)
- Database: Supabase (US or EU-West)
- All international — every video byte crosses FARICE-1, DANICE, or Greenland Connect submarine cables. 30–40ms round-trip latency added unnecessarily.

**Low-effort, low-cost upgrade (priority 1):**
- **Add Cloudflare as edge layer** in front of Bunny. Cloudflare's POP #125 is in Reykjavík, directly peered at RIX (Reykjavik Internet Exchange). Static assets + video manifests cache at the Reykjavík edge = sub-millisecond delivery to Icelandic ISPs.
- Cost: Cloudflare Pro plan is ~$25/mo. Possibly free tier covers it.

**Medium-effort future (when Omega scales):**
- **Origin infrastructure moved into Míla's Ármúli 25 data center** (Reykjavík). Robust UPS, generator backups, direct national fiber backbone access. Powered by geothermal + hydroelectric (green compute, aligns with Omega's values).
- **BGP peering at RIX and Múli-IXP**. RIX connects 26 networks including Síminn, Sýn, Nova, and RÚV. Direct peering means video bytes go ISP ↔ Omega without international transit.
- Cost: colocation ~$500–2000/mo depending on rack density. ASN registration. Worth it at 10,000+ concurrent live-stream viewers (national Sunnudagssamkoma scale).

**What not to do yet:** full data center migration before there's evidence of bottleneck. Cloudflare + Bunny + Supabase is sufficient until there's real live-event traffic straining it.

## Alternative go-to-market: the telco aggregator play

This is potentially a bigger strategic unlock than building our own apps.

**The opportunity:** Sjónvarp Símans Premium (Síminn) aggregates third-party channels via the **Red Bee Channel Store**, a global signal aggregation platform that lets TV services rapidly onboard live broadcast sources via secure internet delivery. Omega is already a broadcast network — we already deliver a signal via cable/satellite to Icelandic operators. Getting that same signal into Sjónvarp Símans Premium as a channel means:
- Appears in 44% of Icelandic households' TV app with no download
- No platform-specific app build required for launch
- Existing Síminn subscribers see Omega in their channel list automatically
- Potential revenue share (if premium) or simple free-channel carriage

**Similar opportunities with Sýn and Nova.** Sýn's aggregation is simpler (they have a large bundled channel set from the Stöð 2 heritage). Nova is more OTT-focused but supports third-party integrations.

**Action items (future):**
- Reach out to Síminn business development — inquire about Sjónvarp Símans carriage terms
- Reach out to Nova — inquire about NovaTV channel onboarding
- Reach out to Red Bee Channel Store directly — they're the aggregation layer
- Parallel to app development, not instead of

**This is a business development project, not a code project.** Hawk needs to own these relationships; Claude can prep briefs and decks but can't negotiate deals.

### What Omega already has in Síminn (confirmed 2026-04-18)

- **Linear channel carriage** — Omega Stöðin's live feed is distributed through Síminn's IPTV.
- **Tímaflakk (24-hour time-shift)** — Síminn's cloud DVR automatically records the linear feed so subscribers can scroll back up to 24 hours. No action required from Omega; this is standard for every carried channel.

### The VOD library gap (Hawk's 2026-04-18 question)

Hawk asked: *"do they have an app where we can build for them... like a VOD section?"*

**Short answer: you don't build FOR Sjónvarp Símans.** The app is Síminn's closed proprietary product. There's no public SDK, developer API, or channel-self-service tooling. Sjónvarp Símans is built by Síminn and distributed on Apple TV, Android TV, Samsung Tizen (2018+), iOS, Android, and web.

**How a VOD library section would actually get built:**

1. **Red Bee Channel Store path** — Red Bee accepts both live signals AND VOD catalogs with metadata. Omega delivers a VOD catalog via secure internet delivery with structured metadata (title, description, thumbnails, duration, chapters, expiry, DRM tokens). Red Bee distributes to Síminn, and it surfaces as an Omega-branded VOD section in Sjónvarp Símans Premium.

2. **Direct Síminn deal path** — negotiate catalog placement directly. They ingest via XMLTV + standard VOD metadata formats (or their current proprietary ingest). Skips Red Bee as intermediary.

**Technical compatibility with Omega's existing pipeline:**

The `/admin/drafts → Publish` pipeline produces exactly what either path would need:
- `episodes.title`
- `episodes.description`
- `episodes.chapters` (JSONB — maps to VOD chapter markers)
- `episodes.bible_ref` (custom metadata they may or may not use)
- `episodes.editor_note` (can feed their short-description field)
- Bunny thumbnail URL
- `episodes.duration`
- `episodes.captions_available` (language tracks)

A one-time adapter script would map the `episodes` table to Red Bee's / Síminn's ingest format, refresh on publish-trigger. Roughly 1-2 days of work ONCE the ingest spec is in hand.

**DRM question (open):** Síminn may require DRM-protected streams for premium VOD placement. Bunny supports Multi-DRM (Widevine + PlayReady + FairPlay) but it's a separate SKU with cost + setup overhead. Must confirm with Síminn before committing.

**Next step Hawk should take:**

1. Use existing Síminn linear-carriage relationship (whoever currently handles Omega's channel) as the entry point.
2. Ask two specific questions:
   - *"Does Síminn offer VOD library placement for carried channels? Via Red Bee Channel Store or direct ingest?"*
   - *"What's the ingest spec (XMLTV / MRSS / proprietary API)? Do you require DRM on VOD?"*
3. Based on answers, scope the adapter build (lightweight, reuses pipeline).

## Key takeaways — what Omega should actually do

### Short term (already shipping / next 3 months)
1. **Tablet/iPad polish pass on omega.is** — big-tap, big-type audit. The 50+ audience is here first.
2. **Add Cloudflare** in front of Bunny for Iceland-local edge caching.
3. **Chapter click-to-seek** on sermon player (makes the Gemini-generated chapters functional).
4. **Azotus native-IS mode** — the content pipeline reaches 100% of incoming video.

### Medium term (3–12 months)
5. **Apple TV + Android TV + Samsung Tizen + LG webOS TV apps.** Build the shell once, wrap four times. 10–14 weeks per updated `docs/tv-app-considerations.md`.
6. **Donation architecture with DCB integration.** Nova is the likely first partner given their digital-first culture. Card-based web fallback via Adyen+Straumur.
7. **Business development conversations with Síminn / Sýn / Nova / Red Bee.** Hawk-led. Explore channel aggregation deals parallel to app development.

### Long term (12+ months)
8. **Move origin into Míla's Ármúli** + direct RIX peering when live event traffic justifies it.
9. **Evaluate expanding to Apple TV / Android TV / Roku in other markets** (US Icelandic diaspora, Scandinavian ministries, etc.) only after Icelandic market is saturated.

## Source

Deep research summary shared by Hawk 2026-04-18. Internal file: none —
originated externally, pasted verbatim into the conversation transcript.
Should be retained as the foundational strategic reference for all
future distribution, device, and monetization decisions.
