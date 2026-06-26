# Move 1 — BRIDGE: point the hose at the cup

**Scope:** the cable-to-web bridge and the email-capture seed. It stops at: a stranger who saw Omega on TV arrives at omega.is, watches, and when it is honest to ask, leaves an email Omega can lawfully come back to. Retain and Reach are separate docs.

## North star

You have a fire hose (34 years of cable trust, the biggest Christian audience in Iceland) and a beautiful cup (omega.is), and today the hose points nowhere. Zero cable-to-web acquisition. One subscriber. Every visitor leaves a stranger. This move connects the hose to the cup and, for the first time, gives the ministry a memory of the people Jesus is reaching through it.

Success is not list size. Success is a 70-year-old who has watched Omega for decades seeing one warm invitation on screen, finding the site, staying to watch, and because Omega gave before it asked, choosing to let the channel pray with them by email.

## Principles

- **Watch is the gift, capture is the thank-you.** The one action on arrival is a big "Horfa núna" into the live player. The data says the instinct is to watch. Email is offered warmly after Omega has already given something, never as a wall.
- **Promise only what currently sends.** Today the list can honestly be invited to the weekly letter only. Do not write "bæn dagsins kl. 7" anywhere until the daily rotation and the verified domain are both live. A broken daily-email promise to this audience is worse than never asking.
- **The bridge is a measured experiment, not a launch.** Air the cheapest on-air layer on one program for two weeks and watch `/tv` climb before committing broadcast inventory.
- **Not every viewer needs to be captured.** For a share of the older base, the most faithful thing is to let them keep watching on cable. The spoken and typed path serves everyone; the QR serves only the phone-in-hand minority and is never the only door.
- **Reverence over reach on air.** The lower-third stays rare and never covers worship, prayer, communion, the altar, or testimony. The broadcast must never feel interrupted to feed the website.
- **Build by composition.** `/tv` reuses the live embed, the existing signup form, the subscribers table, and the existing tracking pipeline. Smallest possible code on the smallest possible surface.

## The experience, end to end

**On the TV.** During a program, a clean lower-third animates in for about 12 to 15 seconds, once, never over a sacred moment. Two lines, plain Icelandic, sentence case: "Horfðu aftur, hvenær sem er" / "omega.is/tv", with a small high-contrast QR in the safe band. When the program ends, the heart-open moment, a full-screen end-card for about 10 seconds: the ΩMEGA wordmark, "Haltu áfram með okkur", "Horfðu á efni þegar þér hentar · Biddu með okkur", a big QR, and "omega.is/tv" spoken by the familiar continuity voice. At sign-off the host says it in their own trusted voice: "Þú getur horft á Omega hvenær sem er á omega.is skástrik tv, og þar getur þú beðið með okkur." Spoken trust from a familiar voice is what actually moves a 70-year-old. The QR is only for the ones already holding a phone.

**Arriving at omega.is/tv.** A dedicated, stripped, phone-first arrival mat, not the full homepage maze. Top: the ΩMEGA wordmark and one warm line, "Velkomin. Þú fannst okkur," so the person who just scanned knows they are in the right place.

**The one action.** A large "Horfa núna →" button opens the live player inline (the same Restream embed and BEINT pill the `/live` page uses), big tap target, unmissable. Under it, a quiet "Eða skoðaðu þætti →" to `/sermons`. The watch asks nothing of them.

**The capture, below the fold, after they chose to stay.** One warm card. Today the headline promises the weekly letter only: "Fáðu vikulegt bréf frá Omega í pósti." Email field only, no name, no password. An unticked consent line linking to the real privacy page, and the anti-nag promise: "Engin læti, þú getur hætt hvenær sem er." Submit writes to subscribers with segment `tv`. When the daily prayer can truly send and rotate, the headline upgrades to add it. Not before.

**Quiet links at the bottom.** "Biddu með okkur →" to `/baenatorg`, "Styðja Omega →" to `/give` (never the lead), and a cable continuity reminder, "Omega er líka í sjónvarpi, Sjónvarp Símans, rás 6."

**Omega's side.** Open admin → Greining → Top pages. The moment the on-air assets air, `/tv` appears and climbs as its own line. That single number answers "is the hose connected." Next to it, the `tv`-segment subscriber count shows how many watchers became a memory. Arrivals and captures side by side is a real conversion read, not a binary.

## Architecture

Everything lives in the omega-tv repo on Vercel. No new infrastructure.

- **New page** `src/app/tv/page.tsx` (server component, revalidate 60), composed from three things that already exist: the live player block from `src/app/live/page.tsx` (the Restream iframe and BEINT pill), `src/components/forms/EmailSignupForm.tsx` wired to `src/actions/subscribe.ts` with `segment='tv'`, and the Navbar/Footer plus Altingi tokens in `globals.css`.
- **New static page** `src/app/personuverndarstefna/page.tsx`. Repoint the footer link away from `/about`.
- **The watch button uses Restream, not Bunny.** The live player is a third-party Restream iframe token (confirmed in `.env.local`). That is fine for this move. On-demand ("Eða skoðaðu þætti") links to `/sermons` (Bunny VOD).
- **Measurement is the elegant part, near-zero new infra.** The destination is its own path, so every cable arrival is automatically a `page_views` row and shows as `/tv` climbing. One nuance: `/api/track` strips the querystring (`path.split('?')[0]`), so source codes on the URL get dropped. The smallest fix: when `path === '/tv'`, read the `q` code and store the source bucket so you can tell which on-air placement converts (lower-third vs end-card vs spoken). That matters because the on-air rollout is the expensive, hard-to-change lever.

**Data flow:** TV → person types, scans, or hears omega.is/tv → `/tv` page → tracker records `/tv` plus source bucket → taps "Horfa núna" → Restream plays → scrolls, enters email → `subscribeAction(segment='tv')` writes a consented row → admin sees `/tv` climbing and the tv-segment count rising. No new cron, no new env var, no new table.

## Data changes

- **`subscribers`:** add `consent_text_version`, `consent_given_at`, `consent_source`. Written on every email submission so opt-in is provable. No new table; `segment='tv'` rides the existing `segments` array.
- **`page_views`:** keep a source bucket for `/tv` (either a nullable `source` column or encode the bucket into the stored path) so the q-code survives the querystring strip.
- **No new tables for this move.** Resist building prayer consent columns, a clips table, or notification ledgers here. They belong to Retain and Reach.
- **Verify before shipping capture:** confirm RLS on subscribers blocks anon reads of the new consent columns. And fix the live prayer-wall email leak in the same sweep (see `00-omega-three-moves.md`), but do not let it ride along silently.

## Phases

**Phase 0 — make capture lawful and the sender real (the gate).** Nothing with an email field ships until these exist. The watch button does not depend on this and ships in parallel.
- Ship the real privacy page with Omega's legal entity name, Reykjavík address, lawful basis, retention, and Persónuvernd as the complaint authority. Repoint the footer.
- Add consent logging and hard-block saving an email without affirmative consent.
- Verify the omega.is domain in Resend, set `RESEND_FROM_EMAIL`, add the `resend.dev` guard, and DKIM-test to a real Icelandic inbox.
- Fix the verify route so an unknown token does not redirect to success.

*Outcome:* a lawful foundation. No user-facing capture yet, but the moment one ships it is clean.

**Phase 1 — ship /tv, watch first.** The arrival mat with watch as the one action; the capture card in collect-mode promising the weekly letter only.
- Build `/tv`: wordmark, "Velkomin. Þú fannst okkur," the big "Horfa núna" opening the live embed inline, the quiet on-demand link.
- The one capture card wired to `subscribeAction(segment='tv')`, weekly-letter headline, email only, unticked consent line, anti-nag promise, no donate ask bundled in.
- Add the `/tv` source split to `/api/track` and surface the tv-segment count in admin.
- Style with the Altingi palette via the `omega-stodin-design` skill, large and legible.

*Outcome:* omega.is/tv is live, polished, phone-first, watch-first, lawful, measurable from the first visit.

**Phase 2 — connect the hose as an experiment.** Prove the cable audience will cross before committing broadcast inventory.
- Generate a real QR for omega.is/tv and test it by scanning with an actual older phone in actual TV lighting before it airs.
- Produce one lower-third and one end-card on the locked brand, and script one warm spoken sign-off line.
- Coordinate with the channel to run the spoken invite plus one lower-third on one program for two weeks. The playout infra is shared and not Omega-owned; coordinate, never rotate credentials.
- Watch `/tv` and the tv-segment count. Climbs → scale the rollout. Flat → the channel is wrong, escalate the destination (an on-screen app/channel, a "text OMEGA to a shortcode," or a printed insert in the donor mail the audience already trusts) rather than building more on-air assets.

*Outcome:* the hose is pointed at the cup on one program, and you have a real, diagnosable read on whether the older base will cross, with a kill-or-escalate decision instead of weeks of sunk on-air work.

## Guardrails

- **Cost-safe:** this move adds no render loop, no cron, no per-recipient fan-out, no new metered service. It cannot repeat the runaway. The only metered surface is the human-triggered weekly letter. Keep it that way; no automated daily send in this move.
- **Privacy:** no email field ships before the privacy page exists, consent is logged, and the sender is verified. Keep the watch path free of any personal-data collection so it can ship first.
- **Do not promise the daily prayer** anywhere until it can truly send and rotate. Promise the weekly letter, which is real.
- **Do not bundle a donate ask** into the capture card or the lower-third. Give lives on the end-card and the `/tv` footer only, framed as partnership.
- **Reverence on air:** lower-third once per program, 12 to 15 seconds, never over worship, prayer, communion, altar, or testimony. Brief the broadcast side explicitly, since they build the on-air assets.
- **Passwordless:** email only, no name, no account, no modal wall.
- **Prod is live.** Stage on the branch, verify `/tv` in a browser (the embed plays, the form writes, the consent line links live), and get a clear explicit deploy go-ahead before prod.
- **Not every viewer is a target.** No aggressive re-prompts or second capture walls. Let people watch and leave.

## The biggest risk, named honestly

The load-bearing assumption is that a 65 to 75 year old cable viewer will pick up a second device, unlock it, and scan a QR or type a URL while passively watching with a remote. There is no behavioral evidence for that yet. `/live` being the #2 page proves the watch habit for people already on the web, not the cold cable-to-phone jump. The whole thing can air for weeks and move almost nobody.

That is exactly why Phase 2 is a two-week experiment on one program, cheapest layer first, with a clear escalate path if `/tv` stays flat. The experiment tells the truth cheaply instead of sinking weeks into on-air assets nobody used. An honest negative is also a success.

## Decisions for you

- **Destination string.** Recommended: `omega.is/tv`. Memorable to say, and it measures itself.
- **v1 capture promise.** Recommended: weekly letter now, add the daily prayer the day it can truly send.
- **Which program and how often for the experiment.** Recommended: one program, two weeks, lower-third once per program. Your call with the channel.
- **Sending address for the weekly letter.** Recommended: `postur@omega.is`. Needs the domain verified first.
- **The q-code source split now or later.** Recommended: now. It is a tiny change and the only way to steer the expensive on-air lever during the experiment.
- **Omega's registered legal entity name and Reykjavík postal address.** Needed before Phase 0. A hard input, not a design choice.

## Success signals

- `/tv` appears and climbs in admin within the two-week experiment. The first concrete proof in 34 years that the cable audience crossed to the web.
- Real Icelandic emails with segment `tv` start arriving. The list moves off 1 with people who came because they saw Omega on TV.
- Watchers stay: people land on `/tv`, tap "Horfa núna," and keep watching.
- The spoken invite in the host's voice visibly outperforms the QR for the older base.
- Zero broken promises: the weekly letter that was promised actually lands, on brand, in real inboxes.
