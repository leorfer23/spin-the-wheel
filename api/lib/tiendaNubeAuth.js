// Standalone TiendaNube Auth Service for Vercel Serverless Functions

class TiendaNubeAuthService {
  constructor() {
    this.clientId = process.env.VITE_TIENDANUBE_APP_ID || process.env.VITE_TIENDANUBE_CLIENT_ID || '';
    this.clientSecret = process.env.VITE_TIENDANUBE_CLIENT_SECRET || '';
    this.redirectUri = this.getRedirectUri();
  }

  getRedirectUri() {
    // Always use the configured redirect URI that matches TiendaNube app settings
    // In production, this should match what's configured in TiendaNube
    if (process.env.NODE_ENV === 'production') {
      return 'https://www.rooleta.com/api/integrations/callback';
    }
    
    // For Vercel preview deployments
    if (process.env.VERCEL_URL && !process.env.VERCEL_URL.includes('localhost')) {
      return `https://${process.env.VERCEL_URL}/api/integrations/callback`;
    }
    
    // In development
    return 'http://localhost:5173/api/integrations/callback';
  }

  validateConfig() {
    if (!this.clientId) {
      console.error('VITE_TIENDANUBE_APP_ID is not set');
      return false;
    }
    if (!this.clientSecret) {
      console.error('VITE_TIENDANUBE_CLIENT_SECRET is not set');
      return false;
    }
    return true;
  }

  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state: state,
    });

    // Log for debugging
    console.log('OAuth URL generation:', {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    });

    return `https://www.tiendanube.com/apps/${this.clientId}/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    const response = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code: code,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async fetchStoreInfo(accessToken, userId) {
    try {
      const response = await fetch(`https://api.tiendanube.com/v1/${userId}/store`, {
        headers: {
          'Authentication': `bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SpinWheel/1.0'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch store info: ${response.statusText}`);
      }

      const storeData = await response.json();
      
      return {
        store_id: storeData.id,
        store_name: storeData.name?.es || storeData.name?.pt || 'Tienda Sin Nombre',
        store_domain: storeData.domains?.[0] || storeData.original_domain || '',
        store_email: storeData.email || '',
        store_phone: storeData.phone || '',
        store_country: storeData.country || '',
        store_language: storeData.main_language || 'es',
        store_currency: storeData.main_currency || 'ARS',
        plan_name: storeData.plan_name || '',
        raw_data: storeData,
      };
    } catch (error) {
      console.error('Failed to fetch store info:', error);
      throw error;
    }
  }
}

module.exports = { TiendaNubeAuthService };