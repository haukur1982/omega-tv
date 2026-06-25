/**
 * Prints the SQL to insert the faith-library seed articles into the
 * Supabase `articles` table. Run with:  npx tsx scripts/print-faith-insert.ts
 *
 * Output is dollar-quoted so the live text is byte-for-byte identical to
 * the verified seed (no escaping, no retyping). Pipe / paste into the
 * Supabase SQL runner. Idempotent enough for a one-time publish: the five
 * slugs do not exist in the table yet.
 */
import { FAITH_SEED } from "../src/components/articles/faith-library-seed";

const dq = (s: string | null): string =>
    s === null || s === undefined ? "NULL" : `$omega$${s}$omega$`;

const inserts = FAITH_SEED.map(
    (a) =>
        `UPDATE articles SET title = ${dq(a.title)}, category = ${dq(a.category)}, author_name = ${dq(a.author_name)}, excerpt = ${dq(a.excerpt)}, content = ${dq(a.content)}, published_at = ${dq(a.published_at)} WHERE slug = ${dq(a.slug)};`,
).join("\n\n");

console.log(inserts);
