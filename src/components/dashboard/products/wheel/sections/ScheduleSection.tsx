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
      await onUpdateScheduleConfig(config);
    },
    debounceDelay: 1500 // Slightly longer delay for schedule changes
  });

  // Update local state when prop changes (from database)
  useEffect(() => {
    setLocalScheduleConfig(scheduleConfig);
  }, [scheduleConfig]);

  const handleScheduleConfigChange = (newConfig: WheelScheduleConfig) => {
    setLocalScheduleConfig(newConfig);
    save(newConfig);
  };

  const handleEnabledChange = (enabled: boolean) => {
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
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-6">
          {/* Header with Save Status */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Programación de Horarios
              </h3>
              <p className="text-sm text-gray-500">Configura cuándo estará activa tu ruleta</p>
            </div>
            <SaveStatusIndicator status={saveStatus} />
          </div>
          
          <SimpleScheduleConfig
            config={localScheduleConfig}
            onChange={handleScheduleConfigChange}
            enabled={localScheduleConfig.enabled}
            onEnabledChange={handleEnabledChange}
          />
        </div>
      </div>
    </motion.div>
  );
};