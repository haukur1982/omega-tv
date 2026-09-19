'use client';

import Link from 'next/link';

export default function DevotionalError({ reset }: { reset: () => void }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--skra)] px-6 text-center text-[var(--skra-djup)]">
            <h1 className="text-3xl">Ekki tókst að sækja hugleiðinguna</h1>
            <p className="text-lg">Reyndu aftur eftir smástund.</p>
            <button onClick={reset} className="rounded-lg bg-[#416b97] px-6 py-4 font-semibold text-white">Reyna aftur</button>
            <Link href="/hugleidingar" className="inline-flex min-h-11 items-center underline">Til baka í hugleiðingar</Link>
        </main>
    );
}
