import Image from 'next/image';
import Link from 'next/link';
import styles from './HeroV2.module.css';

export default function HeroV2({ readingHref = '/hugleidingar#lesa' }: { readingHref?: string }) {
    return (
        <section className={styles.hero} aria-labelledby="omega-hero-title">
            <Image
                src="/images/hero/kirkjufell-josh-levey.webp"
                alt="Kirkjufell og fossinn í kvöldbirtu á Snæfellsnesi."
                fill
                priority
                sizes="100vw"
                className={styles.photograph}
            />
            <div className={styles.shade} aria-hidden="true" />
            <div className={styles.inner}>
                <p className={styles.kicker}>Omega · Kristinn fjölmiðill á Íslandi</p>
                <h1 id="omega-hero-title" className={styles.title}>
                    Nær Jesú.<br />
                    <span>Mitt í lífinu.</span>
                </h1>
                <p className={styles.introduction}>
                    Hugleiðingar og þættir á íslensku sem styrkja trúna og vekja von.
                    Taktu þér stund með okkur.
                </p>
                <div className={styles.actions}>
                    <Link href={readingHref} className={styles.primary}>Lesa hugleiðingu <span aria-hidden="true">↗</span></Link>
                    <Link href="/live" className={styles.secondary}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4.5v15l13-7.5-13-7.5z" /></svg>
                        Horfa í beinni
                    </Link>
                </div>
            </div>
            <a className={styles.credit}
                href="https://unsplash.com/photos/waterfalls-near-green-grass-field-and-mountain-during-daytime-nZ4_aoumUu0"
                target="_blank" rel="noreferrer">
                Kirkjufell · Ljósmynd: Josh Levey / Unsplash
            </a>
        </section>
    );
}
