/* eslint-disable @next/next/no-img-element */
/**
 * src/lib/social/templates/a-morgun.tsx
 *
 * "Á morgun / Í kvöld / Í dag — Broadcast Card".
 *
 * A post announcing an upcoming or live Omega broadcast. Pulls data
 * from schedule_slots + programs (the XML-enrichment pipeline we shipped
 * yesterday). This is the template that cannot be faked — no other
 * Christian publisher has Omega's schedule, so only Omega can post this.
 *
 * Composition (ranked by hierarchy):
 *   - Top kicker: temporal marker (Á MORGUN) + date + time (Inter caps)
 *   - Hero: program title (Source Serif 4 Vaka weight 300)
 *   - Secondary: host name (Libre Baskerville italic — "voice" styling)
 *   - Gull horizontal rule — divider
 *   - Description: one-sentence hook (Source Serif 4 regular)
 *   - Brand signature: OMEGA wordmark (Source Serif 4 Bold caps, dim)
 *
 * Three format variations: square (feed), story (9:16), landscape (link preview).
 */

import React from 'react';
import { ALTINGI, type SocialFormat } from '../types';
import { type TypefaceFamily, TYPEFACES } from '../typeface';

export interface BroadcastInput {
    /**
     * Temporal prefix — "Á MORGUN", "Í KVÖLD", "Í DAG", etc.
     * Pre-computed via iclPrefix() or set manually.
     */
    prefix: string;
    /**
     * Pre-formatted Icelandic date/time — "SUNNUDAGUR 20. APRÍL · KL. 20:00"
     * Pre-computed via formatIcelandicBroadcastTime().
     */
    when: string;
    /** Program title — e.g., "Sunnudagssamkoma" */
    programTitle: string;
    /** Host/speaker name (optional, omitted cleanly if empty) */
    hostName?: string;
    /** One-sentence hook from programs.description */
    description: string;
    /** Color scheme */
    scheme?: 'primary' | 'cream';
    /** Typeface family. Defaults to classic. */
    typeface?: TypefaceFamily;
}

interface TemplateProps extends BroadcastInput {
    format: SocialFormat;
}

// ═══════════════════════════════════════════════════════════════════
// Sizing per format
// ═══════════════════════════════════════════════════════════════════

function sizesFor(format: SocialFormat) {
    switch (format) {
        case 'square':
            return {
                padTop: 110, padBottom: 110, padX: 96,
                kickerPrefixFont: 32,    // "Á MORGUN" prominent
                kickerDateFont: 18,      // date/time supporting
                titleFont: 84,           // Hero program name
                titleLineHeight: 1.05,
                hostFont: 30,            // Host italic
                ruleWidth: 72,
                ruleHeight: 2,
                descFont: 26,
                descLineHeight: 1.45,
                wordmarkFont: 20,
                gapTop: 28,              // between prefix and date
                gapMid: 24,              // between title and host
                gapPreRule: 36,
                gapPostRule: 32,
                gapPreWordmark: 56,
            };
        case 'story':
            // Story is 1080 wide same as square — so title font must be
            // sized similarly to avoid overflow. Slightly smaller than
            // square (76 vs 84) because story padding is wider (110 vs 96).
            return {
                padTop: 180, padBottom: 180, padX: 100,
                kickerPrefixFont: 36,
                kickerDateFont: 20,
                titleFont: 80,
                titleLineHeight: 1.08,
                hostFont: 32,
                ruleWidth: 80,
                ruleHeight: 2,
                descFont: 28,
                descLineHeight: 1.42,
                wordmarkFont: 20,
                gapTop: 28,
                gapMid: 24,
                gapPreRule: 36,
                gapPostRule: 32,
                gapPreWordmark: 56,
            };
        case 'landscape':
            return {
                padTop: 56, padBottom: 56, padX: 80,
                kickerPrefixFont: 22,
                kickerDateFont: 14,
                titleFont: 62,
                titleLineHeight: 1.05,
                hostFont: 22,
                ruleWidth: 56,
                ruleHeight: 2,
                descFont: 18,
                descLineHeight: 1.4,
                wordmarkFont: 16,
                gapTop: 16,
                gapMid: 16,
                gapPreRule: 24,
                gapPostRule: 20,
                gapPreWordmark: 32,
            };
    }
}

// ═══════════════════════════════════════════════════════════════════
// Template
// ═══════════════════════════════════════════════════════════════════

export function AMorgunCard(props: TemplateProps) {
    const { prefix, when, programTitle, hostName, description, scheme = 'primary', format, typeface = TYPEFACES.fraunces } = props;
    const s = sizesFor(format);

    const bg     = scheme === 'primary' ? ALTINGI.nott   : ALTINGI.skra;
    const fg     = scheme === 'primary' ? ALTINGI.kerti  : ALTINGI.nott;
    const dim    = scheme === 'primary' ? ALTINGI.moskva : ALTINGI.steinn;
    const muted  = scheme === 'primary' ? ALTINGI.ljos   : ALTINGI.mold;
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
                fontFamily: typeface.display,
            }}
        >
            {/* Top cluster: prefix + date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: s.gapTop - 12 }}>
                <div
                    style={{
                        fontFamily: typeface.ui,
                        fontWeight: 600,
                        fontSize: s.kickerPrefixFont,
                        color: accent,                // Gull for the temporal marker — this is THE hook
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        display: 'flex',
                    }}
                >
                    {prefix}
                </div>
                <div
                    style={{
                        fontFamily: typeface.ui,
                        fontWeight: 500,
                        fontSize: s.kickerDateFont,
                        color: dim,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        display: 'flex',
                    }}
                >
                    {when}
                </div>
            </div>

            {/* Middle: program title + host */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: `${Math.round(s.titleFont * 0.3)}px 0`,
                    gap: s.gapMid,
                }}
            >
                <div
                    style={{
                        fontFamily: typeface.display,
                        fontWeight: 300,                    // Vaka weight — hero Scripture-level
                        fontSize: s.titleFont,
                        lineHeight: s.titleLineHeight,
                        letterSpacing: '-0.02em',
                        color: fg,
                        display: 'flex',
                        maxWidth: '100%',
                    }}
                >
                    {programTitle}
                </div>
                {hostName && (
                    <div
                        style={{
                            fontFamily: typeface.body,
                            fontStyle: 'italic',              // Italic = voice attribution
                            fontWeight: 400,
                            fontSize: s.hostFont,
                            color: muted,
                            display: 'flex',
                        }}
                    >
                        með {hostName}
                    </div>
                )}
            </div>

            {/* Bottom: rule + description + wordmark */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div
                    style={{
                        width: s.ruleWidth,
                        height: s.ruleHeight,
                        background: accent,
                        marginBottom: s.gapPostRule,
                    }}
                />
                <div
                    style={{
                        fontFamily: typeface.display,
                        fontWeight: 400,
                        fontSize: s.descFont,
                        lineHeight: s.descLineHeight,
                        letterSpacing: '-0.005em',
                        color: fg,
                        display: 'flex',
                        maxWidth: '80%',
                    }}
                >
                    {description}
                </div>
                <div
                    style={{
                        fontFamily: typeface.display,
                        fontWeight: 700,
                        fontSize: s.wordmarkFont,
                        color: dim,
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        marginTop: s.gapPreWordmark,
                        display: 'flex',
                    }}
                >
                    Omega
                </div>
            </div>
        </div>
    );
}
