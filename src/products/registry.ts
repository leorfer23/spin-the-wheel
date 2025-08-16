import type { ProductRegistry } from "./types";
import type { ProductMeta } from "@/types/product";
import { useWheelStore } from "@/stores/wheelStore";
import { WheelConfiguration } from "@/components/dashboard/products/wheel/WheelConfiguration";
import { useJackpotStore } from "@/stores/jackpotStore";
import { JackpotConfiguration } from "@/components/dashboard/products/jackpot/JackpotConfiguration";
import type { JackpotSymbol } from "@/components/dashboard/products/jackpot/types";
import type { Segment } from "@/components/dashboard/products/wheel/types";

// Catalog metadata for left ProductSelector and general product info
export const PRODUCT_CATALOG: ProductMeta[] = [
  {
    id: "wheel",
    name: "Rueda de Premios",
    description: "Gira para ganar premios",
    icon: "🎡",
    available: true,
    businessOutcome:
      "Captura más leads de email para convertirlos en clientes más tarde",
  },
  {
    id: "jackpot",
    name: "Jackpot",
    description: "Acumula y gana el premio mayor",
    icon: "💰",
    available: true,
  },
  {
    id: "lottery",
    name: "Sorteo de la Suerte",
    description: "Elige tus números",
    icon: "🎰",
    available: true,
  },
  {
    id: "scratch-card",
    name: "Tarjetas Rasca y Gana",
    description: "Juegos de premio instantáneo",
    icon: "🎟️",
    available: false,
  },
  {
    id: "slot-machine",
    name: "Máquina Tragamonedas",
    description: "Tira de la palanca",
    icon: "🎲",
    available: false,
  },
];

// Concrete adapters: map product to its config component and hooks
export const PRODUCT_REGISTRY: ProductRegistry = {
  wheel: {
    id: "wheel",
    ConfigComponent: WheelConfiguration,
    useConfigProps: () => {
      const {
        selectedWheel,
        isLoading,
        updateSegments,
        updateSchedule,
        updateWheelDesign,
        updateWidgetConfig,
        setActiveConfigSection,
      } = useWheelStore();

      const wheelData =
        selectedWheel ||
        ({
          id: "",
          segments: [],
          widgetConfig: {},
          wheelDesign: {},
          schedule: {},
        } as {
          id: string;
          segments: Segment[];
          widgetConfig: Record<string, unknown>;
          wheelDesign: Record<string, unknown>;
          schedule: Record<string, unknown>;
        });

      return {
        segments: wheelData.segments || [],
        onUpdateSegments: updateSegments,
        wheelId: wheelData.id,
        isUpdating: isLoading,
        widgetConfig: wheelData.widgetConfig,
        onUpdateWidgetConfig: updateWidgetConfig,
        wheelDesignConfig: wheelData.wheelDesign,
        onUpdateWheelDesign: updateWheelDesign,
        onActiveSectionChange: setActiveConfigSection,
        scheduleConfig: wheelData.schedule,
        onUpdateScheduleConfig: updateSchedule,
      };
    },
    useCanRenderConfig: () => {
      const { hasWheelSelected } = useWheelStore();
      return hasWheelSelected;
    },
  },
  jackpot: {
    id: "jackpot",
    ConfigComponent: JackpotConfiguration,
    useConfigProps: () => {
      const {
        selectedJackpot,
        updateSymbols,
        updateWidgetConfig,
        updateSchedule,
      } = useJackpotStore();

      const data = selectedJackpot || {
        id: "",
        symbols: [],
        widgetConfig: {},
        schedule: {},
      };

      return {
        jackpotId: data.id,
        symbols: data.symbols as JackpotSymbol[],
        onUpdateSymbols: (symbols: JackpotSymbol[]) => updateSymbols(symbols),
        widgetConfig: data.widgetConfig,
        onUpdateWidgetConfig: (c: Record<string, unknown>) =>
          updateWidgetConfig(c),
        scheduleConfig: data.schedule,
        onUpdateScheduleConfig: (s: Record<string, unknown>) =>
          updateSchedule(s),
      };
    },
    useCanRenderConfig: () => {
      const { hasJackpotSelected } = useJackpotStore();
      return hasJackpotSelected;
    },
  },
  "scratch-card": undefined,
  lottery: undefined,
  "slot-machine": undefined,
};
