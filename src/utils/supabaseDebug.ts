import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth status:', user ? 'Authenticated' : 'Not authenticated', authError);

    // Test schema access
    console.log('Testing spinawheel schema access...');
    
    // Try to fetch from wheels table
    const { data: wheels, error: wheelsError, status, statusText } = await supabase
      .from('wheels')
      .select('*')
      .limit(1);
    
    console.log('Wheels query result:', {
      data: wheels,
      error: wheelsError,
      status,
      statusText,
      errorDetails: wheelsError ? {
        message: wheelsError.message,
        details: (wheelsError as any).details,
        hint: (wheelsError as any).hint,
        code: (wheelsError as any).code
      } : null
    });

    // Try with public schema (should fail)
    console.log('Testing with public schema (should fail)...');
    const { data: wheelsPublic, error: publicError } = await supabase
      .from('public.wheels')
      .select('*')
      .limit(1);
    
    console.log('Public schema query result:', {
      data: wheelsPublic,
      error: publicError
    });

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Add this to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}