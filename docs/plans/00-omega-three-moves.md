# Omega: from broadcast to home — the three moves

**Written:** 2026-06-25 · **For:** Hawk, Claude Design, and the next agent · **Status:** plan, not yet built

This is the strategy doc. Read it first. The three moves each have their own build-ready spec next to this file:

- [`01-bridge.md`](01-bridge.md) — Move 1, connect the cable audience to the web and capture email
- [`02-retain.md`](02-retain.md) — Move 2, the prayer that comes back answered, the daily word, the weekly letter
- [`03-reach.md`](03-reach.md) — Move 3, clips that travel and the social strategy (with a Claude Design handoff)

---

## The one sentence

Omega is a beautiful broadcast that forgets you the moment you leave. The work is to give the ministry a memory.

Everything below serves the mission: to lift up the name of Jesus Christ for the whole nation of Iceland, every generation, phone first. Not a TV channel with a website bolted on. The place the country comes to be fed, prayed for, and pointed to Jesus, and wants to come back to.

## What is actually true right now

Pulled live from production on 2026-06-25. The site went live four days earlier.

- **About 300 pageviews in four days**, and a big share of that is internal (dev, founder, the agents). Real Icelandic human traffic is a few dozen people.
- **`/live` is the #2 page.** Even with almost no traffic, the instinct of the people who arrive is "I want to watch." The cable habit transfers.
- **Acquisition is basically nothing.** 18 visits from Google, zero from social.
- **The relationship layer is empty.** One email subscriber. Zero prayers submitted. Six testimonials.
- **The content is ready.** 16 episodes published, 8 series, 14 articles.

The diagnosis writes itself. You have a fire hose (the biggest Christian cable audience in Iceland, 34 years of trust) and a beautiful cup (omega.is), and the hose is not pointed at the cup. The product is built. The audience pipe is not connected.

## The three moves, in this order

1. **BRIDGE.** Point the cable audience at the web, and capture their email so Omega finally owns a direct relationship. Fastest, highest return, because the audience already exists and already trusts you. Nobody has to be convinced, only pointed.
2. **RETAIN.** The prayer that comes back answered, the daily word at 7, the weekly letter. This turns a captured email into a living relationship. It only matters once Bridge starts filling the room, which is why it is second.
3. **REACH.** Clips that travel and a real social presence, to reach the generations who never turn on the cable. The long hill. Sequenced last on purpose, and scoped small, because there is no point building a video factory before the cheap bridge is connected.

They reinforce each other. Bridge fills the room. Retain holds the people in it. Reach walks strangers up to the door that Retain built.

## The foundations all three need first (do these once)

Every move depends on the same small set of foundations. Build them once, up front. None of them is user facing on its own, but the moment anything asks for an email, these must already be true.

- **A real privacy page** at `/personuverndarstefna`. Today the footer "Persónuverndarstefna" link dead-ends to `/about`. Prayer text is sensitive data under GDPR, so this is not optional.
- **Consent logged.** Store the exact wording shown, the timestamp, and the source on every email we keep. The burden of proof is on Omega.
- **A verified sending domain.** Today email goes out as the Resend sandbox address `onboarding@resend.dev`, which cannot reach real inboxes. Verify the omega.is domain (SPF/DKIM/DMARC), set `RESEND_FROM_EMAIL`, and add a guard that refuses to send while the address still contains `resend.dev`.
- **Passwordless identity.** Supabase magic link is already wired for admin login. Extend it to the public side later. No passwords, ever, for this audience.

## Two live bugs to fix before any capture ships

The review found these in the real code. Neither is exploitable today because there is no data yet, but both must be fixed before prayers or emails start flowing.

1. **Prayer email leak.** `getPrayers`/`getAllPrayers` in `src/lib/prayer-db.ts` use `select('*')` and pass `row.email` into the public prayer-wall payload. The moment a prayer with an email is approved, that email ships to the browser. Fix: explicit public column allow-list, no email, no consent columns, and confirm row-level security blocks the anon role from reading them.
2. **Verify route fake success.** `src/app/api/subscribers/verify/route.ts` redirects an unknown or expired token to `verified=1` (tells the person "confirmed" while they sit unverified). Fix: distinguish "never existed / link expired" from "already used."

## The decisions only you can make

These are cross-cutting. Each move doc has its own short decision list too.

- **Omega's exact registered legal entity name and Reykjavík postal address.** Hard input for the privacy page and every email footer. Not a design choice, a fact I need from you.
- **The on-air destination string.** Recommended: `omega.is/tv`. Easy to say out loud, and because it is its own path it measures itself for free.
- **The sending addresses.** Recommended: `postur@omega.is` for the daily word and weekly letter, `baen@omega.is` reserved for the sacred prayer mail so the From line itself tells the reader which kind of message it is.
- **First on-air program and frequency for the Bridge experiment.** Your call with the channel and continuity team. Start with one program for two weeks.

## How to read the cost guardrails

You once had a corrupt file loop through translation and run up about a $500 Google bill. Every plan here is built so that cannot happen again: no unattended loops, human approval gates before anything publishes or sends, per-day caps, and idempotency so nothing fires twice. Where a plan adds anything metered, it says so and caps it.

## What success looks like (and what it is not)

Success is never likes, followers, or list size to perform against. Success is pastoral and concrete: the first time `/tv` climbs as its own line in your analytics. The first real Icelandic email that arrives because someone saw Omega on TV. The first true "your prayer was answered" note sent to a real person who bore a real burden here. A stranger who came from a clip and stayed to watch the whole sermon. Lives touched and doors opened, counted as relationships kept.
