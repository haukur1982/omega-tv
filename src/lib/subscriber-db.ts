import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase';

const sb = supabaseAdmin as unknown as SupabaseClient;

export interface Subscriber {
    id: string;
    email: string;
    name?: string;
    segments: string[];
    isVerified: boolean;
    createdAt: string;
}

/** Add an opt-in without losing existing lists, including concurrent signups. */
export async function addSubscriber(
    email: string,
    name?: string,
    segments: string[] = ['newsletter'],
    consent?: { textVersion?: string; source?: string }
): Promise<{ success: boolean; error?: string; alreadyOnList?: boolean }> {
    const normalizedEmail = email.trim().toLowerCase();
    const failure = { success: false, error: 'Ekki tókst að skrá netfangið. Reyndu aftur.' };
    const now = new Date().toISOString();
    const consentFields = {
        consent_given_at: now,
        consent_source: consent?.source || segments[0],
        consent_text_version: consent?.textVersion || null,
    };
    for (let attempt = 0; attempt < 4; attempt++) {
        const { data: existing, error: lookupError } = await sb.from('subscribers')
            .select('id, segments').eq('email', normalizedEmail).maybeSingle();
        if (lookupError) {
            console.error('Subscriber lookup failed:', lookupError.code);
            return failure;
        }
        if (existing) {
            const oldSegments: string[] = existing.segments ?? [];
            if (segments.every(segment => oldSegments.includes(segment))) {
                return { success: true, alreadyOnList: true };
            }
            let update = sb.from('subscribers').update({
                segments: [...new Set([...oldSegments, ...segments])],
                ...consentFields,
            }).eq('id', existing.id);
            // Compare-and-swap: a parallel signup must never overwrite a list.
            update = existing.segments === null ? update.is('segments', null)
                : update.eq('segments', `{${oldSegments.map(s => JSON.stringify(s)).join(',')}}`);
            const { data: saved, error } = await update.select('id');
            if (error) {
                console.error('Subscriber update failed:', error.code);
                return failure;
            }
            if (saved?.length) return { success: true };
            continue;
        }
        const { error } = await sb.from('subscribers').insert({
            email: normalizedEmail,
            name: name || null,
            segments,
            // Existing collect-mode: form consent, not mailbox verification.
            is_verified: true,
            verified_at: now,
            ...consentFields,
        });
        if (!error) return { success: true };
        if (error.code === '23505') continue; // Another request inserted this email.
        console.error('Subscriber insert failed:', error.code);
        return failure;
    }
    return failure;
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

    return (data || []).map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name ?? undefined,
        segments: row.segments || [],
        isVerified: row.is_verified ?? false,
        createdAt: row.created_at ?? ""
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
