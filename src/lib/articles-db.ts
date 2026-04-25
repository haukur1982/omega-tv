import { supabase, supabaseAdmin } from './supabase';
import { Database } from '@/types/supabase';

export type Article = Database['public']['Tables']['articles']['Row'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['articles']['Update'];

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
        return [];
    }
    return data || [];
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

    if (error) {
        console.error(`Failed to fetch ${category} articles:`, error);
        return [];
    }
    return data || [];
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
