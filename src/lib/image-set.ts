import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

/**
 * Omega Image System — ONE recipe for every poster/thumbnail on the site.
 *
 * Takes a single source frame and produces a cohesive set of aspect variants
 * (16:9, 4:5, 2:3). Every variant gets the SAME treatment so the whole site
 * looks like one platform:
 *   - natural-colour grade (NO sepia tint)
 *   - burned-subtitle / promo lower-third trimmed off the bottom
 *   - SUBJECT-AWARE crop per aspect (sharp `attention`) so faces are never cut
 *   - a subtle edge vignette for cinematic depth/cohesion
 *   - NO baked text and NO watermark — the UI renders titles; clean like Netflix/Apple
 *
 * Quality scales with the SOURCE: feed a full-res (1920×1080) eyes-up frame.
 */

export type ImageAspect = 'landscape_16x9' | 'portrait_4x5' | 'portrait_2x3';

export interface ImageSetOptions {
    /** Fraction trimmed off the bottom before cropping — removes burned subtitles
     *  and promo/phone lower-thirds on translated broadcasts. 0–0.4. Default 0. */
    trimBottomPct?: number;
    /** Override which aspects to render. Default: all three. */
    aspects?: ImageAspect[];
    /**
     * How to crop to each aspect:
     *  - 'attention' (default): keep the most salient region — best for CLOSE-UPS
     *    so faces are never cut.
     *  - 'centre': preserve the centred composition — best for WIDE establishing
     *    shots / landscapes where 'attention' would zoom into a tiny face.
     */
    cropMode?: 'attention' | 'centre';
}

const DIMS: Record<ImageAspect, { w: number; h: number }> = {
    landscape_16x9: { w: 1280, h: 720 },
    portrait_4x5: { w: 1000, h: 1250 },
    portrait_2x3: { w: 1000, h: 1500 },
};

/** Subtle radial + bottom vignette, sized to the variant. No fonts needed. */
function vignette(w: number, h: number): Buffer {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="v" cx="50%" cy="42%" r="78%">
      <stop offset="60%" stop-color="#14120F" stop-opacity="0"/>
      <stop offset="100%" stop-color="#14120F" stop-opacity="0.34"/>
    </radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="68%" stop-color="#14120F" stop-opacity="0"/>
      <stop offset="100%" stop-color="#14120F" stop-opacity="0.40"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
  <rect width="${w}" height="${h}" fill="url(#b)"/>
</svg>`;
    return new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
}

/**
 * Build the cohesive variant set from one source frame.
 * Returns a map of aspect → PNG buffer.
 */
export async function generateImageSet(
    sourceImage: Buffer,
    opts: ImageSetOptions = {},
): Promise<Record<ImageAspect, Buffer>> {
    const aspects = opts.aspects ?? (['landscape_16x9', 'portrait_4x5', 'portrait_2x3'] as ImageAspect[]);
    const trim = Math.max(0, Math.min(0.4, opts.trimBottomPct ?? 0));

    // 1) Normalise + trim the subtitle/promo band, THEN grade — so the trimmed,
    //    graded image is the single source every aspect is cropped from.
    const base = await sharp(sourceImage).rotate().resize({ width: 1920, withoutEnlargement: true }).toBuffer();
    const meta = await sharp(base).metadata();
    const fullH = meta.height ?? 1080;
    const keepH = Math.max(1, Math.round(fullH * (1 - trim)));
    const graded = await sharp(base)
        .extract({ left: 0, top: 0, width: meta.width ?? 1920, height: keepH })
        .modulate({ saturation: 1.08, brightness: 1.02 })
        .linear(1.06, -(128 * 0.06))
        .toBuffer();

    const position = opts.cropMode === 'centre' ? sharp.gravity.centre : sharp.strategy.attention;
    const out = {} as Record<ImageAspect, Buffer>;
    for (const aspect of aspects) {
        const { w, h } = DIMS[aspect];
        // Subject-aware crop (attention) for close-ups; centred for wide shots.
        const cropped = await sharp(graded)
            .resize(w, h, { fit: 'cover', position })
            .toBuffer();
        out[aspect] = await sharp(cropped)
            .composite([{ input: vignette(w, h), top: 0, left: 0 }])
            .jpeg({ quality: 86, mozjpeg: true })
            .toBuffer();
    }
    return out;
}
