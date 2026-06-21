import Link from "next/link";
import { ARTICLE_CATEGORIES } from "@/lib/article-categories";

/**
 * TopicStrip — "Lestu eftir efni". A row of large, legible topic
 * buttons that let readers jump straight to a subject (Lækning,
 * Frelsun, Trú...). Lives on cream so it matches the magazine body.
 *
 * Built deliberately big and plain for an older readership: clear
 * labels, generous tap targets, no clever interactions. Pass
 * `activeSlug` on a topic page to highlight the current topic.
 */

interface Props {
    activeSlug?: string;
}

export default function TopicStrip({ activeSlug }: Props) {
    return (
        <section
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
                borderBottom: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(36px, 5vw, 56px) var(--rail-padding)',
                }}
            >
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--mor)',
                        marginBottom: '18px',
                    }}
                >
                    Lestu eftir efni
                </div>

                <ul
                    style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                    }}
                >
                    {ARTICLE_CATEGORIES.map((c) => {
                        const active = c.slug === activeSlug;
                        return (
                            <li key={c.slug}>
                                <Link
                                    href={`/greinar/flokkur/${c.slug}`}
                                    className="warm-hover"
                                    style={{
                                        display: 'inline-block',
                                        padding: '13px 24px',
                                        border: `1px solid ${active ? 'var(--skra-djup)' : 'rgba(63,47,35,0.25)'}`,
                                        background: active ? 'var(--skra-djup)' : 'transparent',
                                        color: active ? 'var(--skra)' : 'var(--skra-djup)',
                                        borderRadius: 'var(--radius-xs)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        letterSpacing: '0.02em',
                                        textDecoration: 'none',
                                    }}
                                >
                                    {c.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
