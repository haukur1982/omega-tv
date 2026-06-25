import { safeJsonLd } from '@/lib/seo';

/**
 * Renders one or more JSON-LD structured-data blocks into the page <head>/body.
 * Server component, so the markup is in the SSR HTML where crawlers read it.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
    const blocks = Array.isArray(data) ? data : [data];
    return (
        <>
            {blocks.map((block, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: safeJsonLd(block) }}
                />
            ))}
        </>
    );
}
