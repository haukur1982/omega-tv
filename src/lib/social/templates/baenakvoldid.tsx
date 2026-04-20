/* eslint-disable @next/next/no-img-element */
/**
 * src/lib/social/templates/baenakvoldid.tsx
 *
 * "Bænakvöldið á miðvikudag" — Prayer Night Invite.
 *
 * The quietest of the four templates. Bænakvöld (prayer evening) is
 * Omega's weekly Wednesday gathering, and this template reflects the
 * brand guide's principle that "prayer is the soul of Omega, not a
 * feature." Where the other templates announce or display, this one
 * INVITES.
 *
 * Design differentiation from the other three templates:
 *   - Center-aligned composition (all others are left-aligned editorial)
 *     This is ceremonial and prayer-like, not magazine-editorial.
 *   - Generous whitespace, sparse typography
 *   - A single Gull dot (like a prayer bead) instead of a horizontal rule
 *   - Kerti amber warmth foregrounded — the invitation itself is Kerti
 *   - Minimal supporting text — short Scripture reference only
 *
 * The three other templates are editorial posters; this one is a
 * candle in a quiet room.
 */

import React from 'react';
import { ALTINGI, type SocialFormat } from '../types';

export interface BaenakvoldidInput {
    /** Kicker label — usually "BÆNAKVÖLDIÐ" but could be "BÆNAKVÖLD" etc. */
    eventLabel: string;
    /** Pre-formatted date/time: e.g., "MIÐVIKUDAG 23. APRÍL · KL. 20:00" */
    eventDate: string;
    /** Hero invitation — one short sentence. Kept under ~50 chars. */
    invitation: string;
    /** Optional Scripture reference anchor (ref only, no verse text). */
    scriptureRef?: string;
    /** Color scheme */
    scheme?: 'primary' | 'cream';
}

interface TemplateProps extends BaenakvoldidInput {
    format: SocialFormat;
}

function sizesFor(format: SocialFormat) {
    switch (format) {
        case 'square':
            return {
                padTop: 120, padBottom: 120, padX: 110,
                kickerFont: 22,
                metaFont: 18,
                invitationFont: 68,           // Hero invitation — Vaka weight, centered
                invitationLineHeight: 1.22,
                dotSize: 6,
                scriptureFont: 16,
                wordmarkFont: 20,
                gapKickerToMeta: 10,
                gapInvitationToDot: 36,
                gapDotToScripture: 28,
                gapScriptureToWordmark: 72,
            };
        case 'story':
            return {
                padTop: 220, padBottom: 220, padX: 120,
                kickerFont: 26,
                metaFont: 22,
                invitationFont: 76,
                invitationLineHeight: 1.22,
                dotSize: 8,
                scriptureFont: 18,
                wordmarkFont: 22,
                gapKickerToMeta: 14,
                gapInvitationToDot: 44,
                gapDotToScripture: 32,
                gapScriptureToWordmark: 80,
            };
        case 'landscape':
            return {
                padTop: 52, padBottom: 52, padX: 100,
                kickerFont: 18,
                metaFont: 14,
                invitationFont: 48,
                invitationLineHeight: 1.22,
                dotSize: 5,
                scriptureFont: 12,
                wordmarkFont: 14,
                gapKickerToMeta: 8,
                gapInvitationToDot: 22,
                gapDotToScripture: 16,
                gapScriptureToWordmark: 44,
            };
    }
}

export function Baenakvoldid(props: TemplateProps) {
    const { eventLabel, eventDate, invitation, scriptureRef, scheme = 'primary', format } = props;
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
                alignItems: 'center',                // Center-align the entire composition
                padding: `${s.padTop}px ${s.padX}px ${s.padBottom}px`,
                fontFamily: 'Source Serif 4',
                textAlign: 'center',
            }}
        >
            {/* Top — kicker + meta */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s.gapKickerToMeta }}>
                <div
                    style={{
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontSize: s.kickerFont,
                        color: dim,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        display: 'flex',
                    }}
                >
                    {eventLabel}
                </div>
                <div
                    style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: s.metaFont,
                        color: dim,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        display: 'flex',
                    }}
                >
                    {eventDate}
                </div>
            </div>

            {/* Middle — the hero invitation, centered */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '48px 0',
                }}
            >
                <div
                    style={{
                        fontFamily: 'Source Serif 4',
                        fontWeight: 300,                // Vaka weight — quiet, ceremonial
                        fontSize: s.invitationFont,
                        lineHeight: s.invitationLineHeight,
                        letterSpacing: '-0.015em',
                        color: fg,
                        display: 'flex',
                        textAlign: 'center',
                        maxWidth: '100%',
                    }}
                >
                    {invitation}
                </div>
            </div>

            {/* Bottom — dot + scripture ref (optional) + wordmark */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Single Gull dot — like a prayer bead. Quieter than a horizontal rule. */}
                <div
                    style={{
                        width: s.dotSize,
                        height: s.dotSize,
                        borderRadius: s.dotSize,
                        background: accent,
                        marginBottom: scriptureRef ? s.gapDotToScripture : Math.round(s.gapDotToScripture / 2),
                    }}
                />
                {scriptureRef && (
                    <div
                        style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: s.scriptureFont,
                            color: dim,
                            letterSpacing: '0.28em',
                            textTransform: 'uppercase',
                            display: 'flex',
                        }}
                    >
                        {scriptureRef}
                    </div>
                )}
                <div
                    style={{
                        fontFamily: 'Source Serif 4',
                        fontWeight: 700,
                        fontSize: s.wordmarkFont,
                        color: dim,
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        marginTop: s.gapScriptureToWordmark,
                        display: 'flex',
                    }}
                >
                    Omega
                </div>
            </div>
        </div>
    );
}
