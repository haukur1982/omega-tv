import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import { removeSubscription } from '@/lib/subscription-unsubscribe';
import { unsubscribeHandlers } from '@/lib/unsubscribe-response';

// GET only shows the confirmation. POST handles the reader or RFC 8058 request.
const handlers = unsubscribeHandlers((token, list) => removeSubscription(supabaseAdmin as unknown as SupabaseClient, token, list));
export const GET = handlers.GET;
export const POST = handlers.POST;
