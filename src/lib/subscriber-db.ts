import { supabase } from './supabase';

export interface Subscriber {
    id: string;
    email: string;
    name?: string;
    segments: string[];
    isVerified: boolean;
    createdAt: string;
}

/**
 * Add a new subscriber (email signup)
 */
export async function addSubscriber(
    email: string,
    name?: string,
    segments: string[] = ['newsletter']
): Promise<{ success: boolean; error?: string }> {
    // Check if email already exists
    const { data: existing } = await supabase
        .from('subscribers')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

    if (existing) {
        return { success: false, error: 'Þetta netfang er þegar skráð.' };
    }

    const { error } = await supabase
        .from('subscribers')
        .insert([{
            email: email.toLowerCase(),
            name: name || null,
            segments: segments,
            is_verified: false
        }]);

    if (error) {
        console.error("Failed to add subscriber:", error);
        return { success: false, error: 'Villa kom upp. Reyndu aftur.' };
    }

    return { success: true };
}

/**
 * Get all subscribers (for admin dashboard)
 */
export async function getSubscribers(): Promise<Subscriber[]> {
    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch subscribers:", error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        segments: row.segments || [],
        isVerified: row.is_verified,
        createdAt: row.created_at
    }));
}

/**
 * Get subscriber count (for admin stats)
 */
export async function getSubscriberCount(): Promise<number> {
    const { count, error } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Failed to count subscribers:", error);
        return 0;
    }

    return count || 0;
}

/**
 * Delete a subscriber (admin action or unsubscribe)
 */
export async function deleteSubscriber(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

    return !error;
}
