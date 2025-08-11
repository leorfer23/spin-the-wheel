import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Test Supabase query directly
async function testQuery() {
  console.log('Testing Supabase query for store 6545032...\n');
  
  // Test with ANON key first
  console.log('1. Testing with ANON key:');
  const supabaseAnon = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    {
      db: { schema: 'spinawheel' }
    }
  );
  
  const { data: anonData, error: anonError } = await supabaseAnon
    .from('wheels')
    .select('id, name, tiendanube_store_id, is_active')
    .eq('tiendanube_store_id', '6545032');
  
  console.log('Anon query result:', { 
    error: anonError, 
    dataCount: anonData?.length || 0,
    data: anonData 
  });
  
  // Test with SERVICE ROLE key
  console.log('\n2. Testing with SERVICE ROLE key:');
  const supabaseService = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SERVICE_ROLE_KEY,
    {
      db: { schema: 'spinawheel' },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  const { data: serviceData, error: serviceError } = await supabaseService
    .from('wheels')
    .select('id, name, tiendanube_store_id, is_active')
    .eq('tiendanube_store_id', '6545032');
  
  console.log('Service role query result:', { 
    error: serviceError, 
    dataCount: serviceData?.length || 0,
    data: serviceData 
  });
  
  // Test getting ALL wheels with service role to see what's there
  console.log('\n3. Getting sample of ALL wheels with service role:');
  const { data: allWheels, error: allError } = await supabaseService
    .from('wheels')
    .select('id, name, tiendanube_store_id, is_active')
    .limit(5);
  
  console.log('All wheels sample:', { 
    error: allError, 
    dataCount: allWheels?.length || 0,
    data: allWheels?.map(w => ({
      name: w.name,
      store_id: w.tiendanube_store_id,
      store_id_type: typeof w.tiendanube_store_id,
      is_active: w.is_active
    }))
  });
  
  // Test with explicit schema
  console.log('\n4. Testing with explicit schema() call:');
  const { data: schemaData, error: schemaError } = await supabaseService
    .schema('spinawheel')
    .from('wheels')
    .select('id, name, tiendanube_store_id, is_active')
    .eq('tiendanube_store_id', '6545032');
  
  console.log('Explicit schema query result:', { 
    error: schemaError, 
    dataCount: schemaData?.length || 0,
    data: schemaData 
  });
  
  // Test with different variations of the store ID
  console.log('\n5. Testing different store ID formats:');
  
  // As number
  const { data: numData } = await supabaseService
    .schema('spinawheel')
    .from('wheels')
    .select('id, name, tiendanube_store_id')
    .eq('tiendanube_store_id', 6545032);
  console.log('As number (6545032):', numData?.length || 0, 'results');
  
  // With spaces
  const { data: spaceData } = await supabaseService
    .schema('spinawheel')
    .from('wheels')
    .select('id, name, tiendanube_store_id')
    .eq('tiendanube_store_id', ' 6545032 ');
  console.log('With spaces (" 6545032 "):', spaceData?.length || 0, 'results');
  
  // Using LIKE operator
  const { data: likeData } = await supabaseService
    .schema('spinawheel')
    .from('wheels')
    .select('id, name, tiendanube_store_id')
    .like('tiendanube_store_id', '%6545032%');
  console.log('Using LIKE (%6545032%):', likeData?.length || 0, 'results');
  
  // Check if we can see ANY data at all
  console.log('\n6. Can we see ANY wheels at all?');
  const { data: anyWheels, error: anyError } = await supabaseService
    .schema('spinawheel')
    .from('wheels')
    .select('tiendanube_store_id')
    .limit(10);
  
  console.log('Any wheels visible:', {
    error: anyError,
    count: anyWheels?.length || 0,
    storeIds: anyWheels?.map(w => w.tiendanube_store_id)
  });
  
  // Check stores table
  console.log('\n7. Checking stores table for this ID:');
  const { data: storeData, error: storeError } = await supabaseService
    .schema('spinawheel')
    .from('stores')
    .select('id, tiendanube_store_id, name')
    .eq('tiendanube_store_id', '6545032');
  console.log('Store data:', { error: storeError, data: storeData });
  
  console.log('\n8. Environment check:');
  console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  console.log('SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
  
  // Test without schema specification
  console.log('\n9. Testing WITHOUT schema specification:');
  const supabaseNoSchema = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  const { data: noSchemaData, error: noSchemaError } = await supabaseNoSchema
    .from('spinawheel.wheels')  // Try with schema in table name
    .select('id, name, tiendanube_store_id')
    .eq('tiendanube_store_id', '6545032');
  
  console.log('Query with schema in table name:', {
    error: noSchemaError,
    count: noSchemaData?.length || 0,
    data: noSchemaData
  });
}

testQuery().catch(console.error);