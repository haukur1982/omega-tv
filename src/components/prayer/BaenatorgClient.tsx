'use client';

import { useMemo, useState, useTransition } from 'react';
import { prayForAction } from '@/actions/prayer';
import type { Prayer } from '@/lib/prayer-db';
import PrayerInvitationRow from './PrayerInvitationRow';
import PrayerFilterStrip, { type PrayerFilter } from './PrayerFilterStrip';
import PrayerCardV2 from './PrayerCardV2';
import PrayerSubmissionModal from './PrayerSubmissionModal';
import BidjaMode from './BidjaMode';
import { IcoHands } from './PrayerIcons';

/**
 * The wall's client half: the Biðja-mode entry, the filter, the feed.
 *
 * Two rules from docs/plans/09-prayer-ministry.md govern this file:
 *   - the feed sorts by recency and nothing else — no popularity sort, no
 *     "most prayed" chip. Ranking prayers is the one thing a prayer wall
 *     must never do.
 *   - Biðja-mode is the primary action. Tapping a single card still works,
 *     but it is subordinate: one prayer at a time, held properly, beats
 *     scrolling and tapping a row of them.
 */

type Register = 'dark' | 'light';

interface Props {
    initialPrayers: Prayer[];
    register?: Register;
}

export default function BaenatorgClient({ initialPrayers, register = 'dark' }: Props) {
    const [prayers, setPrayers] = useState<Prayer[]>(initialPrayers);
    const [filter, setFilter] = useState<PrayerFilter>('allar');
    const [modalOpen, setModalOpen] = useState(false);
    const [bidjaOpen, setBidjaOpen] = useState(false);
    const [, startTransition] = useTransition();

    const counts = useMemo(
        () => ({
            allar: prayers.length,
            svor: prayers.filter((p) => p.isAnswered).length,
        }),
        [prayers],
    );

    // Recency only. The server already returns created_at descending, so the
    // "allar" case is deliberately the untouched list.
    const filtered = useMemo(() => {
        if (filter === 'svor') return prayers.filter((p) => p.isAnswered);
        return prayers;
    }, [prayers, filter]);

    /**
     * Optimistic: the count moves here, first, and the write follows in a
     * transition so the RSC refresh that prayForAction's revalidatePath
     * triggers never janks the screen someone is praying in front of.
     *
     * A failed write is swallowed on purpose. The count is company, not a
     * ledger, and yanking the number back out from under someone mid-prayer
     * would be a worse thing than a lost increment.
     */
    const handlePray = (id: string) => {
        setPrayers((list) =>
            list.map((p) => (p.id === id ? { ...p, prayCount: p.prayCount + 1 } : p)),
        );
        startTransition(async () => {
            try {
                await prayForAction(id);
            } catch {
                /* see above */
            }
        });
    };

    const isLight = register === 'light';

    return (
        <>
            <PrayerInvitationRow onOpen={() => setModalOpen(true)} register={register} />

            {prayers.length > 0 && (
                <div
                    style={{
                        marginTop: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '18px',
                        flexWrap: 'wrap',
                        textAlign: 'center',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setBidjaOpen(true)}
                        className="bidja-open-btn"
                        style={{
                            minHeight: '56px',
                            padding: '16px 34px',
                            background: 'transparent',
                            border: `1px solid ${isLight ? 'var(--gull)' : 'var(--kerti)'}`,
                            borderRadius: 'var(--radius-sm)',
                            color: isLight ? 'var(--skra-djup)' : 'var(--kerti)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <IcoHands size={17} />
                        Biðja með
                    </button>
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '15px',
                            lineHeight: 1.5,
                            color: isLight ? 'var(--skra-mjuk)' : 'var(--moskva)',
                            maxWidth: '26rem',
                        }}
                    >
                        Ein bæn í einu, í kyrrð.
                    </span>
                    <style>{`
                        @media (max-width: 640px) {
                            .bidja-open-btn { width: 100%; justify-content: center; }
                        }
                    `}</style>
                </div>
            )}

            <PrayerFilterStrip active={filter} onChange={setFilter} counts={counts} register={register} />

            <div
                id="senda"
                style={{
                    maxWidth: '44rem',
                    margin: isLight ? '24px auto 0' : '0 auto',
                }}
            >
                {filtered.length > 0 ? (
                    filtered.map((p) => (
                        <PrayerCardV2 key={p.id} prayer={p} register={register} onPray={handlePray} />
                    ))
                ) : (
                    <div
                        style={{
                            padding: '80px 0',
                            textAlign: 'center',
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: '18px',
                            color: isLight ? 'var(--skra-mjuk)' : 'var(--moskva)',
                        }}
                    >
                        {filter === 'svor'
                            ? 'Engin bænasvör skráð enn.'
                            : 'Engar bænir ennþá. Vertu fyrst/ur til að senda bænaefni.'}
                    </div>
                )}
            </div>

            <PrayerSubmissionModal open={modalOpen} onClose={() => setModalOpen(false)} />

            {bidjaOpen && (
                <BidjaMode
                    prayers={prayers}
                    onPray={handlePray}
                    onClose={() => setBidjaOpen(false)}
                />
            )}
        </>
    );
}
