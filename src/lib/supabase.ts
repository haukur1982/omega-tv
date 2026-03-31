import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — respects RLS, used for client-side and public reads
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — bypasses RLS, server-side only (API routes, server actions)
export const supabaseAdmin = createClient<Database>(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
);

