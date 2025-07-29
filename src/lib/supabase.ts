import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase environment variables - using mock data mode');
      // Return a mock client for development without Supabase
      return null;
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  
  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return mock implementations for development
      console.warn(`Supabase client not initialized - mock mode for ${String(prop)}`);
      if (prop === 'from') {
        return () => ({
          select: () => Promise.resolve({ data: null, error: new Error('Mock mode - no data') }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
          eq: () => ({ 
            select: () => Promise.resolve({ data: null, error: new Error('Mock mode - no data') }),
            single: () => Promise.resolve({ data: null, error: new Error('Mock mode - no data') })
          })
        });
      }
      return () => Promise.resolve({ data: null, error: null });
    }
    return client[prop as keyof SupabaseClient<Database>];
  }
});