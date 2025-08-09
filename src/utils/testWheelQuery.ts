import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ufliwvyssoqqbejydyjg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGl3dnlzc29xcWJlanlkeWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTE1ODgsImV4cCI6MjA2NzIyNzU4OH0.irrZRHA9gWU5g7ep0wspJII5k0zkhrYVR_PBJDDmylI';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function testWheelQuery() {
  const storeId = '6545032';
  
  console.log('Testing database connection for store:', storeId);
  console.log('=====================================');
  
  try {
    // Test 1: Check if we can connect to the database
    const { error: connectionError } = await supabase
      .from('wheels')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');
    
    // Test 1.5: Query ALL wheels to see what's in the database
    const { data: allWheelsInDB, error: allError } = await supabase
      .from('wheels')
      .select('id, name, is_active, tiendanube_store_id, created_at')
      .limit(10);
    
    if (!allError && allWheelsInDB) {
      console.log(`\n📊 Total wheels in database (first 10):`);
      allWheelsInDB.forEach(wheel => {
        console.log(`  - ${wheel.name} (Store ID: ${wheel.tiendanube_store_id}, Active: ${wheel.is_active})`);
      });
    }
    
    // Test 2: Query ALL wheels for this store (not just active)
    const { data: allWheels, error: allWheelsError } = await supabase
      .from('wheels')
      .select('id, name, is_active, tiendanube_store_id, created_at')
      .eq('tiendanube_store_id', storeId);
    
    if (allWheelsError) {
      console.error('❌ Error querying all wheels:', allWheelsError);
    } else {
      console.log(`\n📊 Found ${allWheels?.length || 0} total wheels for store ${storeId}:`);
      allWheels?.forEach(wheel => {
        console.log(`  - ${wheel.name} (ID: ${wheel.id})`);
        console.log(`    Active: ${wheel.is_active}`);
        console.log(`    Store ID: ${wheel.tiendanube_store_id}`);
        console.log(`    Created: ${wheel.created_at}`);
      });
    }
    
    // Test 3: Query specifically for active wheels
    const { data: activeWheels, error: activeWheelsError } = await supabase
      .from('wheels')
      .select('*')
      .eq('tiendanube_store_id', storeId)
      .eq('is_active', true);
    
    if (activeWheelsError) {
      console.error('❌ Error querying active wheels:', activeWheelsError);
    } else {
      console.log(`\n🎯 Found ${activeWheels?.length || 0} active wheels for store ${storeId}`);
      if (activeWheels && activeWheels.length > 0) {
        const wheel = activeWheels[0];
        console.log('\n🎡 Active wheel details:');
        console.log(`  Name: ${wheel.name}`);
        console.log(`  ID: ${wheel.id}`);
        console.log(`  Segments: ${wheel.segments_config?.length || 0}`);
        console.log(`  Has style config: ${!!wheel.style_config}`);
        console.log(`  Has handle config: ${!!wheel.handle_config}`);
      }
    }
    
    // Test 4: Try the exact query from devServer.ts
    const { data: wheel, error } = await supabase
      .from('wheels')
      .select('*')
      .eq('tiendanube_store_id', storeId)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    console.log('\n🔍 Dev server query result:');
    if (error) {
      console.error('❌ Error:', error);
    } else if (wheel) {
      console.log('✅ Wheel found successfully!');
      console.log(`  Name: ${wheel.name}`);
      console.log(`  ID: ${wheel.id}`);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWheelQuery().then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  });
}