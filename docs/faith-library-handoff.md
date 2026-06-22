# Faith Library — handoff for the design rebrand

A filterable, visual article library for `/greinar` ("Omega Tímaritið"), replacing the old
vertical list. Built and verified on the **current** design system. Per Hawk (2026-06-20), it
should be **folded into the `claude-design-rebrand` branch** so it ships with the new visuals
instead of being deployed on its own. Do not deploy `feat/faith-library-articles` to production
standalone.

## Already LIVE (Supabase data, no deploy needed)
- **14 articles** in the `articles` table, all categorized and clean (person in `author_name`,
  a "Heimild: … Almenningseign." source line in the body, plain text).
- **12 sermon `editor_note`s** rewritten to Omega's impersonal editorial voice (no first-person "ég").
- One sermon description (Alfons ræðir við Viktor Harðarson) fixed (was leaking raw transcript).
- These render in the *current* layout today; the rebrand only needs to restyle, not re-enter data.

> ⚠️ Do NOT run `scripts/import-faith-articles.ts`. It imports with no category, drops the full
> byline into `author_name`, and writes HTML. It damaged rows once. The clean path is
> `scripts/print-faith-insert.ts` / `scripts/print-faith-txt-insert.ts` → run the printed SQL.

## Data contract (stable — the rebrand can rely on this)
- **Table `articles`** (`src/types/supabase.ts`): `slug, title, category, content, excerpt,
  author_name, featured_image (nullable), published_at`. `content` is plain text with `\n\n`
  paragraph breaks; paragraphs starting with `«` or `„` render as blockquotes.
- **Categories** (`src/lib/article-categories.ts`): 7 topics, each `{ key (the DB value), slug
  (URL), label, blurb }` — Lækning, Frelsun, Trú, Bænheyrsla, Afturhvarf, Englar, Ævisögur.
- **DB access** (`src/lib/articles-db.ts`): `getAllArticles()`, `getArticlesByCategory(key)`,
  `getArticleBySlug(slug)`.

## UX intent (please preserve through the rebrand)
- A **featured hero** (newest piece, with its image).
- A **sticky topic filter** (the 7 topic chips + "Allt") that filters **in place**, plus a **search** box.
- Default browse = **streaming-style topic rows** (one horizontal row per topic; each has a
  "Sjá allt" link to `/greinar/flokkur/[slug]`).
- When a topic or search is active = a **card grid** of matches.
- Built **big and legible** for an older readership (audience skews 60–75); cream reading
  surfaces, gold accents, few clicks.

## Reference implementation (on `feat/faith-library-articles` — restyle freely)
- `src/components/articles/ArticleLibrary.tsx` — the whole browse experience (client component).
- `src/app/greinar/page.tsx` — dark masthead + `<ArticleLibrary />`.
- `src/app/greinar/flokkur/[slug]/page.tsx` — per-topic landing page.
- `src/components/articles/TopicStrip.tsx` — topic chips (used on the topic pages).
- `src/components/articles/{article-helpers.ts, LetterPlaceholder.tsx}` — helpers + image fallback.

## Commits to integrate (origin/feat/faith-library-articles)
- `c97d63e` feat(greinar): faith-library topic browse + first translated articles
- `58fee00` fix(sermons): editor notes in Omega's editorial voice, not first person
- `52c7aa5` fix(content): safe metadata fallback + clean faith-library importers
- `332e70d` feat(greinar): visual filterable article library
- Keep the `scripts/generate-metadata.ts` change so new shows generate editor notes in the
  institutional voice (and the fallback never publishes raw transcript).

## Notes
- **Images**: cards and hero show an elegant letter-cover when `featured_image` is null. Real
  images (e.g. public-domain author portraits) will elevate it — set `articles.featured_image`.
- **Em dashes**: removed from the greinar masthead and the two own-article titles. Hawk dislikes
  em dashes site-wide; other pages' copy (home hero, sermons, give) still has them to clean.
