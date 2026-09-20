import type { SupabaseClient } from '@supabase/supabase-js';

export type UnsubscribeList = 'all' | 'devotionals';

/** A concurrent signup must not be lost when removing one topic. */
export async function removeSubscription(db: SupabaseClient, token: string, list: UnsubscribeList) {
    if (list === 'all') {
        const { error } = await db.from('subscribers').delete().eq('unsubscribe_token', token);
        if (error) throw new Error('Unsubscribe could not be saved');
        return;
    }
    for (let attempt = 0; attempt < 4; attempt++) {
        const { data, error } = await db.from('subscribers').select('id,segments').eq('unsubscribe_token', token).maybeSingle();
        if (error) throw new Error('Could not check subscription');
        const oldSegments: string[] = data?.segments ?? [];
        if (!data || !oldSegments.includes(list)) return;
        const remaining = oldSegments.filter(segment => segment !== list);
        const mutation = remaining.length ? db.from('subscribers').update({ segments: remaining })
            : db.from('subscribers').delete();
        const { data: saved, error: saveError } = await mutation
            .eq('id', data.id).eq('unsubscribe_token', token)
            .eq('segments', `{${oldSegments.map(s => JSON.stringify(s)).join(',')}}`).select('id');
        if (saveError) throw new Error('Unsubscribe could not be saved');
        if (saved?.length) return;
    }
    throw new Error('Subscription changed during unsubscribe; retry required');
}
