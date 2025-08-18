import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, BarChart3 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { FortuneWheel } from "../../../wheel/FortuneWheel";
import { WheelSelector } from "./WheelSelector";
import { PreviewCarousel } from "../../../widget/PreviewCarousel";
import { FullWidget } from "../../../widget/FullWidget";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";
import { useWheelStore } from "../../../../stores/wheelStore";
import { useStore } from "../../../../contexts/StoreContext";
import { useAuth } from "../../../../contexts/AuthContext";
import type { WheelConfig } from "./types";
import type { WheelScheduleConfig } from "../../../../types/models";
import { CreateFirstProductPlaceholder } from "../common/CreateFirstProductPlaceholder";
import { Switch } from "../../../ui/switch";
import { Label } from "../../../ui/label";

interface WheelProductProps {
  onModeChange?: (mode: "edit" | "report") => void;
  mode?: "edit" | "report";
}

export const WheelProduct: React.FC<WheelProductProps> = ({
  onModeChange,
  mode = "edit",
}) => {
  const { wheelId } = useParams<{ wheelId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedStoreId, stores } = useStore();
  const [showFullFlow, setShowFullFlow] = useState(false);

  // Get the tiendanube_store_id from the selected store
  const selectedStore = stores.find((s) => s.id === selectedStoreId);
  const tiendanubeStoreId = selectedStore?.tiendanube_store_id;

  // Get everything from Zustand store - single source of truth
  const {
    wheels,
    selectedWheelId,
    selectedWheel,
    isLoading,
    error,
    activeConfigSection,
    loadWheels,
    selectWheel,
    createWheel,
    updateWheelName,
    deleteWheel,
    setWheelActive,
  } = useWheelStore();

  // Load wheels when store is selected (only once per store change)
  useEffect(() => {
    if (tiendanubeStoreId && user) {
      loadWheels(tiendanubeStoreId);
    }
  }, [tiendanubeStoreId, user]); // Using tiendanubeStoreId instead of selectedStoreId

  // Handle URL wheel ID changes
  useEffect(() => {
    if (wheelId && wheelId !== selectedWheelId) {
      selectWheel(wheelId);
    } else if (!wheelId && selectedWheelId) {
      // If no wheel in URL but one is selected, update URL
      navigate(`/dashboard/wheels/${selectedWheelId}`);
    }
  }, [wheelId, selectedWheelId]); // Watch both wheelId and selectedWheelId

  const [wheelDesignConfig] = useState({
    // Theme
    designTheme: "modern" as const,

    // Background
    backgroundStyle: "solid",
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#8B5CF6",
    backgroundGradientTo: "#EC4899",
    backgroundImage: undefined,
    backgroundOpacity: 1,

    // Wheel specific background
    wheelBackgroundColor: undefined,
    wheelBackgroundGradientFrom: undefined,
    wheelBackgroundGradientTo: undefined,
    wheelBorderStyle: "solid" as const,
    wheelBorderColor: "#8B5CF6",
    wheelBorderWidth: 4,
    wheelBorderGradientFrom: undefined,
    wheelBorderGradientTo: undefined,

    // Shadow
    shadowColor: "#8B5CF6",
    shadowIntensity: 0.3,
    shadowBlur: 30,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    innerShadowEnabled: false,
    innerShadowColor: "#000000",

    // Pegs
    pegStyle: "dots",
    pegColor: "#FFD700",
    pegSize: 10,
    pegGlowEnabled: false,
    pegGlowColor: "#FFD700",

    // Center Button
    centerButtonText: "GIRAR",
    centerButtonTextSize: "medium",
    centerButtonBackgroundColor: "#8B5CF6",
    centerButtonTextColor: "#FFFFFF",
    centerButtonLogo: undefined,
    centerButtonBorderColor: undefined,
    centerButtonBorderWidth: 0,
    centerButtonGlowEnabled: false,
    centerButtonGlowColor: "#8B5CF6",
    centerButtonFont: "default",
    centerButtonFontWeight: "bold",

    // Pointer
    pointerStyle: "triangle",
    pointerColor: "#FF1744",
    pointerSize: 60,
    pointerGlowEnabled: false,
    pointerGlowColor: "#FF1744",

    // Effects
    spinningEffect: "smooth",
    spinDuration: 5,
    rotations: 5,
    soundEnabled: false,
    confettiEnabled: true,
    glowEffect: true,
    sparkleEffect: false,
    pulseEffect: false,

    // Segment styling
    segmentBorderEnabled: false,
    segmentBorderColor: "#ffffff",
    segmentBorderWidth: 2,
    segmentSeparatorEnabled: false,
    segmentSeparatorColor: "#e5e7eb",
    segmentTextFont: "default",
    segmentTextBold: false,
    segmentTextShadow: false,
  });

  // Handle wheel selection changes
  const handleSelectWheel = (wheelId: string) => {
    selectWheel(wheelId);
    navigate(`/dashboard/wheels/${wheelId}`);
  };

  // Handle create wheel
  const handleCreateWheel = (name?: string) => {
    const wheelName = name || "Nueva Campaña";

    if (tiendanubeStoreId) {
      const beforeIds = new Set((wheels || []).map((w) => w.id));
      createWheel(tiendanubeStoreId, wheelName).then(() => {
        const created = getLatestCreatedId(wheels, beforeIds);
        if (created) {
          navigate(`/dashboard/wheels/${created}`);
        } else if (selectedWheelId) {
          navigate(`/dashboard/wheels/${selectedWheelId}`);
        }
      });
    }

    return {
      id: "temp-" + Date.now(),
      name: wheelName,
      segments: [],
      schedule: {
        enabled: false,
        timezone: "America/Argentina/Buenos_Aires",
      } as WheelScheduleConfig,
      wheelDesign: {},
      widgetConfig: {},
    };
  };

  function getLatestCreatedId(
    current: any[],
    beforeIds: Set<string>
  ): string | null {
    const after = (current || []).filter((w) => !beforeIds.has(w.id));
    if (after.length > 0) return after[0].id;
    return selectedWheelId || null;
  }

  if (isLoading && wheels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando ruletas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar las ruletas</p>
          <p className="text-gray-500 text-sm">
            {error?.message || "Por favor, intenta nuevamente más tarde"}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedWheel) {
    return (
      <CreateFirstProductPlaceholder
        onCreate={() => handleCreateWheel()}
        primaryMessage="Haz clic para crear tu primera ruleta"
        secondaryMessage="¡Comienza a interactuar con tus clientes!"
      >
        <FortuneWheel
          config={{
            segments: [
              { id: "1", label: "?", value: "?", color: "#E5E7EB", weight: 1 },
              { id: "2", label: "?", value: "?", color: "#D1D5DB", weight: 1 },
              { id: "3", label: "?", value: "?", color: "#E5E7EB", weight: 1 },
              { id: "4", label: "?", value: "?", color: "#D1D5DB", weight: 1 },
              { id: "5", label: "?", value: "?", color: "#E5E7EB", weight: 1 },
              { id: "6", label: "?", value: "?", color: "#D1D5DB", weight: 1 },
            ],
            dimensions: {
              diameter: 500,
              innerRadius: 75,
              pegRingWidth: 38,
              pegSize: 12,
              pegCount: 16,
            },
            style: {
              shadow: "0 15px 40px rgba(0, 0, 0, 0.15)",
              borderColor: "#E5E7EB",
              borderWidth: 12,
            },
            centerCircle: {
              text: "+",
              backgroundColor: "#F3F4F6",
              textColor: "#9CA3AF",
              fontSize: 60,
              showButton: false,
            },
            pointer: { color: "#9CA3AF", size: 55, style: "arrow" },
            spinConfig: {
              duration: 0,
              easing: "ease-out",
              minRotations: 0,
              maxRotations: 0,
              allowDrag: false,
            },
          }}
          onSpinComplete={() => {}}
        />
      </CreateFirstProductPlaceholder>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full w-full">
        {/* Header Row Container */}
        <div className="h-16 flex items-center justify-between px-4">
          {/* Empty space on left for balance */}
          <div className="w-48"></div>

          {/* Centered WheelSelector */}
          <div className="flex-1 flex justify-center">
            <WheelSelector
              wheels={wheels as WheelConfig[]}
              selectedWheelId={selectedWheelId || ""}
              onSelectWheel={handleSelectWheel}
              onCreateWheel={handleCreateWheel}
              onUpdateWheelName={updateWheelName}
              onDeleteWheel={deleteWheel}
            />
          </div>

          {/* Action Buttons on the right */}
          <div className="w-48 flex justify-end gap-2">
            {/* Active Toggle */}
            {selectedWheel && (
              <WheelActiveToggle
                isActive={!!selectedWheel.is_active}
                wheelId={selectedWheelId || ""}
                onToggle={async (checked) => {
                  if (!selectedWheelId) return;
                  await setWheelActive(selectedWheelId, checked);
                }}
              />
            )}

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const newMode = mode === "edit" ? "report" : "edit";
                    onModeChange?.(newMode);
                  }}
                  className={`p-2.5 rounded-lg shadow-lg transition-all cursor-pointer ${
                    mode === "report"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-purple-600"
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white">
                {mode === "edit" ? "Ver Reportes" : "Editar Configuración"}
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFullFlow(true)}
                  className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all cursor-pointer"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white">
                Vista Previa
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Content Area - Carousel */}
        <div className="flex-1 wheel-preview">
          <PreviewCarousel
            segments={(selectedWheel.segments || []).map((s) => ({
              ...s,
              weight: s.weight ?? 10,
            }))}
            widgetConfig={
              selectedWheel?.widgetConfig || {
                handlePosition: "right",
                handleType: "floating",
                handleText: "¡Gana Premios!",
                handleBackgroundColor: "#8B5CF6",
                handleTextColor: "#FFFFFF",
                handleIcon: "🎁",
                handleSize: "medium",
                handleAnimation: "pulse",
                handleBorderRadius: "9999px",
                captureImageUrl:
                  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop",
                captureTitle: "¡Gira y Gana Premios Increíbles!",
                captureSubtitle:
                  "Ingresa tu email para participar y ganar descuentos exclusivos",
                captureButtonText: "¡Quiero Participar!",
                capturePrivacyText:
                  "Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.",
                captureFormat: "instant",
              }
            }
            wheelDesignConfig={{
              ...wheelDesignConfig,
              ...selectedWheel?.wheelDesign,
            }}
            activeConfigSection={activeConfigSection}
          />
        </div>

        {/* Full Flow Preview Modal */}
        {showFullFlow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFullFlow(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <FullWidget
                config={{
                  segments: (selectedWheel.segments || []).map((s) => ({
                    ...s,
                    weight: s.weight ?? 10,
                  })),
                  handleType:
                    selectedWheel?.widgetConfig?.handleType || "floating",
                  handlePosition:
                    selectedWheel?.widgetConfig?.handlePosition || "right",
                  handleText:
                    selectedWheel?.widgetConfig?.handleText || "¡Gana Premios!",
                  handleBackgroundColor:
                    selectedWheel?.widgetConfig?.handleBackgroundColor ||
                    "#8B5CF6",
                  handleTextColor:
                    selectedWheel?.widgetConfig?.handleTextColor || "#FFFFFF",
                  handleIcon: selectedWheel?.widgetConfig?.handleIcon || "🎁",
                  handleSize:
                    selectedWheel?.widgetConfig?.handleSize || "medium",
                  handleAnimation:
                    selectedWheel?.widgetConfig?.handleAnimation || "pulse",
                  handleBorderRadius:
                    selectedWheel?.widgetConfig?.handleBorderRadius || "9999px",
                  captureImageUrl:
                    selectedWheel?.widgetConfig?.captureImageUrl ||
                    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop",
                  captureTitle:
                    selectedWheel?.widgetConfig?.captureTitle ||
                    "¡Gira y Gana Premios Increíbles!",
                  captureSubtitle:
                    selectedWheel?.widgetConfig?.captureSubtitle ||
                    "Ingresa tu email para participar y ganar descuentos exclusivos",
                  captureButtonText:
                    selectedWheel?.widgetConfig?.captureButtonText ||
                    "¡Quiero Participar!",
                  capturePrivacyText:
                    selectedWheel?.widgetConfig?.capturePrivacyText ||
                    "Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.",
                  primaryColor:
                    selectedWheel?.widgetConfig?.handleBackgroundColor ||
                    "#8B5CF6",
                  backgroundColor: "#FFFFFF",
                }}
                onClose={() => setShowFullFlow(false)}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

const WheelActiveToggle: React.FC<{
  isActive: boolean;
  wheelId: string;
  onToggle: (checked: boolean) => Promise<void> | void;
}> = ({ isActive, wheelId, onToggle }) => {
  const [updating, setUpdating] = useState(false);
  const toggleId = `wheel-active-${wheelId}`;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors select-none ${
            isActive
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <Switch
            id={toggleId}
            checked={isActive}
            disabled={updating}
            onCheckedChange={(checked) => {
              if (updating) return;
              setUpdating(true);
              Promise.resolve(onToggle(checked)).finally(() =>
                setUpdating(false)
              );
            }}
          />
          <Label
            className={`text-sm font-medium cursor-pointer ${
              isActive ? "text-green-700" : "text-gray-600"
            }`}
            onClick={() => {
              if (updating) return;
              setUpdating(true);
              Promise.resolve(onToggle(!isActive)).finally(() =>
                setUpdating(false)
              );
            }}
          >
            {isActive ? "Activa" : "Inactiva"}
          </Label>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-gray-900 text-white">
        Activa o desactiva la ruleta para tu tienda
      </TooltipContent>
    </Tooltip>
  );
};
