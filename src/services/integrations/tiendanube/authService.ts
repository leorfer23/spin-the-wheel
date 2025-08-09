/// <reference types="vite/client" />
import { getOAuthRedirectUri } from '../../../utils/env';

export interface AuthTokens {
  access_token: string;
  user_id: string;
  token_type?: string;
  scope?: string;
  refresh_token?: string;
}

export class TiendaNubeAuthService {
  private config: {
    appId: string;
    clientSecret: string;
    redirectUri: string;
    authBaseUrl: string;
    apiBaseUrl: string;
  };

  constructor() {
    // Check if we're in Node.js (server-side) or browser (client-side)
    const isServer = typeof process !== 'undefined' && process.env;
    
    if (isServer) {
      // Server-side: use process.env
      this.config = {
        appId: process.env.VITE_TIENDANUBE_APP_ID || '19912',
        clientSecret: process.env.VITE_TIENDANUBE_CLIENT_SECRET || '',
        redirectUri: process.env.VITE_REDIRECT_URI || getOAuthRedirectUri(),
        authBaseUrl: 'https://www.tiendanube.com',
        apiBaseUrl: 'https://api.tiendanube.com/v1',
      };
    } else {
      // Client-side: use import.meta.env
      this.config = {
        appId: (import.meta.env?.VITE_TIENDANUBE_APP_ID as string) || '19912',
        clientSecret: (import.meta.env?.VITE_TIENDANUBE_CLIENT_SECRET as string) || '',
        redirectUri: (import.meta.env?.VITE_REDIRECT_URI as string) || getOAuthRedirectUri(),
        authBaseUrl: 'https://www.tiendanube.com',
        apiBaseUrl: 'https://api.tiendanube.com/v1',
      };
    }
    
    // Log config on initialization (safely)
    console.log('TiendaNubeAuthService initialized with:', {
      appId: this.config.appId,
      clientSecretLength: this.config.clientSecret?.length || 0,
      clientSecretFirst4: this.config.clientSecret?.substring(0, 4) || 'NONE',
      redirectUri: this.config.redirectUri,
      isServer,
      envVars: {
        hasAppId: isServer ? !!process.env.VITE_TIENDANUBE_APP_ID : !!import.meta.env?.VITE_TIENDANUBE_APP_ID,
        hasClientSecret: isServer ? !!process.env.VITE_TIENDANUBE_CLIENT_SECRET : !!import.meta.env?.VITE_TIENDANUBE_CLIENT_SECRET,
      }
    });
  }

  /**
   * Generate the OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    const { appId } = this.config;
    const params = new URLSearchParams({
      state: state,
    });
    
    // According to Tienda Nube docs, the URL format is:
    // https://www.tiendanube.com/apps/{app_id}/authorize
    return `${this.config.authBaseUrl}/apps/${appId}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<AuthTokens> {
    try {
      const requestBody = {
        client_id: this.config.appId,
        client_secret: this.config.clientSecret,
        grant_type: 'authorization_code',
        code,
      };
      
      console.log('Token exchange request:', {
        url: `${this.config.authBaseUrl}/apps/authorize/token`,
        body: { ...requestBody, client_secret: '[REDACTED]' },
        clientSecretPresent: !!this.config.clientSecret,
        clientSecretLength: this.config.clientSecret?.length
      });

      // According to Tienda Nube docs, send as JSON in body
      const response = await fetch(
        `${this.config.authBaseUrl}/apps/authorize/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('TiendaNube token exchange error:', {
          status: response.status,
          statusText: response.statusText,
          error
        });
        throw new Error(`Failed to exchange code for token: ${response.status} - ${error}`);
      }

      const data = await response.json() as any;
      
      console.log('Raw token response data:', JSON.stringify(data, null, 2));
      
      console.log('Token exchange successful:', {
        user_id: data.user_id,
        token_type: data.token_type,
        scope: data.scope,
        access_token: data.access_token ? '[PRESENT]' : '[MISSING]'
      });
      
      // Handle different possible response formats
      const accessToken = data.access_token || data.token || data.accessToken;
      const userId = data.user_id || data.userId || data.store_id || data.storeId;
      
      if (!accessToken) {
        console.error('No access token found in response:', Object.keys(data));
        throw new Error('No access token in response');
      }
      
      return {
        access_token: accessToken as string,
        user_id: userId?.toString() || '',
        token_type: data.token_type as string | undefined,
        scope: data.scope as string | undefined,
      };
    } catch (error) {
      console.error('TiendaNube token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }
  }

  /**
   * Fetch store information from Tienda Nube API
   */
  async fetchStoreInfo(accessToken: string, storeId: string) {
    try {
      const url = `${this.config.apiBaseUrl}/${storeId}/store`;
      // Try both Authentication and Authorization headers as different APIs use different conventions
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Authentication': `bearer ${accessToken}`,
        'User-Agent': 'SpinWheel Platform',
        'Content-Type': 'application/json',
      };
      
      console.log('Fetching store info:', {
        url,
        storeId,
        headers: {
          ...headers,
          'Authentication': 'bearer [REDACTED]'
        }
      });

      const response = await fetch(url, { headers });

      console.log('Store info response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Store info error response:', errorText);
        throw new Error(`Failed to fetch store info: ${response.status} - ${errorText}`);
      }

      const storeData = await response.json() as any;
      
      console.log('Store data received:', {
        id: storeData.id,
        name: storeData.name,
        email: storeData.email,
        domains: storeData.domains,
        main_language: storeData.main_language
      });
      
      return {
        store_name: storeData.name?.[storeData.main_language || 'es'] || 
                   storeData.name?.es || 
                   'Mi Tienda',
        store_email: storeData.email as string,
        store_domain: storeData.domains?.[0]?.host || 
                     `${storeData.id}.mitiendanube.com`,
        store_language: storeData.main_language || 'es',
        store_currency: storeData.currency || 'ARS',
        raw_data: storeData,
      };
    } catch (error) {
      console.error('Failed to fetch store information:', error);
      throw error;
    }
  }

  /**
   * Validate that required configuration is present
   */
  validateConfig(): boolean {
    const isValid = !!(this.config.appId && this.config.clientSecret);
    
    if (!isValid) {
      console.error('TiendaNube config validation failed:', {
        appId: this.config.appId || 'MISSING',
        clientSecretPresent: !!this.config.clientSecret,
        clientSecretLength: this.config.clientSecret?.length || 0
      });
    }
    
    return isValid;
  }
}