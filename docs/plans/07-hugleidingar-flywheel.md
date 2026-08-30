# Hugleiðingar at article scale: flywheel, flag-first nav, pre-warmed suggestions

Spec by the planning session (2026-08-30). Follows and depends on
`06-hugleidingar-chips-phone.md` (chips + phone sheet). Build ONLY after 06 is
committed; both touch the reading room and the month grid.

The occasion: this editor is about to grow from 62 devotionals into Hawk's standard
review tool for a large translated article library. Three moves make that tractable.

## Part 1 — close the flywheel (the big one)

Today every save records corrections (`recordCorrections` in
`src/lib/devotional-db.ts`) and the suggest route reads recent corrections as
house-voice examples. But the glossary is empty and nothing turns accumulated
corrections into durable rules. Fix the loop:

1. **Mining script** `scripts/mine-corrections.ts` (pattern-match the existing scripts'
   env/DB handling; the pooler connection string is documented in
   `~/.claude/projects/-Users-haukur-Projects-omega-tv/memory/reference_supabase_connection.md`).
   It reads all rows of `devotional_corrections`, uses the existing `diffWords` from
   `src/lib/devotional-review.ts` to extract word/phrase-level substitutions, and
   aggregates: any `old → new` substitution seen **≥ 2 times across different
   paragraphs** is a candidate rule.
2. **Output, two destinations:**
   - Term-like candidates (1–3 word substitutions, stable across contexts) →
     proposed glossary entries. Print them and, with `--apply`, upsert via the
     existing `upsertGlossaryTerm`. NEVER auto-apply without the flag.
   - Phrasing-like candidates (longer, stylistic) → a generated rules file under
     `src/lib/translation-rules/` (READ that directory first and match its existing
     format/conventions exactly; it already exists for this purpose).
3. **Feed the suggester:** the suggest route
   (`src/app/api/admin/devotionals/suggest/route.ts`) additionally loads glossary
   terms + mined rules into its prompt as hard constraints ("house terminology,
   always use X for Y"), ahead of the raw correction examples. Keep total prompt
   growth bounded (cap rules included, most-frequent first).
4. **Surface it:** a small "Námu reglur" (mined rules) admin note is NOT needed as UI.
   The script's report output (counts: corrections read, candidates found, applied)
   is enough. Cross-system note: BookForge consumes rules separately; do NOT modify
   `~/Projects/book-system`. The rules file in this repo is the hand-off artifact.

## Part 2 — flag-first navigation

The measured reality: 1,851 paragraphs, 61 flagged (3%). Reviewing must start where
the problems are.

1. **Reading room** (`src/app/admin/hugleidingar/[slug]/page.tsx`): add
   next-flagged-paragraph jump. ⌥⇧↓ jumps to the next paragraph that has flags
   (⌥↓ stays next-paragraph as today); a visible "Næsta flagg ↓" button does the
   same for mouse/touch, shown only when flags exist. Wraps around; when no flags
   remain, the button disappears.
2. **Month grid** (`src/app/admin/hugleidingar/page.tsx`): each day cell that has
   unreviewed flagged paragraphs shows a small count chip (gull tint, vellum style).
   Add one sort/filter toggle above the grid: "Röð: dagatal / mest flöggað". Default
   stays calendar order. This is the seed of the future article queue; do not build
   a separate queue page yet.
3. Flags are computed client-side today via `flagParagraph`; for the grid, compute
   server-side at page load using the same shared function against each piece's
   paragraphs + glossary (it is client-safe pure code; importing it server-side is
   fine). If that makes the grid slow, compute for the current month only.

## Part 3 — pre-warmed suggestions

Kill the mid-flow Gemini wait.

1. **New table** `devotional_suggestions`: `devotional_id`, `paragraph_index`,
   `body_hash` (hash of the exact Icelandic paragraph the suggestions were computed
   for), `suggestions` (jsonb, the same three-register payload the API returns),
   `created_at`. Unique on (`devotional_id`, `paragraph_index`). RLS locked like the
   sibling tables; server-only access via `supabaseAdmin`. Create it with a SQL
   migration executed through the pooler; save the SQL under `docs/backups/` naming
   convention used by earlier migrations if one exists, else `scripts/sql/`.
2. **Warm script** `scripts/warm-suggestions.ts`: for each published-pipeline piece,
   run `flagParagraph` per paragraph; for flagged paragraphs missing a cache row (or
   whose `body_hash` is stale), call the same generation logic the suggest route uses
   and store the result. **Cost guards are mandatory** (this project has a real
   cost-runaway scar): `--limit N` default 80 paragraphs per run, skip-if-cached,
   never loop on a failing paragraph (one retry, then record the failure and move
   on), print a spend summary (count of Gemini calls) at the end.
3. **API**: extend the suggest route with cache behavior: on request, if a fresh cache
   row matches the current paragraph hash, return it instantly (marked `cached: true`);
   otherwise generate as today AND write the cache row. The editor/phone sheet need
   no changes beyond tolerating the extra field.
4. Do not wire a cron. Hawk runs the warm script manually (or the import script can
   invoke it with the same guards) until the pattern proves out.

## Non-goals

- No generalization of the devotional schema to "articles" yet. That happens when the
  article library actually lands (recorded as an architecture note: same reading room,
  same chips, same flywheel, generic pieces table; decide then, not now).
- No second-reviewer share links, no queue page, no BookForge changes, no cron.

## Acceptance (verify, don't assume)

Dev server runs on port 3010; never start another.

1. `npm run build` exits 0; zero new lint errors/warnings in touched files.
2. Mining: run `scripts/mine-corrections.ts` (dry) against the real corrections table;
   report actual counts. If ≥1 candidate exists, show it verbatim in the ledger. With
   `--apply` on at most ONE clearly-safe term (if any), verify it appears via
   `listGlossary` and that `flagParagraph` then flags a violating paragraph.
3. Flag-nav: in the browser, verify ⌥⇧↓ and the button jump across a real piece with
   flags; verify the month grid shows count chips and the sort toggle reorders.
4. Pre-warm: run the warm script with `--limit 5`; verify rows land in
   `devotional_suggestions`; then request suggestions in the editor for a warmed
   paragraph and verify the response is the cached one (instant, `cached: true`).
   Edit the paragraph, request again, verify it regenerates (hash mismatch).
5. Nothing regressed from 06: chips, tabs, phone sheet, ⌘S, revert, autosave.

Commit on `feat/omega-web-bridge` when green, message style
`feat(hugleidingar): correction mining, flag-first nav, suggestion cache`, with the
`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` trailer. Report an
Observed / Not checked ledger.
