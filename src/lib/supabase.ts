import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables! Check your Vercel/Environment Settings.');
    // We don't throw here to avoid a total "black screen" crash on first load
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

