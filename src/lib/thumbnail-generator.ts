import sharp from 'sharp';
import { fetchBunnyThumbnailBuffer } from './bunny-thumbnail';

/**
 * Apple TV-inspired cinematic thumbnail generator.
 *
 * Pipeline:
 * 1. Fetch raw frame from Bunny CDN
 * 2. Resize to target dimensions
 * 3. Color grade: boost saturation, contrast, slight warmth
 * 4. Cinematic vignette: darken edges
 * 5. Bottom gradient: dark-to-transparent for text
 * 6. SVG text overlay: series + episode title
 */

type ThumbnailFormat = 'landscape' | 'portrait' | 'portrait_4x5';

interface ThumbnailOptions {
    /** Required unless `sourceImage` is supplied. */
    bunnyVideoId?: string;
    /**
     * A pre-selected source frame (Poster Machine: the reviewer-chosen
     * candidate). When given, the Bunny fetch is skipped entirely and
     * this buffer is graded instead — same clean-crop + brand treatment.
     */
    sourceImage?: Buffer;
    seriesName?: string;
    episodeTitle?: string;
    format?: ThumbnailFormat;
    /**
     * Finished Azotus VOD files often have burned subtitles in the bottom
     * band, and imported teaching programs can use right-side scripture
     * slides. This crop favors the live teaching frame and removes the
     * subtitle band before any Apple TV treatment is applied.
     */
    cleanVodCrop?: boolean;
}

// Target dimensions
const DIMENSIONS: Record<ThumbnailFormat, { width: number; height: number }> = {
    landscape: { width: 1280, height: 720 },     // 16:9 — watch pages, wide cards
    portrait: { width: 720, height: 1080 },       // 2:3 — legacy series art
    portrait_4x5: { width: 1080, height: 1350 },  // 4:5 — VOD/program cards
};

// ─── Fetch raw frame from Bunny ───

async function fetchBunnyThumbnail(videoId: string): Promise<Buffer> {
    return (await fetchBunnyThumbnailBuffer(videoId)).buffer;
}

// ─── Create vignette overlay (darkened edges) ───

function createVignetteOverlay(width: number, height: number): Buffer {
    // Radial gradient via SVG — dark at edges, transparent at center
    const svg = `
    <svg width="${width}" height="${height}">
        <defs>
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stop-color="black" stop-opacity="0" />
                <stop offset="70%" stop-color="black" stop-opacity="0.15" />
                <stop offset="100%" stop-color="black" stop-opacity="0.55" />
            </radialGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#vignette)" />
    </svg>`;

    return Buffer.from(svg);
}

// ─── Create bottom gradient overlay ───

function createBottomGradient(width: number, height: number): Buffer {
    const gradientHeight = Math.round(height * 0.55);
    const svg = `
    <svg width="${width}" height="${height}">
        <defs>
            <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="black" stop-opacity="0" />
                <stop offset="40%" stop-color="black" stop-opacity="0.3" />
                <stop offset="100%" stop-color="black" stop-opacity="0.85" />
            </linearGradient>
        </defs>
        <rect y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#bottom)" />
    </svg>`;

    return Buffer.from(svg);
}

// ─── Create text overlay SVG ───

function createTextOverlay(
    width: number,
    height: number,
    seriesName?: string,
    episodeTitle?: string
): Buffer {
    const padding = Math.round(width * 0.05);
    const bottomY = height - padding;

    // Escape XML entities
    const escapeXml = (str: string) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // Font sizes scale with dimensions
    const seriesFontSize = Math.round(width * 0.018);      // ~23px at 1280w
    const titleFontSize = Math.round(width * 0.032);       // ~41px at 1280w
    const maxTitleWidth = width - (padding * 2);

    let textElements = '';

    if (seriesName) {
        const seriesY = episodeTitle ? bottomY - titleFontSize - 16 : bottomY - 8;
        textElements += `
            <text
                x="${padding}"
                y="${seriesY}"
                font-family="Inter, -apple-system, sans-serif"
                font-size="${seriesFontSize}"
                font-weight="700"
                fill="#5b8abf"
                letter-spacing="0.2em"
                text-transform="uppercase"
                opacity="0.9"
            >${escapeXml(seriesName.toUpperCase())}</text>`;
    }

    if (episodeTitle) {
        const titleY = bottomY - 8;
        // Truncate if too long
        const displayTitle = episodeTitle.length > 60
            ? episodeTitle.substring(0, 57) + '...'
            : episodeTitle;

        textElements += `
            <text
                x="${padding}"
                y="${titleY}"
                font-family="'Libre Baskerville', Georgia, serif"
                font-size="${titleFontSize}"
                font-weight="700"
                fill="white"
            >
                <tspan filter="url(#shadow)">${escapeXml(displayTitle)}</tspan>
            </text>`;
    }

    const svg = `
    <svg width="${width}" height="${height}">
        <defs>
            <filter id="shadow" x="-2%" y="-2%" width="104%" height="104%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="black" flood-opacity="0.5" />
            </filter>
        </defs>
        ${textElements}
    </svg>`;

    return Buffer.from(svg);
}

// ─── Main thumbnail generator ───

export async function generateThumbnail(options: ThumbnailOptions): Promise<Buffer> {
    const format = options.format || 'landscape';
    const { width, height } = DIMENSIONS[format];

    // 1. Get the raw frame — either the reviewer-chosen poster source, or
    //    (legacy / one-frame fallback) the auto Bunny frame.
    let rawFrame: Buffer;
    if (options.sourceImage) {
        rawFrame = options.sourceImage;
    } else if (options.bunnyVideoId) {
        rawFrame = await fetchBunnyThumbnail(options.bunnyVideoId);
    } else {
        throw new Error('generateThumbnail requires bunnyVideoId or sourceImage.');
    }
    const source = sharp(rawFrame);
    const sourceMeta = await source.metadata();
    const sourceWidth = sourceMeta.width ?? width;
    const sourceHeight = sourceMeta.height ?? height;
    const sourceCrop = options.cleanVodCrop !== false
        ? getCleanVodCrop(sourceWidth, sourceHeight)
        : null;

    // 2. Resize and color grade
    let pipeline = source
        .rotate()
        .extract(sourceCrop ?? {
            left: 0,
            top: 0,
            width: sourceWidth,
            height: sourceHeight,
        })
        .resize(width, height, { fit: 'cover', position: 'centre' })
        // Color grading: boost saturation, slight contrast, warmth
        .modulate({
            saturation: 1.2,        // +20% saturation
            brightness: 1.05,       // slight brightness boost
        })
        .linear(1.1, -(128 * 0.1))
        .gamma(1.05);

    // 3. Composite overlays. The bottom gradient exists only to keep baked text
    //    legible — for clean, Apple-TV-style stills (no baked text) we skip it
    //    and keep just a soft vignette, so the still reads as key art rather
    //    than a darkened caption plate.
    const hasText = Boolean(options.seriesName || options.episodeTitle);
    const composites: sharp.OverlayOptions[] = [
        { input: createVignetteOverlay(width, height), top: 0, left: 0 },
    ];

    // 4. Baked text (only when explicitly requested — e.g. the manual thumbnail
    //    tool). The key-art pipeline omits it; the UI renders titles itself.
    if (hasText) {
        composites.push({ input: createBottomGradient(width, height), top: 0, left: 0 });
        composites.push({
            input: createTextOverlay(width, height, options.seriesName, options.episodeTitle),
            top: 0,
            left: 0,
        });
    }

    // 5. Apply composites and output
    const result = await pipeline
        .composite(composites)
        .png({ quality: 90, compressionLevel: 6 })
        .toBuffer();

    return result;
}

function getCleanVodCrop(
    sourceWidth: number,
    sourceHeight: number,
): sharp.Region {
    // Trim the burned-in subtitle band off the bottom (and a sliver off the
    // top), keeping FULL WIDTH. The later resize(cover, centre) then crops to
    // the target aspect CENTERED on the subject — talking-head framing — instead
    // of slicing the left edge, which cut off any center-right subject.
    const top = Math.max(0, Math.floor(sourceHeight * 0.02));
    const bottomBand = Math.floor(sourceHeight * 0.20);
    const height = Math.max(1, sourceHeight - top - bottomBand);
    return { left: 0, top, width: sourceWidth, height };
}

/**
 * Generate both landscape and portrait thumbnails.
 */
export async function generateThumbnailSet(options: Omit<ThumbnailOptions, 'format'>): Promise<{
    landscape: Buffer;
    portrait: Buffer;
}> {
    const [landscape, portrait] = await Promise.all([
        generateThumbnail({ ...options, format: 'landscape' }),
        generateThumbnail({ ...options, format: 'portrait' }),
    ]);

    return { landscape, portrait };
}

/**
 * Poster Machine V1 — branded variants from one selected source frame.
 *
 * Fetches the source ONCE (so a Bunny-backed source isn't pulled twice)
 * and grades it into the two V1 aspects the public UI needs:
 *   - landscape_16x9 → watch pages, wide cards, mirrored to thumbnail_custom
 *   - portrait_4x5    → VOD/program cards
 *
 * `square_1x1` / `wide_21x9` are intentionally NOT generated in V1 — the
 * dispatch says only build the variants the current UI needs.
 */
export async function generatePosterVariants(
    options: Omit<ThumbnailOptions, 'format'>,
): Promise<{ landscape_16x9: Buffer; portrait_4x5: Buffer }> {
    // Resolve the source buffer a single time.
    let sourceImage: Buffer;
    if (options.sourceImage) {
        sourceImage = options.sourceImage;
    } else if (options.bunnyVideoId) {
        sourceImage = await fetchBunnyThumbnail(options.bunnyVideoId);
    } else {
        throw new Error('generatePosterVariants requires bunnyVideoId or sourceImage.');
    }

    const base: ThumbnailOptions = { ...options, sourceImage };
    const [landscape_16x9, portrait_4x5] = await Promise.all([
        generateThumbnail({ ...base, format: 'landscape' }),
        generateThumbnail({ ...base, format: 'portrait_4x5' }),
    ]);

    return { landscape_16x9, portrait_4x5 };
}
