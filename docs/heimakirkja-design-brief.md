# Heimakirkja — design brief / handoff for the rebrand

For the Claude Design workstream. Goal: rebuild the `/heimakirkja` page into the new
visual system and make it **cinematic** ("a vision for the future, something that can
change the nation"). A working reference implementation already exists with all copy and
structure; see "Reference build" below. Restyle it and layer in real media.

## 1. The why (concept)
Heimakirkja is a registered Icelandic faith org (skráð trúfélag) created by Omega's founder.
The state pays ~**1.221 kr/month** in sóknargjald for every person 16+ to a registered
faith org, drawn from taxes already paid. A member can redirect theirs to Heimakirkja at
**0 kr. extra cost**. The aim: ~**3.000 members** (≈ 44 millj. kr/year) as a stable
foundation for the channel (cable, rent, staff, studio, translations, content). It's
especially for people who have left church but not faith.

## 2. Art direction (what "impressive" means here)
The page must **sell vision first, mechanism second**, and feel like a movement, not a form.
Reference Hawk loves: theaterofdreams.com (cinematic, alive, "a door").
- **Real, full-bleed media** behind the hero and 2-3 section moments is THE missing ingredient.
  Direction: Icelandic land at dawn / aurora, homes lit at night, faces, hands, light through
  clouds, a glowing screen reaching a home. Warm, hopeful, transcendent.
- Keep Omega's warm-but-LIGHT north star, but this page may carry more drama than the calm
  content pages (it is a special vision moment).
- Motion: slow ken-burns on hero media, scroll-reveal on sections, subtle parallax. Tasteful.
- Type: existing serif (Fraunces/Newsreader) at large display scale; lean into scale for the
  hero and the closing.

## 3. Voice + accuracy rules (do not break)
- Warm institutional voice ("við / þú"). The "heart" section is a placeholder in Omega's
  voice; Hawk may supply the founder's real first-person words. Do NOT fabricate a personal "ég".
- **No em dashes** anywhere (Hawk's standing rule). Use periods, commas, "og".
- Þjóðskrá facts that must stay correct: registration is **free and same-day** with rafræn
  skilríki; **one félag per person**; **children 15 and under do NOT follow automatically**
  (a separate child form is required). Do not overpromise auto-enrollment.
- Registration link: https://www.skra.is/umsoknir/rafraen-skil/tru-og-lifsskodunarfelag/

## 4. Structure + locked copy (source of truth)
1. **Hero** (full-screen, cinematic media)
   - Kicker: HEIMAKIRKJA
   - H1: "Kirkjan heim til þjóðarinnar."
   - Sub: "Omega hefur borið fagnaðarerindið inn á íslensk heimili í meira en þrjá áratugi. Nú getum við byggt næsta kafla saman."
   - CTAs: "Skráðu þig (0 kr.)" (→ skra.is) · "Sjá hvernig það virkar" (→ #skraning)
2. **The mechanism (simple, second)**
   - "Sóknargjaldið fer hvort eð er eitthvað. Þú færð að velja hvert."
   - Body: "Ríkið greiðir 1.221 kr. á mánuði fyrir hvern einstakling 16 ára og eldri til skráðs trúfélags. Þetta heita sóknargjöld og þau koma af sköttunum sem þú borgar hvort eð er. Þú getur valið að þau renni til Heimakirkju. Það kostar þig ekki eina krónu í viðbót."
   - 3 stats: "0 kr." (enginn aukakostnaður) · "Þitt val" (þú ræður hvert gjaldið fer) · "2 mínútur" (skráning hjá Þjóðskrá)
3. **Vision**
   - H2: "Ef 3.000 manns segja já, verður það grunnur undir heila kristna fjölmiðlastöð." (Hawk wants this framing OVER a bare "44 milljónir" number.)
   - Identity: "Omega er fyrsta og eina kristna sjónvarpsstöðin á Íslandi. Heimakirkja er leiðin fyrir venjulegt fólk til að halda ljósinu logandi, koma fagnaðarerindinu inn á heimili landsins, þýða bækur, byggja öpp og skapa kristna miðlun fyrir næstu kynslóð."
   - List: Útsendingar · Íslenskt efni · Þýddar bækur · Öpp fyrir fjölskyldur · Bæn · Fræðsla · Von á skjánum, allan sólarhringinn
4. **What you get (pillars)** — Bókaklúbbur, Þýdda bókasafnið, Viðburðir, Samfélag.
   NOTE: some may be aspirational. Confirm with Hawk which are live before presenting as current.
5. **What it funds** — Útsending · Húsnæði og rekstur · Starfsfólk · Stúdíó og búnaður · Þýðingar og nýtt efni.
6. **Framtíðin** — H2 "Þetta er rétt að byrja." + "Ímyndaðu þér íslenskt kristið efni alla daga. Þýddar bækur og öpp fyrir hverja fjölskyldu. Barnaefni sem nær til næstu kynslóðar. Viðburði um allt land. Von á hverjum skjá, inn á hvert heimili. Ekki draumur fyrir fáa, heldur hreyfing heillar þjóðar." + "Og það byrjar með einu já."
7. **Frá hjartanu** — vision quote (placeholder; swap in founder's words if provided).
8. **Skráning (4 steps)** — 01 Opnaðu Þjóðskrá · 02 Skráðu þig inn (rafræn skilríki) · 03 Veldu „Heimakirkja“ · 04 Staðfestu. Plus the honest note (one félag per person; free + same-day; child form for 15 and under).
9. **FAQ** — 6 Q&A (cost, children, change-back, current registration, where the money goes, privacy).
10. **Final CTA** — "Vertu hluti af þessu." + "Það kostar þig ekkert. En það getur breytt heilli þjóð." + "Skráðu þig (0 kr.)"

## 5. Reference build
`src/app/heimakirkja/page.tsx` on branch `feat/faith-library-articles` (pushed to origin).
It has every section, the locked copy above, and a CSS-only cinematic hero (dawn glow,
drifting aurora, scroll cue) as a stand-in for real media. Treat it as the structural and
copy source of truth.

## 6. Assets Hawk needs to supply
- Hero media (image or short silent loop): Icelandic dawn/aurora, or light reaching a home.
- 2-3 section background images (homes, faces, the work, the land).
- Optional: founder's words (or a short video) for the "Frá hjartanu" section.

## 7. Open questions for Hawk
- Which pillars are live now vs "á leiðinni" (book club, translated-books app, events)?
- Founder's own words for the heart section, or keep the institutional placeholder?
