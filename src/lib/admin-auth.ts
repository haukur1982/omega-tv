import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Allowlist of admin emails. Set ADMIN_EMAILS (comma-separated) to override.
 * Defaults to the known Omega admin so the gate is closed even if the env var
 * is never set — no launch friction, but no "any logged-in user is admin" hole.
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'haukur1982@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

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

        // Authenticated — now authorize. A valid Supabase session is not enough;
        // the email must be on the admin allowlist.
        const email = user.email?.toLowerCase();
        if (!email || !ADMIN_EMAILS.includes(email)) {
            return {
                error: NextResponse.json(
                    { error: 'Aðgangur ekki heimill.' },
                    { status: 403 }
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
