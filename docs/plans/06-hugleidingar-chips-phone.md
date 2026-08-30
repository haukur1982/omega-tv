# Hugleiðingar editor: tap-to-take chips + phone review

Spec by the planning session (2026-08-30). Implements Hawk's feedback after a week of
daily use: (1) the three suggestion cards eat the laptop screen, (2) he wants to mix
words from *different* suggestions, (3) he wants to review on his phone.

Design source for the phone interaction: `~/Projects/book-system/`
`REVIEW_EXPERIENCE_PLAN.md` + `apps/web/src/components/revisar/suggestion-sheet.tsx`
("one sheet, one question, one unit"). Read both before building — copy the *thinking*,
not the Spanish code.

## The core idea

Stop treating a suggestion as one paragraph-sized thing. A suggestion is really 5–10
small edits. Render each edit as a **tappable chip** (`old → new`); tapping applies just
that edit to the current text. Mixing across registers falls out for free: tap one chip
from Nákvæmt, another from Eðlilegt. "Nota" (take the whole rewrite) stays.

## Files

- `src/lib/devotional-review.ts` — already has `diffWords()` (LCS) and `isDifferent()`.
  ADD two pure, client-safe functions:
  - `groupEdits(current: string, suggestion: string): Edit[]` — run `diffWords`, group
    maximal contiguous runs of non-`same` ops into edits. Each `Edit` carries: the
    removed words, the added words, and enough positional anchoring (e.g. index of the
    edit's start in the current text's word array + the full expected removed run) to
    apply it safely.
  - `applyEdit(current: string, edit: Edit): string | null` — verify the anchor still
    matches (the removed run is still there at that word position); if yes return the
    new text, if not return `null` (caller silently drops the stale chip).
  - Join words with single spaces. The corpus is plain Icelandic prose; „quotes" are
    part of word tokens already, so this is safe. Do not get clever with punctuation.
- `src/app/admin/hugleidingar/[slug]/page.tsx` — the reading room. READ IT FULLY FIRST.
  It has: vellum SHEET_CSS (`--paper:#F3EDE0`, `--ink:#1B1814`), `ProseLine` auto-growing
  textareas, localStorage draft autosave + warn-on-leave, per-paragraph revert, ⌘S,
  ⌥↓, focus mode, the Ósk box, Hlusta (SpeechSynthesis is-IS), and the current
  three-stacked-cards suggestions UI fed by `/api/admin/devotionals/suggest`.
- New components may be extracted to `src/components/hugleidingar/` if the page file
  gets unwieldy — builder's call. The suggest API route is NOT to be changed.

## Part 1 — laptop: compact suggestions

1. Replace the three stacked cards with ONE card + a segmented control:
   **Nákvæmt · Eðlilegt · Prédikun**. Remember last-used tab in localStorage.
2. Inside the active tab: the existing full-diff preview, then a **chip row**: one chip
   per grouped edit, showing `old → new` (old struck through in the muted red already
   used, new in the green tint). Tap = `applyEdit` into the paragraph's textarea value
   (through the same state path a manual edit takes, so autosave/revert/corrections
   recording all keep working).
3. After ANY apply (chip or Nota), recompute `groupEdits` for all three registers
   against the new current text; chips that no longer apply disappear; a chip whose
   edit is already present renders in a quiet "taken" state (gull check, not tappable).
4. Nota keeps applying the whole rewrite for the active tab.
5. Keep every existing keyboard behavior. The card must be visibly ~1/3 the height of
   the old three-card stack for a typical paragraph.

## Part 2 — phone: tap the paragraph, get a sheet

At ≤ 768px the reading room switches mode:

1. The piece renders as a *reading page* — the vellum sheet, title, paragraphs as plain
   prose (no visible textareas). Reviewed/published state and the Yfirlesin button stay
   reachable at the bottom.
2. Tap a paragraph → it highlights, a **bottom sheet** slides up (fixed, rounded top,
   backdrop; drag down ≥ 90px or tap backdrop to dismiss — never dismiss on accident,
   see book-system's `DISMISS_PX`). Sheet contains, top to bottom:
   - the paragraph in an auto-growing textarea (same ProseLine mechanics; NEVER an
     inner scrollbar — the sheet itself scrolls if the paragraph is long),
   - the English source in small muted type beneath (collapsible),
   - a **Tillögur** button → fetches suggestions (same API), then the register tabs +
     chip row from Part 1 (same shared component),
   - Vista. Saving closes nothing — he may keep editing; show the existing
     "Vistað — smelltu á „Yfirlesin"…" nudge.
3. Touch targets ≥ 44px. Chips wrap; long chips truncate the middle, never the ends.
4. iOS keyboard dictation works in any textarea for free — do not build voice input.
5. Draft autosave, warn-on-leave, revert must work identically in sheet mode (same
   state, different rendering).
6. Check `/admin/hugleidingar` (month grid) at 390px; fix only what's broken.

## Non-goals

- No changes to the suggest API, the DB layer, the public site, or the Ósk box logic.
- No new palette; vellum tokens only. No framer-motion additions if CSS transitions do.
- Desktop editing flow stays textareas-inline exactly as today.

## Acceptance (verify, don't assume)

Dev server already runs on port 3010 (do NOT start another; project owns 3010).
Verify in the Browser pane against a real piece (e.g. open `/admin/hugleidingar`, take
the "Halda áfram" day). If admin auth blocks the subagent browser session, verify what
you can by build + reasoning and SAY SO in Not checked.

1. `npm run build` exits 0. `npm run lint` adds ZERO new errors/warnings in touched
   files (repo lint is pre-existing red elsewhere — do not fix unrelated files).
2. Desktop 1440px: one suggestion card with tabs; chips apply single edits; two chips
   from two different registers can both land in one paragraph; recompute works.
3. Phone 390px: reading mode, tap → sheet, edit, Tillögur chips, Vista; no horizontal
   overflow; sheet never traps scroll.
4. Nothing regressed: ⌘S, revert, focus mode, Hlusta, Yfirlesin, draft autosave.

Commit on the current branch (`feat/omega-web-bridge`) when green, message style:
`feat(hugleidingar): tap-to-take chips + phone review sheet`, with the
`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` trailer.

Report back with an Observed / Not checked ledger.
