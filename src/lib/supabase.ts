import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Omega TV Platform - Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jmwavmhbdsqmmxypnyis.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2F2bWhiZHNxbW14eXBueWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwOTc2MjQsImV4cCI6MjA4MjY3MzYyNH0._UY5Dgz6kHvvnl_Np7Kq4tRNo8hna5h-Z5hq07Bge64";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

