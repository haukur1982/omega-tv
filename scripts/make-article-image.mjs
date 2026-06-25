// Generate dark, cinematic featured images for faith-library articles via FAL
// (FLUX). Symbolic / atmospheric subjects (objects, light, landscape) — never
// faces — to match the existing hand-picked covers (ash in a stone font, light
// through a window). Output: public/images/articles/<slug>.jpg (1280x800).
//
// Usage:
//   node scripts/make-article-image.mjs                 # all slugs in PROMPTS
//   node scripts/make-article-image.mjs slug1 slug2     # only these
//
// Needs FAL_KEY (read from env or .env.local).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// ── FAL key ───────────────────────────────────────────────────────────────
function falKey() {
    if (process.env.FAL_KEY?.trim()) return process.env.FAL_KEY.trim();
    try {
        const env = readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        const m = env.match(/^FAL_KEY=(.+)$/m);
        if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    } catch {}
    throw new Error('FAL_KEY not found (env or .env.local)');
}

// Shared look so every cover sits in the same world as the existing three.
const STYLE =
    'dark cinematic fine-art photograph, low-key chiaroscuro lighting, a single ' +
    'warm amber light source glowing in deep shadow, muted earthy desaturated ' +
    'palette, soft film grain, 35mm, shallow depth of field, reverent and quiet, ' +
    'atmospheric, no text, no words, no watermark, no people, no faces';

// Symbolic concept per article (keyed by slug).
const PROMPTS = {
    'smith-wigglesworth-aevi':
        'an old worn leather Bible lying open on a rough wooden workbench beside antique iron plumber\'s tools, a shaft of light falling across the pages',
    'gladur-upp-fra-thvi':
        'a vast dark moor at first light, radiant golden sunrise breaking through heavy clouds on the horizon, hope and quiet joy',
    'allt-sem-eg-atti':
        'a single old worn silver coin resting in an open weathered hand, dark background, one warm beam of light, extreme close-up, no face',
    'eins-og-fadir':
        'a single rustic loaf of bread and empty wooden bowls on a bare worn table, soft morning light through a small window, humble provision',
    'menn-baenarinnar':
        'an empty worn wooden kneeling bench in an old stone chapel, a single shaft of light falling on it through deep shadow',
    'yfir-fljotid':
        'a wide dark river at dawn, low mist over the water, soft radiant light glowing on the far bank, a crossing, peaceful and vast',
    'laeknadur-og-frelsadur':
        'a single beam of light breaking through darkness onto an empty simple iron bed in a bare dim room, redemption and release',
    'bidjid-hvert-fyrir-odru':
        'two weathered old hands clasped together in prayer over a dark wooden table, warm amber light, deep shadow, no face',
    'konan-i-belfast':
        'a simple wooden walking cane leaning against an empty made bed by a window, soft dawn light streaming in, stillness and hope',
    'hvernig-truin-styrkist':
        'a lone windswept tree on a dark barren moor under dramatic storm light, bending but rooted, a break of light in the clouds',
    'rettlaeti-mitt-er-a-himnum':
        'broken rusted iron chains lying open on cold stone ground, a shaft of heavenly light falling from above, freedom',
};

const OUT_DIR = path.join(process.cwd(), 'public/images/articles');

async function generate(slug) {
    const concept = PROMPTS[slug];
    if (!concept) {
        console.error(`✗ ${slug}: no prompt defined`);
        return false;
    }
    const prompt = `${concept}. ${STYLE}.`;
    const res = await fetch('https://fal.run/fal-ai/flux/dev', {
        method: 'POST',
        headers: { Authorization: `Key ${falKey()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt,
            image_size: { width: 1280, height: 800 },
            num_inference_steps: 30,
            guidance_scale: 3.5,
            num_images: 1,
            enable_safety_checker: true,
        }),
    });
    if (!res.ok) {
        console.error(`✗ ${slug}: FAL ${res.status} ${(await res.text()).slice(0, 200)}`);
        return false;
    }
    const json = await res.json();
    const url = json?.images?.[0]?.url;
    if (!url) {
        console.error(`✗ ${slug}: no image url in response`);
        return false;
    }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
    const dest = path.join(OUT_DIR, `${slug}.jpg`);
    await sharp(buf).resize(1280, 800, { fit: 'cover' }).jpeg({ quality: 82 }).toFile(dest);
    console.log(`✓ ${slug} → public/images/articles/${slug}.jpg`);
    return true;
}

const slugs = process.argv.slice(2);
const targets = slugs.length ? slugs : Object.keys(PROMPTS);
let ok = 0;
for (const slug of targets) {
    // Sequential on purpose — small batch, no runaway loops.
    if (await generate(slug)) ok++;
}
console.log(`\nDone: ${ok}/${targets.length} generated.`);
