#!/usr/bin/env node

/**
 * Local test script for OAuth callback flow
 * This mimics what happens in production when TiendaNube redirects back
 * Usage: node test-oauth-callback-local.cjs
 */

const http = require('http');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test Supabase connection
async function testSupabaseConnection() {
  log('\n=== Testing Supabase Connection ===', 'blue');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    log('✗ Missing Supabase configuration', 'red');
    log(`  VITE_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}`, 'red');
    log(`  VITE_SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'Set' : 'Missing'}`, 'red');
    return null;
  }
  
  log('✓ Supabase configuration found', 'green');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  // Test connection
  try {
    const { data, error } = await supabase
      .schema('spinawheel')
      .from('stores')
      .select('count')
      .limit(1);
    
    if (error) {
      log('✗ Supabase connection failed:', 'red');
      log(`  ${JSON.stringify(error)}`, 'red');
      return null;
    }
    
    log('✓ Supabase connection successful', 'green');
    return supabase;
  } catch (e) {
    log(`✗ Supabase connection error: ${e.message}`, 'red');
    return null;
  }
}

// Test store creation
async function testStoreCreation(supabase) {
  log('\n=== Testing Store Creation ===', 'blue');
  
  // Create test data similar to OAuth callback
  const testUserId = 'test-user-' + Date.now(); // Unique test user ID
  const testStoreName = 'Test Store ' + new Date().toISOString();
  
  const storeData = {
    user_id: testUserId,
    store_name: testStoreName,
    platform: 'tienda_nube',
    store_url: 'https://test-store.tiendanube.com',
    plan_tier: 'free',
    is_active: true,
  };
  
  log('Attempting to create store with data:', 'yellow');
  console.log(storeData);
  
  try {
    const { data: newStore, error: storeError } = await supabase
      .schema('spinawheel')
      .from('stores')
      .insert(storeData)
      .select()
      .single();
    
    if (storeError) {
      log('✗ Store creation failed:', 'red');
      log(`  Error: ${JSON.stringify(storeError, null, 2)}`, 'red');
      
      // Try to extract meaningful error info
      if (storeError.message) log(`  Message: ${storeError.message}`, 'red');
      if (storeError.details) log(`  Details: ${storeError.details}`, 'red');
      if (storeError.hint) log(`  Hint: ${storeError.hint}`, 'red');
      if (storeError.code) log(`  Code: ${storeError.code}`, 'red');
      
      return null;
    }
    
    log('✓ Store created successfully!', 'green');
    log(`  Store ID: ${newStore.id}`, 'green');
    log(`  Store Name: ${newStore.store_name}`, 'green');
    
    return newStore;
  } catch (e) {
    log(`✗ Store creation exception: ${e.message}`, 'red');
    return null;
  }
}

// Test store integration creation
async function testIntegrationCreation(supabase, storeId) {
  log('\n=== Testing Integration Creation ===', 'blue');
  
  const integrationData = {
    store_id: storeId,
    platform: 'tienda_nube',
    access_token: 'test-token-' + Date.now(),
    refresh_token: null,
    platform_store_id: '12345',
    platform_store_name: 'Test Store',
    platform_store_domain: 'test.tiendanube.com',
    platform_store_email: 'test@example.com',
    platform_metadata: {
      test: true,
      created_at: new Date().toISOString()
    },
    status: 'active',
    last_sync_at: new Date().toISOString(),
  };
  
  log('Attempting to create integration with data:', 'yellow');
  console.log(integrationData);
  
  try {
    const { data: integration, error: integrationError } = await supabase
      .schema('spinawheel')
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
      log('✗ Integration creation failed:', 'red');
      log(`  Error: ${JSON.stringify(integrationError, null, 2)}`, 'red');
      return null;
    }
    
    log('✓ Integration created successfully!', 'green');
    log(`  Integration ID: ${integration.id}`, 'green');
    
    return integration;
  } catch (e) {
    log(`✗ Integration creation exception: ${e.message}`, 'red');
    return null;
  }
}

// Clean up test data
async function cleanupTestData(supabase, storeId) {
  log('\n=== Cleaning Up Test Data ===', 'blue');
  
  if (!storeId) {
    log('No store ID to clean up', 'yellow');
    return;
  }
  
  try {
    // Delete integration first
    const { error: integrationDeleteError } = await supabase
      .schema('spinawheel')
      .from('store_integrations')
      .delete()
      .eq('store_id', storeId);
    
    if (integrationDeleteError) {
      log(`⚠ Failed to delete integration: ${integrationDeleteError.message}`, 'yellow');
    } else {
      log('✓ Test integration deleted', 'green');
    }
    
    // Delete store
    const { error: storeDeleteError } = await supabase
      .schema('spinawheel')
      .from('stores')
      .delete()
      .eq('id', storeId);
    
    if (storeDeleteError) {
      log(`⚠ Failed to delete store: ${storeDeleteError.message}`, 'yellow');
    } else {
      log('✓ Test store deleted', 'green');
    }
  } catch (e) {
    log(`⚠ Cleanup error: ${e.message}`, 'yellow');
  }
}

// Test the full OAuth callback flow
async function testOAuthCallbackFlow() {
  log('\n=== Testing Full OAuth Callback Flow (Mimicking Production) ===', 'cyan');
  
  // Create mock OAuth state (what TiendaNube sends back)
  const mockState = Buffer.from(JSON.stringify({
    storeId: '', // Empty like in real flow
    storeName: 'Mi Tienda',
    userId: 'test-user-' + Date.now(),
    platform: 'tiendanube'
  })).toString('base64');
  
  const mockCode = 'mock-auth-code-' + Date.now();
  
  log('Mock OAuth state:', 'yellow');
  log(`  Encoded: ${mockState}`, 'yellow');
  log(`  Decoded: ${Buffer.from(mockState, 'base64').toString('utf-8')}`, 'yellow');
  log(`  Code: ${mockCode}`, 'yellow');
  
  // Make request to local OAuth callback endpoint
  return new Promise((resolve) => {
    const callbackUrl = `http://localhost:3000/api/integrations/callback?code=${mockCode}&state=${mockState}`;
    
    log('\nCalling OAuth callback endpoint...', 'cyan');
    log(`URL: ${callbackUrl}`, 'yellow');
    
    http.get(callbackUrl, (res) => {
      log(`\nCallback response:`, 'cyan');
      log(`  Status: ${res.statusCode}`, res.statusCode === 302 ? 'green' : 'yellow');
      log(`  Location: ${res.headers.location || 'N/A'}`, 'yellow');
      
      if (res.statusCode === 302) {
        const location = res.headers.location;
        if (location) {
          if (location.includes('integration_success')) {
            log('✓ OAuth flow completed successfully!', 'green');
          } else if (location.includes('integration_error')) {
            const errorMatch = location.match(/integration_error=([^&]+)/);
            const errorMsg = errorMatch ? decodeURIComponent(errorMatch[1]) : 'Unknown error';
            log(`✗ OAuth flow failed: ${errorMsg}`, 'red');
          }
        }
      }
      
      resolve();
    }).on('error', (e) => {
      log(`✗ Callback request failed: ${e.message}`, 'red');
      resolve();
    });
  });
}

// Main test runner
async function runTests() {
  log('OAuth Callback Production Simulation Test', 'magenta');
  log('==========================================', 'magenta');
  
  // Test Supabase connection
  const supabase = await testSupabaseConnection();
  if (!supabase) {
    log('\n✗ Cannot proceed without Supabase connection', 'red');
    log('Make sure your .env file has:', 'yellow');
    log('  VITE_SUPABASE_URL', 'yellow');
    log('  VITE_SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    process.exit(1);
  }
  
  let testStoreId = null;
  
  try {
    // Test store creation (what fails in production)
    const store = await testStoreCreation(supabase);
    if (store) {
      testStoreId = store.id;
      
      // Test integration creation
      await testIntegrationCreation(supabase, store.id);
    }
    
    // Test full OAuth callback flow
    await testOAuthCallbackFlow();
    
  } finally {
    // Clean up test data
    if (testStoreId) {
      await cleanupTestData(supabase, testStoreId);
    }
  }
  
  log('\n==========================================', 'magenta');
  log('Test Complete', 'magenta');
  
  log('\nSummary:', 'blue');
  log('1. If store creation succeeded locally but fails in production:', 'blue');
  log('   - Check that Vercel has VITE_SUPABASE_SERVICE_ROLE_KEY set correctly', 'yellow');
  log('   - The service role key might be wrong or missing in production', 'yellow');
  log('2. If store creation failed locally too:', 'blue');
  log('   - Check the error message above', 'yellow');
  log('   - Might be a database schema or RLS policy issue', 'yellow');
  log('3. Check Vercel function logs for detailed error messages', 'blue');
}

// Check if we can connect to localhost:3000
log('Checking if Vercel dev server is running...', 'cyan');
http.get('http://localhost:3000', (res) => {
  log('✓ Vercel dev server is running', 'green');
  runTests();
}).on('error', (e) => {
  log('✗ Vercel dev server is not running', 'red');
  log('You can still run Supabase tests without it', 'yellow');
  runTests();
});