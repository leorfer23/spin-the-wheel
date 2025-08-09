import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TiendaNubeAuthService } from '../../src/services/integrations/tiendanube/authService';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tiendaNubeAuth = new TiendaNubeAuthService();
    
    // Validate config
    if (!tiendaNubeAuth.validateConfig()) {
      console.error('TiendaNube OAuth configuration is incomplete');
      return res.status(500).json({ 
        error: 'OAuth service not configured. Please contact support.' 
      });
    }

    const { storeId, storeName, platform, userId } = req.body;

    if (platform !== 'tiendanube') {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    // Simple state with just the essential info
    const state = JSON.stringify({
      storeId: storeId || '',
      storeName: storeName || 'Mi Tienda',
      userId: userId || '',
      platform,
    });

    // Encode state for URL
    const encodedState = Buffer.from(state).toString('base64');

    // Get OAuth URL with encoded state
    const authUrl = tiendaNubeAuth.getAuthUrl(encodedState);

    return res.status(200).json({ authUrl });
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to initiate OAuth',
    });
  }
};

export default handler;