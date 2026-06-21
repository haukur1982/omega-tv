import type { Article } from "./article-helpers";

/**
 * FAITH_SEED — the first four public-domain, faith-building articles,
 * translated to Icelandic via BookForge.
 *
 * Used ONLY for local preview. articles-db.ts merges these in when
 * NODE_ENV === 'development' (or FAITH_PREVIEW=1) so we can see the
 * topic browse with real content before the rows are inserted into
 * Supabase and published. In production this list is inert.
 *
 * Source URLs and rights notes live in docs/faith-library-seed.md.
 * All four are public domain.
 */

const SOURCE = {
    wigglesworth: 'Heimild: „Ever Increasing Faith“ eftir Smith Wigglesworth. Almenningseign.',
    mueller: 'Heimild: „Answers to Prayer“ eftir George Müller, 17. mars 1842. Almenningseign.',
    bray: 'Heimild: „The King’s Son“, ævisaga Billy Bray. Almenningseign.',
};

function body(paragraphs: string[], source: string): string {
    return [...paragraphs, source].join('\n\n');
}

export const FAITH_SEED: readonly Article[] = [
    {
        id: 'seed-eins-og-fadir',
        slug: 'eins-og-fadir',
        title: 'Eins og faðir',
        category: 'Bænheyrsla',
        author_name: 'George Müller',
        excerpt: 'Á tæmdum sjóðum og með munaðarleysingja að fæða gekk George Müller af stað í bæn. Svarið kom áður en hann náði heim.',
        featured_image: null,
        published_at: '2026-06-20T09:00:00Z',
        created_at: '2026-06-20T09:00:00Z',
        content: body([
            'Þennan morgun var fátæktin orðin yfirþyrmandi, enda höfðum við búið við mikinn skort í marga mánuði.',
            'Ég fór að heiman skömmu eftir klukkan sjö og gekk til munaðarleysingjaheimilanna til að athuga hvort til væri peningur fyrir mjólkinni sem afhent er um áttaleytið.',
            'Á leiðinni bað ég Drottin sérstaklega að miskunna okkur, líkt og faðir sýnir börnum sínum miskunn, og að leggja ekki meira á okkur en við mættum þola.',
            'Ég sárbændi hann um að endurnæra hjörtu okkar með því að senda okkur hjálp.',
            'Ég minnti hann einnig á hverjar afleiðingarnar yrðu, bæði fyrir trúaða og vantrúaða, ef við þyrftum að leggja niður starfið vegna fjárskorts.',
            'Ég játaði jafnframt frammi fyrir Drottni að ég væri þess ekki verður að hann notaði mig lengur í þessu verki.',
            'Meðan ég var þannig í bæn, í um tveggja mínútna göngufjarlægð frá munaðarleysingjaheimilunum, mætti ég bróður sem var á leið til vinnu svo snemma morguns.',
            'Við skiptumst á nokkrum orðum og ég hélt áfram, en stuttu síðar hljóp hann á eftir mér og rétti mér eitt pund fyrir börnin.',
            'Þannig svaraði Drottinn bæn minni um hæl.',
            'Sannarlega er það þess virði að líða skort og þola miklar trúarprófanir, til þess eins að upplifa dag hvern þessar dýrmætu sannanir um umhyggju góðs Föður fyrir öllu því sem okkur varðar.',
            'Sá sem færði okkur æðstu sönnunina um kærleika sinn með því að gefa okkur sinn eigin son, mun vissulega einnig gefa okkur allt með honum.',
        ], SOURCE.mueller),
    },
    {
        id: 'seed-konan-i-belfast',
        slug: 'konan-i-belfast',
        title: 'Konan í Belfast',
        category: 'Lækning',
        author_name: 'Smith Wigglesworth',
        excerpt: 'Öldruð kona, lærbrotin og rúmföst, fékk þau skilaboð að hún myndi aldrei ganga aftur. En Guð átti annað erindi.',
        featured_image: null,
        published_at: '2026-06-20T09:05:00Z',
        created_at: '2026-06-20T09:05:00Z',
        content: body([
            'Einn daginn var ég í Belfast og hitti einn bræðranna úr söfnuðinum.',
            'Hann sagði við mig: „Wigglesworth, ég er áhyggjufullur.“',
            'Undanfarna fimm mánuði hef ég gengið í gegnum mikla sorg.',
            'Í söfnuðinum mínum var kona sem gat alltaf beðið himneskrar blessunar yfir samkomurnar okkar.',
            'Hún er öldruð kona, en nærvera hennar varpar alltaf birtu yfir okkur.',
            'En fyrir fimm mánuðum datt hún og lærbrotnaði.',
            'Læknarnir settu hana í gifs og eftir fimm mánuði var það tekið af.',
            'En beinin höfðu ekki gróið rétt saman, svo hún datt og braut lærið aftur.“ Hann fór með mig heim til hennar og þar lá konan í rúmi hægra megin í herberginu.',
            'Ég sagði við hana: „Jæja, hvernig horfir þetta þá við núna?“ Hún sagði: „Þeir sendu mig heim og sögðu að ekki væri hægt að lækna mig.',
            'Læknarnir segja að ég sé orðin svo gömul að beinin muni ekki gróa saman.',
            'Það er engin næring í beinunum og þeir geta aldrei gert neitt fyrir mig. Þeir segja að ég verði að liggja í rúminu það sem eftir er.“ Ég sagði við hana: „Geturðu reitt þig á Guð?“ Hún svaraði: „Já, allt frá því að ég heyrði að þú værir kominn til Belfast hefur trú mín glæðst.',
            'Ef þú biður, þá mun ég trúa.',
            'Ég veit að það er enginn máttur á jörðu sem getur látið lærbeinin gróa saman, en ég veit að Guði er ekkert ómögulegt.“ Ég sagði: „Trúirðu að hann muni mæta þér núna?“ Hún svaraði: „Það geri ég.“ Ég sagði við konuna: „Þegar ég bið mun eitthvað gerast.“ Eiginmaður hennar sat þar hjá; hann hafði setið í stól sínum í fjögur ár og gat ekki tekið eitt einasta skref.',
            'Hann kallaði upp: „Ég trúi þessu ekki.',
            'Ég neita að trúa.',
            'Ég sagði: „Það er í góðu lagi,“ og lagði hendur yfir eiginkonu hans í nafni Drottins Jesú.',
            'Um leið og hendur voru lagðar yfir hana fór kraftur Guðs um hana alla og hún kallaði upp: „Ég er læknuð.“ Ég sagði: „Ég ætla ekki að hjálpa þér á fætur.',
            'Guð mun gera það allt.“ Hún stóð upp, gekk fram og til baka um herbergið og lofaði Guð.',
            'Gamli maðurinn var agndofa yfir því sem hafði gerst fyrir eiginkonu hans og kallaði: „Láttu mig ganga, láttu mig ganga.“ Ég sagði við hann: „Gamli syndari, gerðu iðrun.“ Hann hrópaði: „Drottinn, þú veist að ég meinti ekki það sem ég sagði.',
            'Drottinn var fullur miskunnar.',
            'Ef hann minntist synda okkar, hvar værum við þá öll?',
            'Ef við gerum okkar, mun Guð alltaf mæta okkur.',
            'Ef við trúum er allt mögulegt.',
            'Ég lagði hendur yfir hann og krafturinn fór um allan líkama gamla mannsins; og þessir fætur fengu í fyrsta sinn í fjögur ár þrek til að bera líkama hans, og hann gekk fram og til baka, út og inn.',
            'Hann sagði: „Ó, hversu mikla hluti Guð hefur gert fyrir okkur í kvöld!“',
        ], SOURCE.wigglesworth),
    },
    {
        id: 'seed-laeknadur-og-frelsadur',
        slug: 'laeknadur-og-frelsadur',
        title: 'Læknaður og frelsaður',
        category: 'Frelsun',
        author_name: 'Smith Wigglesworth',
        excerpt: 'Ungur maður, útskúfaður af tveimur sjúkrahúsum, kom örvæntingarfullur á samkomu. Það sem gerðist næst breytti öllu.',
        featured_image: null,
        published_at: '2026-06-20T09:10:00Z',
        created_at: '2026-06-20T09:10:00Z',
        content: body([
            'Eitt sinn var ég á síðdegissamkomu.',
            'Drottinn hafði verið með okkur í náð sinni og margir höfðu hlotið lækningu fyrir kraft Guðs.',
            'Flestir voru farnir heim og ég var orðinn einn eftir þegar ég tók eftir ungum manni sem virtist bíða eftir að fá að ræða við mig.',
            'Ég spurði: „Hvað get ég gert fyrir þig?“ Hann svaraði: „Ætli ég mætti biðja þig að biðja fyrir mér.“ Ég spurði: „Hvað amar að?“ Hann svaraði: „Finnurðu ekki lyktina?“ Þessi ungi maður hafði villst af leið og var nú að taka út afleiðingarnar.',
            'Hann sagði: „Mér hefur verið vísað burt af tveimur sjúkrahúsum.',
            'Ég er útsettur um allan líkamann.',
            'Ég er allur þakinn kýlum.“ Og ég sá að hann var með slæm útbrot á nefinu.',
            'Hann sagði: „Ég hlustaði á þig prédika en skildi ekkert í þessu tali um lækningu, en velti því samt fyrir mér hvort það væri nokkur von fyrir mig.“ Ég spurði hann: „Þekkir þú Jesú?“ Hann hafði ekki minnstu hugmynd um hjálpræðið, en ég sagði við hann: „Stattu kyrr.“ Ég lagði hendur á höfuð hans og lendar og ávítaði þennan hræðilega sjúkdóm í nafni Jesú.',
            'Hann hrópaði: „Ég veit að ég er læknaður.',
            'Ég finn hita og yl um allan líkamann.“ Ég spurði: „Hver gerði þetta?“ Hann svaraði: „Bænir þínar.“ Ég sagði: „Nei, það var Jesús!“ Hann spurði: „Var það hann?“',
            'Ó, Jesús! Jesús! Jesús, frelsaðu mig.“ Og þessi ungi maður fór burt læknaður og frelsaður.',
        ], SOURCE.wigglesworth),
    },
    {
        id: 'seed-gladur-upp-fra-thvi',
        slug: 'gladur-upp-fra-thvi',
        title: 'Glaður upp frá því',
        category: 'Afturhvarf',
        author_name: 'Billy Bray',
        excerpt: 'Á einu andartaki fyllti Guð hann slíkri gleði að hann hætti aldrei að lofa. Fjörutíu árum síðar var fögnuðurinn óbreyttur.',
        featured_image: null,
        published_at: '2026-06-20T09:15:00Z',
        created_at: '2026-06-20T09:15:00Z',
        content: body([
            'Á augabragði fyllti Drottinn mig svo mikilli gleði að mér verður orðfall.',
            'Ég hrópaði af fögnuði.',
            'Ég lofaði Guð af öllu hjarta fyrir það sem hann hafði gert fyrir auman syndara eins og mig, því ég gat loksins sagt að Drottinn hefði fyrirgefið mér allar syndir mínar.',
            'Ég man hvernig allt virtist nýtt í augum mér; fólkið, akrarnir, skepnurnar og trén.',
            'Ég var sem maður í nýjum heimi.',
            'Ég varði mestum tíma mínum í að lofa Drottin.',
            'Ég sagði öllum sem ég hitti frá því hvað Drottinn hafði gert fyrir sálu mína.',
            'Sumir sögðu mig galinn, en aðrir töldu víst að ég myndi falla í sama farið á næsta útborgunardegi.',
            'En lofaður sé Drottinn, nú eru liðin rúm fjörutíu ár og þeir hafa ekki enn náð mér.',
            'Ég hef verið glaður upp frá því.',
            'Ég get ekki annað en lofað Drottin.',
            'Þegar ég geng eftir götunni lyfti ég öðrum fætinum og hann virðist segja: „Dýrð!“, og ég lyfti hinum og hann virðist segja: „Amen.“ Og svona halda þeir áfram alla mína göngu.',
            'Þegar fólk snerist gegn honum og ofsótti hann fyrir að syngja og hrópa svona mikið, var hann vanur að segja: „Ef þeir settu mig í tunnu, myndi ég hrópa dýrðina út um tappagatið! Lofaður sé Drottinn!“',
        ], SOURCE.bray),
    },
    {
        id: 'seed-smith-wigglesworth-aevi',
        slug: 'smith-wigglesworth-aevi',
        title: 'Smith Wigglesworth, postuli trúarinnar',
        category: 'Ævisögur',
        author_name: 'Ritstjórn Omega',
        excerpt: 'Fátækur pípulagningamaður frá Englandi, sem varla kunni að lesa, varð einn þekktasti lækningaprédikari sögunnar. Hér er sagan af manninum á bak við frásagnirnar.',
        featured_image: null,
        published_at: '2026-06-19T09:00:00Z',
        created_at: '2026-06-19T09:00:00Z',
        content: [
            'Smith Wigglesworth fæddist í mikilli fátækt á Englandi árið 1859. Sem barn vann hann langan vinnudag, fyrst á ökrum og síðar í ullarverksmiðju, og naut lítillar sem engrar skólagöngu.',
            'Hann gaf Guði hjarta sitt ungur að árum, en lengi vel var trú hans hljóðlát og hversdagsleg. Hann lærði pípulagnir og kom sér upp eigin rekstri í borginni Bradford.',
            'Smith kunni varla að lesa. Það var eiginkona hans, Polly, sem kenndi honum, og Biblían varð eina bókin sem hann las nokkru sinni. Polly var öflugur prédikari, og fyrstu árin stóð Smith fremur í skugga hennar og sá um verklegu hlið starfsins.',
            'Árið 1907 varð vendipunktur. Smith upplifði kröftuga fyllingu heilags anda, og þegar hann steig næst í ræðustól tók Polly eftir því að maðurinn hennar var ekki samur. Boðun hans hafði fengið nýjan kraft.',
            'Upp frá því ferðaðist Wigglesworth um allan heim og boðaði fagnaðarerindið með djörfung. Frásagnir bárust af sjúkum sem læknuðust, og hann varð þekktur sem „postuli trúarinnar“. Hann var hreinskiptinn maður, stundum hrjúfur, en knúinn áfram af einlægri ást á Guði og óbilandi trausti á orði hans.',
            'Polly lést árið 1913, en Smith hélt ótrauður áfram starfi sínu og ferðaðist meðal annars til Evrópu, Bandaríkjanna, Ástralíu og Nýja-Sjálands. Hann lést árið 1947, áttatíu og sjö ára að aldri.',
            'Frásagnirnar sem hér birtast af lækningum og trú eru úr þjónustu þessa manns. Þær minna okkur á að Guð notar fúsa þjóna, hversu lítilfjörlegt sem upphafið kann að virðast.',
        ].join('\n\n'),
    },
];
