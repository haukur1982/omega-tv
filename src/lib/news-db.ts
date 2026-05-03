import { supabase, supabaseAdmin } from './supabase';

/**
 * News items — translated Christian world news. Distinct from articles
 * (evergreen teaching). Every item carries mandatory source attribution
 * so the public page can render "Heimild: <name> →" prominently and
 * route readers back to the original publisher.
 *
 * Editorial practice locked in TS shape:
 *   - source_url + source_name are required at type level (never null)
 *   - publish flow uses is_published + published_at, same pattern as
 *     articles, so the public page can filter cheaply
 */

export interface NewsItem {
    id: string;
    createdAt: string;
    slug: string;
    title: string;
    summary: string;
    body: string | null;
    sourceUrl: string;
    sourceName: string;
    sourcePublishedAt: string | null;
    region: string | null;
    category: string | null;
    imageUrl: string | null;
    editorNote: string | null;
    isPublished: boolean;
    publishedAt: string | null;
}

export interface NewsItemInsert {
    slug: string;
    title: string;
    summary: string;
    body?: string | null;
    sourceUrl: string;
    sourceName: string;
    sourcePublishedAt?: string | null;
    region?: string | null;
    category?: string | null;
    imageUrl?: string | null;
    editorNote?: string | null;
    isPublished?: boolean;
    publishedAt?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): NewsItem {
    return {
        id: row.id,
        createdAt: row.created_at,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        body: row.body,
        sourceUrl: row.source_url,
        sourceName: row.source_name,
        sourcePublishedAt: row.source_published_at,
        region: row.region,
        category: row.category,
        imageUrl: row.image_url,
        editorNote: row.editor_note,
        isPublished: row.is_published,
        publishedAt: row.published_at,
    };
}

// ===== PUBLIC =====

export async function getPublishedNews(limit = 50): Promise<NewsItem[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data, error } = await sb
        .from('news_items')
        .select('*')
        .eq('is_published', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('Failed to fetch news:', error); return []; }
    return (data ?? []).map(mapRow);
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data, error } = await sb
        .from('news_items')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
    if (error || !data) return null;
    return mapRow(data);
}

export async function getNewsByCategory(category: string, limit = 50): Promise<NewsItem[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data, error } = await sb
        .from('news_items')
        .select('*')
        .eq('category', category)
        .eq('is_published', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('Failed to fetch news by category:', error); return []; }
    return (data ?? []).map(mapRow);
}

// ===== ADMIN =====

export async function getAllNewsAdmin(): Promise<NewsItem[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { data, error } = await sb
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) { console.error('Failed to fetch all news:', error); return []; }
    return (data ?? []).map(mapRow);
}

export async function createNews(input: NewsItemInsert): Promise<NewsItem | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const payload = {
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        body: input.body ?? null,
        source_url: input.sourceUrl,
        source_name: input.sourceName,
        source_published_at: input.sourcePublishedAt ?? null,
        region: input.region ?? null,
        category: input.category ?? null,
        image_url: input.imageUrl ?? null,
        editor_note: input.editorNote ?? null,
        is_published: input.isPublished ?? false,
        published_at: input.isPublished
            ? (input.publishedAt ?? new Date().toISOString())
            : null,
    };
    const { data, error } = await sb.from('news_items').insert(payload).select().single();
    if (error) { console.error('Failed to create news:', error); return null; }
    return mapRow(data);
}

export async function updateNews(id: string, patch: Partial<NewsItemInsert>): Promise<NewsItem | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const dbPatch: Record<string, unknown> = {};
    if (patch.slug !== undefined) dbPatch.slug = patch.slug;
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.summary !== undefined) dbPatch.summary = patch.summary;
    if (patch.body !== undefined) dbPatch.body = patch.body;
    if (patch.sourceUrl !== undefined) dbPatch.source_url = patch.sourceUrl;
    if (patch.sourceName !== undefined) dbPatch.source_name = patch.sourceName;
    if (patch.sourcePublishedAt !== undefined) dbPatch.source_published_at = patch.sourcePublishedAt;
    if (patch.region !== undefined) dbPatch.region = patch.region;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl;
    if (patch.editorNote !== undefined) dbPatch.editor_note = patch.editorNote;
    if (patch.isPublished !== undefined) {
        dbPatch.is_published = patch.isPublished;
        if (patch.isPublished && !patch.publishedAt) {
            dbPatch.published_at = new Date().toISOString();
        }
    }
    if (patch.publishedAt !== undefined) dbPatch.published_at = patch.publishedAt;

    const { data, error } = await sb.from('news_items').update(dbPatch).eq('id', id).select().single();
    if (error) { console.error('Failed to update news:', error); return null; }
    return mapRow(data);
}

export async function deleteNews(id: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { error } = await sb.from('news_items').delete().eq('id', id);
    if (error) { console.error('Failed to delete news:', error); return false; }
    return true;
}

export async function getNewsAdminBySlug(slug: string): Promise<NewsItem | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { data, error } = await sb.from('news_items').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) return null;
    return mapRow(data);
}
