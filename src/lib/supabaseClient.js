import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// On the server side (API routes), use the service_role key to bypass RLS.
// On the client side, fall back to the anon key (which is blocked by RLS policies).
// The service_role key is a server-only secret — it is NEVER exposed to the browser.
const isServer = typeof window === 'undefined';
const supabaseKey = (isServer && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : supabaseAnonKey;

// Create a singleton client. If keys are not configured yet, it will fail gracefully
// when called, or fallback safely during build.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        // Disable auto-refresh and session persistence since we use our own JWT auth
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null;

/**
 * Helper to ensure Supabase client is initialized.
 * Throws a clear error if credentials are not filled in yet.
 */
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.');
  }
  return supabase;
}

