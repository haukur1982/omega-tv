import { supabase, supabaseAdmin } from './supabase';

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
): Promise<{ success: boolean; error?: string; verificationToken?: string }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    // Already a row for this email?
    const { data: existing } = await sb
        .from('subscribers')
        .select('id, verified_at, verification_token')
        .eq('email', email.toLowerCase())
        .maybeSingle();

    if (existing) {
        if (existing.verified_at) {
            return { success: false, error: 'Þetta netfang er þegar staðfest.' };
        }
        // Pending — return the existing token so caller can resend the email.
        return {
            success: true,
            verificationToken: existing.verification_token ?? undefined,
        };
    }

    const { data: inserted, error } = await sb
        .from('subscribers')
        .insert([{
            email: email.toLowerCase(),
            name: name || null,
            segments: segments,
            is_verified: false,
        }])
        .select('verification_token')
        .single();

    if (error) {
        console.error("Failed to add subscriber:", error);
        return { success: false, error: 'Villa kom upp. Reyndu aftur.' };
    }

    return {
        success: true,
        verificationToken: inserted?.verification_token ?? undefined,
    };
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
