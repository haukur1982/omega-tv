import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Lazy clients. The previous module-level createClient() with `!` assertions
// crashed `next build` whenever the Supabase env vars weren't present in the
// build environment (they live in local .env.local, so it passed locally but
// failed on Vercel preview builds). Deferring construction to first use means
// the build never needs the env — only the request that actually queries does.
function makeClient(serviceRole: boolean): SupabaseClient<Database> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
        throw new Error(
            'Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and ' +
            'NEXT_PUBLIC_SUPABASE_ANON_KEY.',
        );
    }
    const key = serviceRole
        ? process.env.SUPABASE_SERVICE_ROLE_KEY || anon
        : anon;
    return createClient<Database>(url, key);
}

function lazyClient(serviceRole: boolean): SupabaseClient<Database> {
    let real: SupabaseClient<Database> | null = null;
    return new Proxy({} as SupabaseClient<Database>, {
        get(_target, prop, receiver) {
            real ??= makeClient(serviceRole);
            const value = Reflect.get(real as object, prop, receiver);
            return typeof value === 'function' ? value.bind(real) : value;
        },
    });
}

// Public client — respects RLS, used for client-side and public reads
export const supabase = lazyClient(false);

// Admin client — bypasses RLS, server-side only (API routes, server actions)
export const supabaseAdmin = lazyClient(true);

