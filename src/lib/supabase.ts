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
    let key = anon;
    if (serviceRole) {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceKey) {
            key = serviceKey;
        } else {
            // Fall back to anon so the build/runtime doesn't hard-crash, but make
            // it LOUD: with the anon key, supabaseAdmin is silently subject to RLS,
            // so admin writes (intake, publish, moderation) fail in confusing ways.
            // This must never be missing in production.
            console.error(
                '[supabase] SUPABASE_SERVICE_ROLE_KEY is missing — supabaseAdmin is ' +
                'falling back to the anon key and will be blocked by RLS. Set this env ' +
                'var (locally in .env.local, and on Vercel) for admin operations to work.',
            );
        }
    }
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

