/**
 * Vercel Edge Function - TiendaNube API Proxy
 * Handles all API requests to TiendaNube with proper authentication
 * Path: /api/tiendanube/proxy/[storeId]/coupons/...
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
    // Extract the path from the catch-all route
    const { path } = req.query;
    if (!path || path.length === 0) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    // Join the path segments
    const fullPath = Array.isArray(path) ? path.join('/') : path;
    console.log('Proxy request for path:', fullPath);

    // Extract the authorization token from the request
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');

    // The token passed from frontend is actually the access_token from the database
    // We use it directly to call TiendaNube API
    
    // Build the TiendaNube API URL
    const tiendaNubeUrl = `https://api.tiendanube.com/v1/${fullPath}`;
    console.log('Proxying to TiendaNube:', tiendaNubeUrl);

    // Prepare the request options
    const options = {
      method: req.method,
      headers: {
        'Authentication': `bearer ${token}`,
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
    console.log('TiendaNube response:', {
      status: tiendaNubeResponse.status,
      statusText: tiendaNubeResponse.statusText,
      headers: Object.fromEntries(tiendaNubeResponse.headers.entries())
    });

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
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Export config for Vercel Edge Runtime (optional, for better performance)
export const config = {
  runtime: 'nodejs', // Use 'edge' for Edge Runtime if you want better performance
};