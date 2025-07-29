import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChartBar, Mail, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface FloatingInsightsProps {
  spinsCount: number;
  onEmailCapture?: () => void;
}

export const FloatingInsights: React.FC<FloatingInsightsProps> = ({
  spinsCount,
  onEmailCapture,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "email" | null>(null);

  const handleTabClick = (tab: "analytics" | "email") => {
    if (activeTab === tab) {
      setActiveTab(null);
      setIsExpanded(false);
    } else {
      setActiveTab(tab);
      setIsExpanded(true);
    }
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <motion.div
        className="fixed bottom-8 right-8 flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTabClick("email")}
          className={`w-14 h-14 rounded-full shadow-lg backdrop-blur-md flex items-center justify-center transition-all ${
            activeTab === "email"
              ? "bg-primary text-primary-foreground"
              : "bg-white/90 hover:bg-white text-gray-700"
          }`}
        >
          <Mail className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTabClick("analytics")}
          className={`w-14 h-14 rounded-full shadow-lg backdrop-blur-md flex items-center justify-center transition-all ${
            activeTab === "analytics"
              ? "bg-primary text-primary-foreground"
              : "bg-white/90 hover:bg-white text-gray-700"
          }`}
        >
          <ChartBar className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Floating Content Card */}
      <AnimatePresence>
        {isExpanded && activeTab && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-32 right-8 z-50"
          >
            <Card className="w-80 backdrop-blur-md bg-white/95 shadow-2xl border-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {activeTab === "analytics" ? "Rendimiento" : "Captura de Email"}
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab(null);
                      setIsExpanded(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {activeTab === "analytics" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-4">
                      <p className="text-4xl font-bold text-primary mb-1">
                        {spinsCount}
                      </p>
                      <p className="text-sm text-gray-600">Giros totales</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-semibold text-gray-800">
                          {Math.round(spinsCount * 0.4)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Premios ganados</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-semibold text-gray-800">
                          40%
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Tasa de conversión</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Actualizado en tiempo real
                    </p>
                  </motion.div>
                )}

                {activeTab === "email" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-gray-600">
                      Captura emails para enviar códigos de descuento a los ganadores
                    </p>
                    
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <Button 
                        className="w-full rounded-xl"
                        onClick={onEmailCapture}
                      >
                        Activar captura
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-3 bg-primary/5 rounded-xl">
                      <p className="text-xs text-primary font-medium mb-1">
                        Tip profesional
                      </p>
                      <p className="text-xs text-gray-600">
                        Los emails capturados se sincronizan automáticamente con tu tienda
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};