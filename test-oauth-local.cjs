#!/usr/bin/env node

/**
 * Local test script for OAuth flow
 * Usage: node test-oauth-local.js
 */

const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testOAuthInitiation() {
  log('\n=== Testing OAuth Initiation ===', 'blue');
  
  const testData = {
    platform: 'tiendanube',
    userId: 'test-user-123',
    storeName: 'Test Store',
    storeId: null
  };

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/integrations/oauth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(testData))
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            log('✓ OAuth initiation successful', 'green');
            log(`  Status: ${res.statusCode}`, 'green');
            log(`  Auth URL: ${response.authUrl}`, 'green');
            
            // Extract and decode state from URL
            const url = new URL(response.authUrl);
            const state = url.searchParams.get('state');
            if (state) {
              const decodedState = Buffer.from(state, 'base64').toString('utf-8');
              log(`  State (decoded): ${decodedState}`, 'yellow');
            }
            
            resolve(response);
          } else {
            log(`✗ OAuth initiation failed`, 'red');
            log(`  Status: ${res.statusCode}`, 'red');
            log(`  Error: ${JSON.stringify(response)}`, 'red');
            reject(new Error(`Status ${res.statusCode}: ${JSON.stringify(response)}`));
          }
        } catch (e) {
          log(`✗ Failed to parse response: ${e.message}`, 'red');
          log(`  Raw response: ${data}`, 'red');
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      log(`✗ Request failed: ${e.message}`, 'red');
      reject(e);
    });

    req.write(JSON.stringify(testData));
    req.end();
  });
}

async function testOAuthCallback() {
  log('\n=== Testing OAuth Callback (Mock) ===', 'blue');
  
  // Create a mock state
  const mockState = Buffer.from(JSON.stringify({
    storeId: 'test-store-id',
    storeName: 'Test Store',
    userId: 'test-user-123',
    platform: 'tiendanube'
  })).toString('base64');
  
  const mockCode = 'mock-auth-code-123';
  
  const callbackUrl = `http://localhost:3000/api/integrations/callback?code=${mockCode}&state=${mockState}`;
  
  log(`Mock callback URL: ${callbackUrl}`, 'yellow');
  log('Note: This will fail without valid TiendaNube credentials, but tests the endpoint is reachable', 'yellow');
  
  return new Promise((resolve) => {
    http.get(callbackUrl, (res) => {
      log(`✓ Callback endpoint responded`, 'green');
      log(`  Status: ${res.statusCode}`, 'green');
      log(`  Location: ${res.headers.location || 'N/A'}`, 'green');
      
      if (res.statusCode === 302) {
        const location = res.headers.location;
        if (location && location.includes('integration_error')) {
          log('  Expected error (no valid token exchange)', 'yellow');
        }
      }
      
      resolve();
    }).on('error', (e) => {
      log(`✗ Callback test failed: ${e.message}`, 'red');
      resolve(); // Don't fail the whole test
    });
  });
}

async function checkEnvironmentVariables() {
  log('\n=== Checking Environment Variables ===', 'blue');
  
  const required = [
    'VITE_TIENDANUBE_APP_ID',
    'VITE_TIENDANUBE_CLIENT_SECRET',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const optional = [
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let allSet = true;
  
  for (const envVar of required) {
    if (process.env[envVar]) {
      log(`✓ ${envVar} is set`, 'green');
    } else {
      log(`✗ ${envVar} is NOT set (required)`, 'red');
      allSet = false;
    }
  }
  
  for (const envVar of optional) {
    if (process.env[envVar]) {
      log(`✓ ${envVar} is set`, 'green');
    } else {
      log(`⚠ ${envVar} is NOT set (optional for local testing)`, 'yellow');
    }
  }
  
  return allSet;
}

async function runTests() {
  log('Starting OAuth Local Tests', 'magenta');
  log('================================', 'magenta');
  
  // Check environment variables
  const envOk = await checkEnvironmentVariables();
  if (!envOk) {
    log('\n⚠ Warning: Some required environment variables are missing', 'yellow');
    log('The tests will continue but may fail', 'yellow');
  }
  
  log('\n📝 Make sure Vercel dev server is running on port 3000', 'yellow');
  log('Run: vercel dev --listen 3000', 'yellow');
  
  // Wait a moment for user to see the message
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Test OAuth initiation
    await testOAuthInitiation();
    
    // Test OAuth callback
    await testOAuthCallback();
    
    log('\n================================', 'magenta');
    log('✓ All tests completed', 'green');
    log('\nNext steps:', 'blue');
    log('1. If tests passed, the OAuth endpoints are working locally', 'blue');
    log('2. Deploy to Vercel to test in production', 'blue');
    log('3. Check Vercel function logs for any runtime errors', 'blue');
    
  } catch (error) {
    log('\n================================', 'magenta');
    log('✗ Tests failed', 'red');
    log(`Error: ${error.message}`, 'red');
    log('\nTroubleshooting:', 'yellow');
    log('1. Make sure Vercel dev server is running: vercel dev --listen 3000', 'yellow');
    log('2. Check that environment variables are set in .env file', 'yellow');
    log('3. Verify TiendaNube credentials are correct', 'yellow');
    process.exit(1);
  }
}

// Check if Vercel dev is running
http.get('http://localhost:3000', (res) => {
  runTests();
}).on('error', (e) => {
  log('✗ Cannot connect to localhost:3000', 'red');
  log('Please start Vercel dev server first:', 'yellow');
  log('  vercel dev --listen 3000', 'blue');
  process.exit(1);
});