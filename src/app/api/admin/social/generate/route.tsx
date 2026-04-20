import { NextResponse, type NextRequest } from 'next/server';
import { renderToPng } from '@/lib/social/render';
import { RitningInVikunnar } from '@/lib/social/templates/ritningin-vikunnar';
import type { SocialFormat } from '@/lib/social/types';

/**
 * GET /api/admin/social/generate
 *
 * Renders a social post template to PNG.
 *
 * Query params:
 *   template — template ID (e.g. "ritningin-vikunnar")
 *   format   — 'square' | 'story' | 'landscape'
 *   scheme   — 'primary' (Kerti on Night) | 'cream' (Night on Vellum)
 *
 *   Template-specific params:
 *     text     — verse text (Icelandic)
 *     citation — display citation (e.g., "MATTEUS 5:3")
 *
 * Returns: image/png binary.
 *
 * Phase 1 usage: admin page embeds this as an <img src="...">, and
 * also offers a download link that hits the same URL.
 *
 * Not admin-gated yet — will add session check when we know the
 * access story for the social admin page. For now this is local-only
 * (dev on :3010, not deployed to production).
 *
 * Node runtime required — Satori + resvg use filesystem APIs.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;

    const template = sp.get('template') ?? 'ritningin-vikunnar';
    const format = (sp.get('format') ?? 'square') as SocialFormat;
    const scheme = (sp.get('scheme') ?? 'primary') as 'primary' | 'cream';

    if (!['square', 'story', 'landscape'].includes(format)) {
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    try {
        let png: Buffer;

        switch (template) {
            case 'ritningin-vikunnar': {
                const text = sp.get('text') ??
                    'Sælir eru fátækir í anda, því þeirra er himnaríki.';
                const citation = sp.get('citation') ?? 'MATT. 5:3';

                png = await renderToPng(
                    <RitningInVikunnar
                        text={text}
                        citation={citation}
                        scheme={scheme}
                        format={format}
                    />,
                    { format },
                );
                break;
            }
            default:
                return NextResponse.json(
                    { error: `Unknown template: ${template}` },
                    { status: 400 },
                );
        }

        const filename = `omega-${template}-${format}-${scheme}.png`;

        return new NextResponse(new Uint8Array(png), {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `inline; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        console.error('[social/generate] render failed:', err);
        return NextResponse.json(
            { error: (err as Error).message ?? 'Render failed' },
            { status: 500 },
        );
    }
}
