import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Server-side Supabase client that uses process.env instead of import.meta.env
let supabaseServerInstance: SupabaseClient<Database> | null = null;

export function getServerSupabaseClient() {
  if (!supabaseServerInstance) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Server Supabase] Missing environment variables');
      return null;
    }

    supabaseServerInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
  
  return supabaseServerInstance;
}

export const supabaseServer = getServerSupabaseClient();