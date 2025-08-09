import { supabase } from '../../../lib/supabase';
import type { 
  TiendaNubeCoupon, 
  CouponFilters, 
  CreateCouponPayload 
} from '../../../types/tiendanube.types';

export class TiendaNubeCouponsService {
  private readonly baseUrl = 'https://api.tiendanube.com/v1';

  private async getStoreInfo(storeId: string): Promise<{ access_token: string; platform_store_id: string }> {
    console.log('🔍 [getStoreInfo] Fetching store info for storeId:', storeId);
    
    // Direct query to spinawheel.store_integrations
    const { data, error } = await (supabase as any)
      .schema('spinawheel')
      .from('store_integrations')
      .select('access_token, platform_store_id')
      .eq('store_id', storeId)
      .eq('platform', 'tienda_nube')
      .eq('status', 'active')
      .single();

    console.log('📀 [getStoreInfo] Supabase query result:', {
      hasData: !!data,
      hasError: !!error,
      error: error?.message,
      platform_store_id: data?.platform_store_id,
      has_token: !!data?.access_token
    });

    if (error || !data) {
      console.error('❌ [getStoreInfo] Failed to get store info:', error);
      throw new Error('No active Tienda Nube integration found for this store');
    }

    return {
      access_token: data.access_token,
      platform_store_id: data.platform_store_id
    };
  }

  private buildQueryString(filters?: CouponFilters): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getCoupons(storeId: string, filters?: CouponFilters): Promise<TiendaNubeCoupon[]> {
    try {
      const { access_token, platform_store_id } = await this.getStoreInfo(storeId);
      const queryString = this.buildQueryString(filters);
      
      const response = await fetch(
        `${this.baseUrl}/${platform_store_id}/coupons${queryString}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SpinWheel/1.0'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Tienda Nube API error:', errorData);
        throw new Error(`Failed to fetch coupons: ${response.statusText}`);
      }

      const coupons: TiendaNubeCoupon[] = await response.json();
      return coupons;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }

  async getCoupon(storeId: string, couponId: number): Promise<TiendaNubeCoupon> {
    try {
      const { access_token, platform_store_id } = await this.getStoreInfo(storeId);
      
      const response = await fetch(
        `${this.baseUrl}/${platform_store_id}/coupons/${couponId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SpinWheel/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch coupon: ${response.statusText}`);
      }

      const coupon: TiendaNubeCoupon = await response.json();
      return coupon;
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw error;
    }
  }

  async createCoupon(storeId: string, couponData: CreateCouponPayload): Promise<TiendaNubeCoupon> {
    console.log('🎯 [CouponsService] Starting createCoupon:', {
      storeId,
      couponData,
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log('📊 [CouponsService] Getting store info...');
      const { access_token, platform_store_id } = await this.getStoreInfo(storeId);
      console.log('✅ [CouponsService] Store info retrieved:', {
        platform_store_id,
        has_token: !!access_token,
        token_preview: access_token ? `${access_token.substring(0, 10)}...` : 'null'
      });
      
      const url = `${this.baseUrl}/${platform_store_id}/coupons`;
      const requestBody = JSON.stringify(couponData);
      
      console.log('🔗 [CouponsService] Making POST request:', {
        url,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token ? access_token.substring(0, 10) + '...' : 'null'}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SpinWheel/1.0'
        },
        body: requestBody
      });
      
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SpinWheel/1.0'
          },
          body: requestBody
        }
      );

      console.log('📨 [CouponsService] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ [CouponsService] Failed to create coupon:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
          requestBody
        });
        throw new Error(`Failed to create coupon: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const responseText = await response.text();
      console.log('📄 [CouponsService] Raw response:', responseText);
      
      let newCoupon: TiendaNubeCoupon;
      try {
        newCoupon = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [CouponsService] Failed to parse response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      console.log('✅ [CouponsService] Coupon created successfully:', newCoupon);
      return newCoupon;
    } catch (error) {
      console.error('❌ [CouponsService] Error creating coupon:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        storeId,
        couponData
      });
      throw error;
    }
  }

  async updateCoupon(
    storeId: string, 
    couponId: number, 
    updates: Partial<CreateCouponPayload>
  ): Promise<TiendaNubeCoupon> {
    try {
      const { access_token, platform_store_id } = await this.getStoreInfo(storeId);
      
      const response = await fetch(
        `${this.baseUrl}/${platform_store_id}/coupons/${couponId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SpinWheel/1.0'
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update coupon: ${response.statusText}`);
      }

      const updatedCoupon: TiendaNubeCoupon = await response.json();
      return updatedCoupon;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  }

  async deleteCoupon(storeId: string, couponId: number): Promise<void> {
    try {
      const { access_token, platform_store_id } = await this.getStoreInfo(storeId);
      
      const response = await fetch(
        `${this.baseUrl}/${platform_store_id}/coupons/${couponId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SpinWheel/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete coupon: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  }

  async validateCouponCode(storeId: string, code: string): Promise<boolean> {
    try {
      const coupons = await this.getCoupons(storeId, { q: code });
      return coupons.length === 0 || coupons.every(c => c.code !== code);
    } catch (error) {
      console.error('Error validating coupon code:', error);
      return false;
    }
  }

  generateCouponCode(prefix: string = 'SPIN'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}