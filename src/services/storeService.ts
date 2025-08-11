import { supabase } from '../lib/supabase';
import type { Store, StoreInput, StoreWithWheels } from '../types/models';
import type { ApiResponse } from '../types/models';

export class StoreService {
  static async getUserStore(): Promise<ApiResponse<Store>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: store, error } = await (supabase as any)
        .schema('spinawheel')
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return { data: store, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch user store', 
        success: false 
      };
    }
  }

  static async getUserStores(): Promise<ApiResponse<Store[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First get the stores
      const { data: stores, error } = await (supabase as any)
        .schema('spinawheel')
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Then get wheel counts for each store if we have stores
      let storesWithCounts = stores || [];
      
      if (storesWithCounts.length > 0) {
        // Get wheel counts for all stores
        const storeIds = storesWithCounts.map((s: any) => s.tiendanube_store_id);
        const { data: wheels } = await (supabase as any)
          .schema('spinawheel')
          .from('wheels')
          .select('tiendanube_store_id')
          .in('tiendanube_store_id', storeIds);
        
        // Count wheels per store
        const wheelCounts: Record<string, number> = {};
        storeIds.forEach((id: string) => {
          wheelCounts[id] = 0;
        });
        
        if (wheels) {
          wheels.forEach((wheel: any) => {
            wheelCounts[wheel.tiendanube_store_id] = (wheelCounts[wheel.tiendanube_store_id] || 0) + 1;
          });
        }
        
        // Add wheel count to each store and sort
        storesWithCounts = storesWithCounts.map((store: any) => ({
          ...store,
          wheel_count: wheelCounts[store.tiendanube_store_id] || 0
        }));
        
        // Sort by wheel count (descending) and then by creation date (descending)
        storesWithCounts.sort((a: any, b: any) => {
          if (a.wheel_count !== b.wheel_count) {
            return b.wheel_count - a.wheel_count;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }

      return { data: storesWithCounts, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch user stores', 
        success: false 
      };
    }
  }
  static async createStore(data: any): Promise<ApiResponse<Store>> {
    try {
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('User not authenticated');

      // Make sure we're using the exact field names from the schema
      const insertData = { 
        tiendanube_store_id: data.tiendanube_store_id || `store-${Date.now()}`, // Generate if not provided
        store_name: data.store_name,
        platform: data.platform,
        store_url: data.store_url,
        user_id: user.id,
        is_active: true,
        plan_tier: 'free'
      };
const { data: store, error } = await (supabase as any)
        .schema('spinawheel')
        .from('stores')
        .insert(insertData)
        .select()
        .single();

if (error) throw error;

      return { data: store, success: true };
    } catch (error) {

      return { 
        error: error instanceof Error ? error.message : 'Failed to create store', 
        success: false 
      };
    }
  }

  static async getStores(): Promise<ApiResponse<Store[]>> {
    try {
      const { data: stores, error } = await (supabase as any)
        .schema('spinawheel')
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: stores || [], success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch stores', 
        success: false 
      };
    }
  }

  static async getStore(storeId: string): Promise<ApiResponse<StoreWithWheels>> {
    try {
      const { data: store, error } = await (supabase as any)
        .schema('spinawheel')
        .from('stores')
        .select(`
          *,
          wheels (*)
        `)
        .eq('id', storeId)
        .single();

      if (error) throw error;

      return { data: store, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch store', 
        success: false 
      };
    }
  }

  static async updateStore(storeId: string, data: Partial<StoreInput>): Promise<ApiResponse<Store>> {
    try {
      const { data: store, error } = await (supabase as any)
        .schema('spinawheel')
        .from('stores')
        .update(data)
        .eq('id', storeId)
        .select()
        .single();

      if (error) throw error;

      return { data: store, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to update store', 
        success: false 
      };
    }
  }

  static async deleteStore(storeId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await (supabase as any)
        .schema('spinawheel')
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete store', 
        success: false 
      };
    }
  }

  static async getStoreStats(storeId: string): Promise<ApiResponse<any>> {
    try {
      const { data: wheels } = await supabase
        .from('wheels')
        .select('id')
        .eq('store_id', storeId);

      const wheelIds = wheels?.map(w => w.id) || [];

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .in('wheel_id', wheelIds);

      const campaignIds = campaigns?.map(c => c.id) || [];

      const { count: totalSpins } = await supabase
        .from('spins')
        .select('id', { count: 'exact' })
        .in('campaign_id', campaignIds);

      const { data: uniqueEmails } = await supabase
        .from('spins')
        .select('email')
        .in('campaign_id', campaignIds);

      const uniqueParticipants = new Set(uniqueEmails?.map(s => s.email) || []).size;

      return {
        data: {
          totalWheels: wheelIds.length,
          totalCampaigns: campaignIds.length,
          totalSpins: totalSpins || 0,
          uniqueParticipants
        },
        success: true
      };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch store stats', 
        success: false 
      };
    }
  }
}