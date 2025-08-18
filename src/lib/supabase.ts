import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Extended type for Supabase client with schema method
export type SupabaseClientWithSchema = SupabaseClient<Database> & {
  schema: (schemaName: string) => SupabaseClient<Database>;
};

let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Return a mock client for development without Supabase
      return null;
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'spinawheel'
      },
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
      if (prop === 'from') {
        return () => {
          const mockQueryBuilder = {
            select: function() { 
              return {...this, 
                then: (resolve: any) => resolve({ data: null, error: new Error('Mock mode - Supabase not configured') }),
                single: function() {
                  return Promise.resolve({ data: null, error: new Error('Mock mode - Supabase not configured') });
                }
              };
            },
            insert: function() {
              return {
                ...this,
                select: function() {
                  return {
                    ...this,
                    single: function() {
                      return Promise.resolve({ data: null, error: new Error('Mock mode - Supabase not configured') });
                    },
                    then: (resolve: any) => resolve({ data: [], error: new Error('Mock mode - Supabase not configured') })
                  };
                },
                then: (resolve: any) => resolve({ data: null, error: null })
              };
            },
            update: function() {
              return {
                ...this,
                select: function() {
                  return {
                    ...this,
                    single: function() {
                      return Promise.resolve({ data: null, error: new Error('Mock mode - Supabase not configured') });
                    },
                    then: (resolve: any) => resolve({ data: [], error: new Error('Mock mode - Supabase not configured') })
                  };
                },
                then: (resolve: any) => resolve({ data: null, error: null })
              };
            },
            delete: () => Promise.resolve({ data: null, error: null }),
            eq: function() { return this; },
            limit: function() { return this; },
            single: function() { 
              return Promise.resolve({ data: null, error: new Error('Mock mode - Supabase not configured') });
            }
          };
          return mockQueryBuilder;
        };
      }
      // Mock auth object for when Supabase is not configured
      if (prop === 'auth') {
        return {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: (callback: any) => {
            // Call the callback immediately with null session
            if (callback) {
              callback('INITIAL_SESSION', null);
            }
            // Return unsubscribe function
            return { data: { subscription: { unsubscribe: () => {} } } };
          },
          signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
          signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
          signOut: () => Promise.resolve({ error: null }),
          resetPasswordForEmail: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          updateUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        };
      }
      return () => Promise.resolve({ data: null, error: null });
    }
    return client[prop as keyof SupabaseClient<Database>];
  }
});

// Export typed version with schema support (cast to any when using .schema())
export const supabaseWithSchema = supabase as any;