/**
 * Dramatic show key art (the "designed" tier) — for worship-service / church
 * shows whose footage is dark stage video that never yields a clean portrait.
 * Takes the newest episode's best frame, AI-upscales it (fal), and composes the
 * Omega hero treatment (cinematic grade + title in Fraunces + Ω mark) at BOTH
 * 2:3 (poster_vertical, show-page masthead) and 4:5 (poster_horizontal, the
 * /sermons shelf card). Title is baked in, the way Apple TV does show posters.
 *
 *   node_modules/.bin/tsx scripts/make-show-hero.ts <slug> \
 *       [--theme=glod] [--focus=0.66] [--boost=1.5] [--trim=0.12] \
 *       [--title="..."] [--tagline="..."] [--host="..."]
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { generateHeroPoster, type PosterThemeName } from '../src/lib/hero-poster';

const argv = process.argv.slice(2);
const slug = argv.find((a) => !a.startsWith('--'));
const flag = (k: string) => {
    const hit = argv.find((a) => a.startsWith(`--${k}=`));
    return hit ? hit.slice(k.length + 3) : undefined;
};

async function main() {
    if (!slug) { console.error('usage: make-show-hero.ts <slug> [--flags]'); process.exit(1); }

    const theme = flag('theme') as PosterThemeName | undefined;
    const focusX = flag('focus') ? Number(flag('focus')) : 0.5;
    const brightnessBoost = flag('boost') ? Number(flag('boost')) : 1;
    const trimBottomPct = flag('trim') ? Number(flag('trim')) : 0;

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: series } = await sb.from('series').select('id, title, host').eq('slug', slug).single();
    if (!series) { console.error('series not found:', slug); process.exit(1); }

    const title = flag('title') ?? series.title;
    const tagline = flag('tagline') || undefined;
    const host = flag('host') !== undefined ? (flag('host') || undefined) : (series.host || undefined);

    const { data: eps } = await sb
        .from('episodes')
        .select('poster_candidates, published_at')
        .eq('series_id', series.id)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1);
    type FrameModel = { selected_source?: { url?: string }; source_candidates?: { url?: string }[] };
    const model = eps?.[0]?.poster_candidates as FrameModel | undefined;
    const frameUrl: string | undefined = model?.selected_source?.url || model?.source_candidates?.[0]?.url;
    if (!frameUrl) { console.error('no source frame for', slug); process.exit(1); }

    // AI re-polish the frame (graceful: fall back to the raw frame).
    let chosenUrl = frameUrl;
    const falKey = process.env.FAL_KEY?.trim();
    if (falKey) {
        try {
            const r = await fetch('https://fal.run/fal-ai/codeformer', {
                method: 'POST',
                headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: frameUrl, fidelity: 0.7, upscale_factor: 2, face_upscale: true }),
            });
            if (r.ok) { const d = await r.json() as { image?: { url?: string } }; if (d?.image?.url) chosenUrl = d.image.url; }
        } catch { /* fall back to raw frame */ }
    }
    const sourceImage = Buffer.from(await (await fetch(chosenUrl)).arrayBuffer());

    const stamp = Date.now();
    const upload = async (buf: Buffer, name: string) => {
        const fn = `series_${slug}_hero_${name}_${stamp}.png`;
        const { error } = await sb.storage.from('thumbnails').upload(fn, buf, {
            contentType: 'image/png', cacheControl: '3600', upsert: true,
        });
        if (error) throw new Error(error.message);
        return sb.storage.from('thumbnails').getPublicUrl(fn).data.publicUrl;
    };

    const common = { sourceImage, title, tagline, host, theme, focusX, brightnessBoost, trimBottomPct };
    const v23 = await generateHeroPoster({ ...common, width: 1000, height: 1500 }); // masthead
    const v45 = await generateHeroPoster({ ...common, width: 1000, height: 1250 }); // shelf
    const vUrl = await upload(v23, '2x3');
    const hUrl = await upload(v45, '4x5');
    await sb.from('series').update({ poster_vertical: vUrl, poster_horizontal: hUrl }).eq('id', series.id);

    console.log('✅', series.title, `(theme=${theme ?? 'auto'} focus=${focusX} boost=${brightnessBoost} trim=${trimBottomPct})`);
    console.log('   poster_vertical (2:3): ', vUrl);
    console.log('   poster_horizontal(4:5):', hUrl);
}

main().catch((e) => { console.error(e); process.exit(1); });
