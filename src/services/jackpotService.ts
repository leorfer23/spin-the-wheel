import type { ApiResponse } from "../types/models";
import { supabase } from "../lib/supabase";

type JackpotRecord = {
  id: string;
  name: string;
  tiendanube_store_id: string;
  is_active?: boolean;
  config: {
    symbols: {
      id: string;
      label: string;
      icon: string;
      weight1: number;
      weight2: number;
      weight3: number;
    }[];
    widgetConfig: Record<string, unknown>;
    schedule: Record<string, unknown>;
  };
};

export class JackpotService {
  static async getJackpots(
    storeId: string
  ): Promise<ApiResponse<JackpotRecord[]>> {
    try {
      const { data, error } = await (supabase as any)
        .schema("spinawheel")
        .from("jackpots")
        .select("*")
        .eq("tiendanube_store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data: (data || []) as JackpotRecord[] };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch jackpots",
      };
    }
  }

  static async getJackpot(
    jackpotId: string
  ): Promise<ApiResponse<JackpotRecord>> {
    try {
      const { data, error } = await (supabase as any)
        .schema("spinawheel")
        .from("jackpots")
        .select("*")
        .eq("id", jackpotId)
        .single();
      if (error) throw error;
      return { success: true, data: data as JackpotRecord };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch jackpot",
      };
    }
  }

  static async createJackpot(
    storeId: string,
    data: Omit<JackpotRecord, "id" | "tiendanube_store_id">
  ): Promise<ApiResponse<JackpotRecord>> {
    try {
      await supabase.auth.getUser();

      const insertData = {
        tiendanube_store_id: storeId,
        name: (data as any).name || "Nuevo Jackpot",
        config: (data as any).config || {},
        is_active:
          (data as any).is_active !== undefined
            ? (data as any).is_active
            : false,
      };

      const { data: record, error } = await (supabase as any)
        .schema("spinawheel")
        .from("jackpots")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: record as JackpotRecord };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create jackpot",
      };
    }
  }

  static async updateJackpot(
    jackpotId: string,
    updates: Partial<JackpotRecord>
  ): Promise<ApiResponse<JackpotRecord>> {
    try {
      const { data, error } = await (supabase as any)
        .schema("spinawheel")
        .from("jackpots")
        .update(updates as any)
        .eq("id", jackpotId)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as JackpotRecord };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update jackpot",
      };
    }
  }

  static async deleteJackpot(jackpotId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await (supabase as any)
        .schema("spinawheel")
        .from("jackpots")
        .delete()
        .eq("id", jackpotId);
      if (error) throw error;
      return { success: true } as ApiResponse<void>;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete jackpot",
      };
    }
  }
}
