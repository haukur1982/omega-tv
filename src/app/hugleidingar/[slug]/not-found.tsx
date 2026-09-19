import Link from 'next/link';

export default function DevotionalNotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--skra)] px-6 text-center text-[var(--skra-djup)]">
            <h1 className="text-3xl">Hugleiðingin er ekki aðgengileg</h1>
            <p className="max-w-lg text-lg leading-relaxed">Hún gæti enn verið í yfirlestri. Þú getur skoðað birtar hugleiðingar og skráð þig á póstlistann.</p>
            <Link href="/hugleidingar" className="rounded-lg bg-[#416b97] px-6 py-4 font-semibold text-white">Til baka í hugleiðingar</Link>
        </main>
    );
}
