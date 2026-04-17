import { supabase, supabaseAdmin } from './supabase';

export interface Newsletter {
    id: string;
    title: string;
    date: string;
    author: string;
    content: string;
}

/**
 * Get all published newsletters
 */
export async function getNewsletters(): Promise<Newsletter[]> {
    const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch newsletters:", error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.published_at,
        author: row.author,
        content: row.content
    }));
}

/**
 * Get all newsletters (for admin dashboard)
 */
export async function getAllNewsletters(): Promise<Newsletter[]> {
    const { data, error } = await supabaseAdmin
        .from('newsletters')
        .select('*')
        .order('published_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch all newsletters:", error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.published_at,
        author: row.author,
        content: row.content
    }));
}

/**
 * Create a new newsletter (admin action)
 */
export async function createNewsletter(newsletter: Omit<Newsletter, 'id' | 'date'>): Promise<Newsletter | null> {
    const { data, error } = await supabaseAdmin
        .from('newsletters')
        .insert([{
            title: newsletter.title,
            author: newsletter.author,
            content: newsletter.content,
            is_published: true,
            published_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) {
        console.error("Failed to create newsletter:", error);
        return null;
    }

    return {
        id: data.id,
        title: data.title,
        date: data.published_at || '',
        author: data.author,
        content: data.content
    };
}

/**
 * Delete a newsletter (admin action)
 */
export async function deleteNewsletter(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('newsletters')
        .delete()
        .eq('id', id);

    return !error;
}
