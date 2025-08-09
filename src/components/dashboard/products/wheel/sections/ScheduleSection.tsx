import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SimpleScheduleConfig } from "../../../../scheduling/SimpleScheduleConfig";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { WheelScheduleConfig } from "../../../../../types/models";

interface ScheduleSectionProps {
  scheduleConfig: WheelScheduleConfig;
  onUpdateScheduleConfig: (config: WheelScheduleConfig) => void;
  saveStatus: "idle" | "pending" | "saving" | "saved" | "error";
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  scheduleConfig,
  onUpdateScheduleConfig,
  saveStatus: _saveStatus // Unused, keeping for backward compatibility
}) => {
  const [localScheduleConfig, setLocalScheduleConfig] = useState<WheelScheduleConfig>(scheduleConfig);
  
  // Use centralized auto-save
  const { save, saveStatus } = useAutoSave({
    type: 'schedule',
    onSave: async (config) => {
      console.log('[ScheduleSection] Auto-saving schedule to database:', config);
      await onUpdateScheduleConfig(config);
    },
    debounceDelay: 1500 // Slightly longer delay for schedule changes
  });

  // Update local state when prop changes (from database)
  useEffect(() => {
    console.log('[ScheduleSection] Schedule from database:', scheduleConfig);
    console.log('[ScheduleSection] Schedule keys:', Object.keys(scheduleConfig || {}));
    console.log('[ScheduleSection] Schedule enabled:', scheduleConfig?.enabled);
    console.log('[ScheduleSection] Schedule weekDays:', scheduleConfig?.weekDays);
    console.log('[ScheduleSection] Schedule dateRange:', scheduleConfig?.dateRange);
    console.log('[ScheduleSection] Schedule timeSlots:', scheduleConfig?.timeSlots);
    setLocalScheduleConfig(scheduleConfig);
  }, [scheduleConfig]);

  const handleScheduleConfigChange = (newConfig: WheelScheduleConfig) => {
    console.log('[ScheduleSection] Local config change:', newConfig);
    setLocalScheduleConfig(newConfig);
    save(newConfig);
  };

  const handleEnabledChange = (enabled: boolean) => {
    console.log('[ScheduleSection] Enabled change:', enabled);
    const updatedConfig = { 
      ...localScheduleConfig, 
      enabled,
      timezone: localScheduleConfig.timezone || 'America/Argentina/Buenos_Aires'
    };
    setLocalScheduleConfig(updatedConfig);
    save(updatedConfig);
  };

  return (
    <motion.div
      key="schedule"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 overflow-hidden"
    >
      <div className="h-full overflow-y-auto custom-scrollbar relative">
        {/* Save Status - Fixed position at top */}
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <SaveStatusIndicator status={saveStatus} />
        </div>
        
        <SimpleScheduleConfig
          config={localScheduleConfig}
          onChange={handleScheduleConfigChange}
          enabled={localScheduleConfig.enabled}
          onEnabledChange={handleEnabledChange}
        />
      </div>
    </motion.div>
  );
};