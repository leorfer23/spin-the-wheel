import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  try {
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Try to fetch from wheels table
    const { data: wheels, error: wheelsError, status, statusText } = await supabase
      .from('wheels')
      .select('*')
      .limit(1);

    // Try with public schema (should fail)
    const { data: wheelsPublic, error: publicError } = await supabase
      .from('public.wheels')
      .select('*')
      .limit(1);

    return {
      auth: { user, error: authError },
      wheelsQuery: { data: wheels, error: wheelsError, status, statusText },
      publicQuery: { data: wheelsPublic, error: publicError }
    };
  } catch (error) {
    throw error;
  }
}

// Add this to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}