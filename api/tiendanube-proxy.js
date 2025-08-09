/**
 * Vercel Edge Function - TiendaNube API Proxy (Alternative)
 * Simple proxy endpoint that handles path as a query parameter
 * Path: /api/tiendanube-proxy?path=[storeId]/coupons/...
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for backend operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '', // Use service role key for backend
  {
    db: {
      schema: 'spinawheel'
    }
  }
);

export default async function handler(req, res) {
  console.log('🔵 TiendaNube Proxy - Request received:', {
    method: req.method,
    url: req.url,
    query: req.query
  });

  // Enable CORS for your domain
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://www.rooleta.com',
    'https://rooleta.com',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract the path from query parameter
    const { path } = req.query;
    if (!path) {
      console.error('❌ No path provided in query');
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    console.log('📍 Proxy request for path:', path);

    // Extract the authorization token from the request
    const authHeader = req.headers.authorization;
    console.log('🔍 Proxy Auth Header received:', {
      hasAuthHeader: !!authHeader,
      headerValue: authHeader ? `${authHeader.substring(0, 30)}...` : 'none',
      startsWithBearer: authHeader?.startsWith('Bearer ')
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing authorization token');
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted:', {
      tokenLength: token.length,
      tokenPreview: `${token.substring(0, 20)}...${token.substring(token.length - 10)}`
    });

    // Build the TiendaNube API URL
    const tiendaNubeUrl = `https://api.tiendanube.com/v1/${path}`;
    console.log('🌐 Proxying to TiendaNube:', tiendaNubeUrl);

    // Prepare the request options
    const options = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SpinWheel/1.0'
      }
    };

    // Add body for POST/PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
      options.body = JSON.stringify(req.body);
    }

    // Make the request to TiendaNube
    const tiendaNubeResponse = await fetch(tiendaNubeUrl, options);

    // Get the response text
    const responseText = await tiendaNubeResponse.text();

    // Log the response for debugging
    console.log('✅ TiendaNube response:', {
      status: tiendaNubeResponse.status,
      statusText: tiendaNubeResponse.statusText,
      responsePreview: responseText ? responseText.substring(0, 200) : 'empty'
    });
    
    // If it's a 401, log more details
    if (tiendaNubeResponse.status === 401) {
      console.error('❌ TiendaNube 401 Unauthorized:', {
        responseText,
        tokenUsed: `${token.substring(0, 20)}...`,
        url: tiendaNubeUrl
      });
    }

    // Set the response status
    res.status(tiendaNubeResponse.status);

    // Forward response headers (filtering out some that shouldn't be forwarded)
    const headersToSkip = ['content-encoding', 'content-length', 'transfer-encoding'];
    tiendaNubeResponse.headers.forEach((value, key) => {
      if (!headersToSkip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Return the response
    if (responseText) {
      try {
        const jsonResponse = JSON.parse(responseText);
        return res.json(jsonResponse);
      } catch {
        // If not JSON, return as text
        return res.send(responseText);
      }
    } else {
      return res.status(tiendaNubeResponse.status).end();
    }

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Export config for Vercel
export const config = {
  runtime: 'nodejs',
};