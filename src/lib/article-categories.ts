/**
 * Canonical article topics for the faith library (Omega Tímaritið).
 *
 * `key`   is the exact string stored in the `articles.category` column.
 * `slug`  is the URL segment used at /greinar/flokkur/[slug].
 * `label` is what readers see on the topic strip and topic page.
 * `blurb` is a one-line description shown on the topic landing page.
 *
 * This is the single source of truth for both the topic strip on
 * /greinar and the per-topic landing pages. Add a topic here and it
 * shows up everywhere.
 */

export interface ArticleCategory {
    key: string;
    slug: string;
    label: string;
    blurb: string;
}

export const ARTICLE_CATEGORIES: readonly ArticleCategory[] = [
    { key: 'Lækning', slug: 'laekning', label: 'Lækning', blurb: 'Frásagnir af lækningu fyrir kraft Guðs.' },
    { key: 'Frelsun', slug: 'frelsun', label: 'Frelsun', blurb: 'Þegar fjötrar bresta og fólk verður frjálst.' },
    { key: 'Trú', slug: 'tru', label: 'Trú', blurb: 'Orð sem styrkja og næra trúna.' },
    { key: 'Bænheyrsla', slug: 'baenheyrsla', label: 'Bænheyrsla', blurb: 'Bænir sem Guð svaraði.' },
    { key: 'Afturhvarf', slug: 'afturhvarf', label: 'Afturhvarf', blurb: 'Líf sem gjörbreyttust þegar þau mættu Jesú.' },
    { key: 'Englar', slug: 'englar', label: 'Englar', blurb: 'Hið ósýnilega og vernd Guðs.' },
    { key: 'Ævisögur', slug: 'aevisogur', label: 'Ævisögur', blurb: 'Líf trúarhetja, sagt til uppbyggingar.' },
] as const;

export function categoryBySlug(slug: string): ArticleCategory | undefined {
    return ARTICLE_CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByKey(key: string | null | undefined): ArticleCategory | undefined {
    if (!key) return undefined;
    return ARTICLE_CATEGORIES.find((c) => c.key === key);
}
