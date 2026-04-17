import sharp from 'sharp';

const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

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

interface ThumbnailOptions {
    bunnyVideoId: string;
    seriesName?: string;
    episodeTitle?: string;
    format?: 'landscape' | 'portrait';
}

// Target dimensions
const DIMENSIONS = {
    landscape: { width: 1280, height: 720 },   // 16:9
    portrait: { width: 720, height: 1080 },     // 2:3
};

// ─── Fetch raw frame from Bunny ───

async function fetchBunnyThumbnail(videoId: string): Promise<Buffer> {
    const url = `https://iframe.mediadelivery.net/thumbnail/${LIBRARY_ID}/${videoId}/thumbnail.jpg`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch Bunny thumbnail: ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
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

    // 1. Fetch raw frame
    const rawFrame = await fetchBunnyThumbnail(options.bunnyVideoId);

    // 2. Resize and color grade
    let pipeline = sharp(rawFrame)
        .resize(width, height, { fit: 'cover', position: 'centre' })
        // Color grading: boost saturation, slight contrast, warmth
        .modulate({
            saturation: 1.2,        // +20% saturation
            brightness: 1.05,       // slight brightness boost
        })
        .linear(1.1, -(128 * 0.1)) // Contrast boost ~10%
        .gamma(0.95);               // Slight warmth

    // 3. Composite overlays
    const composites: sharp.OverlayOptions[] = [
        // Vignette
        { input: createVignetteOverlay(width, height), top: 0, left: 0 },
        // Bottom gradient
        { input: createBottomGradient(width, height), top: 0, left: 0 },
    ];

    // 4. Text overlay (if series/title provided)
    if (options.seriesName || options.episodeTitle) {
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
