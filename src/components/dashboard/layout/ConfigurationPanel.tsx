import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ConfigSection = "config";

interface ConfigurationPanelProps {
  children: (activeSection: ConfigSection) => React.ReactNode;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  children,
}) => {
  const [activeSection] = useState<ConfigSection>("config");

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col h-full w-full">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              {children(activeSection)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
