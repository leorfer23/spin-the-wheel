/**
 * Test script to fetch coupons using the proxy
 * Run with: node test-coupons-fetch.js
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://ufliwvyssoqqbejydyjg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGl3dnlzc29xcWJlanlkeWpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTY1MTU4OCwiZXhwIjoyMDY3MjI3NTg4fQ.PItcPs_CP4Wu46RLDPa5FObfCNPmPBpieKjIxg4-NfE',
  {
    db: {
      schema: 'spinawheel'
    }
  }
);

async function testCouponFetch() {
  console.log('🔍 Fetching TiendaNube integration data...');
  
  // Get the integration data
  const { data: integrations, error } = await supabase
    .from('store_integrations')
    .select('*')
    .eq('platform', 'tienda_nube')
    .eq('status', 'active');

  if (error || !integrations || integrations.length === 0) {
    console.error('❌ No active integrations found:', error);
    return;
  }

  console.log(`📋 Found ${integrations.length} active integration(s). Testing the first one...`);
  const integration = integrations[0];

  console.log('✅ Found integration:', {
    store_id: integration.store_id,
    platform_store_id: integration.platform_store_id,
    has_token: !!integration.access_token
  });

  // Now test the proxy
  const proxyUrl = `http://localhost:3001/api/tiendanube/proxy/${integration.platform_store_id}/coupons?per_page=5`;
  
  console.log('\n🌐 Testing proxy endpoint:', proxyUrl);
  
  try {
    const response = await fetch(proxyUrl, {
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📨 Response status:', response.status, response.statusText);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success! Found ${Array.isArray(data) ? data.length : 0} coupons:`);
      if (Array.isArray(data)) {
        data.forEach((coupon, index) => {
          console.log(`\n📎 Coupon ${index + 1}:`, {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            valid: coupon.valid,
            used: coupon.used,
            max_uses: coupon.max_uses
          });
        });
      }
    } else {
      console.error('❌ Proxy request failed:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run the test
testCouponFetch().catch(console.error);