# Meta Business Portfolio — Omega setup

One-time setup so Omega owns its own Meta presence and Pikk (Birkir) works
inside it as a **partner, never an owner**. About 10 minutes. Done from
Hawk's Facebook account (the one with admin on facebook.com/Omegasjonvarp).

## The principle (why this order matters)

Omega's portfolio → owns the page, the Instagram, the ad account, and later
the pixel. Birkir gets **partner access** with task permissions. If Pikk ever
disappears, nothing is lost. If assets were created under Pikk's portfolio
instead, Omega could lose page, ad history, and audiences overnight. Any
legitimate agency happily works as a partner.

## Step 1 — Create the portfolio (5 min)

1. Go to **business.facebook.com** → "Create a business portfolio".
2. Business name: **Sjónvarpsstöðin Omega**
3. Your name: Haukur. Business email: **omega@omega.is** (official inbox;
   confirmation mail may land there — Eiríkur can forward it, or use
   haukur1982@gmail.com if speed matters today and change later).
4. When asked for details: website **omega.is**, country Iceland.
5. Turn on **two-factor authentication** when prompted (Meta effectively
   requires it for portfolios; use your phone).

## Step 2 — Claim the page + add a second admin (2 min)

1. Business settings → **Accounts → Pages → Add → Claim an existing page**
   → choose **Omega** (facebook.com/Omegasjonvarp). Instant, since you're
   page admin.
2. Business settings → **People → Add** → invite **Eiríkur** (his FB email)
   as a second **admin** of the portfolio. Never one-admin-only — if your
   account gets locked, Omega keeps control.

## Step 3 — Instagram (3 min)

1. If Omega has no Instagram yet: create the account in the Instagram app or
   instagram.com — username **omegasjonvarp** (matches the FB handle),
   email omega@omega.is. Profile pic: `design/facebook/omega-profile.png`
   (same Ω mark as Facebook).
2. Switch it to a professional account (Settings → Account type).
3. Business settings → **Accounts → Instagram accounts → Add** → log in
   once to connect it to the portfolio.

## Step 4 — Ad account (2 min)

1. Business settings → **Accounts → Ad accounts → Add → Create a new ad
   account**.
2. Name: **Omega auglýsingar** · Time zone: **Atlantic/Reykjavik** ·
   Currency: **ISK**.
3. Payment method: **Omega's card** (Eiríkur's/the station's — NOT Pikk's,
   and not a personal card if avoidable). This keeps every króna of ad
   spend visible on Omega's own statements.

If Birkir suggests running ads from *his* ad account instead: politely
decline. Omega's ad account, his hands on the wheel via partner access.

## Step 5 — Give Pikk partner access (2 min)

1. Ask Birkir for **Pikk's Business Portfolio ID** (he'll know exactly what
   that is; it's a number in his own Business settings).
2. Business settings → **Partners → Add → Give a partner access to your
   assets** → enter his ID.
3. Assign assets + permissions (task-level, not "everything"):
   - **Page Omega**: content (create/manage posts), messages if agreed.
     Not "full control".
   - **Ad account Omega auglýsingar**: manage campaigns.
   - **Instagram**: content.
4. That's it — he can work immediately, and every permission is revocable
   in one click under Partners.

## Later (when ads actually start)

- **Pixel/dataset**: create it under Omega's portfolio (Data sources →
  Datasets), give Pikk partner access to it. Claude adds the pixel to
  omega.is — BUT a consent banner (GDPR) must ship first; the site has
  none today. Do not let anyone install a pixel before that.
- Record the Portfolio ID + ad account ID in CLAUDE.md's service table.

## Red lines (repeat)

- Assets live in **Omega's** portfolio. Always.
- Birkir = **Partner** with task permissions. Never admin, never owner.
- Ad spend billed to **Omega's** card, in Omega's ad account.
- Two admins (Hawk + Eiríkur), 2FA on.

## Gotcha: auto-restriction on a brand-new portfolio (hit 2026-08-20)

Minutes after creating the portfolio + claiming the page + opening the
partner screens, Meta auto-restricted the business: "created or used with an
automation that doesn't follow our rules" (Advertising Standards → Account
Integrity). No ads, no pixel, no boosting, no managing ad assets.

This is a routine false positive on new portfolios, especially when the
creating profile already belongs to several other portfolios and the setup
steps happen in a rapid burst.

**Do:** click *Request review* once (179-day window; usually clears in
24–48h). Tell the agency — they see this constantly.

**Don't:** create a second portfolio, or resubmit repeatedly. Meta reads
that as evasion and it can escalate to a permanent ban.

**Note:** the Facebook Page itself is not restricted by this — posting and
followers are unaffected. Only the portfolio's advertising capabilities.

**Interim fallback if review drags:** the agency uses *Request shared access
to a Facebook Page* from their own portfolio (access only, no ownership
transfer). Accept the tradeoff knowingly: ads then run from their ad
account, so ad history/audiences accrue on their side. Temporary only.
