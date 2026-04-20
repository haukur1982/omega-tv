/* eslint-disable @next/next/no-img-element */
/**
 * src/lib/social/templates/ritstjoraroedd.tsx
 *
 * "Ritstjórarödd" (Editor's Voice) — a pull-quote card that turns
 * every published sermon into a social post automatically.
 *
 * Pulls `editor_note` from the `episodes` table — the 40-80 word
 * curated voice line Hawk writes (or Gemini-assists) for each sermon.
 * This is the template where Omega speaks in its own voice, where
 * the personality shows through.
 *
 * Design — deliberately close to a classical magazine pull-quote:
 *   - Kicker: "RITSTJÓRARÖDD" (Inter caps, muted) — labels what this is
 *   - Hero: the editor note in Libre Baskerville italic
 *     (the brand guide's designated "human voice" treatment)
 *   - Gull horizontal rule — shared divider with other templates
 *   - Attribution: sermon title (caps) + date · Bible ref (caps)
 *   - Omega wordmark signature at the bottom
 *
 * Three format variations: square (feed), story (9:16), landscape.
 */

import React from 'react';
import { ALTINGI, type SocialFormat } from '../types';

export interface RitstjoraroeddInput {
    /** Editor note / voice line — 40-80 words. The hero. */
    editorNote: string;
    /** Sermon title (will be rendered uppercase). */
    sermonTitle: string;
    /** Bible reference — e.g., "MATT. 5:3". Optional. */
    bibleRef?: string;
    /** Pre-formatted date — e.g., "3. APRÍL 2026". Optional. */
    date?: string;
    /** Color scheme. */
    scheme?: 'primary' | 'cream';
}

interface TemplateProps extends RitstjoraroeddInput {
    format: SocialFormat;
}

function sizesFor(format: SocialFormat) {
    switch (format) {
        case 'square':
            return {
                padTop: 100, padBottom: 100, padX: 96,
                kickerFont: 22,
                quoteFont: 42,             // Pull-quote hero (not as big as Ritningin — room for 4-8 lines)
                quoteLineHeight: 1.38,
                ruleWidth: 72,
                ruleHeight: 2,
                gapKickerToQuote: 48,
                gapQuoteToRule: 48,
                gapPostRule: 28,
                attrTitleFont: 22,
                attrMetaFont: 16,
                gapAttrTitleToMeta: 10,
                gapPreWordmark: 44,
                wordmarkFont: 20,
            };
        case 'story':
            return {
                padTop: 180, padBottom: 180, padX: 100,
                kickerFont: 26,
                quoteFont: 48,
                quoteLineHeight: 1.38,
                ruleWidth: 80,
                ruleHeight: 2,
                gapKickerToQuote: 56,
                gapQuoteToRule: 56,
                gapPostRule: 32,
                attrTitleFont: 26,
                attrMetaFont: 18,
                gapAttrTitleToMeta: 12,
                gapPreWordmark: 56,
                wordmarkFont: 22,
            };
        case 'landscape':
            return {
                padTop: 52, padBottom: 52, padX: 100,
                kickerFont: 18,
                quoteFont: 30,
                quoteLineHeight: 1.38,
                ruleWidth: 56,
                ruleHeight: 2,
                gapKickerToQuote: 28,
                gapQuoteToRule: 28,
                gapPostRule: 18,
                attrTitleFont: 18,
                attrMetaFont: 13,
                gapAttrTitleToMeta: 6,
                gapPreWordmark: 28,
                wordmarkFont: 14,
            };
    }
}

export function Ritstjoraroedd(props: TemplateProps) {
    const { editorNote, sermonTitle, bibleRef, date, scheme = 'primary', format } = props;
    const s = sizesFor(format);

    const bg     = scheme === 'primary' ? ALTINGI.nott   : ALTINGI.skra;
    const fg     = scheme === 'primary' ? ALTINGI.kerti  : ALTINGI.nott;
    const dim    = scheme === 'primary' ? ALTINGI.moskva : ALTINGI.steinn;
    const accent = ALTINGI.gull;

    // Build attribution meta line: "3. APRÍL · MATT. 5:3" (either or both, comma-joined)
    const metaParts: string[] = [];
    if (date) metaParts.push(date.toUpperCase());
    if (bibleRef) metaParts.push(bibleRef.toUpperCase());
    const metaLine = metaParts.join(' · ');

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
                Ritstjórarödd
            </div>

            {/* Middle — the pull quote */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: `${s.gapKickerToQuote}px 0 ${s.gapQuoteToRule}px`,
                }}
            >
                <div
                    style={{
                        fontFamily: 'Libre Baskerville',
                        fontStyle: 'italic',            // The brand guide's "human voice" treatment
                        fontWeight: 400,
                        fontSize: s.quoteFont,
                        lineHeight: s.quoteLineHeight,
                        letterSpacing: '-0.005em',
                        color: fg,
                        display: 'flex',
                        maxWidth: '100%',
                    }}
                >
                    {editorNote}
                </div>
            </div>

            {/* Bottom — rule + attribution + wordmark */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontSize: s.attrTitleFont,
                        color: fg,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        display: 'flex',
                    }}
                >
                    {sermonTitle}
                </div>
                {metaLine && (
                    <div
                        style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: s.attrMetaFont,
                            color: dim,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            marginTop: s.gapAttrTitleToMeta,
                            display: 'flex',
                        }}
                    >
                        {metaLine}
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
