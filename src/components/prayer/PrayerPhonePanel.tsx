import type { MinistrySettings } from '@/lib/ministry-shared';
import { formatPhoneIs, telHref } from '@/lib/ministry-shared';

/**
 * The phone door, directly under the cover.
 *
 * Three doors lead into the same basket (docs/plans/09-prayer-ministry.md) and
 * this is the one the anchor audience uses. So it sits ABOVE everything the
 * wall does with a keyboard: a number large enough to read across a room, a
 * tel: link for the phone in their hand, and the hours so nobody rings into
 * silence.
 *
 * Two states, one component:
 *   - live_now  — a warm kerti banner: a program is on the air, ring now.
 *   - standing  — a quiet pergament panel: the number and when it is answered.
 *
 * Renders NOTHING without a number. An empty panel would be worse than no
 * panel: it would promise a door that isn't there.
 *
 * Server component on purpose — this is static text and an anchor, and it must
 * be in the first paint for someone who arrived from the broadcast.
 */

interface Props {
    settings: MinistrySettings;
}

export default function PrayerPhonePanel({ settings }: Props) {
    const phone = settings.prayerPhone.trim();
    if (!phone) return null;

    const pretty = formatPhoneIs(phone);
    const href = telHref(phone);
    const hours = settings.phoneHours.trim();
    const note = settings.scheduleNote.trim();
    const live = settings.liveNow;

    return (
        <section
            className="prayer-phone-panel"
            style={{
                marginTop: '28px',
                padding: 'clamp(24px, 3.5vw, 36px) clamp(22px, 3.5vw, 40px)',
                background: live
                    ? 'color-mix(in oklab, var(--kerti) 14%, var(--skra))'
                    : 'rgba(212,194,162,0.22)',
                border: `1px solid ${live ? 'var(--gull)' : 'rgba(63,47,35,0.14)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: 'clamp(18px, 3vw, 40px)',
                alignItems: 'center',
            }}
        >
            <div>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: live ? 'var(--skra-djup)' : 'var(--skra-mjuk)',
                        marginBottom: '12px',
                    }}
                >
                    {live && (
                        <span
                            aria-hidden
                            className="live-dot"
                            style={{
                                width: '9px',
                                height: '9px',
                                borderRadius: '999px',
                                background: 'var(--blod)',
                                display: 'inline-block',
                            }}
                        />
                    )}
                    {live ? 'Bænastund í beinni' : 'Bænasíminn'}
                </div>

                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(22px, 2.4vw, 30px)',
                        lineHeight: 1.3,
                        color: 'var(--skra-djup)',
                        letterSpacing: '-0.005em',
                        textWrap: 'pretty',
                        maxWidth: '30rem',
                    }}
                >
                    {live
                        ? 'Við biðjum með þér núna. Hringdu.'
                        : 'Viltu heldur hringja?'}
                </p>

                <p
                    style={{
                        margin: '14px 0 0',
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(16px, 1.4vw, 18px)',
                        lineHeight: 1.55,
                        color: 'var(--skra-mjuk)',
                        maxWidth: '34rem',
                        textWrap: 'pretty',
                    }}
                >
                    {hours && <>Síminn er opinn {hours}. </>}
                    Bænin þín má berast í útsendingu ef þú leyfir. Við spyrjum þig að því
                    í símanum.
                </p>

                {note && (
                    <p
                        style={{
                            margin: '10px 0 0',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            lineHeight: 1.55,
                            color: 'var(--skra-mjuk)',
                            maxWidth: '34rem',
                        }}
                    >
                        {note}
                    </p>
                )}
            </div>

            <a
                href={href}
                className="prayer-phone-cta"
                style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '18px 28px',
                    minHeight: '44px',
                    background: live ? 'var(--kerti)' : 'transparent',
                    border: `1px solid ${live ? 'var(--kerti)' : 'var(--gull)'}`,
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: live ? 'var(--nott)' : 'var(--skra-mjuk)',
                    }}
                >
                    Hringdu
                </span>
                <span
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(28px, 3.4vw, 40px)',
                        lineHeight: 1.05,
                        color: live ? 'var(--nott)' : 'var(--skra-djup)',
                        fontFeatureSettings: '"lnum", "tnum"',
                    }}
                >
                    {pretty}
                </span>
            </a>

            <style>{`
                @media (max-width: 720px) {
                    .prayer-phone-panel {
                        grid-template-columns: minmax(0, 1fr) !important;
                    }
                    .prayer-phone-cta {
                        width: 100%;
                    }
                }
            `}</style>
        </section>
    );
}
