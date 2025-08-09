import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";
import { useAutoSaveStore } from "@/stores/autoSaveStore";
import { TiendaNubeCouponsProvider } from "@/contexts/TiendaNubeCouponsContext";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTiendaNubeIntegration } from "@/hooks/useTiendaNubeCoupons";
import { toast } from "sonner";

// Import types and constants
import type { WheelConfigurationProps } from "./wheelConfigTypes";
import { tabs } from "./wheelConfigConstants";

// Import section components
import { SegmentsSection } from "./sections/SegmentsSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { HandleSection } from "./sections/HandleSection";
import { CaptureSection } from "./sections/CaptureSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { EmbedSection } from "./sections/EmbedSection";

export function WheelConfiguration({
  segments,
  onUpdateSegments,
  wheelId,
  widgetConfig = {
    handlePosition: 'right',
    handleType: 'floating',
    handleText: '¡Gana Premios!',
    handleBackgroundColor: '#8B5CF6',
    handleTextColor: '#FFFFFF',
    handleIcon: '🎁',
    handleSize: 'medium',
    handleAnimation: 'pulse',
    handleBorderRadius: '9999px',
    captureImageUrl: '',
    captureTitle: '¡Gira y Gana Premios Increíbles!',
    captureSubtitle: 'Ingresa tu email para participar y ganar descuentos exclusivos',
    captureButtonText: '¡Quiero Participar!',
    capturePrivacyText: 'Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.',
    captureFormat: 'instant'
  },
  onUpdateWidgetConfig,
  wheelDesignConfig = {
    // Theme
    designTheme: 'modern' as const,
    
    // Background
    backgroundStyle: 'solid',
    backgroundColor: '#F3F4F6',
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
    shadowColor: '#000000',
    shadowIntensity: 0.2,
    shadowBlur: 30,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    innerShadowEnabled: false,
    innerShadowColor: '#000000',
    
    // Pegs
    pegStyle: 'dots',
    pegColor: '#FFD700',
    pegSize: 20,
    pegGlowEnabled: false,
    pegGlowColor: '#FFD700',
    
    // Center Button
    centerButtonText: 'GIRAR',
    centerButtonTextSize: 'medium',
    centerButtonBackgroundColor: '#8B5CF6',
    centerButtonTextColor: '#FFFFFF',
    centerButtonLogo: '',
    centerButtonBorderColor: undefined,
    centerButtonBorderWidth: 0,
    centerButtonGlowEnabled: false,
    centerButtonGlowColor: '#8B5CF6',
    centerButtonFont: 'default',
    centerButtonFontWeight: 'bold',
    
    // Pointer
    pointerStyle: 'triangle',
    pointerColor: '#EF4444',
    pointerSize: 60,
    pointerGlowEnabled: false,
    pointerGlowColor: '#EF4444',
    
    // Effects
    spinningEffect: 'smooth',
    spinDuration: 5,
    rotations: 5,
    soundEnabled: true,
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
  },
  onUpdateWheelDesign,
  onActiveSectionChange,
  scheduleConfig = {
    enabled: false,
    timezone: 'America/Argentina/Buenos_Aires',
    dateRange: {
      startDate: null,
      endDate: null,
    },
  },
  onUpdateScheduleConfig,
}: WheelConfigurationProps) {
  const [activeSection, setActiveSection] = useState<"segments" | "appearance" | "handle" | "capture" | "schedule" | "embed">("segments");
  const [selectedStyle] = useState("modern");
  const [selectedColorTheme] = useState(0);
  
  // Clear all pending saves when switching wheels or unmounting
  const { clearAllPending } = useAutoSaveStore();
  
  // Get store and auth context for TiendaNube integration
  const { selectedStoreId } = useStore();
  const { user } = useAuth();
  
  // Check integration status
  const { isConnected } = useTiendaNubeIntegration(selectedStoreId || undefined);
  
  // Handle re-authorization
  const handleReauthorize = async () => {
    if (!selectedStoreId || !user) {
      toast.error('No se pudo identificar la tienda o el usuario');
      return;
    }

    try {
      const response = await fetch('/api/integrations/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'tiendanube',
          storeId: selectedStoreId,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to initiate OAuth');

      const { authUrl } = await response.json();
      toast.info('Redirigiendo a TiendaNube para autorización...');
      window.location.href = authUrl;
    } catch (err) {
      toast.error('Error al iniciar re-autorización');
    }
  };

  // Clear pending saves when switching wheels
  useEffect(() => {
    return () => {
      clearAllPending();
    };
  }, [wheelId, clearAllPending]);

  // Notify parent of active section change
  useEffect(() => {
    if (onActiveSectionChange) {
      onActiveSectionChange(activeSection);
    }
  }, [activeSection, onActiveSectionChange]);


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full max-w-4xl mx-auto flex flex-col"
    >
      {/* Minimalistic Tab Navigation */}
      <TooltipProvider>
        <motion.div 
          className="mx-auto w-fit bg-white/90 backdrop-blur-md rounded-full shadow-xl p-3 mb-3 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Tab Container */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => setActiveSection(tab.id as any)}
                    className={`relative p-3 rounded-full transition-all duration-200 cursor-pointer ${
                      activeSection === tab.id
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    }`}
                    whileHover={{ scale: activeSection === tab.id ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon className={`transition-all duration-200 ${
                      activeSection === tab.id ? "w-6 h-6" : "w-5 h-5"
                    }`} />
                    {activeSection === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{tab.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{tab.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </motion.div>
      </TooltipProvider>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {activeSection === "segments" && (
        <TiendaNubeCouponsProvider
          storeId={selectedStoreId}
          isConnected={isConnected}
          onReauthRequired={handleReauthorize}
        >
          <SegmentsSection
            segments={segments}
            onUpdateSegments={onUpdateSegments}
            saveStatus="idle"
            selectedColorTheme={selectedColorTheme}
          />
        </TiendaNubeCouponsProvider>
      )}

        {activeSection === "appearance" && (
          <AppearanceSection
            wheelDesign={wheelDesignConfig}
            onUpdateWheelDesign={onUpdateWheelDesign || (() => {})}
            saveStatus="idle"
          />
        )}

        {activeSection === "handle" && (
          <HandleSection
            widgetConfig={widgetConfig}
            onUpdateWidgetConfig={onUpdateWidgetConfig || (() => {})}
          />
        )}

        {activeSection === "capture" && (
          <CaptureSection
            widgetConfig={widgetConfig}
            onUpdateWidgetConfig={onUpdateWidgetConfig || (() => {})}
            segments={segments}
          />
        )}

        {activeSection === "schedule" && (
          <ScheduleSection
            scheduleConfig={scheduleConfig}
            onUpdateScheduleConfig={onUpdateScheduleConfig || (() => {})}
            saveStatus="idle"
          />
        )}

        {activeSection === "embed" && (
          <EmbedSection
            wheelId={wheelId}
            widgetConfig={widgetConfig}
            selectedStyle={selectedStyle}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}