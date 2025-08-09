import React from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Shield
} from "lucide-react";
import type { WidgetConfig } from "../wheelConfigTypes";
import type { Segment } from "../types";

interface CaptureSectionProps {
  widgetConfig: WidgetConfig;
  onUpdateWidgetConfig: (config: Partial<WidgetConfig>) => void;
  segments: Segment[];
}

export const CaptureSection: React.FC<CaptureSectionProps> = ({
  widgetConfig,
  onUpdateWidgetConfig
}) => {
  const updateConfig = (updates: Partial<WidgetConfig>) => {
    onUpdateWidgetConfig(updates);
  };

  return (
    <motion.div
      key="capture"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6 flex-1 overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Configuración de Captura
        </h3>
      </div>
      
      <div className="space-y-6 flex-1">
        {/* Title Configuration - Super Simple */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Título de la Ruleta
          </label>
          <input
            type="text"
            value={widgetConfig.captureTitle || "¡Gira y Gana!"}
            onChange={(e) => updateConfig({ captureTitle: e.target.value })}
            className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="¡Gira y Gana!"
          />
          <p className="text-xs text-gray-500 mt-2">
            Este es el título que verán tus clientes al abrir la ruleta
          </p>
        </div>

        {/* Simple Options - Only Timer and Trust Badges */}
        <div className="space-y-4">
          {/* Countdown Timer */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="text-base font-semibold text-gray-800">
                    Temporizador de Urgencia
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Muestra un contador que crea sensación de tiempo limitado
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.showCountdownTimer ?? true}
                  onChange={(e) => updateConfig({ showCountdownTimer: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="text-base font-semibold text-gray-800">
                    Insignias de Confianza
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Muestra mensajes que generan confianza en los usuarios
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.showTrustBadges ?? true}
                  onChange={(e) => updateConfig({ showTrustBadges: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Simple Tip */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mt-auto">
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-purple-600 text-lg">💡</span>
            <span>
              <strong className="text-purple-700">Consejo:</strong> Mantén la configuración simple. 
              El temporizador y las insignias de confianza son suficientes para aumentar las conversiones.
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};