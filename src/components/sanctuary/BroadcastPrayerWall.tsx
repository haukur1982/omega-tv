import type { BroadcastPrayer } from '@/lib/sanctuary-db';
import PrayAlongButton from './PrayAlongButton';

/**
 * BroadcastPrayerWall — the primary content of the /beint sanctuary surface.
 *
 * NOT a chat. Not a comment section. Each card is a prayer — name (or
 * "Nafnlaus"), body in warm serif, "bið með" button with live count.
 * Prayers are moderated before they appear; interaction is limited to
 * praying along.
 *
 * Renders in a masonry-like multi-column grid on wider viewports,
 * single column on mobile. Longer prayers can take more vertical space.
 */
export default function BroadcastPrayerWall({
    prayers,
    columns = 'multi',
}: {
    prayers: BroadcastPrayer[];
    columns?: 'multi' | 'single';
}) {
    if (prayers.length === 0) {
        return (
            <div
                style={{
                    padding: 'clamp(28px, 4vw, 40px) clamp(24px, 3vw, 36px)',
                    border: '1px dashed var(--border-hover)',
                    borderRadius: '4px',
                    textAlign: 'center',
                }}
            >
                <p
                    className="type-merki"
                    style={{ color: 'var(--kerti)', margin: 0, marginBottom: '10px', letterSpacing: '0.22em' }}
                >
                    Þú fyrstur
                </p>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        color: 'var(--moskva)',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        maxWidth: '38ch',
                        marginInline: 'auto',
                    }}
                >
                    Engin bæn hefur borist í þessari útsendingu ennþá. Sendu þína fyrstu bæn hér að neðan.
                </p>
            </div>
        );
    }

    const columnClass = columns === 'single' ? 'prayer-grid-single' : 'prayer-grid-multi';

    return (
        <ul
            className={columnClass}
            style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                columnGap: 'clamp(18px, 2vw, 24px)',
            }}
        >
            {prayers.map((p) => (
                <li key={p.id} style={{ breakInside: 'avoid', marginBottom: 'clamp(18px, 2vw, 22px)' }}>
                    <PrayerCard prayer={p} />
                </li>
            ))}
            {/* Responsive column rules via scoped style tag — 3 on wide,
                2 on tablet, 1 on mobile. Multi-column layout handles the
                masonry feel for free, with clean CSS.  */}
            <style>{`
                .prayer-grid-multi {
                    column-count: 1;
                }
                @media (min-width: 720px)  { .prayer-grid-multi { column-count: 2; } }
                @media (min-width: 1280px) { .prayer-grid-multi { column-count: 3; } }
                .prayer-grid-single { column-count: 1; }
            `}</style>
        </ul>
    );
}

function PrayerCard({ prayer }: { prayer: BroadcastPrayer }) {
    return (
        <article
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: 'clamp(20px, 2.2vw, 26px) clamp(22px, 2.4vw, 28px) clamp(20px, 2.2vw, 24px)',
                background: 'var(--torfa)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
            }}
        >
            {/* Author kicker */}
            <p
                className="type-merki"
                style={{
                    margin: 0,
                    color: 'var(--moskva)',
                    letterSpacing: '0.22em',
                    fontSize: '0.62rem',
                }}
            >
                {prayer.name ?? 'Nafnlaus'}
                {prayer.is_answered && (
                    <span
                        style={{
                            marginLeft: '10px',
                            color: 'var(--gull)',
                            letterSpacing: '0.22em',
                        }}
                    >
                        · Bænheyrsla
                    </span>
                )}
            </p>

            {/* Prayer body — serif, substantial, breathable */}
            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--ljos)',
                    fontSize: '1.02rem',
                    lineHeight: 1.6,
                }}
            >
                {prayer.content}
            </p>

            {/* Action row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <PrayAlongButton
                    prayerId={prayer.id}
                    initialCount={prayer.pray_count ?? 0}
                />
            </div>
        </article>
    );
}
