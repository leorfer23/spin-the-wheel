import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";

import { tabs } from "./jackpotConfigConstants";
import { SegmentsSection } from "./sections/SegmentsSection";
import type { JackpotSymbol } from "./types";
import type { WidgetConfig } from "../wheel/wheelConfigTypes";

// Reuse generic sections for now
import { HandleSection } from "../wheel/sections/HandleSection";
import { CaptureSection } from "../wheel/sections/CaptureSection";
import { ScheduleSection } from "../wheel/sections/ScheduleSection";
import { EmbedSection } from "../wheel/sections/EmbedSection";

interface JackpotConfigurationProps {
  jackpotId: string;
  symbols: JackpotSymbol[];
  onUpdateSymbols: (symbols: JackpotSymbol[]) => void;
  widgetConfig: WidgetConfig;
  onUpdateWidgetConfig: (config: Partial<WidgetConfig>) => void;
  scheduleConfig: Record<string, unknown>;
  onUpdateScheduleConfig: (config: Record<string, unknown>) => void;
}

export const JackpotConfiguration: React.FC<JackpotConfigurationProps> = ({
  jackpotId,
  symbols,
  onUpdateSymbols,
  widgetConfig,
  onUpdateWidgetConfig,
  scheduleConfig,
  onUpdateScheduleConfig,
}) => {
  const [activeSection, setActiveSection] = useState<string>("segments");

  return (
    <motion.div className="w-full h-full">
      <TooltipProvider>
        <motion.div className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center gap-2 p-2 overflow-x-auto">
            {tabs.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveSection(tab.id)}
                    className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
                      activeSection === tab.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{tab.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tab.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </motion.div>
      </TooltipProvider>

      <AnimatePresence mode="wait">
        {activeSection === "segments" && (
          <SegmentsSection
            symbols={symbols}
            onUpdateSymbols={onUpdateSymbols}
          />
        )}

        {activeSection === "appearance" && (
          <div className="p-6 text-gray-600">
            Configuración de Apariencia próximamente
          </div>
        )}

        {activeSection === "handle" && (
          <HandleSection
            widgetConfig={widgetConfig}
            onUpdateWidgetConfig={onUpdateWidgetConfig}
          />
        )}

        {activeSection === "capture" && (
          <CaptureSection
            widgetConfig={widgetConfig}
            onUpdateWidgetConfig={onUpdateWidgetConfig}
            segments={[]}
          />
        )}

        {activeSection === "schedule" && (
          <ScheduleSection
            scheduleConfig={scheduleConfig as any}
            onUpdateScheduleConfig={onUpdateScheduleConfig as any}
            saveStatus="idle"
          />
        )}

        {activeSection === "embed" && (
          <EmbedSection
            wheelId={jackpotId}
            widgetConfig={widgetConfig as any}
            selectedStyle="floating"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
