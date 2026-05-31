# Omega TV — Verkstýringarblað

> Eins-blaðs handbók fyrir Hawk og umsjónarmanninn í Íslandi.
> Lestu þetta þegar þú þarft að rifja upp hvar allt er.

---

## Tvö efnisfæri, eitt innhólf

**1. Erlent efni textað á íslensku** — Hour of Power, In Touch, Charles Stanley.
Erlenda stúdíóið sendir hráa enska upptöku. **Azotus** textar í íslensku, brennir textann inn í myndbandið, og sendir til Omega.

**2. Íslenskt frumefni** — Móttarstund, Bænatorg, Boðunarstund.
Þú tekur upp sýningu á íslensku. **Azotus** textar (fyrir kafla og leit — engin þýðing). Eða þú keyrir `scripts/publish-native-is.ts` beint.

**Bæði enda á sama stað:** drög birtast í `/admin/drafts`.

---

## Tvær síður sem sjá um 90% af daglegri stjórn

| Síða | Þegar þú spyrð... | Slóð |
|---|---|---|
| **Innhólf** | "Hvað bíður mín?" | `/admin/drafts` |
| **Kerfisheilsa** | "Er eitthvað bilað?" | `/admin/health` |

Báðar í `/admin` hliðarstikunni: Innhólf er fyrst undir **Efni & dagskrá**, Kerfisheilsa er undir **Rekstur** (neðst).

---

## Daglegt verkflæði

**Þegar þú opnar tölvuna:**

1. Opnaðu **Innhólf** (`/admin/drafts`)
2. Ef það eru drög sem bíða — smelltu á eitt:
   - **Veggspjald**: PosterStudio sýnir 8–12 ramma frá Azotus. Veldu einn. Smelltu *Búa til* → 16:9 + 4:5 útgáfur framleiddar
   - **Titill, lýsing, kaflar, tags**: Gemini hefur skrifað drög. Lestu, lagaðu ef þarf
   - **Þáttaröð**: tengdu við réttu seríuna (ef þetta er endurtekið efni)
   - Smelltu **Vista og birta** → komið á netið
3. Opnaðu **Kerfisheilsa** (`/admin/health`). Skoðaðu spjöldin:
   - **Vandamál** — ef talan er > 0, kíktu á viðburðina að neðan og sjáðu hvaða villa kom upp

Markmið: 2–3 mínútur á drag þegar Gemini hefur skilað nokkuð réttu.

---

## Þegar eitthvað fer úrskeiðis

| Einkenni | Hvar þú sérð það | Hvað þú gerir |
|---|---|---|
| **Sending frá Azotus mistókst** | Kerfisheilsa → "Vandamál" > 0 | Lestu villuskilaboðin. Endurfírðu úr Mac mini: `.venv/bin/python -m workers.vod_publisher <azotus_track_uuid>` |
| **Veggspjald ekki rétt** | Innhólf → opna drag → PosterStudio | Veldu annan ramma, eða límdu inn eigin URL |
| **Titill/lýsing eintómt subtitle-texti** | Innhólf → opna drag | Skrifaðu yfir handvirkt; Gemini virkaði ekki á þessu efni |
| **Bunny þumlull birtist ekki** | Innhólf → drag án myndar | Keyrðu `/api/bunny/thumbnail/<videoId>` til að hreinsa caching |
| **Tvíverkun á sömu sýningu** | Tvö drög með sama efni | Eyddu öðru úr innhólfi (ekki úr Bunny — það deilir sömu skrá) |

---

## Hvar kerfið býr

| Vél | Hlutverk | Hvar |
|---|---|---|
| **Mac mini í Íslandi** | Azotus framleiðsla. Tekur við hráu efni, textar, brennir, sendir til Omega. **Eina vélin sem sendir í alvöru framleiðslu.** | `omegatv@omegas-mac-mini` |
| **Omega TV vefur** | Tekur við sendingu, býr til drag, birtir. | Vercel — `omega-tv-lovat.vercel.app` (verður `omega.is`) |
| **Hawk Mac Studio** | Þróun. `OMEGA_VOD_DELIVER_ROLE=dev` — sendir ekki í framleiðslu. | Þessi tölva |

---

## Heimavinna fyrir aðra rekstur

| Spurning | Skjal |
|---|---|
| Hvernig bætist hvert efnistegund inn í síðuna? | `docs/admin-guide.md` |
| Hvernig flæðir efnið í gegnum kerfið? | `docs/content-pipeline.md` |
| Hvar er allt í repoinu? | `docs/ORIENTATION.md` |
| Hvað var unnið undanfarna daga? | `STATUS.md` |
| Veggspjaldakerfið í dýpt | `docs/poster-system.md` |

---

## Núverandi staða (2026-05-20)

- **Tegund 1 (erlent → íslenska):** Sannreynt í eitt skipti — i2620 (Charles Stanley) komst í gegn 2026-05-18, drag býr í `/admin/drafts`, veggspjald virkaði.
- **Tegund 2 (íslenskt frumefni):** Innviðir til staðar í gegnum `scripts/publish-native-is.ts`. Engin alvöru sýning hefur runnið ennþá.
- **Ein send mistókst** í gær (2026-05-19 18:12) með "Unknown intake failure." Bót `e0a2d87` veiðir núna alvöru villuna. **Næsta skref:** endurfíra úr Mac mini til að sjá hvað brotnaði:
  ```
  ssh omegatv@omegas-mac-mini
  cd ~/Projects/Azotus
  .venv/bin/python -m workers.vod_publisher 5346e83b-9296-4a3d-87d8-6e65b68ef39c
  ```
- **Bakskrá íslenskra þátta** bíður á Mac mini — `scripts/deliver_vod_backlog.py` í Azotus er tilbúið að keyra allt í gegn þegar fyrsta endurkeyrslan staðfestir að seimurinn virkar.

---

**Þumalputtaregla:** Ef þú veist ekki hvar þú átt að líta — opnaðu **Innhólf** og **Kerfisheilsa**. Þær tvær segja þér 90% af því sem þú þarft að vita.
