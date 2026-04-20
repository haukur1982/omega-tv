/**
 * src/lib/social/render.ts
 *
 * Core rendering pipeline:
 *   React element → Satori → SVG string → resvg → PNG buffer
 *
 * Satori renders a subset of React/CSS to SVG. resvg (Rust-based SVG
 * renderer compiled to WASM/native) converts the SVG to a rasterized
 * PNG that's ready to upload to social platforms.
 *
 * Usage:
 *   const png = await renderToPng(<MyTemplate ... />, 'square');
 *   return new Response(png, { headers: { 'Content-Type': 'image/png' } });
 */

import satori, { type SatoriOptions } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SATORI_FONTS } from './fonts';
import { FORMAT_DIMENSIONS, type SocialFormat } from './types';

export interface RenderOptions {
    /** Output format. Determines width/height. */
    format: SocialFormat;
    /** Optional scale factor for PNG. Default 1 — Satori already renders at target size. */
    scale?: number;
}

/**
 * Render a React element to a PNG buffer.
 *
 * Note: the React element must use Satori-compatible JSX — not all
 * CSS properties are supported. See Satori docs for the supported
 * subset. Most flexbox layout works.
 */
export async function renderToPng(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element: any,
    { format, scale = 1 }: RenderOptions,
): Promise<Buffer> {
    const { width, height } = FORMAT_DIMENSIONS[format];

    // Step 1: React element → SVG string
    const svgOptions: SatoriOptions = {
        width,
        height,
        fonts: SATORI_FONTS,
        // Default to Inter so unmarked text uses a sensible fallback.
        // Templates should be explicit about font-family, but this
        // prevents mystery rendering bugs.
    };
    const svg = await satori(element, svgOptions);

    // Step 2: SVG → PNG via resvg
    const resvg = new Resvg(svg, {
        fitTo: scale === 1
            ? { mode: 'original' }
            : { mode: 'width', value: Math.round(width * scale) },
        background: 'transparent',
    });
    const pngData = resvg.render();
    return Buffer.from(pngData.asPng());
}

/**
 * Render just to SVG (useful for debugging or client-side preview
 * without the PNG rasterization step).
 */
export async function renderToSvg(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element: any,
    { format }: Pick<RenderOptions, 'format'>,
): Promise<string> {
    const { width, height } = FORMAT_DIMENSIONS[format];
    return satori(element, {
        width,
        height,
        fonts: SATORI_FONTS,
    });
}
