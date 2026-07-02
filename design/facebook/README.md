# Facebook facelift kit — facebook.com/Omegasjonvarp

Everything for the page facelift in one sitting. Assets regenerate with
`node scripts/make-facebook-assets.mjs`.

## 1. Upload the images

| What | File | Where in Facebook |
|------|------|-------------------|
| Profile picture | `omega-profile.png` (1024×1024) | Page → profile photo. Displays circular; the mark is centered for the crop. |
| Cover photo | `omega-cover-photo.png` (1640×720) | Page → cover photo. The village photo with the lockup and "Ljós inn á heimili Íslendinga". Designed to survive both desktop (820×312) and mobile (640×360) crops. Don't reposition; leave centered. |
| Cover (alternate) | `omega-cover.png` (1640×720) | Typographic-only fallback. Not the primary choice; the photo version is. |

## 2. Page settings (paste-ready)

**Display name:** Sjónvarpsstöðin Omega
**Handle:** @Omegasjonvarp (keep, it's established)
**Website:** https://omega.is
**Category:** Broadcasting & media production company / TV channel

**About (short bio):**

> Ljós inn á heimili Íslendinga síðan 1992. Beint streymi, þættir, orð dagsins og bænatorg á omega.is. Rás 6 hjá Símanum.

**About (long / additional info):**

> Omega hefur borið ljós inn á heimili Íslendinga síðan 1992. Á omega.is finnur þú beint streymi, nýjustu þættina, orð dagsins og Bænatorgið, þar sem beðið er fyrir hverri bæn sem berst. Sjónvarpið er á rás 6 hjá Símanum og hjá Vodafone.

**Action button:** „Skrá þig" (Sign up) → `https://omega.is/frettabref`

## 3. Pinned post (the relaunch announcement)

Post this, then pin it to the top of the page:

> Eftir 33 ár í sjónvarpinu er Omega nú líka komin heim til þín á netinu.
>
> Nýja heimasíðan okkar er opin á omega.is. Þar finnur þú beint streymi, nýjustu þættina, orð dagsins og Bænatorgið, þar sem beðið er fyrir hverri einustu bæn sem berst.
>
> Sjónvarpið heldur áfram á rás 6 eins og alltaf.
>
> Viltu fá sunnudagsbréfið okkar í pósthólfið? Skráðu þig á omega.is/frettabref

## 4. After the facelift

The page stops looking dead the day the rhythm starts (see
`docs/plans/04-audience-system.md`): daily Orð dagsins card, three clips a
week, Wednesday prayer post, Sunday letter excerpt. All scheduled in advance
via Meta Business Suite in the Friday batch session, so the page stays alive
even in a bad week.

Brand rules that apply here (from the design system): Icelandic only, no
emoji, warm-black backgrounds (never pure black), amber is for invitations,
the red dot means LIVE and nothing else.
