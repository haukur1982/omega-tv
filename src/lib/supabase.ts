import { createClient } from '@supabase/supabase-js';

// Keys provided by user (Public/Safe for client-side use)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ucpwhwyaqhyihukqrieo.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_5xGSoUAgePzmJJRetn8KQw_e_g-f1Ay";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
