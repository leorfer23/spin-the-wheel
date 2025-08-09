import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, BarChart3 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { FortuneWheel } from "../../../wheel/FortuneWheel";
import { WheelSelector } from "./WheelSelector";
import { PreviewCarousel } from "../../../widget/PreviewCarousel";
import { FullWidget } from "../../../widget/FullWidget";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";
import { useWheelStore } from "../../../../stores/wheelStore";
import { useStore } from "../../../../contexts/StoreContext";
import { useAuth } from "../../../../contexts/AuthContext";
import type { WheelConfig } from "./types";
import type { WheelScheduleConfig } from "../../../../types/models";

interface WheelProductProps {
  onModeChange?: (mode: 'edit' | 'report') => void;
  mode?: 'edit' | 'report';
}

export const WheelProduct: React.FC<WheelProductProps> = ({
  onModeChange,
  mode = 'edit',
}) => {
  const { wheelId } = useParams<{ wheelId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedStoreId, stores } = useStore();
  const [showFullFlow, setShowFullFlow] = useState(false);
  
  // Get the tiendanube_store_id from the selected store
  const selectedStore = stores.find(s => s.id === selectedStoreId);
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
      navigate(`/dashboard/wheel/${selectedWheelId}`);
    }
  }, [wheelId, selectedWheelId]); // Watch both wheelId and selectedWheelId

  const [wheelDesignConfig] = useState({
    // Theme
    designTheme: 'modern' as const,
    
    // Background
    backgroundStyle: 'solid',
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#8B5CF6',
    backgroundGradientTo: '#EC4899',
    backgroundImage: undefined,
    backgroundOpacity: 1,
    
    // Wheel specific background
    wheelBackgroundColor: undefined,
    wheelBackgroundGradientFrom: undefined,
    wheelBackgroundGradientTo: undefined,
    wheelBorderStyle: 'solid' as const,
    wheelBorderColor: '#8B5CF6',
    wheelBorderWidth: 4,
    wheelBorderGradientFrom: undefined,
    wheelBorderGradientTo: undefined,
    
    // Shadow
    shadowColor: '#8B5CF6',
    shadowIntensity: 0.3,
    shadowBlur: 30,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    innerShadowEnabled: false,
    innerShadowColor: '#000000',
    
    // Pegs
    pegStyle: 'dots',
    pegColor: '#FFD700',
    pegSize: 10,
    pegGlowEnabled: false,
    pegGlowColor: '#FFD700',
    
    // Center Button
    centerButtonText: 'SPIN',
    centerButtonTextSize: 'medium',
    centerButtonBackgroundColor: '#8B5CF6',
    centerButtonTextColor: '#FFFFFF',
    centerButtonLogo: undefined,
    centerButtonBorderColor: undefined,
    centerButtonBorderWidth: 0,
    centerButtonGlowEnabled: false,
    centerButtonGlowColor: '#8B5CF6',
    centerButtonFont: 'default',
    centerButtonFontWeight: 'bold',
    
    // Pointer
    pointerStyle: 'arrow',
    pointerColor: '#FF1744',
    pointerSize: 40,
    pointerGlowEnabled: false,
    pointerGlowColor: '#FF1744',
    
    // Effects
    spinningEffect: 'smooth',
    spinDuration: 5,
    rotations: 5,
    soundEnabled: false,
    confettiEnabled: true,
    glowEffect: true,
    sparkleEffect: false,
    pulseEffect: false,
    
    // Segment styling
    segmentBorderEnabled: false,
    segmentBorderColor: '#ffffff',
    segmentBorderWidth: 2,
    segmentSeparatorEnabled: false,
    segmentSeparatorColor: '#e5e7eb',
    segmentTextFont: 'default',
    segmentTextBold: false,
    segmentTextShadow: false,
  });
  
  // Handle wheel selection changes
  const handleSelectWheel = (wheelId: string) => {
    selectWheel(wheelId);
    navigate(`/dashboard/wheel/${wheelId}`);
  };

  // Handle create wheel
  const handleCreateWheel = (name?: string) => {
    if (tiendanubeStoreId) {
      const wheelName = name || 'New Campaign';
      createWheel(tiendanubeStoreId, wheelName);
      // Return a dummy WheelConfig since the actual creation is async
      // The real wheel will be loaded after creation
      return {
        id: 'temp-' + Date.now(),
        name: wheelName,
        segments: [],
        schedule: {
          enabled: false,
          timezone: 'America/Argentina/Buenos_Aires'
        } as WheelScheduleConfig,
        wheelDesign: {},
        widgetConfig: {}
      };
    }
    // Return a dummy config if no store selected
    return {
      id: 'temp-' + Date.now(),
      name: name || 'New Campaign',
      segments: [],
      schedule: {
        enabled: false,
        timezone: 'America/Argentina/Buenos_Aires'
      } as WheelScheduleConfig,
      wheelDesign: {},
      widgetConfig: {}
    };
  };

  if (isLoading && wheels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading wheels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load wheels</p>
          <p className="text-gray-500 text-sm">
            {error?.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedWheel) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8">
        <div
          className="relative group cursor-pointer w-full max-w-[600px] aspect-square flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300"
          onClick={() => handleCreateWheel()}
        >
          {/* Purple glowing ring effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-[520px] h-[520px] rounded-full bg-purple-500/20 animate-pulse blur-xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
            <div className="absolute w-[510px] h-[510px] rounded-full ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 group-hover:ring-4 transition-all duration-300"></div>
          </div>

          {/* Greyed out wheel placeholder */}
          <div className="relative opacity-30 hover:opacity-50 transition-opacity duration-300">
            <FortuneWheel
              config={{
                segments: [
                  {
                    id: "1",
                    label: "?",
                    value: "?",
                    color: "#E5E7EB",
                    weight: 1,
                  },
                  {
                    id: "2",
                    label: "?",
                    value: "?",
                    color: "#D1D5DB",
                    weight: 1,
                  },
                  {
                    id: "3",
                    label: "?",
                    value: "?",
                    color: "#E5E7EB",
                    weight: 1,
                  },
                  {
                    id: "4",
                    label: "?",
                    value: "?",
                    color: "#D1D5DB",
                    weight: 1,
                  },
                  {
                    id: "5",
                    label: "?",
                    value: "?",
                    color: "#E5E7EB",
                    weight: 1,
                  },
                  {
                    id: "6",
                    label: "?",
                    value: "?",
                    color: "#D1D5DB",
                    weight: 1,
                  },
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
                pointer: {
                  color: "#9CA3AF",
                  size: 55,
                  style: "arrow",
                },
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
          </div>

          {/* Hover tooltip */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900/95 backdrop-blur text-white px-6 py-3 rounded-lg shadow-xl transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 border border-purple-500/30">
              <p className="text-lg font-medium">
                Click to create your first wheel
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Start engaging your customers!
              </p>
            </div>
          </div>
        </div>
      </div>
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
            selectedWheelId={selectedWheelId || ''}
            onSelectWheel={handleSelectWheel}
            onCreateWheel={handleCreateWheel}
            onUpdateWheelName={updateWheelName}
            onDeleteWheel={deleteWheel}
          />
        </div>

        {/* Action Buttons on the right */}
        <div className="w-48 flex justify-end gap-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newMode = mode === 'edit' ? 'report' : 'edit';
                  onModeChange?.(newMode);
                }}
                className={`p-2.5 rounded-lg shadow-lg transition-all cursor-pointer ${
                  mode === 'report'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white">
              {mode === 'edit' ? 'Ver Reportes' : 'Editar Configuración'}
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
      <div className="flex-1">
        <PreviewCarousel
          segments={(selectedWheel.segments || []).map(s => ({
            ...s,
            weight: s.weight ?? 10
          }))}
          widgetConfig={selectedWheel?.widgetConfig || {
            handlePosition: 'right',
            handleType: 'floating',
            handleText: '¡Gana Premios!',
            handleBackgroundColor: '#8B5CF6',
            handleTextColor: '#FFFFFF',
            handleIcon: '🎁',
            handleSize: 'medium',
            handleAnimation: 'pulse',
            handleBorderRadius: '9999px',
            captureImageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
            captureTitle: '¡Gira y Gana Premios Increíbles!',
            captureSubtitle: 'Ingresa tu email para participar y ganar descuentos exclusivos',
            captureButtonText: '¡Quiero Participar!',
            capturePrivacyText: 'Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.',
            captureFormat: 'instant'
          }}
          wheelDesignConfig={selectedWheel?.wheelDesign || wheelDesignConfig}
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
                segments: (selectedWheel.segments || []).map(s => ({
                  ...s,
                  weight: s.weight ?? 10
                })),
                handleType: selectedWheel?.widgetConfig?.handleType || 'floating',
                handlePosition: selectedWheel?.widgetConfig?.handlePosition || 'right',
                handleText: selectedWheel?.widgetConfig?.handleText || '¡Gana Premios!',
                handleBackgroundColor: selectedWheel?.widgetConfig?.handleBackgroundColor || '#8B5CF6',
                handleTextColor: selectedWheel?.widgetConfig?.handleTextColor || '#FFFFFF',
                handleIcon: selectedWheel?.widgetConfig?.handleIcon || '🎁',
                handleSize: selectedWheel?.widgetConfig?.handleSize || 'medium',
                handleAnimation: selectedWheel?.widgetConfig?.handleAnimation || 'pulse',
                handleBorderRadius: selectedWheel?.widgetConfig?.handleBorderRadius || '9999px',
                captureImageUrl: selectedWheel?.widgetConfig?.captureImageUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
                captureTitle: selectedWheel?.widgetConfig?.captureTitle || '¡Gira y Gana Premios Increíbles!',
                captureSubtitle: selectedWheel?.widgetConfig?.captureSubtitle || 'Ingresa tu email para participar y ganar descuentos exclusivos',
                captureButtonText: selectedWheel?.widgetConfig?.captureButtonText || '¡Quiero Participar!',
                capturePrivacyText: selectedWheel?.widgetConfig?.capturePrivacyText || 'Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.',
                primaryColor: selectedWheel?.widgetConfig?.handleBackgroundColor || '#8B5CF6',
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