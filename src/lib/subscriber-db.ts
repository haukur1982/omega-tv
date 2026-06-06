import { supabaseAdmin } from './supabase';

export interface Subscriber {
    id: string;
    email: string;
    name?: string;
    segments: string[];
    isVerified: boolean;
    createdAt: string;
}

/**
 * Add a new subscriber (email signup). On success returns the
 * verification_token — caller passes it to sendVerificationEmail. The
 * DB default fills the token (gen_random_uuid), we just read it back.
 */
export async function addSubscriber(
    email: string,
    name?: string,
    segments: string[] = ['newsletter']
): Promise<{ success: boolean; error?: string; alreadyOnList?: boolean }> {
    // Service-role client: runs server-side (called from the subscribe server
    // action). The anon client is blocked by RLS from reading the inserted row
    // back, so the verification_token came back null and NO verification email
    // was ever sent. supabaseAdmin bypasses RLS and reads the token reliably.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;

    // Already a row for this email?
    const { data: existing } = await sb
        .from('subscribers')
        .select('id, verified_at, verification_token')
        .eq('email', email.toLowerCase())
        .maybeSingle();

    // Collect-mode (list-building phase): the web form IS the opt-in, so the
    // email is added straight to the list. No double-opt-in email yet — the
    // sending domain isn't configured. When it is, re-enable verification.
    if (existing) {
        // Already on the list — friendly success, not an error.
        return { success: true, alreadyOnList: true };
    }

    const { error } = await sb
        .from('subscribers')
        .insert([{
            email: email.toLowerCase(),
            name: name || null,
            segments: segments,
            is_verified: true,
            verified_at: new Date().toISOString(),
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
    const { data, error } = await supabaseAdmin
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
    const { count, error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin
        .from('subscribers')
        .delete()
        .eq('id', id);

    return !error;
}
