# Omega: homepage and reasons to return

19 September 2026 · Hawk asked for a homepage review, improvements and thoughts
on Israel / Christian news. This is an editorial recommendation, not an
approved publishing schedule.

## What the homepage needed

The warm Icelandic photography, Omega identity and readable editorial design
already work. The main weakness was finding something worth reading quickly
and knowing what was actually current.

The live audit found a July 3 prayer labelled “Bæn dagsins,” a June 28 teaching
labelled “Þáttur vikunnar,” and invented prayer messages when the real list
was empty. The large hero, generic devotional promotion and five equal cards
made a simple first step harder to see.

The update gives the reviewed devotional a real opening quotation, reading
time and direct link; places the existing optional email signup beside it;
shortens the hero; and gives its secondary button a direct reading destination.
Older prayers keep their dates and use “Sameinumst í bæn.” Archive teaching is
labelled “Úr safni Omega.” Empty prayer lists invite participation. Mock
episode links are removed. Future scheduled prayers are withheld. Real prayer
excerpts can be advanced by the reader instead of automatically changing.
The tablet audit also found clipped navigation. The full navigation now starts
at 1280px, with the menu available below that width. The menu closes on Escape
or when returning to desktop size. The prayer's decorative first letter now
uses CSS so screen readers receive the complete first word.

## A rhythm people can depend on

- **A quiet reading:** publish reviewed devotionals on a sustainable schedule.
  Keep every reading open; email is the convenience of receiving it. Start
  daily delivery only after the sender and a buffer of reviewed readings are
  ready. The current receipt correctly says daily delivery is in preparation.
- **A weekly selection:** a short “Vikan með Omega” email with one reading,
  one programme and two or three carefully selected stories. A manageable
  starting point is three news briefs per week, gathered into that digest.
- **Icelandic voices:** short testimonies, conversations with people serving
  their communities, and church events with confirmed dates. This gives
  readers something a translated international feed cannot provide.
- **A place to participate:** prayer requests and, with permission, follow-up
  testimonies. Never imply that a private request or answer can be published
  merely because it was submitted.

Keep the homepage reading and programme selections current. As the library
grows, add a useful next reading and then saved / continue-watching features
if viewers need them. Prioritize the editorial rhythm over additional widgets.

## Israel and Christian news

Recommend Israel alongside Christian stories from Iceland and abroad. An
optional scope question was sent to Hawk; this recommendation can be narrowed
if he prefers an Israel-only section.

Useful starting sources, checked on their own sites:

- [CBN / The 700 Club Israel](https://cbn.com/700-club-israel): news,
  testimonies, interviews and Christian life in the Holy Land. Omega already
  carries CBN Israel broadcasts. A natural starting point for linked coverage.
- [ALL ISRAEL NEWS](https://allisraelnews.com/about): reporting and analysis
  for a Christian audience, explicitly from an evangelical / Messianic
  perspective. Useful, with that perspective clearly understood.
- [Latin Patriarchate of Jerusalem](https://www.lpj.org/en): primary accounts
  from local Christian communities and church work. Include local Jewish,
  Arab and Palestinian Christian voices rather than relying on one outlet.

For each brief: say what happened, where and when; explain its relevance;
name and link the original source. Write an original Icelandic summary.
Keep reporting, commentary, teaching and testimony visibly distinct.
Check disputed conflict claims against additional reliable reporting and
original documents. Do not present a headline as proof of a prophetic claim.
Use images only with appropriate rights. Correct significant errors visibly.

AI can collect candidates and prepare drafts; an editor checks the sources,
Icelandic wording and publication choice. No unattended publishing is proposed.
Start with a small reviewed set, then add the section to the homepage when
it has enough worthwhile, recent material.

## Existing infrastructure and next decisions

News pages and admin components exist, but production reports a missing
`news_items` table. Completing that needs a separately authorized database
change and verification of draft, scheduling and publication controls. This
homepage work changes no schema, publishes no news and starts no automation.

Daily devotional delivery, retries, reviewed content buffer and email failure
handling remain separate work in `newsletter-experience-review.md`.

After a consistent month, assess returning readers and email-to-reading
clicks, alongside real feedback from viewers. No new tracking is introduced
by this update. Use actual readership to decide whether to increase frequency.
