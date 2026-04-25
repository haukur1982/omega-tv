import Link from "next/link";
import type { Article } from "@/lib/articles-db";

/**
 * IsraelGreinarRail — surfaces Israel-tagged articles on the
 * /israel landing.
 *
 * If there are no Israel articles yet, renders an honest empty state:
 * a quiet placeholder that says content is coming, not generated
 * filler text. Articles are Hawk's voice — we don't fabricate them
 * for visual completeness (project standing rule: "Articles auto-
 * generation from sermons — scrapped. Articles are Hawk's voice,
 * written from conviction.").
 *
 * If there are 1–4, all show in the rail. If 5+, show the latest 4
 * with a "Sjá allar greinar →" link to /israel/greinar.
 */

interface Props {
    articles: Article[];
}

export default function IsraelGreinarRail({ articles }: Props) {
    const hasArticles = articles.length > 0;
    const display = articles.slice(0, 4);

    return (
        <section
            style={{
                background: 'var(--skra)',
                color: 'var(--skra-djup)',
                borderTop: '1px solid rgba(63,47,35,0.12)',
            }}
        >
            <div
                style={{
                    maxWidth: '80rem',
                    margin: '0 auto',
                    padding: 'clamp(72px, 9vw, 112px) var(--rail-padding)',
                }}
            >
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: '24px',
                        flexWrap: 'wrap',
                        marginBottom: 'clamp(32px, 4vw, 48px)',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'var(--gull)',
                                marginBottom: '12px',
                            }}
                        >
                            Fræðsla
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(28px, 3.2vw, 40px)',
                                lineHeight: 1.1,
                                fontWeight: 400,
                                color: 'var(--skra-djup)',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            Greinar um Ísrael
                        </h2>
                    </div>
                    {articles.length > 4 && (
                        <Link
                            href="/israel/greinar"
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: 'var(--skra-djup)',
                                textDecoration: 'none',
                                borderBottom: '1px solid var(--gull)',
                                paddingBottom: '2px',
                            }}
                        >
                            Sjá allar greinar →
                        </Link>
                    )}
                </header>

                {hasArticles ? (
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'grid',
                            gap: 'clamp(28px, 3vw, 40px)',
                            gridTemplateColumns: display.length === 1
                                ? 'minmax(0, 1fr)'
                                : 'repeat(auto-fit, minmax(280px, 1fr))',
                        }}
                    >
                        {display.map((a) => (
                            <ArticleCard key={a.id} article={a} />
                        ))}
                    </ul>
                ) : (
                    <EmptyState />
                )}
            </div>
        </section>
    );
}

function ArticleCard({ article }: { article: Article }) {
    const date = article.published_at
        ? new Date(article.published_at).toLocaleDateString('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : '';

    return (
        <li>
            <Link
                href={`/greinar/${article.slug}`}
                style={{
                    display: 'block',
                    color: 'var(--skra-djup)',
                    textDecoration: 'none',
                }}
            >
                <article
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    {article.featured_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={article.featured_image}
                            alt=""
                            style={{
                                width: '100%',
                                aspectRatio: '16 / 10',
                                objectFit: 'cover',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(63,47,35,0.1)',
                            }}
                        />
                    )}
                    <div
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--skra-mjuk)',
                        }}
                    >
                        {date || 'Grein'}
                    </div>
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(20px, 1.8vw, 24px)',
                            lineHeight: 1.25,
                            fontWeight: 400,
                            color: 'var(--skra-djup)',
                            letterSpacing: '-0.005em',
                            textWrap: 'balance',
                        }}
                    >
                        {article.title}
                    </h3>
                    {article.excerpt && (
                        <p
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: '15.5px',
                                lineHeight: 1.55,
                                color: 'var(--skra-mjuk)',
                                textWrap: 'pretty',
                            }}
                        >
                            {article.excerpt}
                        </p>
                    )}
                </article>
            </Link>
        </li>
    );
}

function EmptyState() {
    return (
        <div
            style={{
                padding: 'clamp(48px, 6vw, 72px) clamp(28px, 4vw, 48px)',
                border: '1px dashed rgba(63,47,35,0.2)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(212,194,162,0.18)',
                textAlign: 'center',
                maxWidth: '46rem',
                margin: '0 auto',
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--gull)',
                    marginBottom: '14px',
                }}
            >
                Komandi greinar
            </div>
            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: 'clamp(18px, 1.7vw, 22px)',
                    lineHeight: 1.5,
                    color: 'var(--skra-djup)',
                    maxWidth: '32rem',
                    marginInline: 'auto',
                }}
            >
                Fræðsla um Ísrael — sáttmálinn, Rómverjabréfið 11, og kall Íslands sem þjóðar — er á leiðinni. Greinar eru skrifaðar af sannfæringu, ekki af áætlun.
            </p>
        </div>
    );
}
