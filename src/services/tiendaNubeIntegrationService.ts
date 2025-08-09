import { supabase } from '../lib/supabase';
import { TiendaNubeAuthService } from './integrations/tiendanube/authService';

export interface OAuthState {
  state: string;
  user_id: string;
  store_id?: string;
  metadata: {
    store_name?: string;
    platform: string;
    redirect_to?: string;
  };
}

export interface StoreIntegration {
  id: string;
  store_id: string;
  platform: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  platform_store_id?: string;
  platform_store_name?: string;
  platform_store_domain?: string;
  platform_store_email?: string;
  platform_metadata?: any;
  status: string;
  connected_at: string;
  last_sync_at?: string;
}

class TiendaNubeIntegrationService {
  private tiendaNubeAuth: TiendaNubeAuthService;

  constructor() {
    this.tiendaNubeAuth = new TiendaNubeAuthService();
  }

  /**
   * Generate a unique state token for OAuth
   */
  private generateStateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Initiate OAuth flow for Tienda Nube
   */
  async initiateOAuth(storeId?: string, storeName?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate unique state token
    const stateToken = this.generateStateToken();
    
    // Store state in database with 10 minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        state: stateToken,
        user_id: user.id,
        store_id: storeId,
        metadata: {
          store_name: storeName,
          platform: 'tiendanube',
          redirect_to: '/dashboard',
        },
        expires_at: expiresAt,
      });

    if (stateError) {
      console.error('Failed to create OAuth state:', stateError);
      throw new Error('Failed to initiate OAuth flow');
    }

    // Get OAuth URL
    const authUrl = this.tiendaNubeAuth.getAuthUrl(stateToken);

    return { authUrl, state: stateToken };
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string) {
    // Retrieve and validate state
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single();

    if (stateError || !oauthState) {
      throw new Error('Invalid or expired OAuth state');
    }

    // Check if state has expired
    if (new Date(oauthState.expires_at) < new Date()) {
      throw new Error('OAuth state has expired');
    }

    // Delete the state after retrieval
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    const { store_name } = oauthState.metadata;

    // Exchange code for token
    const tokenData = await this.tiendaNubeAuth.exchangeCodeForToken(code);
    
    // Fetch store information
    let storeInfo;
    try {
      storeInfo = await this.tiendaNubeAuth.fetchStoreInfo(
        tokenData.access_token,
        tokenData.user_id
      );
    } catch (error) {
      console.error('Failed to fetch store info:', error);
      // Continue without store info
    }

    // Create or update store integration
    const integration = await this.createOrUpdateIntegration(
      oauthState.store_id,
      oauthState.user_id,
      tokenData,
      storeInfo,
      store_name
    );

    return {
      success: true,
      integration,
      redirect_to: oauthState.metadata.redirect_to || '/dashboard',
    };
  }

  /**
   * Create or update store integration
   */
  private async createOrUpdateIntegration(
    storeId: string | undefined,
    userId: string,
    tokenData: any,
    storeInfo: any,
    storeName?: string
  ) {
    let finalStoreId = storeId;

    // If no store exists, create one
    if (!finalStoreId) {
      const { data: newStore, error: storeError } = await (supabase as any)
        .schema('spinawheel')
        .from('stores')
        .insert({
          user_id: userId,
          store_name: storeInfo?.store_name || storeName || 'Mi Tienda',
          platform: 'tiendanube',
          store_url: storeInfo?.store_domain || '',
          plan_tier: 'free',
          is_active: true,
        })
        .select()
        .single();

      if (storeError) {
        throw new Error('Failed to create store');
      }

      finalStoreId = newStore.id;
    }

    // Check if integration already exists
    const { data: existingIntegration } = await (supabase as any)
      .schema('spinawheel')
      .from('store_integrations')
      .select('*')
      .eq('store_id', finalStoreId)
      .eq('platform', 'tienda_nube')
      .single();

    const integrationData = {
      store_id: finalStoreId,
      platform: 'tiendanube',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      platform_store_id: tokenData.user_id,
      platform_store_name: storeInfo?.store_name,
      platform_store_domain: storeInfo?.store_domain,
      platform_store_email: storeInfo?.store_email,
      platform_metadata: {
        ...storeInfo?.raw_data,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
      },
      status: 'active',
      last_sync_at: new Date().toISOString(),
    };

    let integration;
    
    if (existingIntegration) {
      // Update existing integration
      const { data, error } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .update({
          ...integrationData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingIntegration.id)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update integration');
      }
      
      integration = data;
    } else {
      // Create new integration
      const { data, error } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .insert(integrationData)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create integration');
      }
      
      integration = data;
    }

    // Update store with integration_id and store info
    await (supabase as any)
      .schema('spinawheel')
      .from('stores')
      .update({
        integration_id: integration.id,
        store_url: storeInfo?.store_domain || '',
        store_name: storeInfo?.store_name || storeName || 'Mi Tienda',
        updated_at: new Date().toISOString(),
      })
      .eq('id', finalStoreId);

    return integration;
  }

  /**
   * Get integration status for a store
   */
  async getIntegrationStatus(storeId: string) {
    const { data, error } = await (supabase as any)
      .schema('spinawheel')
      .from('store_integrations')
      .select('*')
      .eq('store_id', storeId)
      .eq('platform', 'tienda_nube')
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }

    return data;
  }

  /**
   * Disconnect integration
   */
  async disconnectIntegration(storeId: string) {
    const { error } = await (supabase as any)
      .schema('spinawheel')
      .from('store_integrations')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', storeId)
      .eq('platform', 'tienda_nube');

    if (error) {
      throw new Error('Failed to disconnect integration');
    }

    // Remove integration_id from store
    await (supabase as any)
      .schema('spinawheel')
      .from('stores')
      .update({
        integration_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId);

    return { success: true };
  }

  /**
   * Refresh access token if needed
   */
  async refreshTokenIfNeeded(storeId: string) {
    const integration = await this.getIntegrationStatus(storeId);
    
    if (!integration) {
      throw new Error('No integration found');
    }

    // Check if token is expired
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      // TODO: Implement token refresh logic when Tienda Nube provides refresh token endpoint
      console.warn('Token expired, refresh not implemented yet');
    }

    return integration.access_token;
  }
}

export const tiendaNubeIntegrationService = new TiendaNubeIntegrationService();