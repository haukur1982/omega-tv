# Omega devotional email experience

19 September 2026 · Email and reading design approved; release status in STATUS.md

The interview launch gives readers a working signup and an open first devotional. The whole email experience is not yet ready to be called exceptional: regular devotional sending has not been built, and a browser preview does not prove inbox rendering or delivery.

## The recommendation

Make this a devotional publication people look forward to receiving. Keep the readings open on the website. Subscription offers the convenience of receiving the complete reading in their inbox.

Use the same calm cream, ink and Nordic blue throughout. Large readable type, space between paragraphs, clear Scripture passages, and one unhurried invitation to spend time with the Lord. Preserve the reviewed translation in full. Avoid crowded promotions, image-heavy layouts, forced accounts and interruptions during reading.

## Prepared in this pass

- **Welcome:** an immediate receipt, honest explanation that daily sending is in preparation, and the opening Scripture with a direct link to the first reviewed, published reading. If content is temporarily unavailable, the basic receipt still works. Existing recipients do not receive a second welcome because this code was changed.
- **Devotional email:** the full first reading, all 25 original paragraphs, plain-text alternative, readable Scripture styling, a reading-time estimate, author/source attribution and links to read or share the open website. The additional “Stöldrum við” paragraph is Omega's invitation after the author's text. The template rejects draft, unreviewed and empty readings. It renders an email; it does not send one.
- **Website reading:** the email's warm paper and Georgia typography, a comfortable reading column, adjustable text from 18 to 28 pixels (22px default), separate Scripture references, a reading-time estimate and sharing. The reviewed text and publication gate are unchanged. Font size currently lasts for the page visit; it is not saved between visits.
- **Unsubscribe:** opening a link shows a confirmation instead of deleting a subscriber. Devotional links remove only that topic, preserving other subscriptions. Removing the last topic removes the subscriber row; a conditional update/delete protects concurrent opt-ins. Explicit legacy all-list links retain their original scope. Provider one-click requests return an empty 200, without a redirect. Invalid input and failures do not claim success.

Preview files are in `output/email/`. The HTML previews have inactive unsubscribe links and contain no subscriber data. The official logo is a crisp PNG with its tagline set underneath as readable 14px text. See STATUS.md for the latest production deployment.

## What still separates this from a complete service

**Editorial rhythm.** One first-morning piece is currently published. Build a buffer of reviewed readings before switching on daily delivery. My recommendation is one morning email at a consistent Icelandic time when that buffer and the sending process are ready. Until then, keep the current clear “sending is in preparation” promise. Do not publish translations automatically to fill a schedule.

**Delivery that can be trusted.** Build a dedicated devotional sender with a durable per-recipient record, a fixed reading identity, safe retries and a fresh opt-in check before each send. A failure for one person must be retryable without sending everyone else another copy. Do not reuse the general-newsletter batch sender unchanged: it stamps the whole newsletter sent after any successful delivery, which prevents ordinary retry of the failed recipients.

**Mailbox feedback.** Configure and verify provider feedback for bounces and complaints, then suppress affected recipients before the next send. Have an admin view that shows what was queued, accepted, delivered or failed. A provider accepting a message does not prove it arrived in the main inbox.

**Real inbox testing.** Send the reviewed sample only to agreed test recipients and check Gmail, Apple Mail and Outlook, including dark mode, images disabled, links and unsubscribe. The HTML is intentionally conservative and includes dark-mode styles, but client support varies; the browser checks performed here are not an inbox-client matrix.

**Rejoining another list.** A reader who opts out of devotionals while keeping another Omega subscription retains their subscriber ID. If they later rejoin devotionals, the existing welcome history currently says “already sent” rather than sending a new welcome. Decide and implement a per-enrollment receipt before calling that edge of the journey finished. Do not indiscriminately clear welcome history to resend mail.

The general station newsletter, “Bréf frá Eiríki,” remains separate. This pass focuses on the devotional journey discussed in this task.

## Verification and source references

The email contains all 25 published paragraphs; HTML size is about 16 KB. Desktop and 390-pixel browser previews were checked. All 25 web paragraphs also match the source exactly after presentation markup is removed. Eighteen tests cover Scripture reference separation, text preservation, HTML escaping, publication gates, welcome fallback, scanner-safe GET, topic scope, one-click responses, malformed input, failures and concurrency. A disposable unverified `.invalid` subscriber verified the actual local endpoint against Supabase and was removed afterward. One requested inbox sample was delivered to Hawk, who liked the design. The subsequent logo refinements have browser verification; a complete email-client matrix is still outstanding. No campaign or daily sending was activated.

One-click behavior follows [Resend's unsubscribe documentation](https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails) and [RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058). Email-client CSS support is documented by [Can I Email](https://www.caniemail.com/features/css-at-media-prefers-color-scheme/).
