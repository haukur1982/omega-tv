import { supabase, supabaseAdmin } from './supabase';
import { Database } from '@/types/supabase';
import { FAITH_SEED } from '@/components/articles/faith-library-seed';

export type Article = Database['public']['Tables']['articles']['Row'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['articles']['Update'];

/**
 * Faith-library preview seed. Merged in only during local development
 * (or when FAITH_PREVIEW=1) so the topic browse can be reviewed before
 * the rows are inserted into Supabase and published. Inert in production.
 */
const PREVIEW_SEED =
    process.env.NODE_ENV === 'development' || process.env.FAITH_PREVIEW === '1';

function byPublishedDesc(a: Article, b: Article): number {
    const da = a.published_at ? new Date(a.published_at).getTime() : 0;
    const db = b.published_at ? new Date(b.published_at).getTime() : 0;
    return db - da;
}

/**
 * Get all published articles (public-facing)
 */
export async function getAllArticles(): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch articles:', error);
        return PREVIEW_SEED ? [...FAITH_SEED].sort(byPublishedDesc) : [];
    }

    const rows = data || [];
    if (!PREVIEW_SEED) return rows;
    const have = new Set(rows.map((r) => r.slug));
    return [...rows, ...FAITH_SEED.filter((s) => !have.has(s.slug))].sort(byPublishedDesc);
}

/**
 * Get all published articles in a given category (public-facing).
 * Articles without a category are excluded — pass null to opt out.
 */
export async function getArticlesByCategory(category: string): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

    const seeded = PREVIEW_SEED ? FAITH_SEED.filter((s) => s.category === category) : [];

    if (error) {
        console.error(`Failed to fetch ${category} articles:`, error);
        return seeded.sort(byPublishedDesc);
    }

    const rows = data || [];
    if (!PREVIEW_SEED) return rows;
    const have = new Set(rows.map((r) => r.slug));
    return [...rows, ...seeded.filter((s) => !have.has(s.slug))].sort(byPublishedDesc);
}

/**
 * Get a single article by slug (public-facing)
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        if (PREVIEW_SEED) {
            const seeded = FAITH_SEED.find((s) => s.slug === slug);
            if (seeded) return seeded;
        }
        console.error('Failed to fetch article:', error);
        return null;
    }
    return data;
}

// ===== ADMIN OPERATIONS (use supabaseAdmin to bypass RLS) =====

/**
 * Get ALL articles including unpublished (admin dashboard)
 */
export async function getAllArticlesAdmin(): Promise<Article[]> {
    const { data, error } = await supabaseAdmin
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch all articles:', error);
        return [];
    }
    return data || [];
}

/**
 * Create a new article (admin action)
 */
export async function createArticle(article: ArticleInsert): Promise<Article | null> {
    const { data, error } = await supabaseAdmin
        .from('articles')
        .insert(article)
        .select()
        .single();

    if (error) {
        console.error('Failed to create article:', error);
        return null;
    }
    return data;
}

/**
 * Update an existing article (admin action)
 */
export async function updateArticle(id: string, updates: ArticleUpdate): Promise<Article | null> {
    const { data, error } = await supabaseAdmin
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Failed to update article:', error);
        return null;
    }
    return data;
}

/**
 * Delete an article (admin action)
 */
export async function deleteArticle(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('articles')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Failed to delete article:', error);
        return false;
    }
    return true;
}
