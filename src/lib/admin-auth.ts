import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Verify that the request is from an authenticated admin user.
 * 
 * Usage in API routes:
 * ```ts
 * export async function GET(request: Request) {
 *     const auth = await verifyAdminSession(request);
 *     if (auth.error) return auth.error;
 *     // ... proceed with authenticated logic
 * }
 * ```
 */
export async function verifyAdminSession(
    request: Request
): Promise<{ user: any; error?: never } | { user?: never; error: NextResponse }> {
    try {
        // Extract the Authorization header (Bearer token)
        const authHeader = request.headers.get('Authorization');
        const cookieHeader = request.headers.get('cookie');

        // Create a per-request Supabase client
        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    // Forward cookies for session-based auth
                    ...(cookieHeader ? { cookie: cookieHeader } : {}),
                    // Forward Bearer token if present
                    ...(authHeader ? { Authorization: authHeader } : {}),
                },
            },
        });

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return {
                error: NextResponse.json(
                    { error: 'Óheimilt. Vinsamlegast skráðu þig inn.' },
                    { status: 401 }
                ),
            };
        }

        return { user };
    } catch (e) {
        console.error('Admin auth verification failed:', e);
        return {
            error: NextResponse.json(
                { error: 'Villa við auðkenningu.' },
                { status: 500 }
            ),
        };
    }
}
