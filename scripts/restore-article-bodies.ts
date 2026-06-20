// Restore article bodies into Supabase.
//
// Three published articles (aska, thu-tharft-ekki-ad-vinna, hvernig-gud-ser-thig)
// have empty `content` in the DB — title/excerpt/image are present but the body
// never landed, so the detail pages render a cover with no article. The real,
// Hawk-written bodies live in the repo:
//   - aska, thu-tharft-ekki-ad-vinna  → src/components/articles/mock-articles.ts
//   - hvernig-gud-ser-thig            → scripts/seed-article.ts
//
// This script copies those bodies in, but ONLY when the DB content is currently
// empty — it never overwrites real content. Run:  npx tsx scripts/restore-article-bodies.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { MOCK_ARTICLES } from '../src/components/articles/mock-articles';
import { article as seedArticle } from './seed-article';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const SLUGS = ['aska', 'thu-tharft-ekki-ad-vinna', 'hvernig-gud-ser-thig'];

function bodyFor(slug: string): string | null {
    if (slug === seedArticle.slug) return seedArticle.content;
    const m = MOCK_ARTICLES.find((a) => a.slug === slug);
    return m?.content ?? null;
}

async function main() {
    for (const slug of SLUGS) {
        const { data: rows, error: selErr } = await supabase
            .from('articles')
            .select('id, slug, content')
            .eq('slug', slug);

        if (selErr) {
            console.error(`✗ ${slug}: select failed —`, selErr.message);
            continue;
        }
        if (!rows || rows.length === 0) {
            console.log(`–  ${slug}: no DB row, skipped`);
            continue;
        }

        const row = rows[0];
        const current = (row.content ?? '').trim();
        if (current.length > 0) {
            console.log(`–  ${slug}: already has ${current.length} chars, left untouched`);
            continue;
        }

        const body = bodyFor(slug);
        if (!body || !body.trim()) {
            console.log(`–  ${slug}: no body found in repo, skipped`);
            continue;
        }

        const { error: updErr } = await supabase
            .from('articles')
            .update({ content: body })
            .eq('id', row.id);

        if (updErr) {
            console.error(`✗ ${slug}: update failed —`, updErr.message);
            continue;
        }
        console.log(`✅ ${slug}: restored ${body.length} chars`);
    }
}

main();
