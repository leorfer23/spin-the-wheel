#!/usr/bin/env node

// Test script to directly call TiendaNube API
// Usage: node test-tiendanube-api.js <access_token> <store_id>

const [,, accessToken, storeId] = process.argv;

if (!accessToken || !storeId) {
  console.error('Usage: node test-tiendanube-api.js <access_token> <store_id>');
  console.error('Example: node test-tiendanube-api.js "your_token_here" "6545032"');
  process.exit(1);
}

async function testTiendaNubeAPI() {
  console.log('Testing TiendaNube API...');
  console.log('Store ID:', storeId);
  console.log('Token (first 10 chars):', accessToken.substring(0, 10) + '...');
  console.log('Token length:', accessToken.length);
  console.log('---');

  // Test 1: Try with uppercase Bearer
  console.log('Test 1: Using "Bearer" (uppercase)');
  try {
    const response1 = await fetch(`https://api.tiendanube.com/v1/${storeId}/coupons`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SpinWheel/1.0'
      }
    });
    
    console.log('Response status:', response1.status);
    console.log('Response statusText:', response1.statusText);
    const text1 = await response1.text();
    console.log('Response body:', text1.substring(0, 200));
    console.log('---');
  } catch (error) {
    console.error('Error with Bearer:', error.message);
  }

  // Test 2: Try with lowercase bearer
  console.log('Test 2: Using "bearer" (lowercase)');
  try {
    const response2 = await fetch(`https://api.tiendanube.com/v1/${storeId}/coupons`, {
      method: 'GET',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SpinWheel/1.0'
      }
    });
    
    console.log('Response status:', response2.status);
    console.log('Response statusText:', response2.statusText);
    const text2 = await response2.text();
    console.log('Response body:', text2.substring(0, 200));
    console.log('---');
  } catch (error) {
    console.error('Error with bearer:', error.message);
  }

  // Test 3: Test store info endpoint
  console.log('Test 3: Testing /store endpoint');
  try {
    const response3 = await fetch(`https://api.tiendanube.com/v1/${storeId}/store`, {
      method: 'GET',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SpinWheel/1.0'
      }
    });
    
    console.log('Response status:', response3.status);
    console.log('Response statusText:', response3.statusText);
    const text3 = await response3.text();
    console.log('Response body:', text3.substring(0, 200));
  } catch (error) {
    console.error('Error with store endpoint:', error.message);
  }
}

testTiendaNubeAPI();