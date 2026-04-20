/* eslint-disable @next/next/no-img-element */
/**
 * src/lib/social/templates/ritningin-vikunnar.tsx
 *
 * "Ritningin vikunnar" (Passage of the Week) — v3.
 *
 * Typography-led Bible passage card. Cinematic, Icelandic-first,
 * with the Omega mark anchored as a true brand signature.
 *
 * Design rules this template honors (per docs/brand-guide.md):
 *   - Real typography (Source Serif 4 Vaka weight 300 for the verse)
 *   - Altingi palette only (Kerti on Night, or Night on Vellum)
 *   - Unique-to-Omega signal (the Ω mark presence + palette +
 *     Icelandic citation format)
 *   - Flat color only, no gradients, no chrome
 *
 * Changes from v1 → v2:
 *   - Verse bumped to Vaka weight 300 at larger size (hero treatment)
 *   - Tiny dot divider replaced with Gull-gold horizontal rule
 *   - Omega mark anchored at bottom-center as brand signature
 *   - Default citation format uses Icelandic abbreviation (MATT.)
 *
 * Three format variations:
 *   - square    (1080×1080) — Instagram feed, Facebook feed
 *   - story     (1080×1920) — Instagram Story, Facebook Story
 *   - landscape (1200×628)  — Facebook feed wide, link preview
 */

import React from 'react';
import { ALTINGI, type SocialFormat } from '../types';

export interface RitningInput {
    /** Verse text in Icelandic. Keep under ~220 chars for legibility. */
    text: string;
    /** Display citation — e.g. "MATT. 5:3" or "SÁLM. 23:1" (Icelandic abbreviation). */
    citation: string;
    /** Color scheme. Primary = Kerti on Night. Cream = Night on Vellum. */
    scheme?: 'primary' | 'cream';
}

interface TemplateProps extends RitningInput {
    format: SocialFormat;
}

// ═══════════════════════════════════════════════════════════════════
// Format-specific sizing — tuned so verse reads as HERO
// ═══════════════════════════════════════════════════════════════════

function sizesFor(format: SocialFormat) {
    switch (format) {
        case 'square':
            return {
                padTop: 110, padBottom: 110, padX: 96,
                kickerFont: 24,
                verseFont: 76,               // Large but fits 2-line clean break
                verseLineHeight: 1.22,
                ruleWidth: 72,
                ruleHeight: 2,
                ruleGap: 26,
                citationFont: 22,
                wordmarkFont: 20,            // Smaller — reads as signature, not competing
                wordmarkGap: 56,             // More air between citation and signature
            };
        case 'story':
            // Story is 9:16 phone-full-screen. Same 1080 width as square,
            // so verse size must match square's 76pt to keep the clean
            // 2-line "Sælir eru fátækir í anda, / því þeirra er himnaríki."
            // break. Viewer is close on phone anyway — smaller text reads fine.
            return {
                padTop: 200, padBottom: 200, padX: 110,
                kickerFont: 26,
                verseFont: 76,
                verseLineHeight: 1.22,
                ruleWidth: 80,
                ruleHeight: 2,
                ruleGap: 28,
                citationFont: 22,
                wordmarkFont: 20,
                wordmarkGap: 56,
            };
        case 'landscape':
            return {
                padTop: 56, padBottom: 56, padX: 120,
                kickerFont: 20,
                verseFont: 56,
                verseLineHeight: 1.22,
                ruleWidth: 60,
                ruleHeight: 2,
                ruleGap: 20,
                citationFont: 18,
                wordmarkFont: 16,
                wordmarkGap: 36,
            };
    }
}

// ═══════════════════════════════════════════════════════════════════
// Template
// ═══════════════════════════════════════════════════════════════════

export function RitningInVikunnar(props: TemplateProps) {
    const { text, citation, scheme = 'primary', format } = props;
    const s = sizesFor(format);

    const bg     = scheme === 'primary' ? ALTINGI.nott   : ALTINGI.skra;
    const fg     = scheme === 'primary' ? ALTINGI.kerti  : ALTINGI.nott;
    const dim    = scheme === 'primary' ? ALTINGI.moskva : ALTINGI.steinn;
    const accent = ALTINGI.gull;

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

            {/* Middle — verse at Vaka weight, hero-sized */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: `${Math.round(s.verseFont * 0.4)}px 0`,
                }}
            >
                <div
                    style={{
                        fontFamily: 'Source Serif 4',
                        fontWeight: 300,                 // Vaka weight
                        fontSize: s.verseFont,
                        lineHeight: s.verseLineHeight,
                        letterSpacing: '-0.018em',       // Tighter at display size
                        color: fg,
                        display: 'flex',
                        textAlign: 'center',
                        maxWidth: '100%',
                    }}
                >
                    {text}
                </div>
            </div>

            {/* Bottom — horizontal rule + citation + mark, stacked center */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: s.ruleGap,
                }}
            >
                {/* Gull horizontal rule — replaces tiny dot, actually reads as intentional */}
                <div
                    style={{
                        width: s.ruleWidth,
                        height: s.ruleHeight,
                        background: accent,
                    }}
                />

                {/* Citation */}
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

                {/* Brand signature — OMEGA wordmark (all-Latin letters
                    so always renders reliably). Source Serif 4 Bold caps,
                    small size, generous letter-spacing for institutional
                    feel. Pairs with the palette + kicker + citation to
                    make the Omega brand unmistakable. */}
                <div
                    style={{
                        fontFamily: 'Source Serif 4',
                        fontWeight: 700,
                        fontSize: s.wordmarkFont,
                        color: dim,                    // Muted — signature, not headline
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        marginTop: s.wordmarkGap - s.ruleGap,
                        display: 'flex',
                    }}
                >
                    Omega
                </div>
            </div>
        </div>
    );
}
