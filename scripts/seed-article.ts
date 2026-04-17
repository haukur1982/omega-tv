// Quick script to seed the first launch article into Supabase
// Run with: npx tsx scripts/seed-article.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const article = {
    title: 'Hvernig Guð sér þig — og hvers vegna það breytir öllu',
    slug: 'hvernig-gud-ser-thig',
    author_name: 'Omega',
    excerpt: 'Flest okkar bera með sér sjálfsmynd sem mótast hefur af okkar verstu augnablikum. En hvað ef Guð sér þig alls ekki þannig?',
    featured_image: null,
    published_at: new Date().toISOString(),
    content: `
<p class="lead">Hefurðu einhvern tíma staðið fyrir framan spegil og þér ekki líkað það sem þú sást?</p>

<p>Ekki andlitið á þér. Ekki fötin þín. Heldur eitthvað mun dýpra. Þessi rödd aftarlega í huganum sem hvíslar: <em>Þú ert ekki nóg. Þér hefur mistekist of oft. Ef fólk þekkti þig í raun og veru myndu þau ekki staldra við.</em></p>

<p>Flest okkar bera með sér sjálfsmynd sem mótast hefur af okkar verstu augnablikum. Mistökunum sem við höfum gert. Því sem við vildum óska að við gætum tekið til baka. Þar sem við höfum brugðist. Og með tímanum verður þessi sjálfsmynd að þeirri linsu sem við sjáum allt í gegnum — gildi okkar, framtíð okkar og jafnvel samband okkar við Guð.</p>

<p>En hvað ef Guð sér þig alls ekki þannig?</p>

<p>Hvað ef þín eigin sýn á þér og sýn Guðs á þér eru tvær gjörólíkar myndir?</p>

<h2>Blóðið breytir öllu</h2>

<p>Biblían setur fram fullyrðingu í Kólossubréfinu 1:22 sem er svo róttæk að flestir lesa beint fram hjá henni án þess að staldra við og finna fyrir þunganum í henni. Þar er talað um það sem Jesús áorkaði með fórn sinni og segir:</p>

<blockquote>
<p>„En nú hefur hann sætt ykkur við sig með dauða sínum í jarðneskum líkama til þess að geta leitt ykkur fram fyrir sig <strong>heilög, lýtalaus og óaðfinnanleg</strong>."</p>
</blockquote>

<p>Lestu þetta aftur, hægt og rólega. <strong>Heilög. Lýtalaus. Óaðfinnanleg.</strong> Þetta er engin framtíðarvon. Það er nákvæmlega svona sem Guð sér þig einmitt núna — vegna þess sem Jesús hefur þegar gert.</p>

<p>Þetta er ekki bara jákvæð hugsun. Það er ekki óskhyggju-guðfræði. Þetta er afrakstur stærstu makaskipta mannkynssögunnar. Á krossinum tók Jesús á sig allt sem var að hjá þér — hverja synd, hvern ósigur, hvern brest — og gaf þér allt sem var rétt og fullkomið hjá honum. Páll postuli orðaði það á skýran hátt í 2. Korintubréfi 5:21:</p>

<blockquote>
<p>„Þann sem þekkti ekki synd gerði hann að synd okkar vegna til þess að við skyldum verða <strong>réttlæti Guðs</strong> í honum."</p>
</blockquote>

<p>Þér er ekki bara fyrirgefið. Þú ert ekki bara umborin manneskja. <strong>Réttlæti Guðs.</strong> Það er það sem þú ert í hans augum.</p>

<h2>Boginn — tvö sjónarhorn</h2>

<p>Hugsaðu um það svona.</p>

<p>Ímyndaðu þér mikinn boga sem teygir sig yfir líf þitt — eins og regnboga sem hylur allt sem þú ert. Þessi bogi er friðþægingin, blóð Krists, fórnin sem færð var í þinn stað.</p>

<p>Ímyndaðu þér nú tvö sjónarhorn.</p>

<p><strong>Neðan frá boganum</strong> — frá mannlegu hliðinni — horfir þú á sjálfan þig og sérð það sem allir aðrir sjá. Synd. Galla. Ósigra. Það sem þú hefur gert og það sem hefur verið gert á þinn hlut. Óreiðuna. Baráttuna. Efann. Þetta er sjónarhornið frá jörðu niðri, og það er sú sýn sem flest fólk lifir við allt sitt líf.</p>

<p><strong>En ofan frá boganum</strong> — frá hlið Guðs — er sjónarhornið gjörólíkt. Guð horfir í gegnum hjúp blóðsins, og hvað sér hann? Ekki synd þína — hann sér heilagleika. Ekki galla þína — hann sér lýtaleysi. Ekki ósigra þína — hann sér manneskju sem er óaðfinnanleg. Vegna þess að blóðið hefur þegar bætt fyrir þetta allt.</p>

<p>Hér er Guð ekki að þykjast. Hann er ekki að líta undan. Hann tókst raunverulega á við syndavandann — að fullu og varanlega, á krossinum. Og vegna þess að tekið hefur verið á vandanum skilgreinir hann ekki lengur hvernig Guð sér þig.</p>

<h2>Áður en heimurinn var til</h2>

<p>Þetta var ætlun Guðs alveg frá upphafi. Þetta var engin varaáætlun. Það var ekki viðbragð við því hversu illa fór í Edengarðinum. Hlustaðu á það sem segir í Efesusbréfinu 1:4–5:</p>

<blockquote>
<p>„Áður en grunnur heimsins var lagður útvaldi hann okkur í Kristi að hann hefði okkur fyrir augum sér <strong>heilög og lýtalaus í kærleika</strong>. Hann ákvað fyrir fram að veita okkur sonarrétt í Jesú Kristi. Það var hans vilji og velþóknun."</p>
</blockquote>

<p>Áður en heimurinn var til. Áður en þú fæddist. Áður en þú gerðir nokkurn tímann nokkuð rétt eða rangt. Þá hafði Guð þegar valið að sjá þig sem heilaga og lýtalausa manneskju. Það var hans hugmynd. Það var hans velþóknun. Ekki vegna þess sem þú myndir gera — heldur vegna þess sem hann ætlaði að gera fyrir milligöngu Krists.</p>

<p>Það þýðir að sjálfsmynd þín átti aldrei að byggjast á frammistöðu þinni. Hún átti að byggjast á ákvörðun hans.</p>

<h2>Náðin sem bæði hulir og umbreytir</h2>

<p>Það er til fallegt vers í Títusarbréfinu sem sýnir báðar hliðar þessa sannleika — þá sem vísar til himins og þá sem vísar til jarðar:</p>

<blockquote>
<p>„Því að náð Guðs hefur opinberast til sáluhjálpar öllum mönnum. Hún kennir okkur að afneita óguðleik og veraldlegum girndum og lifa hóglátlega, réttvíslega og guðrækilega í heimi þessum." — Títusarbréfið 2:11–12</p>
</blockquote>

<p>Náð Guðs geislar upp til himins með boðskap um réttlætingu — Guð hefur nú þegar tekið við þér. En sama náð geislar niður í daglegt líf þitt og kennir þér að lifa á annan hátt — ekki til að vinna þér inn samþykki Guðs, heldur vegna þess að þú hefur það nú þegar.</p>

<p>Hér er lykillinn: <strong>Viðurkenning Guðs kom fyrst. Umbreytingin kemur á eftir.</strong> Þú hreinsar þig ekki til svo að Guð taki við þér. Hann tekur við þér svo að þú getir, út frá stað öryggis og kærleika, byrjað að breytast.</p>

<p>Þetta er munurinn á trúarbrögðum og sambandi. Trúarbrögðin segja: <em>Stattu þig, og ef til vill mun Guð taka við þér.</em> Náðin segir: <em>Guð hefur nú þegar samþykkt þig — leyfðu nú þeim sannleika að endurmóta hvernig þú lifir.</em></p>

<h2>Engin fyrirdæming</h2>

<p>Flest fólk ber með sér djúpstæðan ótta um að ef Guð liti raunverulega á það — ef hann sæi það í raun og veru — yrði hann fyrir vonbrigðum. Eða reiður. Eða fylltur viðbjóði.</p>

<p>En Biblían segir hið gagnstæða. Þegar Guð horfir á þig í gegnum blóð Jesú, sér hann ekki verstu útgáfuna af þér. Hann sér þig eins og hann ætlaðist alltaf til að þú yrðir. Efesusbréfið 1:4 segir að hann hafi þig <em>fyrir augum sér heilög og lýtalaus</em>. Og Kólossubréfið 1:22 segir að hann sjái ekkert sem hægt sé að ávíta, álasa eða jafnvel skamma þig fyrir.</p>

<p><strong>Ekkert.</strong></p>

<p>Þetta þýðir ekki að daglegt líf þitt sé fullkomið. Það þýðir að staða þín frammi fyrir Guði er trygg. Hann huldi þig fyrst — og síðan starfar hann í þér, undir þeirri hulu, og umbreytir þér innan frá og út.</p>

<p>Hulan er algjör. Umbreytingin er yfirstandandi. Hvort tveggja er satt á sama tíma.</p>

<h2>Undir hvers sjónarhorni lifir þú?</h2>

<p>Svo hér er spurningin sem skiptir meira máli en nokkur önnur:</p>

<p><strong>Undir hvers sjónarhorni ert þú að lifa?</strong></p>

<p>Ef þú lifir eftir sjónarhorninu neðan frá boganum — mannlegu sýninni — muntu verja ævinni í að reyna að laga, vinna þér inn, sanna þig og streða til að öðlast virði. Og þú munt aldrei komast þangað, vegna þess að það var aldrei ætlunin að þú byggðir sjálfsmynd þína á eigin getu eða frammistöðu.</p>

<p>En ef þú lyftir augum þínum og tekur á móti sjónarhorninu að ofan — sýninni sem Guð hefur — breytist allt. Þú hættir að streða. Þú hættir að fela þig. Þú byrjar að lifa sem manneskja sem er nú þegar þekkt, nú þegar elskuð og nú þegar samþykkt.</p>

<p>Páll postuli, sem skildi þennan sannleika jafn djúpt og nokkur annar, orðaði það svona:</p>

<blockquote>
<p>„Nú er því <strong>engin fyrirdæming</strong> búin þeim sem eru í Kristi Jesú." — Rómverjabréfið 8:1</p>
</blockquote>

<p>Engin fyrirdæming. Ekki minni fyrirdæming. Ekki skilyrt fyrirdæming. <strong>Engin.</strong></p>

<p>Þannig sér Guð þig. Og þegar þú byrjar að sjá sjálfan þig eins og hann gerir, breytir það öllu — ekki vegna þess að þú leggir þig harðar fram, heldur vegna þess að þú skilur loksins hver þú raunverulega ert nú þegar.</p>

<p class="lead">Fortíð þín skilgreinir þig ekki. Þú ert ekki summan af ósigrum þínum. Þú ert ekki það sem aðrir hafa sagt um þig.</p>

<p class="lead"><strong>Þú ert það sem Guð segir um þig. Og það sem hann segir er: heilög, lýtalaus, óaðfinnanleg — og heitt og skilyrðislaust elskuð.</strong></p>
`.trim(),
};

async function main() {
    console.log('Inserting article:', article.title);

    const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select()
        .single();

    if (error) {
        console.error('Failed:', error);
        process.exit(1);
    }

    console.log('✅ Article published!');
    console.log('   ID:', data.id);
    console.log('   Slug:', data.slug);
    console.log('   View at: /greinar/hvernig-gud-ser-thig');
}

main();
