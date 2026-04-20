/* eslint-disable @next/next/no-img-element */
/**
 * src/lib/social/templates/ritningin-vikunnar.tsx
 *
 * "Ritningin vikunnar" (Passage of the Week).
 *
 * Typography-led Bible passage card. Pure type, Altingi palette, no
 * stock imagery, no gradients, no chrome. The verse is the hero.
 *
 * Three format variations:
 *   - square    (1080×1080) — Instagram feed, Facebook feed
 *   - story     (1080×1920) — Instagram Story, Facebook Story
 *   - landscape (1200×628)  — Facebook feed wide, shareable link preview
 *
 * Composition rules:
 *   - Kicker at top: "RITNINGIN VIKUNNAR" (Inter SemiBold caps, 0.22em tracking)
 *   - Center: verse text in Source Serif 4, generous line-height
 *   - Bottom: Gull-colored · divider, then citation (e.g., "MATTEUS 5:3")
 *   - Corner watermark: tiny "Ω" in muted Kerti (keeps brand presence without competing)
 */

import React from 'react';
import { ALTINGI, type SocialFormat } from '../types';

export interface RitningInput {
    /**
     * The passage text in Icelandic. Can be a single verse or a short
     * multi-verse block. Longer passages may need truncation; keep
     * verse blocks under ~220 characters for legibility at social sizes.
     */
    text: string;
    /**
     * Display citation in Icelandic uppercase — e.g. "MATTEUS 5:3"
     * or "SÁLMUR 23:1". Used at the bottom of the card.
     */
    citation: string;
    /**
     * Optional color scheme. Default primary is Kerti on Night.
     */
    scheme?: 'primary' | 'cream';
}

interface TemplateProps extends RitningInput {
    format: SocialFormat;
}

// ═══════════════════════════════════════════════════════════════════
// Format-specific sizing
// ═══════════════════════════════════════════════════════════════════

function sizesFor(format: SocialFormat) {
    switch (format) {
        case 'square':
            return {
                padTop: 120, padBottom: 120, padX: 96,
                kickerFont: 22,
                verseFont: 68,
                verseLineHeight: 1.22,
                citationFont: 22,
                markFont: 80,
            };
        case 'story':
            return {
                padTop: 240, padBottom: 240, padX: 100,
                kickerFont: 26,
                verseFont: 76,
                verseLineHeight: 1.22,
                citationFont: 26,
                markFont: 110,
            };
        case 'landscape':
            return {
                padTop: 72, padBottom: 72, padX: 120,
                kickerFont: 20,
                verseFont: 54,
                verseLineHeight: 1.2,
                citationFont: 20,
                markFont: 60,
            };
    }
}

// ═══════════════════════════════════════════════════════════════════
// The template — returns a JSX element Satori can render
// ═══════════════════════════════════════════════════════════════════

export function RitningInVikunnar(props: TemplateProps) {
    const { text, citation, scheme = 'primary', format } = props;
    const s = sizesFor(format);

    // Color assignments
    const bg   = scheme === 'primary' ? ALTINGI.nott   : ALTINGI.skra;
    const fg   = scheme === 'primary' ? ALTINGI.kerti  : ALTINGI.nott;
    const dim  = scheme === 'primary' ? ALTINGI.moskva : ALTINGI.steinn;
    const accent = ALTINGI.gull; // Same on both schemes — warm amber

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: bg,
                color: fg,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: `${s.padTop}px ${s.padX}px ${s.padBottom}px`,
                position: 'relative',
                fontFamily: 'Source Serif 4',
            }}
        >
            {/* Top — kicker */}
            <div
                style={{
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    fontSize: s.kickerFont,
                    color: dim,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    display: 'flex',
                }}
            >
                Ritningin vikunnar
            </div>

            {/* Middle — the verse. flex:1 so it takes remaining space */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: `${Math.round(s.verseFont * 0.6)}px 0`,
                }}
            >
                <div
                    style={{
                        fontFamily: 'Source Serif 4',
                        fontWeight: 400,
                        fontSize: s.verseFont,
                        lineHeight: s.verseLineHeight,
                        letterSpacing: '-0.01em',
                        color: fg,
                        display: 'flex',
                        textAlign: 'center',
                        maxWidth: '100%',
                    }}
                >
                    {text}
                </div>
            </div>

            {/* Bottom — gold divider + citation */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 18,
                }}
            >
                {/* Small gold dot divider (·) */}
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: 6,
                        background: accent,
                    }}
                />
                <div
                    style={{
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontSize: s.citationFont,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: fg,
                        display: 'flex',
                    }}
                >
                    {citation}
                </div>
            </div>

            {/* Corner watermark — tiny Ω in the top-right, in muted color */}
            <div
                style={{
                    position: 'absolute',
                    top: s.padTop,
                    right: s.padX,
                    fontFamily: 'Source Serif 4',
                    fontWeight: 700,
                    fontSize: s.markFont,
                    color: dim,
                    opacity: 0.4,
                    lineHeight: 1,
                    display: 'flex',
                }}
            >
                Ω
            </div>
        </div>
    );
}
