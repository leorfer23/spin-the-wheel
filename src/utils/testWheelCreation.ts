import { supabase } from '../lib/supabase';

export async function testWheelCreation() {
  console.log('=== Testing Wheel Creation ===');
  
  try {
    // 1. Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('1. Auth test:', { userId: user?.id, authError });
    
    if (!user) {
      console.error('Not authenticated!');
      return;
    }
    
    // 2. Test direct table access
    console.log('2. Testing direct table access...');
    const { data: testSelect, error: selectError } = await supabase
      .from('spinawheel.wheels' as any)
      .select('id')
      .limit(1);
    console.log('Direct select result:', { data: testSelect, error: selectError });
    
    // 3. Test store access
    console.log('3. Testing store access...');
    const { data: stores, error: storesError } = await supabase
      .from('spinawheel.stores' as any)
      .select('*');
    console.log('Stores:', { count: stores?.length, error: storesError });
    
    if (!stores || stores.length === 0) {
      console.log('No stores found. Creating a test store...');
      const { data: newStore, error: createStoreError } = await supabase
        .from('spinawheel.stores' as any)
        .insert({
          user_id: user.id,
          store_name: 'Test Store',
          platform: 'custom',
          store_url: 'https://test.example.com',
          plan_tier: 'free'
        })
        .select()
        .single();
      
      console.log('Store creation result:', { store: newStore, error: createStoreError });
      
      if (newStore) {
        stores?.push(newStore);
      }
    }
    
    // 4. Test wheel creation with a real store
    if (stores && stores.length > 0) {
      const storeId = stores[0].id;
      console.log('4. Testing wheel creation with store:', storeId);
      
      const wheelId = crypto.randomUUID();
      
      const { data: wheel, error: wheelError } = await supabase
        .from('spinawheel.wheels' as any)
        .insert({
          id: wheelId,
          tiendanube_store_id: storeId,
          name: 'Test Wheel',
          segments_config: [
            { id: '1', label: 'Test', value: 'TEST', color: '#FF0000', weight: 1 }
          ],
          style_config: {},
          wheel_handle_config: {},
          email_capture_config: {},
          schedule_config: {
            enabled: false,
            timezone: 'UTC',
            weekDays: { enabled: false, days: [0, 1, 2, 3, 4, 5, 6] },
            dateRange: { startDate: null, endDate: null },
            timeSlots: { enabled: false, slots: [] },
            specialDates: { blacklistDates: [], whitelistDates: [] }
          },
          is_active: true
        })
        .select()
        .single();
      
      console.log('Wheel creation result:', { wheel, error: wheelError });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testWheelCreation = testWheelCreation;
}