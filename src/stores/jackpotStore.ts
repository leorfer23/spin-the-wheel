import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { JackpotService } from "@/services/jackpotService";
import {
  DEFAULT_JACKPOT_SYMBOLS,
  DEFAULT_JACKPOT_WIDGET_CONFIG,
  DEFAULT_JACKPOT_SCHEDULE,
} from "@/config/jackpotDefaults";
import type { JackpotSymbol } from "@/components/dashboard/products/jackpot/types";

interface Jackpot {
  id: string;
  name: string;
  symbols: JackpotSymbol[];
  widgetConfig: Record<string, unknown>;
  schedule: Record<string, unknown>;
  is_active?: boolean;
}

interface JackpotState {
  jackpots: Jackpot[];
  selectedJackpotId: string | null;
  selectedJackpot: Jackpot | null;
  isLoading: boolean;
  hasJackpotSelected: boolean;
  activeConfigSection: string;

  loadJackpots: (storeId: string) => Promise<void>;
  selectJackpot: (id: string | null) => void;
  createJackpot: (storeId: string, name: string) => Promise<string | void>;
  updateSymbols: (symbols: JackpotSymbol[]) => Promise<void>;
  updateWidgetConfig: (config: Record<string, unknown>) => Promise<void>;
  updateSchedule: (schedule: Record<string, unknown>) => Promise<void>;
  setActiveConfigSection: (section: string) => void;
}

export const useJackpotStore = create<JackpotState>()(
  devtools((set, get) => ({
    jackpots: [],
    selectedJackpotId: null,
    selectedJackpot: null,
    isLoading: false,
    hasJackpotSelected: false,
    activeConfigSection: "segments",

    loadJackpots: async (storeId: string) => {
      set({ isLoading: true });
      const res = await JackpotService.getJackpots(storeId);
      const jackpots: Jackpot[] = (res.data || []).map((j) => ({
        id: j.id,
        name: j.name,
        symbols: j.config.symbols,
        widgetConfig: j.config.widgetConfig,
        schedule: j.config.schedule,
        is_active: j.is_active,
      }));
      set({ jackpots, isLoading: false });
      if (jackpots.length && !get().selectedJackpotId) {
        // Select latest created (end of list for in-memory service)
        get().selectJackpot(jackpots[jackpots.length - 1].id);
      }
    },

    selectJackpot: (id: string | null) => {
      const jackpot = get().jackpots.find((j) => j.id === id) || null;
      set({
        selectedJackpotId: id,
        selectedJackpot: jackpot,
        hasJackpotSelected: !!jackpot,
      });
    },

    createJackpot: async (storeId: string, name: string) => {
      const res = await JackpotService.createJackpot(storeId, {
        name,
        is_active: false,
        config: {
          symbols: DEFAULT_JACKPOT_SYMBOLS,
          widgetConfig: DEFAULT_JACKPOT_WIDGET_CONFIG,
          schedule: DEFAULT_JACKPOT_SCHEDULE,
        },
      } as any);
      if (res.success && res.data) {
        const j = res.data;
        const jackpot: Jackpot = {
          id: j.id,
          name: j.name,
          symbols: j.config.symbols,
          widgetConfig: j.config.widgetConfig,
          schedule: j.config.schedule,
          is_active: j.is_active,
        };
        set((state) => ({ jackpots: [...state.jackpots, jackpot] }));
        get().selectJackpot(jackpot.id);
        return jackpot.id;
      }
    },

    updateSymbols: async (symbols: JackpotSymbol[]) => {
      const current = get().selectedJackpot;
      if (!current) return;
      set((state) => ({
        jackpots: state.jackpots.map((j) =>
          j.id === current.id ? { ...j, symbols } : j
        ),
        selectedJackpot: { ...current, symbols },
      }));
    },

    updateWidgetConfig: async (config: Record<string, unknown>) => {
      const current = get().selectedJackpot;
      if (!current) return;
      set((state) => ({
        jackpots: state.jackpots.map((j) =>
          j.id === current.id
            ? { ...j, widgetConfig: { ...current.widgetConfig, ...config } }
            : j
        ),
        selectedJackpot: {
          ...current,
          widgetConfig: { ...current.widgetConfig, ...config },
        },
      }));
    },

    updateSchedule: async (schedule: Record<string, unknown>) => {
      const current = get().selectedJackpot;
      if (!current) return;
      set((state) => ({
        jackpots: state.jackpots.map((j) =>
          j.id === current.id ? { ...j, schedule } : j
        ),
        selectedJackpot: { ...current, schedule },
      }));
    },

    setActiveConfigSection: (section: string) =>
      set({ activeConfigSection: section }),
  }))
);
