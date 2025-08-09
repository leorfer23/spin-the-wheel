import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WheelConfiguration } from "../products/wheel/WheelConfiguration";
import { WheelReporting } from "../products/wheel/WheelReporting";
import { useWheelStore } from "../../../stores/wheelStore";

export type ConfigSection = "config";

interface ConfigurationPanelProps {
  children?: (activeSection: ConfigSection) => React.ReactNode;
  mode?: 'edit' | 'report';
  wheelData?: any;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  mode = 'edit',
  wheelData,
}) => {
  const [activeSection] = useState<ConfigSection>("config");
  
  // Use Zustand store for all updates - single source of truth
  const {
    updateSegments,
    updateSchedule,
    updateWheelDesign,
    updateWidgetConfig,
    setActiveConfigSection,
    isLoading: isUpdating,
  } = useWheelStore();

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

  if (!wheelData) {
    return null;
  }

  const renderContent = () => {
    if (mode === 'report') {
      return (
        <WheelReporting
          wheelId={wheelData.id}
          segments={wheelData.segments || []}
        />
      );
    }
    
    // Merge widgetConfig with defaults to ensure all fields are present
    const mergedWidgetConfig = {
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
      captureFormat: 'instant',
      ...wheelData?.widgetConfig // Spread actual config last to override defaults
    };
    
    return (
      <WheelConfiguration
        segments={wheelData.segments || []}
        onUpdateSegments={updateSegments}
        wheelId={wheelData.id}
        isUpdating={isUpdating}
        widgetConfig={mergedWidgetConfig}
        onUpdateWidgetConfig={updateWidgetConfig}
        wheelDesignConfig={wheelData?.wheelDesign || wheelDesignConfig}
        onUpdateWheelDesign={updateWheelDesign}
        onActiveSectionChange={setActiveConfigSection}
        scheduleConfig={wheelData.schedule || {
          enabled: false,
          timezone: 'UTC',
          dateRange: {
            startDate: null,
            endDate: null
          },
          timeSlots: {
            enabled: false,
            slots: []
          },
          weekDays: {
            enabled: false,
            days: [0, 1, 2, 3, 4, 5, 6]
          },
          specialDates: {
            blacklistDates: [],
            whitelistDates: []
          }
        }}
        onUpdateScheduleConfig={updateSchedule}
      />
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col h-full w-full">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSection}-${mode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
