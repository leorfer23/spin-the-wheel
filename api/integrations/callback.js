const { TiendaNubeAuthService } = require('../lib/tiendaNubeAuth');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration check failed:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'set' : 'missing',
      VITE_SUPABASE_SERVICE_ROLE_KEY: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing'
    });
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tiendaNubeAuth = new TiendaNubeAuthService();
    const supabase = getSupabaseClient();
    
    const { code, state, error } = req.query;

    if (error) {
      // Redirect to dashboard with error
      return res.redirect(302, `/dashboard?integration_error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect(302, '/dashboard?integration_error=missing_params');
    }

    // Decode state from base64
    let stateData;
    try {
      const decodedState = Buffer.from(state, 'base64').toString('utf-8');
      stateData = JSON.parse(decodedState);
    } catch (e) {
      console.error('Failed to decode state:', e);
      return res.redirect(302, '/dashboard?integration_error=invalid_state');
    }

    const { storeName, storeId, userId } = stateData;

    // Exchange code for token
    console.log('Exchanging code for token...');
    const tokenData = await tiendaNubeAuth.exchangeCodeForToken(code);
    console.log('Token data received:', {
      user_id: tokenData.user_id,
      has_access_token: !!tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    });

    // Fetch store information
    let storeInfo;
    try {
      console.log('Attempting to fetch store info with user_id:', tokenData.user_id);
      storeInfo = await tiendaNubeAuth.fetchStoreInfo(
        tokenData.access_token,
        tokenData.user_id
      );
      console.log('Store info fetched successfully:', storeInfo);
    } catch (error) {
      console.error('Failed to fetch store info:', error);
      // Continue without store info
    }

    // Create or update store integration
    let finalStoreId = storeId;

    // If no store exists, create or find one
    if (!finalStoreId && userId) {
      const finalStoreName = storeInfo?.store_name || storeName || 'Mi Tienda';
      
      console.log('Looking for existing store or creating new one:', {
        user_id: userId,
        store_name: finalStoreName,
        platform: 'tienda_nube',
      });

      // First, check if a store already exists for this user and store name
      const { data: existingStore } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .eq('store_name', finalStoreName)
        .single();

      if (existingStore) {
        console.log('Found existing store:', existingStore);
        finalStoreId = existingStore.id;
        
        // Update the existing store with new information
        const { error: updateError } = await supabase
          .from('stores')
          .update({
            platform: 'tienda_nube',
            store_url: storeInfo?.store_domain || existingStore.store_url || '',
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingStore.id);
          
        if (updateError) {
          console.error('Store update error:', updateError);
        }
      } else {
        // Create new store
        console.log('Creating new store...');
        const { data: newStore, error: storeError } = await supabase
          .from('stores')
          .insert({
            user_id: userId,
            store_name: finalStoreName,
            platform: 'tienda_nube',
            store_url: storeInfo?.store_domain || '',
            plan_tier: 'free',
            is_active: true,
          })
          .select()
          .single();

        if (storeError) {
          console.error('Store creation error:', storeError);
          throw new Error(`Failed to create store: ${storeError.message}`);
        }

        console.log('Store created successfully:', newStore);
        finalStoreId = newStore.id;
      }
    }

    // Create or update integration
    const integrationData = {
      store_id: finalStoreId,
      platform: 'tienda_nube',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      platform_store_id: tokenData.user_id?.toString() || null,
      platform_store_name: storeInfo?.store_name || null,
      platform_store_domain: storeInfo?.store_domain || null,
      platform_store_email: storeInfo?.store_email || null,
      platform_metadata: {
        ...storeInfo?.raw_data,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
      },
      status: 'active',
      last_sync_at: new Date().toISOString(),
    };

    console.log('Upserting integration for store:', finalStoreId);

    // Use upsert to handle both create and update cases
    const { data: integration, error: integrationError } = await supabase
      .from('store_integrations')
      .upsert(
        {
          ...integrationData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'store_id,platform'
        }
      )
      .select()
      .single();

    if (integrationError) {
      console.error('Integration upsert error:', integrationError);
      throw new Error(`Failed to create/update integration: ${integrationError.message}`);
    }

    console.log('Integration upserted successfully:', integration);

    // Update store with integration_id
    await supabase
      .from('stores')
      .update({
        integration_id: integration.id,
        store_url: storeInfo?.store_domain || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', finalStoreId);

    // Redirect to dashboard with success
    return res.redirect(302, `/dashboard?integration_success=true&store_id=${finalStoreId}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect(302, `/dashboard?integration_error=${encodeURIComponent(
      error instanceof Error ? error.message : 'callback_failed'
    )}`);
  }
};