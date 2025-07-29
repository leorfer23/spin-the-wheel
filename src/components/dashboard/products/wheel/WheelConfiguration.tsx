import { useState, useEffect, useCallback } from "react";
import type { Segment } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import type { WheelScheduleConfig } from "../../../../types/models";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";

// Import types and constants
import type { WheelConfigurationProps, WheelDesignConfig, WidgetConfig } from "./wheelConfigTypes";
import { tabs } from "./wheelConfigConstants";

// Import section components
import { SegmentsSection } from "./sections/SegmentsSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { HandleSection } from "./sections/HandleSection";
import { CaptureSection } from "./sections/CaptureSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { EmbedSection } from "./sections/EmbedSection";

// Custom debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function WheelConfiguration({
  segments,
  onUpdateSegments,
  wheelId,
  isUpdating = false,
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
    pointerStyle: 'arrow',
    pointerColor: '#EF4444',
    pointerSize: 40,
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const [localSegments, setLocalSegments] = useState(segments);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [wheelDesign, setWheelDesign] = useState<WheelDesignConfig>(wheelDesignConfig);
  const [scheduleConfig2, setScheduleConfig] = useState<WheelScheduleConfig>(scheduleConfig);
  const [localWidgetConfig, setLocalWidgetConfig] = useState<WidgetConfig>(widgetConfig);

  // Debounced save functions
  const debouncedSave = useCallback(
    debounce((newSegments: Segment[]) => {
      setSaveStatus("saving");
      onUpdateSegments(newSegments);
      
      setTimeout(() => {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      }, 500);
    }, 1000),
    [onUpdateSegments]
  );

  const debouncedSaveWheelDesign = useCallback(
    debounce((newDesign: WheelDesignConfig) => {
      setSaveStatus("saving");
      onUpdateWheelDesign?.(newDesign);
      
      setTimeout(() => {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      }, 500);
    }, 1000),
    [onUpdateWheelDesign]
  );

  const debouncedSaveScheduleConfig = useCallback(
    debounce((newConfig: WheelScheduleConfig) => {
      setSaveStatus("saving");
      onUpdateScheduleConfig?.(newConfig);
      
      setTimeout(() => {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      }, 500);
    }, 1000),
    [onUpdateScheduleConfig]
  );

  const debouncedSaveWidgetConfig = useCallback(
    debounce((newConfig: WidgetConfig) => {
      setSaveStatus("saving");
      onUpdateWidgetConfig?.(newConfig);
      
      setTimeout(() => {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      }, 500);
    }, 300),
    [onUpdateWidgetConfig]
  );

  // Update local segments when props change
  useEffect(() => {
    setLocalSegments(segments);
  }, [segments]);

  // Update wheel design when it changes
  useEffect(() => {
    if (hasUnsavedChanges && onUpdateWheelDesign) {
      debouncedSaveWheelDesign(wheelDesign);
    }
  }, [wheelDesign, hasUnsavedChanges, debouncedSaveWheelDesign, onUpdateWheelDesign]);

  // Update schedule config when it changes
  useEffect(() => {
    if (hasUnsavedChanges && onUpdateScheduleConfig) {
      debouncedSaveScheduleConfig(scheduleConfig2);
    }
  }, [scheduleConfig2, hasUnsavedChanges, debouncedSaveScheduleConfig, onUpdateScheduleConfig]);

  // Update widget config when it changes
  useEffect(() => {
    if (hasUnsavedChanges && onUpdateWidgetConfig) {
      debouncedSaveWidgetConfig(localWidgetConfig);
    }
  }, [localWidgetConfig, hasUnsavedChanges, debouncedSaveWidgetConfig, onUpdateWidgetConfig]);

  // Notify parent of active section change
  useEffect(() => {
    if (onActiveSectionChange) {
      onActiveSectionChange(activeSection);
    }
  }, [activeSection, onActiveSectionChange]);

  // Reset save status when updating
  useEffect(() => {
    if (isUpdating) {
      setSaveStatus("saving");
    }
  }, [isUpdating, saveStatus]);

  // Handle segment updates
  const handleSegmentUpdate = (newSegments: Segment[]) => {
    setLocalSegments(newSegments);
    setSaveStatus("pending");
    setHasUnsavedChanges(true);
    debouncedSave(newSegments);
  };

  // Handle wheel design updates
  const handleWheelDesignUpdate = (updates: Partial<WheelDesignConfig>) => {
    setWheelDesign(prev => ({ ...prev, ...updates }));
    setSaveStatus("pending");
    setHasUnsavedChanges(true);
  };

  // Handle widget config updates
  const handleWidgetConfigUpdate = (updates: Partial<WidgetConfig>) => {
    setLocalWidgetConfig(prev => ({ ...prev, ...updates }));
    setSaveStatus("pending");
    setHasUnsavedChanges(true);
  };

  // Handle schedule config updates
  const handleScheduleConfigUpdate = (newConfig: WheelScheduleConfig) => {
    setScheduleConfig(newConfig);
    setSaveStatus("pending");
    setHasUnsavedChanges(true);
  };

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
                    className={`relative p-3 rounded-full transition-all duration-200 ${
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
          <SegmentsSection
            segments={localSegments}
            onUpdateSegments={handleSegmentUpdate}
            saveStatus={saveStatus}
            selectedColorTheme={selectedColorTheme}
          />
        )}

        {activeSection === "appearance" && (
          <AppearanceSection
            wheelDesign={wheelDesign}
            onUpdateWheelDesign={handleWheelDesignUpdate}
            saveStatus={saveStatus}
          />
        )}

        {activeSection === "handle" && (
          <HandleSection
            widgetConfig={localWidgetConfig}
            onUpdateWidgetConfig={handleWidgetConfigUpdate}
          />
        )}

        {activeSection === "capture" && (
          <CaptureSection
            widgetConfig={localWidgetConfig}
            onUpdateWidgetConfig={handleWidgetConfigUpdate}
            segments={localSegments}
          />
        )}

        {activeSection === "schedule" && (
          <ScheduleSection
            scheduleConfig={scheduleConfig2}
            onUpdateScheduleConfig={handleScheduleConfigUpdate}
            saveStatus={saveStatus}
          />
        )}

        {activeSection === "embed" && (
          <EmbedSection
            wheelId={wheelId}
            widgetConfig={localWidgetConfig}
            selectedStyle={selectedStyle}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}