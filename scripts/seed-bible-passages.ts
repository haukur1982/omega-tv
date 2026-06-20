// Seed / update Bible passage text in the bible_passages table.
//
// The video page (/sermons/[id]) shows a "Ritningin" block with the full
// scripture text for the episode's bible_ref. The reference + display name
// render automatically; this table supplies the verse TEXT. When a ref has
// no row here, the block shows "Ritningartextinn er ekki enn í safninu".
//
// SOURCE: Biblían — Þýðingin 1981 (Hið íslenska biblíufélag), the same
// "son sinn eingetinn" wording already used by the seeded verses. Pulled
// verbatim from biblian.is/1981/<book>-<chapter>-kafli. Keep ONE translation
// throughout for consistency — do not mix in the 2007 ("Biblía 21. aldar").
//
// Upserts on ref_canonical — safe to re-run. Run:
//   npx tsx scripts/seed-bible-passages.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type Passage = {
    ref_canonical: string;   // MUST exactly match episodes.bible_ref
    ref_display_is: string;
    ref_display_en: string;
    text_is: string;
};

const PASSAGES: Passage[] = [
    {
        ref_canonical: 'JHN.14',
        ref_display_is: 'Jóhannes 14',
        ref_display_en: 'John 14',
        text_is: 'Hjarta yðar skelfist ekki. Trúið á Guð og trúið á mig. Í húsi föður míns eru margar vistarverur. Væri ekki svo, hefði ég þá sagt yður, að ég færi burt að búa yður stað? Þegar ég er farinn burt og hef búið yður stað, kem ég aftur og tek yður til mín, svo að þér séuð einnig þar sem ég er. Veginn þangað, sem ég fer, þekkið þér. Tómas segir við hann: Herra, vér vitum ekki, hvert þú ferð, hvernig getum vér þá þekkt veginn? Jesús segir við hann: Ég er vegurinn, sannleikurinn og lífið. Enginn kemur til föðurins, nema fyrir mig. Ef þér hafið þekkt mig, munuð þér og þekkja föður minn. Héðan af þekkið þér hann og hafið séð hann. Filippus segir við hann: Herra, sýn þú oss föðurinn. Það nægir oss. Jesús svaraði: Ég hef verið með yður allan þennan tíma, og þú þekkir mig ekki, Filippus? Sá sem hefur séð mig, hefur séð föðurinn. Hvernig segir þú þá: Sýn þú oss föðurinn? Trúir þú ekki, að ég er í föðurnum og faðirinn í mér? Orðin, sem ég segi við yður, tala ég ekki af sjálfum mér. Faðirinn, sem í mér er, vinnur sín verk. Trúið mér, að ég er í föðurnum og faðirinn í mér. Ef þér gerið það ekki, trúið þá vegna sjálfra verkanna. Sannlega, sannlega segi ég yður: Sá sem trúir á mig, mun einnig gjöra þau verk, sem ég gjöri. Og hann mun gjöra meiri verk en þau, því ég fer til föðurins. Og hvers sem þér biðjið í mínu nafni, það mun ég gjöra, svo að faðirinn vegsamist í syninum. Ef þér biðjið mig einhvers í mínu nafni, mun ég gjöra það. Ef þér elskið mig, munuð þér halda boðorð mín. Ég mun biðja föðurinn, og hann mun gefa yður annan hjálpara, að hann sé hjá yður að eilífu, anda sannleikans, sem heimurinn getur ekki tekið á móti, því hann sér hann ekki né þekkir. Þér þekkið hann, því hann er hjá yður og verður í yður. Ekki mun ég skilja yður eftir munaðarlausa. Ég kem til yðar. Innan skamms mun heimurinn ekki sjá mig framar. Þér munuð sjá mig, því ég lifi og þér munuð lifa. Á þeim degi munuð þér skilja, að ég er í föður mínum og þér í mér og ég í yður. Sá sem hefur boðorð mín og heldur þau, hann er sá sem elskar mig. En sá sem elskar mig, mun elskaður verða af föður mínum, og ég mun elska hann og birta honum sjálfan mig. Júdas ekki Ískaríot sagði við hann: Herra, hverju sætir það, að þú vilt birtast oss, en eigi heiminum? Jesús svaraði: Sá sem elskar mig, varðveitir mitt orð, og faðir minn mun elska hann. Til hans munum við koma og gjöra okkur bústað hjá honum. Sá sem elskar mig ekki, varðveitir ekki mín orð. Orðið, sem þér heyrið, er ekki mitt, heldur föðurins, sem sendi mig. Þetta hef ég talað til yðar, meðan ég var hjá yður. En hjálparinn, andinn heilagi, sem faðirinn mun senda í mínu nafni, mun kenna yður allt og minna yður á allt það, sem ég hef sagt yður. Frið læt ég yður eftir, minn frið gef ég yður. Ekki gef ég yður eins og heimurinn gefur. Hjarta yðar skelfist ekki né hræðist. Þér heyrðuð, að ég sagði við yður: Ég fer burt og kem til yðar. Ef þér elskuðuð mig, yrðuð þér glaðir af því, að ég fer til föðurins, því faðirinn er mér meiri. Nú hef ég sagt yður það, áður en það verður, svo að þér trúið, þegar það gerist. Ég mun ekki framar tala margt við yður, því höfðingi heimsins kemur. Í mér á hann ekki neitt. En heimurinn á að sjá, að ég elska föðurinn og gjöri eins og faðirinn hefur boðið mér. Standið upp, vér skulum fara héðan.',
    },
    {
        ref_canonical: 'PSA.122',
        ref_display_is: 'Sálmarnir 122',
        ref_display_en: 'Psalm 122',
        text_is: 'Ég varð glaður, er menn sögðu við mig: Göngum í hús Drottins. Fætur vorir standa í hliðum þínum, Jerúsalem. Jerúsalem, þú hin endurreista, borgin þar sem öll þjóðin safnast saman, þangað sem kynkvíslirnar fara, kynkvíslir Drottins, það er regla fyrir Ísrael, til þess að lofa nafn Drottins, því að þar standa dómarastólar, stólar fyrir Davíðs ætt. Biðjið Jerúsalem friðar, hljóti heill þeir, er elska þig. Friður sé kringum múra þína, heill í höllum þínum. Sakir bræðra minna og vina óska ég þér friðar. Sakir húss Drottins, Guðs vors, vil ég leita þér hamingju.',
    },
    {
        ref_canonical: 'ROM.8.31-ROM.8.39',
        ref_display_is: 'Rómverjabréfið 8:31–39',
        ref_display_en: 'Romans 8:31–39',
        text_is: 'Hvað eigum vér þá að segja við þessu? Ef Guð er með oss, hver er þá á móti oss? Hann sem þyrmdi ekki sínum eigin syni, heldur framseldi hann fyrir oss alla, hví skyldi hann ekki líka gefa oss allt með honum? Hver skyldi ásaka Guðs útvöldu? Guð sýknar. Hver sakfellir? Kristur Jesús er sá, sem dáinn er. Og meira en það: Hann er upprisinn, hann er við hægri hönd Guðs og hann biður fyrir oss. Hver mun gjöra oss viðskila við kærleika Krists? Mun þjáning geta það eða þrenging, ofsókn, hungur eða nekt, háski eða sverð? Það er eins og ritað er: Þín vegna erum vér deyddir allan daginn, erum metnir sem sláturfé. Nei, í öllu þessu vinnum vér fullan sigur fyrir fulltingi hans, sem elskaði oss. Því að ég er þess fullviss, að hvorki dauði né líf, englar né tignir, hvorki hið yfirstandandi né hið ókomna, hvorki kraftar, hæð né dýpt, né nokkuð annað skapað muni geta gjört oss viðskila við kærleika Guðs, sem birtist í Kristi Jesú Drottni vorum.',
    },
    {
        ref_canonical: 'JHN.12.9-JHN.12.19',
        ref_display_is: 'Jóhannes 12:9–19',
        ref_display_en: 'John 12:9–19',
        text_is: 'Nú komst allur fjöldi Gyðinga að því, að Jesús væri þarna, og þeir komu þangað, ekki aðeins hans vegna, heldur og til að sjá Lasarus, sem hann hafði vakið frá dauðum. Þá réðu æðstu prestarnir af að taka einnig Lasarus af lífi, því vegna hans snuru margir Gyðingar baki við þeim og fóru að trúa á Jesú. Sá mikli mannfjöldi, sem kominn var til hátíðarinnar, frétti degi síðar, að Jesús væri að koma til Jerúsalem. Þeir tóku þá pálmagreinar, fóru út á móti honum og hrópuðu: Hósanna! Blessaður sé sá, sem kemur, í nafni Drottins, konungur Ísraels! Jesús fann ungan asna og settist á bak honum, eins og skrifað er: Óttast ekki, dóttir Síon. Sjá, konungur þinn kemur, ríðandi á ösnufola. Lærisveinar hans skildu þetta ekki í fyrstu, en þegar Jesús var dýrlegur orðinn, minntust þeir þess, að þetta var ritað um hann og að þeir höfðu gjört þetta fyrir hann. Nú vitnaði fólkið, sem með honum var, þegar hann kallaði Lasarus út úr gröfinni og vakti hann frá dauðum. Vegna þess fór einnig mannfjöldinn á móti honum, því menn höfðu heyrt, að hann hefði gjört þetta tákn. Því sögðu farísear sín á milli: Þér sjáið, að þér ráðið ekki við neitt. Allur heimurinn eltir hann.',
    },
    {
        ref_canonical: 'JOB.1.6-JOB.1.22',
        ref_display_is: 'Jobsbók 1:6–22',
        ref_display_en: 'Job 1:6–22',
        text_is: 'Nú bar svo til einn dag, að synir Guðs komu til þess að ganga fyrir Drottin, og kom Satan og meðal þeirra. Mælti þá Drottinn til Satans: Hvaðan kemur þú? Satan svaraði Drottni og sagði: Ég hefi verið að reika um jörðina og arka fram og aftur um hana. Og Drottinn mælti til Satans: Veittir þú athygli þjóni mínum Job? því að enginn er hans líki á jörðu, maður ráðvandur og réttlátur, guðhræddur og grandvar. Og Satan svaraði Drottni og sagði: Ætli Job óttist Guð fyrir ekki neitt? Hefir þú ekki lagt skjólgarð um hann og hús hans og allt, sem hann á, hringinn í kring? Handaverk hans hefir þú blessað, og fénaður hans breiðir sig um landið. En rétt þú út hönd þína og snert þú allt, sem hann á, og mun hann þá formæla þér upp í opið geðið. Þá mælti Drottinn til Satans: Sjá, veri allt, sem hann á, á þínu valdi, en á sjálfan hann mátt þú ekki leggja hönd þína. Gekk Satan þá burt frá augliti Drottins. Nú bar svo til einn dag, er synir hans og dætur átu og drukku vín í húsi elsta bróður síns, að sendimaður kom til Jobs og sagði: Nautin voru að plægja og ösnurnar voru á beit rétt hjá þeim. Gjörðu þá Sabear athlaup og tóku þau, en sveinana drápu þeir. Ég einn komst undan til að flytja þér tíðindin. En áður en hann hafði lokið máli sínu, kom annar og sagði: Eldur Guðs féll af himni og kveikti í hjörðinni og sveinunum og eyddi þeim. Ég einn komst undan til að flytja þér tíðindin. En áður en sá hafði lokið máli sínu, kom annar og sagði: Kaldear fylktu þremur flokkum, gjörðu áhlaup á úlfaldana og tóku þá, en sveinana drápu þeir. Ég einn komst undan til að flytja þér tíðindin. Áður en sá hafði lokið máli sínu, kom annar og sagði: Synir þínir og dætur átu og drukku vín í húsi elsta bróður síns. Kom þá skyndilega fellibylur austan yfir eyðimörkina og lenti á fjórum hornum hússins, svo að það féll ofan yfir sveinana, og þeir dóu. Ég einn komst undan til að flytja þér tíðindin. Þá stóð Job upp og reif skikkju sína og skar af sér hárið, og féll til jarðar, tilbað og sagði: Nakinn kom ég af móðurskauti og nakinn mun ég aftur þangað fara. Drottinn gaf og Drottinn tók, lofað veri nafn Drottins. Í öllu þessu syndgaði Job ekki, og ekki átaldi hann Guð heimskulega.',
    },
    {
        ref_canonical: '2SA.5.3-2SA.5.12',
        ref_display_is: 'Seinni Samúelsbók 5:3–12',
        ref_display_en: '2 Samuel 5:3–12',
        text_is: 'Allir öldungar Ísraels komu til konungsins í Hebron, og Davíð konungur gjörði við þá sáttmála í Hebron, frammi fyrir augliti Drottins, og þeir smurðu Davíð til konungs yfir Ísrael. Þrjátíu ára gamall var Davíð, þá er hann varð konungur, og fjörutíu ár ríkti hann. Í Hebron ríkti hann sjö ár og sex mánuði yfir Júda, og í Jerúsalem ríkti hann þrjátíu og þrjú ár yfir öllum Ísrael og Júda. Konungur og menn hans fóru til Jerúsalem í móti Jebúsítum, sem bjuggu í því héraði. Jebúsítar sögðu við Davíð: Þú munt eigi komast hér inn, heldur munu blindir menn og haltir reka þig burt. Með því áttu þeir við: Davíð mun ekki komast hér inn. En Davíð tók vígið Síon, það er Davíðsborg. Davíð sagði á þeim degi: Hver sem vill vinna sigur á Jebúsítum, skal fara um göngin til þess að komast að þeim höltu og blindu, sem Davíð hatar í sálu sinni. Þaðan er komið máltækið: Blindir og haltir komast ekki inn í musterið. Því næst settist Davíð að í víginu, og nefndi hann það Davíðsborg. Hann reisti og víggirðingar umhverfis, frá Milló og þaðan inn á við. Og Davíð efldist meir og meir, og Drottinn, Guð allsherjar, var með honum. Híram, konungur í Týrus, gjörði menn á fund Davíðs og sendi honum sedrustré, trésmiði og steinhöggvara, og reistu þeir höll handa Davíð. Og Davíð kannaðist við, að Drottinn hefði staðfest konungdóm hans yfir Ísrael og eflt konungsríki hans fyrir sakir þjóðar sinnar Ísraels.',
    },
    {
        ref_canonical: 'HEB.11.1-HEB.11.2',
        ref_display_is: 'Hebreabréfið 11:1–2',
        ref_display_en: 'Hebrews 11:1–2',
        text_is: 'Trúin er fullvissa um það, sem menn vona, sannfæring um þá hluti, sem eigi er auðið að sjá. Fyrir hana fengu mennirnir fyrr á tíðum góðan vitnisburð.',
    },
];

async function main() {
    for (const p of PASSAGES) {
        const { error } = await supabase
            .from('bible_passages')
            .upsert(
                {
                    ref_canonical: p.ref_canonical,
                    ref_display_is: p.ref_display_is,
                    ref_display_en: p.ref_display_en,
                    text_is: p.text_is.trim(),
                },
                { onConflict: 'ref_canonical' },
            );
        if (error) {
            console.error(`✗ ${p.ref_canonical}: ${error.message}`);
            continue;
        }
        console.log(`✅ ${p.ref_canonical} — ${p.text_is.trim().length} chars`);
    }
}

main();
