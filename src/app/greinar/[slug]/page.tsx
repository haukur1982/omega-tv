import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getArticleBySlug, getAllArticles } from "@/lib/articles-db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";

export const revalidate = 60;

type Article = Database['public']['Tables']['articles']['Row'];

// ─── Mock articles matching exact Supabase schema ───
const MOCK_ARTICLES: Article[] = [
  {
    id: 'a00',
    title: 'Aska — Hvers vegna fortíðin skilgreinir þig ekki',
    slug: 'aska',
    excerpt: 'Hvað ef syndir þínar eru ekki bara fyrirgefnar — heldur tortímdar svo fullkomlega að ekkert stendur eftir nema aska?',
    content: `Allir burðast með eitthvað.

Minningu sem svíður enn þegar hún skýtur upp kollinum. Lífskafla sem þú vildir óska að þú gætir endurskrifað. Orð sem þú lést falla og getur aldrei tekið til baka. Eða kannski eitthvað sem gert var á þinn hlut — eitthvað sem skildi eftir sig svo djúp spor að þau urðu hluti af sjálfsmynd þinni.

Hvað sem það er, þá er þunginn kunnuglegur. Hann blundar aftarlega í huganum eins og opin mappa, og við og við — á kyrrlátri stund, um miðja nótt eða í samtali sem fer aðeins of nærri — opnast þessi mappa og skömmin hellist yfir þig á ný.

Flest fólk lifir allt sitt líf í skugganum af einhverju sem það trúir að aldrei sé hægt að gera upp að fullu. Kannski fyrirgefið. En aldrei raunverulega horfið.

En hvað ef það er farið fyrir fullt og allt? Ekki aðeins fyrirgefið. Ekki aðeins litið fram hjá því. Heldur tortímt — svo fullkomlega að ekkert stendur eftir nema aska?

Þegar flestir hugsa um fyrirgefningu, hugsa þeir um náðun. Náðun er vissulega áhrifamikil. Hún þýðir að refsingin hefur verið felld niður. Þú ert frjáls ferða þinna. En það er eitt sem náðun gerir ekki: hún afmáir ekki brotið sjálft. Sakaskráin er enn til. Mappan verður áfram í skápnum. Þú gengur út frjáls, en fortíðin eltir þig.

Þannig skilja margir fyrirgefningu Guðs — sem guðlega náðun. Guð horfir á það sem þú hefur gert, hristir hausinn og segir: „Ég læt þetta gott heita í þetta skiptið." Syndin er skráð í bækurnar en refsingin er felld niður. Og þú gengur burt með þakklæti í hjarta en ert samt óróleg/ur, vegna þess að einhvers staðar, á einhvern hátt, er skráin enn til.

En Biblían lýsir einhverju mun róttækara en náðun.

Sannleikurinn er sá að orðið „náðun" kemur alls ekki fyrir í Nýja testamentinu.

Hugsaðu út í það. Allur nýi sáttmálinn — allt sem staðfest var með dauða og upprisu Jesú — talar aldrei um náðun. Ekki einu sinni. Og það er ástæða fyrir því.

Guð var nefnilega ekki að náða þig. Hann gekk skrefinu lengra.

Hebreabréfið lýsir fyrirheiti nýja sáttmálans með orðalagi sem er svo afgerandi að það skilur ekkert eftir fyrir varanlega sakaskrá:

«Því að ég mun taka vægt á misgjörðum þeirra og mun ekki framar minnast synda þeirra.» — Hebreabréfið 8:12

Ekki: „Ég mun minnast þeirra sjaldnar." Ekki: „Ég mun aðeins rifja þær upp þegar þess gerist þörf." Aldrei framar. Minningin er horfin. Möppunni hefur verið lokað — hún var ekki sett ofan í skúffu, heldur brennd til ösku.

Og í Hebreabréfinu 10:17–18 snýr höfundurinn aftur að þessu sama fyrirheiti og dregur af því ályktun:

«Og synda þeirra og lögmálsbrota mun ég aldrei framar minnast. En þar sem syndirnar eru fyrirgefnar þarf ekki framar fórn fyrir synd.»

Ef Guð hefur ákveðið að minnast synda þinna aldrei framar, þá er ekkert eftir til að færa fórn fyrir. Uppgjörinu er lokið. Skuldin er liðin undir lok. Það eru engar eftirstöðvar. Það er engin skrá til að fletta upp í á ný. Þessu er lokið — í dýpstu og varanlegustu merkingu þess orðs.

Í Gamla testamentinu, þegar fórn var færð á altarinu, gleypti eldurinn hana. Það sem fór á altarið var dýr — raunverulegt, áþreifanlegt og auðþekkjanlegt. En það sem kom af altarinu var eitthvað allt annað: aska.

Og aska er stórmerkileg. Það er ekki hægt að breyta henni til baka. Þú getur ekki endurskapað það sem brann. Þú getur ekki tekið hnefafylli af ösku og endurbyggt dýrið sem varð að henni. Eldurinn faldi ekki bara það sem þar var — hann umbreytti því í eitthvað óþekkjanlegt, ónothæft og óafturkallanlegt.

Þetta er myndin sem Guð dregur upp af því sem varð um synd þína á krossinum.

Þegar Jesús fórnaði sjálfum sér sem hinni hinstu fórn, fór hver einasta synd sem þú hefur drýgt — og hver synd sem þú átt eftir að drýgja — inn í þann eld. Ekki á táknrænan hátt, heldur í raun og veru. Og það sem kom út hinum megin var aska. Sönnunargögnunum hefur verið eytt. Efniviðurinn er horfinn. Það sem stendur eftir hefur ekkert vald, ekkert form og enga getu til að kvikna á ný.

Kólnuð aska fuðrar ekki upp aftur.

Þetta skiptir máli því óvinur sálar þinnar berst ekki við þig með nýjum vopnum. Hann notar þau gömlu. Hann seilist ofan í fortíð þína, dregur fram það sem þú skammast þín mest fyrir og brýnir það fyrir þér. „Manstu eftir þessu? Manstu hvað þú gerðir? Manstu hver þú ert í raun og veru?"

Og flestir hrökkva í kút. Fólk gengst við ásökuninni vegna þess að hún virðist sönn. Minningin er raunveruleg. Samviskubitið er kunnuglegt. Skömmin hefur dvalið þar svo lengi að hún virðist orðin að hluta af sjálfsmyndinni.

En hér er það sem Biblían segir um nákvæmlega þessa atburðarás.

Í 3. kafla Sakaríabókar var spámanninum gefin sýn. Hann sá Jósúa æðsta prest standa frammi fyrir Guði — og Jósúa var í óhreinum fötum. Skítugum. Flekkuðum. Óhæfur til að standa í návist Guðs. Og rétt hjá honum stóð Satan og ákærði hann. Benti á óhreinindin. Færði rök fyrir því að Jósúa ætti ekkert erindi þangað.

Og þá talaði Guð:

«En Drottinn mælti til Satans: „Drottinn ávíti þig, Satan. Drottinn, sem útvalið hefur Jerúsalem, ávíti þig! Er þessi maður ekki brandur hrifinn úr eldi?"» — Sakaríabók 3:2

Guð bað ekki Jósúa um að verja sig. Hann bað hann ekki um að útskýra óhreinindin. Hann ávítaði ákærandann beint — og síðan gerði hann eitthvað stórkostlegt:

«Engillinn tók þá til máls og sagði við þá sem stóðu frammi fyrir honum: „Færið hann úr þessum óhreinu klæðum." Síðan sagði hann við Jósúa: „Sjá, ég nem burt sök þína og læt færa þig í skrúða."» — Sakaríabók 3:4

Guð bað ekki Jósúa um að hreinsa sig sjálfur. Hann lét fjarlægja óhreinu fötin og skipti þeim út fyrir hrein. Það var ekki verið að krukka í syndina — hún var numin burt. Og í hennar stað setti Guð eitthvað nýtt.

Þetta er engin náðun. Þetta er umbreyting.

Páll postuli skildi þetta til hlítar. Hann átti sér fortíð sem myndi ásækja hvern sem er — hann hafði ofsótt og drepið kristið fólk áður en hann snerist til trúar. Ef einhver hafði ástæðu til að láta fortíð sína skilgreina sig, þá var það Páll.

En hlustaðu á það sem hann skrifaði:

«Þess vegna er hver sá sem er í Kristi ný sköpun. Hið gamla varð að engu, sjá, nýtt er orðið til.» — 2. Korintubréf 5:17

Hið gamla varð að engu. Ekki: „hinu gamla er fyrirgefið." Ekki: „hið gamla er sett á ís." Að engu. Og eitthvað nýtt hefur tekið við — ný sköpun, ný sjálfsmynd, nýr veruleiki sem er ekki byggður á rústum fortíðarinnar heldur á grunni þess sem Guð hefur gert.

Og í Rómverjabréfinu 8:1 gerði Páll það jafnvel enn skýrara:

«Nú er því engin fyrirdæming búin þeim sem eru í Kristi Jesú.»

Engin fyrirdæming. Dómurinn er fallinn og hann hljóðar upp á sýknu. Ekki vegna þess að þú sért saklaus í eðli þínu — heldur vegna þess að sönnunargögnunum hefur verið eytt. Eldurinn gleypti þau. Það eina sem stendur eftir er aska, og aska getur ekki borið vitni gegn þér.

Svo næst þegar þessi gamla mappa opnast í huganum — næst þegar skömmin teygir sig upp úr fortíðinni og reynir að draga þig niður aftur — þá hefurðu eitthvað að segja við hana.

„Þessar syndir sem þú reynir að minna mig á? Þær eru kólnuð aska. Þær hafa ekkert vald. Þær hafa enga rödd. Eldurinn hefur þegar gleypt þær, og það sem eftir stendur getur ekki fuðrað upp á ný."

Það versta sem þú hefur gert skilgreinir þig ekki. Þú ert ekki summan af mistökum þínum. Þú ert ekki sama manneskjan og þú varst áður en eldur Guðs snerti líf þitt.

Guð einn ákvarðar hver þú ert. Og hann segir að þú sért hrein/n.

Höfundur Hebreabréfsins — eftir að hafa sett fram allan þunga þessa sannleika: fórnina sem færð var í eitt skipti fyrir öll, syndirnar sem aldrei framar er minnst og hinn nýja og lifandi veg sem opnaðist fyrir blóðið — gefur okkur eitt fallegasta boð sem finna má í Ritningunni:

«Göngum því fram fyrir Guð með einlægum hjörtum, í öruggu trúartrausti, með hjörtum sem hreinsuð hafa verið og eru laus við meðvitund um synd og með líkömum sem laugaðir hafa verið í hreinu vatni.» — Hebreabréfið 10:22

Göngum fram. Í öruggu trausti. Með hreina samvisku — ekki vegna þess að þú hafir lifað fullkomnu lífi, heldur vegna þess að blóðið hefur unnið sitt verk.

Fortíð þín er aska. Nútíð þín er náð. Og framtíð þín er í höndum Guðs sem heldur ekki bókhald yfir það sem hann hefur þegar tortímt.

Stígðu nær. Eldurinn hefur þegar unnið sitt verk. Það er ekkert eftir til að óttast.`,
    featured_image: '/images/articles/aska.png',
    author_name: 'Omega TV',
    published_at: '2026-04-05T10:00:00Z',
    created_at: '2026-04-05T10:00:00Z',
  },
  {
    id: 'a0',
    title: 'Þú þarft ekki að vinna þér inn það sem er þegar þitt',
    slug: 'thu-tharft-ekki-ad-vinna',
    excerpt: 'Hvað ef allur sá hugsunarháttur sem segir þér að þú sért ekki að gera nóg — byggist á misskilningi?',
    content: `Það er ákveðin byrði sem margir bera með sér — jafnvel fólk sem trúir á Guð. Og kannski sérstaklega fólk sem trúir á Guð.

Þetta er þessi hljóðláta, stöðuga tilfinning um að þú sért ekki að gera nóg. Að biðja ekki nóg. Að lesa ekki nóg. Að vera ekki sú manneskja sem þú veist að þú ættir að vera. Og undir þessari tilfinningu kraumar enn dýpri ótti: að þolinmæði Guðs gagnvart þér fari senn þverrandi. Að einn daginn muni hann horfa á gjána milli þess sem þú veist og þess hvernig þú lifir, og hann muni segja: „Nú er komið nóg. Ég er búinn að fá nóg af þessu."

Ef þú hefur einhvern tíma upplifað þetta — þótt ekki væri nema eitt andartak — þá er þessi grein fyrir þig.

Því hvað ef allur þessi hugsunarháttur byggist á misskilningi? Hvað ef Guð sjálfur myndi horfa á þessa trú og segja: „Þetta var alls ekki það sem ég átti við"?

Í Biblíunni er að finna vers sem hefur mótað það hvernig milljónir kristinna manna skilja samband sitt við Guð. Það er í 1. Jóhannesarbréfi 1:7:

«En ef við göngum í ljósinu, eins og hann sjálfur er í ljósinu, þá höfum við samfélag hvert við annað og blóð Jesú, sonar hans, hreinsar okkur af allri synd.»

Í margar aldir hefur hefðbundin kennsla um þetta vers hljómað einhvern veginn svona: „Að ganga í ljósinu" þýðir að lifa í samræmi við þann sannleika sem þú þekkir. Því meira sem þú lærir um vegu Guðs, þeim mun ríkari krafa er gerð um hlýðni þína. Og svo lengi sem þú gengur í öllu því ljósi sem þú hefur — allri þekkingunni, öllum boðorðunum, öllum viðmiðunum — þá hylur blóð Jesú þig. En ef þér tekst ekki að standa undir því sem þú veist? Þá lyftist hjúpurinn. Hreinsunin stöðvast. Þú ert algjörlega upp á eigin spýtur þar til þú kemst aftur á beinu brautina.

Þessi kennsla hljómar rökrétt. Hún hljómar ábyrg. Hún hljómar jafnvel biblíuleg.

En ef þessi rökfærsla er hugsuð til enda, þá hrynur hún um sjálfa sig.

Hugsaðu út í þetta af fullri hreinskilni. Gengur þú í öllu því ljósi sem þú hefur fengið? Lifir þú í samræmi við allt sem þú veist að er satt? Hverja innri sannfæringu. Hverja meginreglu. Hverja einustu ritningargrein sem þú hefur lesið og skilið.

Nei. Það gerir enginn.

Og ef hreinsun þín er háð því að þú lifir í samræmi við hverja einustu vitneskju sem þú hefur öðlast — hvernig geturðu þá yfirhöfuð hlotið nokkra hreinsun? Ef fullkomin hlýðni er skilyrðið, þá er sláin sett hærra en nokkur manneskja sem lifað hefur getur stokkið.

En málið er jafnvel enn djúpstæðara. Jafnvel á þínum besta degi — gengur þú í ljósinu á sama hátt og Jesús gekk í því? Með hans hreinleika, hans staðfestu og hvernig hann gaf sig algjörlega Föðurnum á vald?

Nei. Ekki einu sinni nálægt því.

Og ef enginn gengur í ljósinu eins og Jesús gerði, og ef hreinsun er eitthvað sem maður vinnur sér inn með því að ganga í ljósinu — þá uppfyllir enginn skilyrðin. Enginn er hreinsaður. Enginn er hólpinn. Allt kerfið brotnar niður undan eigin þunga.

Þetta er ekki mjög huggandi niðurstaða. En það er nákvæmlega þar sem frammistöðudrifin trú endar alltaf: á því að allir falla á prófinu og enginn stendur eftir hreinn.

Svo hvað þýðir þetta vers þá í raun og veru?

Svarið er að finna aðeins tveimur versum á undan, í 1. Jóhannesarbréfi 1:5:

«Og þetta er boðskapurinn sem við höfum heyrt af honum og boðum ykkur: Guð er ljós og myrkur er alls ekki í honum.»

Ljósið er ekki þekking. Ljósið er ekki mælikvarði á hegðun. Ljósið er ekki gátlisti yfir hlýðni.

Ljósið er Guð sjálfur.

Jesús sagði þetta mjög skýrt í Jóhannesarguðspjalli 8:12:

«Ég er ljós heimsins. Sá sem fylgir mér mun ekki ganga í myrkri heldur hafa ljós lífsins.»

Að ganga í ljósinu þýðir ekki að gera allt fullkomlega samkvæmt því sem þú veist. Það þýðir að ganga í samfélagi við þann Guð sem er ljós. Að halda sig nálægt honum. Að tala við hann. Vera einlæg(ur) frammi fyrir honum. Ekki fela sig fyrir honum.

Og þegar þú gengur í því samfélagi — þegar þú dvelur í nærveru hans, ekki á fullkominn hátt heldur af einlægni — þá heldur blóð Jesú áfram að hreinsa þig. Ekki af því að þú hafir unnið þér það inn. Heldur vegna þess að hann er trúr og blóðið hefur aldrei misst mátt sinn.

Þetta breytir öllu varðandi það hvernig þú tengist Guði.

Í þessu frammistöðukerfi ýtir hvert einasta misstig þér lengra frá Guði. Þú syndgar og finnst þú þar af leiðandi hafa fallið úr leik. Þér finnst þú úr leik og því dregurðu þig í hlé. Þú dregur þig í hlé og fjarlægðin eykst. Og áður en langt um líður verður sambandið, sem átti að vera það lífgandi afl sem héldi þér uppi í tilverunni, að uppsprettu skammar og flótta.

En í samfélagslíkaninu snýst stefnan algjörlega við. Þegar þér verður á — og þér mun verða á, vegna þess að þú ert mannleg vera — þá er lausnin ekki að draga sig í hlé. Lausnin er að halda sig nálægt. Að halda áfram að ganga með honum. Að segja: „Guð, mér urðu á mistök. En ég er enn þá hér. Ég er ekki að fela mig fyrir þér."

Og blóðið heldur áfram að hreinsa.

Þetta er ástæðan fyrir því að 1. Jóhannesarbréf 1:7 notar nútíðina: blóðið hreinsar — stöðugt, áframhaldandi, einmitt núna. Ef engin synd gæti loðað við þig á meðan þú gengur í ljósinu, hvers vegna væri þá þörf á stöðugri hreinsun? Versið sjálft sannar að syndin getur enn snert þig þótt þú sért í samfélagi við Guð. En hún rýfur ekki samfélagið. Blóðið tekur á henni, í rauntíma, jafnóðum og þú gengur áfram.

Jóhannes postuli skildi þetta, því aðeins tveimur versum síðar skrifaði hann:

«Ef við játum syndir okkar þá er hann trúr og réttlátur svo að hann fyrirgefur okkur syndirnar og hreinsar okkur af öllu ranglæti.» — 1. Jóhannesarbréf 1:9

Taktu eftir því tvennu sem gerist þegar þú leitar til Guðs af hreinskilni. Hann fyrirgefur — það er lagalega hliðin, sakaskráin er afmáð. Og hann hreinsar — það er innri hliðin, óhreinindin eru fjarlægð. Hvort tveggja gerist. Hvort tveggja er framkvæmt af blóðinu. Og hvort tveggja virkjast ekki af fullkominni frammistöðu, heldur af einfaldri einlægni — að koma til Guðs og segja: „Hér er ég."

Guð þarfnast ekki fullkomnunar þinnar. Hann þarfnast nærveru þinnar.

Þetta er það sem spámaðurinn Jesaja átti við þegar hann skrásetti þessi orð frá Guði:

«Komið, við skulum eigast lög við, segir Drottinn. Þó að syndir ykkar séu sem skarlat skulu þær verða hvítar sem mjöll. Þó að þær séu rauðar sem purpuri skulu þær verða sem ull.» — Jesaja 1:18

Skoðaðu þetta boð vel. Guð segir ekki: „Hreinsaðu þig fyrst til og komdu svo að tala við mig." Hann segir: „Komið." Komdu eins og þú ert. Komdu með skarlatsrauðu blettina. Komdu með purpurarauðu óreiðuna. Komdu — og sjáðu hvað ég geri við þetta allt saman.

Þetta er ekki Guð sem bíður eftir því að þú verðir nógu góð manneskja. Þetta er Guð sem biður þig að hætta að flýja og leyfa honum að gera það sem aðeins hann getur gert.

Í þessu felst frelsi sem flest fólk hefur aldrei fengið að smakka.

Ef staða þín frammi fyrir Guði er háð frammistöðu þinni, þá er hver dagur próf. Hver hugsun fær einkunn. Hvert augnablik ber með sér kvíðann: Er ég að gera nóg? Veit ég nóg? Er ég nógu góð manneskja?

En ef staða þín frammi fyrir Guði er háð trúfesti hans — á mætti blóðsins og raunveruleika nærveru hans — þá er hver dagur boðskort. Ekki próf. Þú vaknar og spurningin er ekki: „Mun ég standast mælinn í dag?" Spurningin er: „Mun ég halda mig nálægt honum í dag?"

Og að halda sig nálægt er ekkert flókið. Það er ekki frátekið fyrir presta, munka eða andlega yfirstétt. Það stendur öllum til boða sem eru tilbúnir að sýna Guði hreinskilni og halda áfram að ganga — ófullkomlega, í einlægni, daglega — í fylgd hans.

Páll postuli lýsti þessu með stórkostlegum einfaldleika:

«Því að af náð eruð þið hólpin orðin fyrir trú. Þetta er ekki ykkur að þakka. Það er Guðs gjöf. Ekki byggt á verkum, enginn skal geta miklast af því.» — Efesusbréfið 2:8–9

Gjöf. Ekki laun. Ekki verðlaun. Ekki bikar handa þeim hlýðnasta. Gjöf — gefin af fúsum og frjálsum vilja, sem tekið er við í trú, og viðhaldið í gegnum samfélag.

Svo ef þú hefur örmagnast á því að reyna að vinna þér inn það sem Guð hefur þegar gefið þér — þá geturðu hætt því.

Ef þú hefur verið að halda bókhald, skrásetja mistök þín og velta því fyrir þér hvort þú hafir loksins fullreynt þolinmæði Guðs — þá geturðu sleppt því takinu.

Ef þú hefur verið að forðast Guð af því þér finnst þú ekki verðskulda að koma til hans — þá er sá flótti það eina sem heldur þér frá þeirri hreinsun sem nú þegar streymir fram.

Komdu nær. Haltu þér nálægt. Sýndu einlægni. Blóð Jesú hefur aldrei hætt að verka og sá Guð sem er ljós hefur aldrei hætt að taka opnum örmum á móti þér í nærveru sinni.

Þú þarft ekki að vinna þér inn það sem er þegar þitt. Þú þarft bara að taka við því.

«Dveldu í samfélagi við hann, og allur máttur heljar fær ekki hrifið þig burt — vegna þess að hjá Guði er innbyggður hreinsimáttur. Hann er algjörlega samofinn ljósi hans og samfélaginu við hann.»`,
    featured_image: '/images/articles/thu-tharft-ekki.png',
    author_name: 'Omega TV',
    published_at: '2026-04-05T08:00:00Z',
    created_at: '2026-04-05T08:00:00Z',
  },
  {
    id: 'a1',
    title: 'Tíminn er núna: Framtíð trúar á Íslandi',
    slug: 'timinn-er-nuna',
    excerpt: 'Hvernig við getum unnið saman að betra samfélagi og sterkari trú í nútímanum.',
    content: 'Ísland stendur á krossgötum. Í samfélagi sem þróast hratt þurfum við að spyrja okkur: hvert stefnir trú okkar?\n\nSagan kennir okkur að trúin hefur alltaf verið aflvaki breytinga. Frá kristnitöku til nútímans hefur trúin mótað menningu, siðferði og samfélag. Hún hefur gefið þjóðinni von, tilgang og stefnu á tímum þegar allt virtist óljóst.\n\nEn í dag stöndum við frammi fyrir nýjum áskorunum. Tæknin breytist, samfélagið breytist, og við þurfum að finna nýjar leiðir til að miðla eldgömlu sannleikanum. Spurningin er ekki hvort sannleikurinn sé enn sannur — heldur hvernig við berum hann áfram.\n\n«Þjóðin sem gengur í myrkri sér mikið ljós.» Þetta orð úr Jesaja eru jafn sannur í dag og fyrir árþúsundum. Myrkið í dag er ekki endilega ofsóknir eða stríð — það er einsemd, tilgangsleysi og vonleysi.\n\nOmega Stöðin er hluti af þessari framtíðarsýn — að nota bestu tækni samtímans til að bera von og sannleika til hvers einasta heimilis á Íslandi. Við trúum því að fjölmiðlar geti verið tæki guðs — til að uppbyggja, fræða og hughreysta.\n\nFramtíðin byrjar með okkur. Hún byrjar með þér. Hvernig ætlarðu að vera hluti af breytingunni?\n\nLéttu okkur saman byggja eitthvað fallegt — eitthvað varanlegt — eitthvað sem skilar sér til komandi kynslóða.',
    featured_image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1400&h=800&fit=crop',
    author_name: 'Omega TV',
    published_at: '2026-04-04T10:00:00Z',
    created_at: '2026-04-04T10:00:00Z',
  },
  {
    id: 'a2',
    title: 'Aflgefandi Samfélag',
    slug: 'aflgefandi-samfelag',
    excerpt: 'Samfélag sem styrkir og uppbyggir hvert annað.',
    content: 'Kristið samfélag er ekki bara sunnudagssamkoma — það er lífsstíll sem birtist í hversdeginum.\n\nÞegar við horfum á fyrstu kirkjuna í Postulasögunni sjáum við samfélag sem deildi öllu: mat, húsnæði, gleði og sorgar. Þau vissu að trúin er ekki einstaklingsíþrótt — hún er hópleikur.\n\nÍ nútímasamfélagi Íslands er auðvelt að verða einangrað. Tæknin tengir okkur saman á yfirborðinu, en djúp tengsl krefjast meiri fyrirhafnar. Þess vegna er safnaðarlífið svo mikilvægt.\n\nÞegar við komum saman sem trúsystkini gerist eitthvað yfirnáttúrulegt. Guð er í miðjunni. Bænin verður sterkari. Vonin verður skýrari.\n\nOmega Stöðin vill vera vettvangur fyrir þetta samfélag — ekki aðeins á netinu, heldur í raunveruleikanum líka.',
    featured_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&h=800&fit=crop',
    author_name: 'Guðrún Helga',
    published_at: '2026-04-03T10:00:00Z',
    created_at: '2026-04-03T10:00:00Z',
  },
  {
    id: 'a3',
    title: 'Að finna náð í hversdeginum',
    slug: 'nad-i-hversdeginum',
    excerpt: 'Hugvekja um náð og fyrirgefningu í dag.',
    content: 'Náðin er ekki bara hugtak — hún er reynsla sem breytir öllu.\n\nHvað er náð? Náð er þegar Guð gefur okkur eitthvað sem við eigum ekki skilið. Enginn getur unnið sér inn náðina. Hún er gjöf — hrein og ómengauð.\n\nÍ hversdeginum birtist náðin á óvæntum stöðum: í brosi ókunnugrar manneskju, í sólargeislum eftir rigningu, í orðum sem lækna gömul sár.\n\nFyrirgefningin er stærstur birtingarmynd náðarinnar. Þegar við fyrirgefum öðrum — og sjálfum okkur — opnum við dyr sem hafa verið lokaðar.\n\n«Þar sem syndin varð mikil, varð náðin enn meiri.» Þessi orð Pálsa postula minna okkur á að engin mistök eru svo stór að Guð geti ekki afmáð þau.',
    featured_image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1400&h=800&fit=crop',
    author_name: 'Jón Þór',
    published_at: '2026-04-02T10:00:00Z',
    created_at: '2026-04-02T10:00:00Z',
  },
  {
    id: 'a4',
    title: 'Bænin sem breytir öllu',
    slug: 'baenin-sem-breytir',
    excerpt: 'Hvað gerist þegar við leggjum allt í hendur Guðs?',
    content: 'Bænin er samtal við Guð — og Guð svarar alltaf, þó ekki alltaf eins og við búumst við.\n\nMargir hugsa um bænina sem einhliða samtal: við biðjum og vonum að eitthvað gerist. En bænin er mun dýpri. Hún er tenging — samband — milli mannlegrar sálar og eilífðar.\n\nÞegar við biðjum erum við ekki bara að senda ósk út í tómið. Við erum að opna okkur fyrir vilja Guðs. Og vilji Guðs er alltaf betri en okkar eigin.\n\nBænin breytir okkur innra með. Hún læknar kvíða, dregur úr reiði og gefur okkur sýn. Rannsóknir hafa sýnt að fólk sem biður reglulega er hamingjusamara en aðrir.\n\nEn mikilvægast af öllu: bænin tengir okkur við Guð sjálfan.',
    featured_image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1400&h=800&fit=crop',
    author_name: 'Sigríður Anna',
    published_at: '2026-04-01T10:00:00Z',
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'a5',
    title: 'Vonin lifir — jafnvel á erfiðum tímum',
    slug: 'vonin-lifir',
    excerpt: 'Sagan af fjölskyldu sem fann ljós í myrkri.',
    content: 'Þegar allt virðist vonlaust er Guð enn að verki.\n\nÞetta er sagan af fjölskyldu sem missti allt — og fann allt aftur. Ekki efnislega, heldur andlega. Þau fundu tilgang, von og gleði þar sem áður var aðeins tóm.\n\nLífið er ekki alltaf auðvelt. Stundum dynur allt yfir okkur í einu og við vitum ekki hvort við getum staðist. En í þeim augnablikum, þegar við erum brotnastar, er Guð nálægastur.\n\n«Ég er með þér alla daga.» Þessi fyrirheit Jesú er ekki auð orð — það er veruleiki sem milljónir hafa upplifað.\n\nVonin er ekki bara ósk — hún er viss vissa um eitthvað betra.',
    featured_image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&h=800&fit=crop',
    author_name: 'Ólafur Helgi',
    published_at: '2026-03-30T10:00:00Z',
    created_at: '2026-03-30T10:00:00Z',
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl', 'ág', 'sep', 'okt', 'nóv', 'des'];
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  let article: Article | null = null;
  let allArticles: Article[] = [];

  try {
    article = await getArticleBySlug(params.slug);
  } catch (error) {
    console.error(error);
  }

  // If no real article, try mock
  if (!article) {
    article = MOCK_ARTICLES.find(a => a.slug === params.slug) || null;
  }
  if (!article) notFound();

  // Get related articles
  try {
    const real = await getAllArticles();
    if (real && real.length > 0) allArticles = real;
  } catch {
    // ignore
  }
  if (allArticles.length === 0) allArticles = MOCK_ARTICLES;
  const related = allArticles.filter(a => a.id !== article!.id).slice(0, 3);

  const paragraphs = article.content.split('\n\n');
  const readTime = estimateReadingTime(article.content);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />



      {/* ═══ HERO IMAGE ═══ */}
      {article.featured_image && (
        <div style={{
          position: 'relative',
          width: '100%',
          maxHeight: '60vh',
          overflow: 'hidden',
          background: '#0a0a0a',
        }}>
          <img
            src={article.featured_image}
            alt={article.title}
            style={{
              width: '100%',
              height: '60vh',
              objectFit: 'cover',
              display: 'block',
              opacity: 0.7,
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-deep) 0%, rgba(28,28,30,0.3) 50%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--bg-deep) 0%, transparent 20%)' }} />
        </div>
      )}

      {/* ═══ FULL-WIDTH READING ZONE ═══ */}
      {/* Clean angled divider: dark → light */}
      <div style={{
        width: '100%',
        marginTop: article.featured_image ? '0' : 'clamp(4rem, 8vw, 6rem)',
        lineHeight: 0,
      }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: '100%', height: 'clamp(40px, 5vw, 80px)', display: 'block' }}>
          <rect width="1440" height="80" fill="#FAF6F0" />
          <path d="M0,0 L1440,0 L1440,0 L0,80 Z" fill="var(--bg-deep)" />
        </svg>
      </div>

      {/* Light reading surface — edge to edge */}
      <div className="article-reading-frame" style={{
        width: '100%',
        background: '#FAF6F0',
        color: '#3B3428',
      }}>
        <div style={{
          maxWidth: '42rem',
          margin: '0 auto',
          padding: '0 clamp(1.25rem, 4vw, 2rem)',
        }}>

        {/* Back link */}
        <Link
          href="/greinar"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--accent)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textDecoration: 'none',
            marginBottom: '2rem',
            paddingTop: 'clamp(1.5rem, 3vw, 2.5rem)',
            transition: 'color 0.2s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><polyline points="12,19 5,12 12,5"/>
          </svg>
          Tilbaka í greinar
        </Link>

        {/* ═══ ARTICLE HEADER ═══ */}
        <header style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          {/* Meta info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: 'var(--accent)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
              Grein
            </span>
            <span style={{ color: '#9A9590', fontSize: '11px' }}>·</span>
            {article.published_at && (
              <time style={{ color: '#9A9590', fontSize: '12px', fontWeight: 600 }}>
                {formatDate(article.published_at)}
              </time>
            )}
            <span style={{ color: '#9A9590', fontSize: '11px' }}>·</span>
            <span style={{ color: '#9A9590', fontSize: '12px', fontWeight: 600 }}>
              {readTime} mín lestur
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            color: '#1E1B16',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 1rem',
          }}>
            {article.title}
          </h1>

          {article.excerpt && (
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontStyle: 'italic',
              color: '#6B6560',
              lineHeight: 1.6,
              margin: '0 0 1.5rem',
            }}>
              {article.excerpt}
            </p>
          )}

          {/* Author line */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(91, 138, 191, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 700 }}>
                {(article.author_name || 'Ω')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p style={{ color: '#1E1B16', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                {article.author_name || 'Omega TV'}
              </p>
              <p style={{ color: '#9A9590', fontSize: '12px', margin: 0 }}>
                Omega Stöðin
              </p>
            </div>
          </div>
        </header>

        {/* ═══ ARTICLE BODY ═══ */}
        <div style={{ marginBottom: '0' }}>
          {article.content.includes('<p') || article.content.includes('<h2') ? (
            /* ── HTML content (from admin/database) ── */
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                color: '#3B3428',
                lineHeight: 1.85,
              }}
            />
          ) : (
            /* ── Plain text fallback (mock articles) ── */
            paragraphs.map((paragraph, i) => {
              const isQuote = paragraph.startsWith('«') || paragraph.startsWith('"');
              if (isQuote) {
                return (
                  <blockquote
                    key={i}
                    className="article-prose"
                    style={{
                      borderLeft: '3px solid var(--accent)',
                      background: 'rgba(91, 138, 191, 0.07)',
                      padding: '1.25rem 1.5rem',
                      borderRadius: '0 12px 12px 0',
                      margin: '2rem 0',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.15rem',
                      fontStyle: 'italic',
                      color: '#4A4540',
                      lineHeight: 1.7,
                    }}
                  >
                    {paragraph}
                  </blockquote>
                );
              }
              return (
                <p
                  key={i}
                  className="article-prose"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                    color: '#3B3428',
                    lineHeight: 1.85,
                    margin: '0 0 1.75rem',
                  }}
                >
                  {i === 0 ? (
                    <>
                      <span style={{
                        float: 'left' as const,
                        fontFamily: 'var(--font-serif)',
                        fontSize: '3.5rem',
                        fontWeight: 700,
                        lineHeight: 0.8,
                        paddingRight: '0.15em',
                        paddingTop: '0.1em',
                        color: '#1E1B16',
                      }}>
                        {paragraph[0]}
                      </span>
                      {paragraph.slice(1)}
                    </>
                  ) : paragraph}
                </p>
              );
            })
          )}
        </div>

        {/* Ornamental end-of-article mark */}
        <div style={{
          textAlign: 'center',
          padding: '3rem 0 0',
          color: '#B8AFA4',
          fontSize: '1.5rem',
          letterSpacing: '0.5em',
        }}>
          ✦ ✦ ✦
        </div>

        </div>{/* ← close centered content */}
      </div>{/* ← close full-width reading zone */}

      {/* ═══ ARTICLE FOOTER (back in dark theme) ═══ */}
      <div style={{
        maxWidth: '42rem',
        margin: '0 auto',
        padding: '0 clamp(1.25rem, 4vw, 2rem)',
      }}>
        <div style={{
          paddingTop: '2rem',
          marginBottom: '3rem',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: '0 0 1.5rem',
          }}>
            Vona að þessi grein hafi verið þér til blessunar.
          </p>

          {/* Share / Newsletter CTA */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '2rem',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: '0.75rem' }}>
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="22,7 12,13 2,7"/>
            </svg>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              Líkaði þér greinin?
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Skráðu þig á fréttabréfið og fáðu nýjar greinar beint í pósthólfið.
            </p>
            <Link
              href="/frettabref"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 24px',
                background: 'var(--accent)',
                color: 'white',
                fontWeight: 700,
                fontSize: '13px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Skrá mig á fréttabréfið
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ RELATED ARTICLES — "Lestu næst" ═══ */}
      {related.length > 0 && (
        <section style={{
          padding: 'var(--section-gap) var(--rail-padding)',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <h3 style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              marginBottom: '2rem',
            }}>
              Lestu næst
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '1.5rem',
            }}>
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/greinar/${rel.slug}`}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#1a1a1a',
                  }}>
                    {rel.featured_image ? (
                      <img
                        src={rel.featured_image}
                        alt={rel.title}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--bg-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: 'var(--accent)',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: '4px',
                    }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
                      Grein · {rel.published_at ? formatDate(rel.published_at) : ''}
                    </span>
                    <h4 style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}>
                      {rel.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
