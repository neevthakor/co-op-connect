import { createClient, SupabaseClient } from '@supabase/supabase-js';

// We do NOT throw at module evaluation to prevent crashing unrelated pages
// that might statically or dynamically import this module.

let _supabaseAdmin: SupabaseClient | null = null;

export const getSupabaseAdmin = () => {
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not configured. Please ensure it is set in your .env file and restart the dev server.");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return _supabaseAdmin;
};

// Use a Proxy to allow transparent usage of `supabaseAdmin.storage` etc.
// It will lazily initialize and throw only when a property is accessed.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  }
});
