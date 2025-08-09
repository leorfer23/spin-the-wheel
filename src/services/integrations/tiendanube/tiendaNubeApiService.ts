import { supabase } from '@/lib/supabase';
import type { 
  TiendaNubeCoupon, 
  CreateCouponPayload,
  CouponFilters 
} from '@/types/tiendanube.types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  needsReauth?: boolean;
}

export class TiendaNubeApiService {
  private static instance: TiendaNubeApiService;
  
  private constructor() {}
  
  static getInstance(): TiendaNubeApiService {
    if (!TiendaNubeApiService.instance) {
      TiendaNubeApiService.instance = new TiendaNubeApiService();
    }
    return TiendaNubeApiService.instance;
  }

  /**
   * Get the store integration details from the database
   */
  private async getIntegration(storeId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await (supabase as any)
        .schema('spinawheel')
        .from('store_integrations')
        .select('*')
        .eq('store_id', storeId)
        .eq('platform', 'tienda_nube')
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'No active TiendaNube integration found for this store'
        };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error fetching integration:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch integration'
      };
    }
  }

  /**
   * Make an authenticated API request to TiendaNube
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    accessToken: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `/api/tiendanube/proxy/${path}`;
      
      console.log('🔐 [makeRequest] Auth debug:', {
        url,
        path,
        tokenLength: accessToken?.length,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 10)}` : 'NO TOKEN',
        method
      });
      
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const responseText = await response.text();

      if (!response.ok) {
        // Check for 401 Unauthorized
        if (response.status === 401) {
          return {
            success: false,
            error: 'Authentication failed. Please reconnect your TiendaNube store.',
            needsReauth: true
          };
        }

        // Try to parse error response
        try {
          const errorData = JSON.parse(responseText);
          return {
            success: false,
            error: errorData.message || errorData.description || `API Error: ${response.status}`
          };
        } catch {
          return {
            success: false,
            error: `API Error: ${response.status} - ${responseText}`
          };
        }
      }

      // Parse successful response
      try {
        const data = responseText ? JSON.parse(responseText) : null;
        return { success: true, data };
      } catch {
        return {
          success: false,
          error: 'Invalid response format from API'
        };
      }
    } catch (err) {
      console.error('API request failed:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Request failed'
      };
    }
  }

  /**
   * Get all coupons for a store
   */
  async getCoupons(storeId: string, filters?: CouponFilters): Promise<ApiResponse<TiendaNubeCoupon[]>> {
    console.log('🎯 [tiendaNubeApi.getCoupons] Starting with storeId:', storeId);
    
    const integrationResult = await this.getIntegration(storeId);
    console.log('🔌 [tiendaNubeApi.getCoupons] Integration result:', integrationResult);
    
    if (!integrationResult.success) {
      console.error('❌ [tiendaNubeApi.getCoupons] No integration found');
      return integrationResult;
    }

    const integration = integrationResult.data;
    console.log('✅ [tiendaNubeApi.getCoupons] Integration found:', {
      platform_store_id: integration.platform_store_id,
      has_token: !!integration.access_token
    });
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const path = `${integration.platform_store_id}/coupons${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest<TiendaNubeCoupon[]>(
      'GET',
      path,
      integration.access_token
    );
  }

  /**
   * Get a single coupon by ID
   */
  async getCoupon(storeId: string, couponId: number): Promise<ApiResponse<TiendaNubeCoupon>> {
    const integrationResult = await this.getIntegration(storeId);
    if (!integrationResult.success) {
      return integrationResult;
    }

    const integration = integrationResult.data;
    const path = `${integration.platform_store_id}/coupons/${couponId}`;
    
    return this.makeRequest<TiendaNubeCoupon>(
      'GET',
      path,
      integration.access_token
    );
  }

  /**
   * Create a new coupon
   */
  async createCoupon(storeId: string, couponData: CreateCouponPayload): Promise<ApiResponse<TiendaNubeCoupon>> {
    const integrationResult = await this.getIntegration(storeId);
    if (!integrationResult.success) {
      return integrationResult;
    }

    const integration = integrationResult.data;
    const path = `${integration.platform_store_id}/coupons`;
    
    // Validate required fields
    if (!couponData.code || !couponData.type || !couponData.value) {
      return {
        success: false,
        error: 'Missing required fields: code, type, and value are required'
      };
    }

    return this.makeRequest<TiendaNubeCoupon>(
      'POST',
      path,
      integration.access_token,
      couponData
    );
  }

  /**
   * Update an existing coupon
   */
  async updateCoupon(
    storeId: string, 
    couponId: number, 
    updates: Partial<CreateCouponPayload>
  ): Promise<ApiResponse<TiendaNubeCoupon>> {
    const integrationResult = await this.getIntegration(storeId);
    if (!integrationResult.success) {
      return integrationResult;
    }

    const integration = integrationResult.data;
    const path = `${integration.platform_store_id}/coupons/${couponId}`;
    
    return this.makeRequest<TiendaNubeCoupon>(
      'PUT',
      path,
      integration.access_token,
      updates
    );
  }

  /**
   * Delete a coupon
   */
  async deleteCoupon(storeId: string, couponId: number): Promise<ApiResponse<void>> {
    const integrationResult = await this.getIntegration(storeId);
    if (!integrationResult.success) {
      return integrationResult;
    }

    const integration = integrationResult.data;
    const path = `${integration.platform_store_id}/coupons/${couponId}`;
    
    return this.makeRequest<void>(
      'DELETE',
      path,
      integration.access_token
    );
  }

  /**
   * Generate a unique coupon code based on a prefix
   */
  generateCouponCode(prefix: string = 'SPIN'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Validate if a coupon code is available
   */
  async isCouponCodeAvailable(storeId: string, code: string): Promise<boolean> {
    const result = await this.getCoupons(storeId, { q: code });
    if (!result.success) return false;
    
    const exactMatch = result.data?.find(coupon => coupon.code === code);
    return !exactMatch;
  }
}

// Export singleton instance
export const tiendaNubeApi = TiendaNubeApiService.getInstance();