import { supabase } from '../lib/supabase';
import type { Wheel, WheelInput, WheelWithSegments, Segment, SegmentInput } from '../types/models';
import type { ApiResponse } from '../types/models';

export class WheelService {
  static async getWheelCountsByStores(storeIds: string[]): Promise<ApiResponse<Record<string, number>>> {
    try {
      if (storeIds.length === 0) {
        return { data: {}, success: true };
      }
      
      const { data, error } = await (supabase as any)
        .schema('spinawheel')
        .from('wheels')
        .select('tiendanube_store_id')
        .in('tiendanube_store_id', storeIds)
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Count wheels per store
      const counts: Record<string, number> = {};
      storeIds.forEach(storeId => {
        counts[storeId] = 0;
      });
      
      data?.forEach((wheel: any) => {
        counts[wheel.tiendanube_store_id] = (counts[wheel.tiendanube_store_id] || 0) + 1;
      });
      
      return { data: counts, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch wheel counts', 
        success: false 
      };
    }
  }
  
  static async createWheel(storeId: string, data: any): Promise<ApiResponse<Wheel>> {
    try {
      console.log('[WheelService] Creating wheel for store:', storeId);
      console.log('[WheelService] Input data:', data);
      
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[WheelService] User authenticated:', user?.id);
      
      // Transform the data to match new schema structure
      const { config, schedule_config, ...restData } = data as any;
      
      // Extract segments from config if present
      const segments = config?.segments || [];
      
      // Build the new structure - only include fields that exist in the schema
      const insertData = {
        id: restData.id, // UUID
        tiendanube_store_id: storeId, // The store ID
        name: restData.name || 'New Wheel',
        segments_config: segments,
        style_config: config?.style || {},
        wheel_handle_config: config?.wheelHandle || {},
        email_capture_config: config?.emailCapture || {},
        schedule_config: schedule_config || config?.schedule || {
          enabled: false,
          timezone: 'UTC',
          weekDays: { enabled: false, days: [0, 1, 2, 3, 4, 5, 6] },
          dateRange: { startDate: null, endDate: null },
          timeSlots: { enabled: false, slots: [] },
          specialDates: { blacklistDates: [], whitelistDates: [] }
        },
        is_active: restData.is_active !== undefined ? restData.is_active : true
      };
      
      console.log('[WheelService] Insert data prepared:', insertData);
      
      const { data: wheel, error } = await (supabase as any)
        .schema('spinawheel')
        .from('wheels')
        .insert(insertData)
        .select()
        .single();

      console.log('[WheelService] Supabase response:', { wheel, error });

      if (error) {
        console.error('[WheelService] Supabase error:', error);
        throw error;
      }

      console.log('[WheelService] Wheel created successfully:', wheel);
      return { data: wheel, success: true };
    } catch (error: any) {
      console.error('[WheelService] Create wheel error:', error);
      return { 
        error: error?.message || 'Failed to create wheel', 
        success: false 
      };
    }
  }

  static async getWheels(storeId: string): Promise<ApiResponse<Wheel[]>> {
    try {
      const { data: wheels, error } = await (supabase as any)
        .schema('spinawheel')
        .from('wheels')
        .select('*')
        .eq('tiendanube_store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform wheels to legacy format for compatibility
      const transformedWheels = wheels?.map((wheel: any) => ({
        ...wheel,
        config: {
          segments: wheel.segments_config || [],
          style: wheel.style_config || {},
          wheelHandle: wheel.wheel_handle_config || {},
          emailCapture: wheel.email_capture_config || {},
          schedule: wheel.schedule_config || {}
        }
      })) || [];

      return { data: transformedWheels, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch wheels', 
        success: false 
      };
    }
  }

  static async getWheel(wheelId: string): Promise<ApiResponse<WheelWithSegments>> {
    try {
      const { data: wheel, error } = await (supabase as any)
        .schema('spinawheel')
        .from('wheels')
        .select('*')
        .eq('id', wheelId)
        .single();

      if (error) throw error;

      // Transform wheel to legacy format for compatibility
      const transformedWheel = wheel ? {
        ...wheel,
        store_id: wheel.tiendanube_store_id,
        segments: wheel.segments_config || [],
        config: {
          segments: wheel.segments_config || [],
          style: wheel.style_config || {},
          wheelHandle: wheel.wheel_handle_config || {},
          emailCapture: wheel.email_capture_config || {},
          schedule: wheel.schedule_config || {}
        },
        schedule: wheel.schedule_config || {}
      } : null;

      return { data: transformedWheel, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch wheel', 
        success: false 
      };
    }
  }

  static async updateWheel(wheelId: string, data: Partial<WheelInput>): Promise<ApiResponse<Wheel>> {
    try {
      const { config, segments, schedule, ...restData } = data as any;
      
      // Build update data based on new schema
      const updateData: any = { ...restData };
      
      // Handle segments update
      if (segments) {
        updateData.segments_config = segments;
      }
      
      // Handle schedule update
      if (schedule) {
        updateData.schedule_config = schedule;
      }
      
      // Handle config updates (legacy format)
      if (config) {
        if (config.segments) updateData.segments_config = config.segments;
        if (config.style) updateData.style_config = config.style;
        if (config.wheelHandle) updateData.wheel_handle_config = config.wheelHandle;
        if (config.emailCapture) updateData.email_capture_config = config.emailCapture;
        if (config.schedule) updateData.schedule_config = config.schedule;
      }

      const { data: wheel, error } = await (supabase as any)
        .schema('spinawheel')
        .from('wheels')
        .update(updateData)
        .eq('id', wheelId)
        .select()
        .single();

      if (error) throw error;

      // Transform response to legacy format
      const transformedWheel = wheel ? {
        ...wheel,
        store_id: wheel.tiendanube_store_id,
        config: {
          segments: wheel.segments_config || [],
          style: wheel.style_config || {},
          wheelHandle: wheel.wheel_handle_config || {},
          emailCapture: wheel.email_capture_config || {},
          schedule: wheel.schedule_config || {}
        }
      } : null;

      return { data: transformedWheel, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to update wheel', 
        success: false 
      };
    }
  }

  static async deleteWheel(wheelId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await (supabase as any)
        .schema('spinawheel')
        .from('wheels')
        .delete()
        .eq('id', wheelId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete wheel', 
        success: false 
      };
    }
  }

  static async duplicateWheel(wheelId: string, newName: string): Promise<ApiResponse<Wheel>> {
    try {
      const { data: originalWheel } = await this.getWheel(wheelId);
      if (!originalWheel) throw new Error('Wheel not found');

      const { segments, campaigns, id, created_at, updated_at, ...wheelData } = originalWheel;
      
      // Use the transformed store_id which maps to tiendanube_store_id
      const newWheel = await this.createWheel(wheelData.store_id, {
        ...wheelData,
        name: newName,
        config: wheelData.config,
        schedule_config: wheelData.schedule_config
      });

      if (!newWheel.data) throw new Error('Failed to create duplicate wheel');

      // Note: Segments are now stored in segments_config, so no need to create them separately

      return { data: newWheel.data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to duplicate wheel', 
        success: false 
      };
    }
  }

  static async createSegment(wheelId: string, data: Omit<SegmentInput, 'wheel_id'>): Promise<ApiResponse<Segment>> {
    try {
      const { data: segment, error } = await (supabase as any)
        .schema('spinawheel')
        .from('segments')
        .insert({ ...data, wheel_id: wheelId })
        .select()
        .single();

      if (error) throw error;

      return { data: segment, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to create segment', 
        success: false 
      };
    }
  }

  static async updateSegment(segmentId: string, data: Partial<SegmentInput>): Promise<ApiResponse<Segment>> {
    try {
      const { data: segment, error } = await (supabase as any)
        .schema('spinawheel')
        .from('segments')
        .update(data)
        .eq('id', segmentId)
        .select()
        .single();

      if (error) throw error;

      return { data: segment, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to update segment', 
        success: false 
      };
    }
  }

  static async deleteSegment(segmentId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await (supabase as any)
        .schema('spinawheel')
        .from('segments')
        .delete()
        .eq('id', segmentId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete segment', 
        success: false 
      };
    }
  }

  static async updateSegments(wheelId: string, segments: SegmentInput[]): Promise<ApiResponse<Segment[]>> {
    try {
      const { error: deleteError } = await (supabase as any)
        .schema('spinawheel')
        .from('segments')
        .delete()
        .eq('wheel_id', wheelId);

      if (deleteError) throw deleteError;

      const { data: newSegments, error: insertError } = await (supabase as any)
        .schema('spinawheel')
        .from('segments')
        .insert(segments.map(s => ({ ...s, wheel_id: wheelId })))
        .select();

      if (insertError) throw insertError;

      return { data: newSegments || [], success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to update segments', 
        success: false 
      };
    }
  }
}