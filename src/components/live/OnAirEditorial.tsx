import type { ScheduleSlot } from "@/lib/schedule-db";
import SendaBaenButton from "./SendaBaenButton";

/**
 * OnAirEditorial — two-column editorial strip below the live meta bar.
 *
 * Left:  "Um þessa útsendingu" — Newsreader body from current.description
 *        with graceful italic fallback if empty. Plus a quiet "Senda
 *        bænarefni" hand-off row (warm border hover, not amber fill).
 * Right: "Ritningarstaðir í dag" — scripture references for today's
 *        program, if present. Hides entirely when no refs exist, so the
 *        column collapses rather than showing a stub.
 *
 * Note: scripture_refs isn't in the schedule_slots schema yet; when
 * it's added (episode_id → episodes.scripture_refs), pass them in as
 * the `scriptures` prop. For now the right column silently hides.
 */

interface Props {
    current: ScheduleSlot;
    scriptures?: ReadonlyArray<{ ref: string; title: string }>;
}

export default function OnAirEditorial({ current, scriptures }: Props) {
    const hasScriptures = scriptures && scriptures.length > 0;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: hasScriptures ? '1.35fr 1fr' : '1fr',
                gap: '48px',
                paddingTop: '36px',
                paddingBottom: '12px',
            }}
        >
            <div>
                <span
                    className="type-merki"
                    style={{ display: 'block', marginBottom: '14px', color: 'var(--moskva)' }}
                >
                    Um þessa útsendingu
                </span>
                {current.description ? (
                    <p
                        className="type-lestur"
                        style={{
                            color: 'var(--ljos)',
                            margin: 0,
                            fontSize: '17.5px',
                            lineHeight: 1.7,
                            maxWidth: '58ch',
                        }}
                    >
                        {current.description}
                    </p>
                ) : (
                    <p
                        style={{
                            color: 'var(--moskva)',
                            margin: 0,
                            fontSize: '17.5px',
                            lineHeight: 1.7,
                            maxWidth: '58ch',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                        }}
                    >
                        {current.program_title} — bein útsending úr safnaðarsalnum.
                    </p>
                )}

                {/* Quiet prayer hand-off — opens the same submission
                    modal Bænatorg uses, in place. Viewer never leaves
                    the broadcast. */}
                <SendaBaenButton variant="ghost" />
            </div>

            {hasScriptures && (
                <div>
                    <span
                        className="type-merki"
                        style={{ display: 'block', marginBottom: '14px', color: 'var(--moskva)' }}
                    >
                        Ritningarstaðir í dag
                    </span>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: '1px solid var(--border)' }}>
                        {scriptures.map(({ ref, title }) => (
                            <li
                                key={ref}
                                style={{
                                    padding: '12px 18px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '24px',
                                    borderBottom: '1px solid var(--border)',
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: 'var(--nordurljos)',
                                        minWidth: '10ch',
                                    }}
                                >
                                    {ref}
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '15px',
                                        color: 'var(--moskva)',
                                        fontStyle: 'italic',
                                        textAlign: 'right',
                                        flex: 1,
                                    }}
                                >
                                    {title}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
