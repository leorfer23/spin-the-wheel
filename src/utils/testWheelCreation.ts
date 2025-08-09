import { supabase } from '../lib/supabase';

export async function testWheelCreation() {
  try {
    // 1. Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // 2. Test direct table access
    const { data: testSelect, error: selectError } = await supabase
      .from('spinawheel.wheels' as any)
      .select('id')
      .limit(1);
    
    // 3. Test store access
    const { data: stores, error: storesError } = await supabase
      .from('spinawheel.stores' as any)
      .select('*');
    
    let storeList = stores || [];
    
    if (!stores || stores.length === 0) {
      const { data: newStore } = await supabase
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
      
      if (newStore) {
        storeList = [newStore];
      }
    }
    
    // 4. Test wheel creation with a real store
    if (storeList.length > 0) {
      const storeId = storeList[0].id;
      
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
      
      return { wheel, wheelError };
    }
    
    return { testSelect, selectError, stores: storeList, storesError, authError };
  } catch (error) {
    throw error;
  }
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testWheelCreation = testWheelCreation;
}