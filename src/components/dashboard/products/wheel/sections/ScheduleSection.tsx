import React, { useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SimpleScheduleConfig } from "../../../../scheduling/SimpleScheduleConfig";
import type { WheelScheduleConfig } from "../../../../../types/models";

interface ScheduleSectionProps {
  scheduleConfig: WheelScheduleConfig;
  onUpdateScheduleConfig: (config: WheelScheduleConfig) => void;
  saveStatus: "idle" | "pending" | "saving" | "saved" | "error";
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  scheduleConfig,
  onUpdateScheduleConfig,
  saveStatus
}) => {
  const [localScheduleConfig, setLocalScheduleConfig] = useState<WheelScheduleConfig>(scheduleConfig);

  const handleScheduleConfigChange = (newConfig: WheelScheduleConfig) => {
    setLocalScheduleConfig(newConfig);
    onUpdateScheduleConfig(newConfig);
  };

  const handleEnabledChange = (enabled: boolean) => {
    const updatedConfig = { 
      ...localScheduleConfig, 
      enabled,
      timezone: 'America/Argentina/Buenos_Aires'
    };
    setLocalScheduleConfig(updatedConfig);
    onUpdateScheduleConfig(updatedConfig);
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
        {/* Save Status - Floating at top */}
        <AnimatePresence mode="wait">
          {saveStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-0 z-10 flex justify-center mb-4"
            >
              <div className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-lg ${
                saveStatus === "pending" ? "bg-yellow-100/90 text-yellow-700 border border-yellow-200" :
                saveStatus === "saving" ? "bg-blue-100/90 text-blue-700 border border-blue-200" :
                saveStatus === "saved" ? "bg-green-100/90 text-green-700 border border-green-200" :
                "bg-red-100/90 text-red-700 border border-red-200"
              }`}>
                {saveStatus === "pending" && (
                  <>
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
                    Cambios sin guardar
                  </>
                )}
                {saveStatus === "saving" && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <Check className="w-4 h-4" />
                    Guardado
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Error al guardar
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
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