import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// createClient will use environment variables if they exist (for production on Vercel),
// or fall back to placeholder values if they don't (for the development environment).
// This prevents the app from crashing on startup and allows the login screen to be displayed.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
