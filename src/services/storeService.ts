import { supabase } from '../lib/supabase';
import type { Store, StoreInput, StoreWithWheels } from '../types/models';
import type { ApiResponse } from '../types/models';

export class StoreService {
  static async getUserStore(): Promise<ApiResponse<Store & { tiendanube_store_id?: string }>> {
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
  static async createStore(data: Omit<StoreInput, 'user_id'>): Promise<ApiResponse<Store>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: store, error } = await supabase
        .from('stores')
        .insert({ ...data, user_id: user.id })
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
      const { data: stores, error } = await supabase
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
      const { data: store, error } = await supabase
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
      const { data: store, error } = await supabase
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
      const { error } = await supabase
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