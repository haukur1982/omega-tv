'use client';

import { useMemo, useState, useTransition } from 'react';
import { prayForAction } from '@/actions/prayer';
import type { Prayer } from '@/lib/prayer-db';
import PrayerInvitationRow from './PrayerInvitationRow';
import PrayerFilterStrip, { type PrayerFilter } from './PrayerFilterStrip';
import PrayerCardV2 from './PrayerCardV2';
import PrayerSubmissionModal from './PrayerSubmissionModal';

type Register = 'dark' | 'light';

interface Props {
    initialPrayers: Prayer[];
    register?: Register;
}

export default function BaenatorgClient({ initialPrayers, register = 'dark' }: Props) {
    const [prayers, setPrayers] = useState<Prayer[]>(initialPrayers);
    const [filter, setFilter] = useState<PrayerFilter>('allar');
    const [modalOpen, setModalOpen] = useState(false);
    const [, startTransition] = useTransition();

    const counts = useMemo(
        () => ({
            allar: prayers.length,
            mest: prayers.filter((p) => p.prayCount >= 30).length,
            svor: prayers.filter((p) => p.isAnswered).length,
        }),
        [prayers],
    );

    const filtered = useMemo(() => {
        if (filter === 'mest') return [...prayers].sort((a, b) => b.prayCount - a.prayCount);
        if (filter === 'svor') return prayers.filter((p) => p.isAnswered);
        return prayers;
    }, [prayers, filter]);

    const handlePray = (id: string) => {
        setPrayers((list) =>
            list.map((p) => (p.id === id ? { ...p, prayCount: p.prayCount + 1 } : p)),
        );
        startTransition(async () => {
            await prayForAction(id);
        });
    };

    const isLight = register === 'light';

    return (
        <>
            <PrayerInvitationRow onOpen={() => setModalOpen(true)} register={register} />

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
                            : filter === 'mest'
                                ? 'Engar bænir með stórt bænasamfélag enn.'
                                : 'Engar bænir ennþá. Vertu fyrst/ur til að senda bænaefni.'}
                    </div>
                )}
            </div>

            <PrayerSubmissionModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </>
    );
}
