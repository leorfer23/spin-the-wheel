/**
 * Test endpoint for debugging TiendaNube integration
 * Access at: http://localhost:5174/api/tiendanube/test
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  {
    db: {
      schema: 'spinawheel'
    }
  }
);

export default async function handler(req, res) {
  // Enable CORS for local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔍 Test endpoint hit!');
  console.log('Environment check:', {
    hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
    hasServiceKey: !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    hasTiendaNubeId: !!process.env.VITE_TIENDANUBE_APP_ID,
    hasTiendaNubeSecret: !!process.env.VITE_TIENDANUBE_CLIENT_SECRET,
  });

  try {
    // Test 1: Check if we can connect to Supabase
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id, store_name')
      .limit(1);

    // Test 2: Check for TiendaNube integrations
    const { data: integrations, error: intError } = await supabase
      .from('store_integrations')
      .select('store_id, platform_store_id, status')
      .eq('platform', 'tienda_nube')
      .eq('status', 'active')
      .limit(1);

    return res.json({
      success: true,
      message: 'Test endpoint working!',
      tests: {
        supabase: {
          connected: !storeError,
          error: storeError?.message,
          hasStores: stores?.length > 0
        },
        tiendanube: {
          hasIntegrations: integrations?.length > 0,
          integration: integrations?.[0] || null,
          error: intError?.message
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          isLocal: !process.env.VERCEL_ENV
        }
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}