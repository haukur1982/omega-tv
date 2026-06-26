# Move 2 — RETAIN: the prayer that comes back

**Scope:** turn a captured email into a living relationship. Four things, in order of sacredness and of build-readiness: the answered-prayer note, the daily word (Bæn dagsins kl. 7), the weekly letter, and the "held, not vanished" experience with passwordless recall that ties them together. This move does not capture the email (that is Move 1) and does not reach strangers (that is Move 3). It assumes an email already exists and asks: once Omega remembers you, what does it faithfully do with that memory?

## North star

When an older Icelandic believer bears a prayer to Omega in a hard season, Omega remembers. Weeks later a message comes back: their own words, quoted gently, and the news that the prayer was answered. That one true email is the whole point. Everything else exists to make that moment possible and to keep the relationship warm without ever nagging, ranking, or selling.

The test for every screen and every send is not "did the list grow." It is "would a grieving widow who prayed here ever feel handled, measured, or sold to." If yes, we cut it.

## Principles

- **Capture is Move 1's job. Retain's job is to honor a memory already given.** We never re-ask, re-wall, or re-sell to someone we already hold.
- **The answered-prayer note must be true or unsent.** It fires on a human, named act of confirmation tied to real knowledge. Never a cron, never a count threshold, never a heuristic, never to clear a queue. If Omega does not actually know the prayer was answered, the prayer stays held and unsent. A manufactured miracle is worse than silence.
- **Two data paths, never crossed.** Prayer text is special-category data under GDPR (religious belief always; health and family usually) and lives only on the prayers table and its notification ledger. The devotional list (daily word, weekly letter) is plain marketing data and lives only on subscribers. The low-risk list never inherits the heavy obligations.
- **Promise only what currently sends.** Until the domain is verified and the daily prayer rotates from a real table and the 7am cron has fired once for real, the copy promises the weekly letter. Promising a daily email the system can't produce is the cheapest way to corrode 34 years of trust.
- **Passwordless or nothing.** The captured email is the identity. Recall is magic link (Supabase `signInWithOtp`, already wired for admin). No password, no account creation, ever.
- **No vanity, ever.** "Beðið með þér" counts are author-only, second-person, never public, never ranked, never a live ticker. The number is company, not score.
- **Service email stays bare.** The answered note and the agreement digest carry zero promotion. No donate, no watch, no event. The reverence and the legal transactional exemption both die the instant a CTA is bolted on. Enforce it in code so a future agent can't add one.
- **Cost-safe by construction.** Every send job inherits one canonical guard set (see below). The runaway does not repeat in inboxes.
- **Prod is live.** Stage on a branch, verify in the browser, and never make the anonymous walk-away prayer path heavier. That frictionless default is most of the audience.

## The experience, end to end

**Bearing a prayer (the default stays frictionless).** A person writes their prayer, picks a topic, leaves "Senda nafnlaust" on (default), taps "Berðu fram bænina." No email, no checkbox, zero personal data. This path must never get heavier.

**Choosing to be remembered.** Only if they want to hear back, a quiet line appears: "Viltu heyra frá okkur um þessa bæn?" with an optional email field. Entering an email reveals one explicit, unticked consent box: "Ég samþykki að Omega geymi bænina mína og hafi samband um hana. Bænir geta innihaldið viðkvæmar upplýsingar, um heilsu, fjölskyldu eða trú, og ég deili þeim af fúsum vilja," linking to the privacy page. Separately, visually distinct, a second never-pre-ticked box: "Sendu mér líka vikulegt bréf frá Omega." (Weekly only at launch.) An email entered without the consent tick blocks the save gently and inline; the email is never silently dropped.

**Held, not vanished.** On submit, the prayer does not disappear. The person sees their own prayer rendered in the vellum (cream) stanza style with a quiet gold seal and the line "Bænin þín er í höndum okkar." Calm status copy: "Hún verður lesin af bænateymi Omega og birt á torginu. Við biðjum með þér." If they left an email: "Þú færð línu þegar bæn þín hefur verið borin fram." No confetti, no counter, no share prompt at this raw moment.

**The prayer team reads.** In `/admin/prayers` the prayer arrives unapproved (unchanged). An admin reads it and approves it (it appears on the wall, the email never public), or if it reveals crisis (suicidal ideation, abuse, an acute emergency) routes it to a named human for pastoral response, not a database queue.

**Marking answered, truthfully.** When Omega genuinely knows a prayer was answered, the admin opens it, fills a required "Hvernig vitum við þetta?" field, and clicks "Senda bænheyrslu-kveðju," a separate, deliberate send, not the bare `is_answered` flag. A confirm dialog shows the full email preview. The send is hard-gated: only fires if an email exists AND the explicit consent is true AND the prayer is not suppressed. One send per prayer, ever.

**The prayer that comes back.** The person receives "Bænin þín var heyrð." On the warm Altingi palette, their own prayer quoted back in a vellum card, then the news, then one line of scripture, then "Guð geymi þig, Omega." No ask, no link except a quiet "Þú færð þennan póst því þú baðst á Bænatorgi omega.is" and a one-tap stop-notifications link. This is the artifact the whole lane exists for.

**The daily word (once it can truly send).** Each morning at 07:00 Iceland, subscribers in the `baen-dagsins` segment receive the same prayer that is on the homepage that day, one source of truth. One short prayer and scripture, vellum card, "ekkert annað." One-tap unsubscribe and legal footer. Until the domain verifies and the table rotates, this email does not exist and is not promised.

**The weekly letter.** A Sunday-evening pastoral note: the week ahead on the channel, one passage, one warm invitation to watch live. This is opted-in marketing, so light promotion is allowed here, and only here. Full marketing footer.

**The agreement digest (gentle, weekly).** For prayers whose pray count rose in the past week and whose owner gave an email and consent, one soft note: "margir hafa beðið með þér." Never a live counter, never per tap. Framed as company, with Matthew 18:19. Bare service footer.

**Recall without a password.** At `/min-baen` the person enters their email; Supabase sends a magic link. It lands on a reverent, read-only "Bænirnar sem þú berð" view showing only prayers where the signed-in email matches the owner email (never a URL parameter). Each prayer shows its status and the author-only "beðið með þér" line. Quiet actions: add an update, manage the 7am and weekly opt-in (large, one-tap unsubscribe), and, your call, mark their own answered.

**Answered becomes witness.** An answered prayer transfigures: the cool "Bænasvar" pill becomes warm kerti gold, framed by a thin gold rule. Light arriving, never a trophy. Once, skippable, the person is invited: "Viltu deila því sem Guð gerði?" One tap seeds a testimonial draft from the answered prayer, routed through the existing `/vitnisburdur` pipeline (unapproved → admin review). Never auto-published, never pressured.

## Architecture

Everything lives in the omega-tv repo plus Supabase. Nothing here touches Azotus or Bunny; Retain is text and email, not video.

- **Sending:** Resend via `src/lib/email.ts`, with two sender lanes. `baen@omega.is` for the answered note and the agreement digest (says exactly what it is). `postur@omega.is` for the daily word and weekly letter. Hard precondition for any send: the omega.is domain verified in Resend and `RESEND_FROM_EMAIL` set. Add a guard that refuses to run a send cron while the address contains `resend.dev`.
- **The answered note fires inline** from the admin "Senda bænheyrslu-kveðju" action, not a cron. Guarded by a `UNIQUE(kind, prayer_id)` constraint, `answered_notified_at`, the consent flag, and a per-prayer do-not-notify flag.
- **Crons** (all reuse the existing `CRON_SECRET` Bearer pattern in `vercel.json`): `/api/cron/daily-prayer` at `0 7 * * *` (Iceland is UTC year round, no DST, so 07:00 UTC is 07:00 Reykjavík); `/api/cron/agreement-digest` weekly on positive delta only; `/api/cron/weekly-letter` weekly; `/api/cron/prayer-retention` daily to anonymise prayer bodies and emails past their retention date.
- **Auth:** extend the already-wired Supabase `signInWithOtp` (admin-only today) to a public `/min-baen` flow. Requires the Supabase email provider configured to deliver via Resend.
- **One source of truth for the daily prayer.** `featured_prayers` feeds both the homepage `BaenDagsins` card (currently hardcoded to 24. apríl 2026, there is a TODO in `src/components/home/BaenDagsins.tsx`) and the 7am email. One source, no drift.
- **Rebuild the email templates on the Altingi palette.** The current ones use pure-black and a blue gradient button, which is off-brand.

## Data changes

On `prayers`:
- `consent_sensitive_art9` boolean, default false. The explicit consent tick; true only when an email is kept. The answered note is hard-gated on this, so legacy prayers are never mailed.
- `consent_text_version` text, `consent_given_at` timestamptz. Proof of consent. The form hard-blocks saving an email without the ticked box.
- `consent_source` text.
- `owner_email_normalized` text, indexed. Lowercased email, the join key for recall, never public-facing.
- `answered_at` timestamptz, `answered_by` text ('owner' or 'admin'), `answered_how` text (the required "how do we know" field, captured before the note can fire).
- `answered_notified_at` and `prayed_notified_at` timestamptz. Each notification fires at most once.
- `do_not_notify` boolean, default false. Pastoral override so an admin can mark answered without sending (terminal grief).
- `notify_token` uuid and `notify_unsubscribed_at` timestamptz. Tokenized one-click stop-notifications, separate from the subscriber unsubscribe.
- `agreement_baseline_count` int. The pray-count snapshot at last digest, so the weekly digest sends the delta, not the absolute.
- `retention_delete_after` date. The retention sweeper anonymises past this.

New tables:
- **`featured_prayers`** — `feature_date` unique, `body`, `scripture`, `author` default "borið fram af Omega." Closes the BaenDagsins TODO, one source for the card and the email. Deterministic by date so the whole nation prays the same prayer. Fallback to the latest past row so the slot never renders empty.
- **`notifications`** — `kind` ('answered' | 'agreement' | 'daily' | 'weekly'), `prayer_id`, `subscriber_id`, `to_email`, `status`, `resend_id`, timestamps. `UNIQUE(kind, prayer_id)` so the answered note can never double-fire. The dedupe and audit ledger; the row is written before the Resend call.
- **`prayer_updates`** — for "Uppfæra bænina" update lines, moderated like prayers. Build in the recall slice, not slice 1.

On `subscribers` (reuse the existing table, no rebuild):
- Use `segments` values `baen-dagsins` and `vikulegt-bref` to separate the devotional lists. Add `opt_in_confirmed_at` for double-opt-in proof. Never store prayer text here.
- Add a suppression concept: do not hard-delete on unsubscribe (the current route deletes the row outright). Add `unsubscribed_at` and a hard-bounce flag so re-subscribe doesn't silently re-enrol and hard bounces stop being mailed.

Two must-fix bugs (not additive, see also `00-omega-three-moves.md`):
- Replace the `select('*')` in `getPrayers`/`getAllPrayers` with an explicit public column allow-list (no email, no consent columns), and confirm RLS blocks the anon role from reading them. This is a live exposure the day capture goes on.
- Fix the verify route so an unknown or expired token shows "link expired, request a new one" instead of fake success.

## The canonical send-guard set

Every send job inherits this verbatim:
- A `MAX_RECIPIENTS` cap that trips on a bad query.
- The idempotency row written before the Resend call.
- `DRY_RUN` default on the first prod run.
- Batch and throttle under Resend's rate limit (no `Promise.all` over the whole list).
- A global daily send ceiling across all four email types.
- A startup or route guard that refuses to send while the sender address contains `resend.dev`.

## Phases

**Phase 0 — foundations that gate everything (no sends yet).** Make capture lawful and make the sacred email possible without sending a single thing.
- Ship the real privacy page (legal entity, Reykjavík address, lawful basis being explicit consent for prayers, retention, Persónuvernd). Repoint the footer.
- Migration: the prayer consent and answered and notify columns; the `notifications` table; `featured_prayers`.
- Fix the email leak and the verify route.
- Update the prayer submission modal: optional-email reveal, the single explicit consent tick, the separate never-pre-ticked weekly-letter box, hard-block saving an email without the tick, write the consent fields.
- Replace the success pane with the "held, not vanished" state.

*Outcome:* Bænatorg becomes a reverent, lawful, memory-capturing moment. Real consented prayer-and-email pairs start accumulating with zero sending risk. The anonymous path is untouched, and omega.is is legally cleaner than before.

**Phase 1 — the answered-prayer note (the one true email).** Ship the single most sacred artifact end to end, and nothing else. It rides on consent Omega can lawfully get at submission, needs no cron, and is the emotional proof of memory.
- Verify the domain, set the sender, add the guard, DKIM-test to a real inbox.
- Rebuild the email base template on the Altingi palette.
- Write the answered email: subject "Bænin þín var heyrð," their own prayer quoted in the vellum card, the news, one scripture line, "Guð geymi þig, Omega." Bare footer, no-CTA enforced in code.
- Admin: replace the bare toggle with "Merkja svarað" → required "Hvernig vitum við þetta?" → "Senda bænheyrslu-kveðju" with full preview and confirm. Hard-gate on email present and consent true and not suppressed, once-only. Add the do-not-notify path for terminal grief.
- Add a pastoral-crisis routing note in the admin prayer view.

*Outcome:* one polished, real, legally clean, truthful send. When Omega genuinely knows a prayer was answered, the person gets their own words back with the news, and it can never double-fire, go to a non-consenting or grieving recipient, or carry an ask.

**Phase 2 — daily word rotation and weekly letter.** Turn on the recurring devotional sends only after they can truly send and rotate.
- Flip subscribers to real double opt-in atomically (change the insert default, re-wire `sendVerificationEmail` which is called by zero production code today, ship the verify-route fix), all in one tested deploy.
- Wire `featured_prayers` into BaenDagsins (replace the hardcoded prayer) and build a tiny admin view to assign a curated pool, roughly 30 to 60 ahead, pastor-touched, never auto-recycled lines.
- Build the daily-prayer cron and the weekly-letter cron, each with one-tap unsubscribe and the legal footer.
- Only now update capture copy site-wide to add "Bæn dagsins kl. 7" alongside the weekly letter. Add an admin list-health view (unverified over 48h, collect vs verified, hard bounces).
- Adopt the canonical send-guard set on every cron.

*Outcome:* a 65-year-old who gives an email actually receives a short real prayer each morning at 7 and a warm letter on Sundays, promised honestly, sent reliably, unsubscribable in one tap, with no possibility of a runaway blast.

**Phase 3 — passwordless recall, agreement digest, testimony bridge.** Close the loop on the believer side.
- Build `/min-baen`: email → magic link → read-only "Bænirnar sem þú berð," gated strictly on signed-in email matching the owner email, never a URL param.
- Per-prayer status, the author-only "beðið með þér" line, add-update (moderated), opt-in management. Your call on whether a person may self-mark answered.
- Build the agreement-digest cron (positive delta only, soft "margir" wording, then snapshot the baseline). Add a server-side rate limit on the pray-along counter so it can't be botted.
- The answered transfiguration (kerti-gold treatment) and the one skippable testimony invite into the existing pipeline.
- Ship the retention sweeper alongside this so the sensitive store is demonstrably bounded.

*Outcome:* the full loop. A stranger's email becomes a held prayer, a prayer that comes back, a recallable thread, and when God answers, a testimony that builds the next person's faith. No password, no vanity, no nagging, bounded retention.

## Guardrails

- Never send the answered note from a cron, a count, or a heuristic. Only a deliberate human action with the "how do we know" field filled. If Omega doesn't know, it stays unsent. One send per prayer ever.
- Never auto-email a prayer that lacks the explicit consent. Legacy prayers are permanently no-send. Treat null as no-send.
- Never put a donate, watch, or event link in the answered note or the agreement digest. Enforce no-CTA in code.
- Never promise the daily prayer until it rotates and the domain is verified and one real 7am send has gone out.
- Never cross the two data paths. The devotional signup writes only to subscribers; the prayer flow writes sensitive data only to prayers and notifications. If anyone proposes merging them "to save a step," refuse.
- Never surface "beðið með þér" as a public, ranked, live, or aggregated number. Author-only, second-person, weekly rollup.
- Never pre-tick or bundle the two consent boxes. Separate, unticked, independent.
- Never gate recall on a URL param. Authorize strictly on signed-in email matching the owner email.
- Never let a send job run uncapped. The canonical guard set, always.
- Never enable a send while the sender contains `resend.dev`.
- Never make the anonymous walk-away path heavier.
- Never route a crisis prayer into only a moderation queue. Flag it for a named human. The wall is a ministry, not a database.

## Decisions for you

- **Can a person mark their own prayer answered in /min-baen, or is it admin-only?** Recommended: allow self-mark for the on-screen transfiguration and the testimony invite, but keep the answered email admin-only and truth-gated. Self-marking changes their own view and offers the testimony bridge; it never triggers an outbound note. Warm for the person, no risk of an untrue email.
- **Daily prayer source: one shared prayer for the nation, or personalized?** Recommended: shared, deterministic by date. One word, one nation, one morning. Curate a pastor-touched pool; never auto-recycle generated lines.
- **Prayer-body retention period.** Recommended: both, whichever comes first, 18 months from submission or 6 months after answered. Defensible and demonstrably bounded. Confirm the numbers so the sweeper and privacy page can state them.
- **Do the weekly letter and daily word ever carry a donation ask?** Recommended: the weekly letter pastoral-first with light "what's on the channel" promotion (legally fine, it's opted-in marketing). The daily word, answered note, and agreement digest stay strictly bare.
- **Sender addresses.** Recommended: `baen@omega.is` for the answered note and digest, `postur@omega.is` for the daily word and letter. Needs the legal entity name and address for every footer.
- **Does the answered note ever go to people who prayed with a prayer, or only the author?** Recommended: author-only. Notifying pray-along taps would mean capturing emails from a one-tap action and dilutes the sacredness.

## Success signals

- The first time Omega sends a true answered-prayer note, confirmed by a real human. That single send is the lane working, regardless of count.
- A grieving or crisis prayer gets a human pastoral response, not just a queue approval.
- Believers come back to `/min-baen` on their own to find prayers they bore weeks ago still held and warm.
- Answered prayers begin flowing into the testimony pipeline by the believer's own choice.
- People stay subscribed to the daily word. Low unsubscribe means it is wanted, not nagging.
- Zero broken promises: no one told "confirmed" while unverified, no daily email promised that doesn't arrive, no "answered" note that wasn't true.
