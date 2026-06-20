// Generate a show (series) key-art poster from its newest episode's chosen frame.
// AI-upscales the frame (fal), makes clean graded 2:3 + 4:5 portraits (no baked
// title — the UI renders the show name), uploads, and sets series.poster_vertical
// + poster_horizontal. Reusable for any show.
//   Run: node scripts/make-show-poster.mjs <series-slug>
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const slug = process.argv[2] || 'bibliulestur-snorri';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: series } = await sb.from('series').select('id, title').eq('slug', slug).single();
if (!series) { console.error('series not found:', slug); process.exit(1); }

const { data: eps } = await sb
    .from('episodes')
    .select('poster_candidates, published_at')
    .eq('series_id', series.id)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1);
const model = eps?.[0]?.poster_candidates;
const frameUrl = model?.selected_source?.url || model?.source_candidates?.[0]?.url;
if (!frameUrl) { console.error('no source frame for', slug); process.exit(1); }

// AI re-polish the frame for crispness (graceful: fall back to raw frame).
let chosenUrl = frameUrl;
const falKey = process.env.FAL_KEY?.trim();
if (falKey) {
    try {
        const r = await fetch('https://fal.run/fal-ai/codeformer', {
            method: 'POST',
            headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: frameUrl, fidelity: 0.8, upscale_factor: 2, face_upscale: true }),
        });
        if (r.ok) { const d = await r.json(); if (d?.image?.url) chosenUrl = d.image.url; }
    } catch { /* fall back to raw frame */ }
}
const src = Buffer.from(await (await fetch(chosenUrl)).arrayBuffer());

const vignette = (w, h) => Buffer.from(
    `<svg width="${w}" height="${h}"><defs><radialGradient id="v" cx="50%" cy="42%" r="60%">` +
    `<stop offset="50%" stop-color="black" stop-opacity="0"/>` +
    `<stop offset="100%" stop-color="black" stop-opacity="0.45"/></radialGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#v)"/></svg>`,
);
// Trim the burned-subtitle band off the bottom, keep full width, then center-crop
// to the target aspect (talking-head framing) — same approach as the episode cards.
const meta = await sharp(src).metadata();
const sw = meta.width ?? 1280;
const sh = meta.height ?? 720;
const cropTop = Math.floor(sh * 0.02);
const cropH = Math.max(1, sh - cropTop - Math.floor(sh * 0.18));
const make = (w, h) => sharp(src)
    .extract({ left: 0, top: cropTop, width: sw, height: cropH })
    .resize(w, h, { fit: 'cover', position: 'centre' })
    .modulate({ saturation: 1.16, brightness: 1.02 })
    .linear(1.08, -(128 * 0.08))
    .gamma(1.05)
    .composite([{ input: vignette(w, h), top: 0, left: 0 }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

const stamp = Date.now();
const upload = async (buf, name) => {
    const fn = `series_${slug}_${name}_${stamp}.jpg`;
    const { error } = await sb.storage.from('thumbnails').upload(fn, buf, {
        contentType: 'image/jpeg', cacheControl: '3600', upsert: true,
    });
    if (error) throw new Error(error.message);
    return sb.storage.from('thumbnails').getPublicUrl(fn).data.publicUrl;
};

const vUrl = await upload(await make(1000, 1500), '2x3');
const hUrl = await upload(await make(1000, 1250), '4x5');
await sb.from('series').update({ poster_vertical: vUrl, poster_horizontal: hUrl }).eq('id', series.id);

console.log('✅', series.title);
console.log('   poster_vertical:  ', vUrl);
console.log('   poster_horizontal:', hUrl);
