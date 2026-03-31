import { supabase, supabaseAdmin } from './supabase';

export interface Prayer {
    id: string;
    name: string;
    email?: string;
    topic: string;
    content: string;
    timestamp: number;
    prayCount: number;
    isAnswered: boolean;
    isApproved: boolean;
}

/**
 * Get all approved prayers for public display
 */
export async function getPrayers(): Promise<Prayer[]> {
    const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch prayers:", error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        topic: row.topic,
        content: row.content,
        timestamp: new Date(row.created_at).getTime(),
        prayCount: row.pray_count || 0,
        isAnswered: row.is_answered || false,
        isApproved: row.is_approved || false
    }));
}

/**
 * Get ALL prayers (for admin dashboard)
 */
export async function getAllPrayers(): Promise<Prayer[]> {
    const { data, error } = await supabaseAdmin
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch all prayers:", error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        topic: row.topic,
        content: row.content,
        timestamp: new Date(row.created_at).getTime(),
        prayCount: row.pray_count || 0,
        isAnswered: row.is_answered || false,
        isApproved: row.is_approved || false
    }));
}

/**
 * Submit a new prayer request (goes to moderation queue)
 */
export async function addPrayer(prayer: Omit<Prayer, 'id' | 'timestamp' | 'prayCount' | 'isAnswered' | 'isApproved'>): Promise<Prayer | null> {
    const { data, error } = await supabase
        .from('prayers')
        .insert([{
            name: prayer.name,
            email: prayer.email,
            topic: prayer.topic,
            content: prayer.content,
            pray_count: 0,
            is_approved: false, // Needs moderation
            is_answered: false
        }])
        .select()
        .single();

    if (error) {
        console.error("Failed to add prayer:", error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        topic: data.topic,
        content: data.content,
        timestamp: new Date(data.created_at).getTime(),
        prayCount: data.pray_count,
        isAnswered: data.is_answered,
        isApproved: data.is_approved
    };
}

/**
 * Increment the "Amen" count for a prayer
 */
export async function incrementPrayCount(id: string): Promise<number | null> {
    // First get current count
    const { data: current, error: fetchError } = await supabase
        .from('prayers')
        .select('pray_count')
        .eq('id', id)
        .single();

    if (fetchError || !current) {
        console.error("Failed to fetch prayer count:", fetchError);
        return null;
    }

    const newCount = (current.pray_count || 0) + 1;

    const { error: updateError } = await supabase
        .from('prayers')
        .update({ pray_count: newCount })
        .eq('id', id);

    if (updateError) {
        console.error("Failed to update prayer count:", updateError);
        return null;
    }

    return newCount;
}

/**
 * Approve a prayer (admin action)
 */
export async function approvePrayer(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', id);

    return !error;
}

/**
 * Mark a prayer as answered (admin action)
 */
export async function markPrayerAnswered(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .update({ is_answered: true, updated_at: new Date().toISOString() })
        .eq('id', id);

    return !error;
}

/**
 * Delete a prayer (admin action)
 */
export async function deletePrayer(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .delete()
        .eq('id', id);

    return !error;
}
