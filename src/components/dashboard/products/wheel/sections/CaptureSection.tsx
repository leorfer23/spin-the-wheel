import React from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Users, 
  TrendingUp, 
  Shield, 
  Trophy,
  Zap,
  AlertCircle,
  Image,
  Type
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
      className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-4 flex-1 overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Captura de Email
        </h3>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {/* Main Content Section - Always Expanded */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Type className="w-4 h-4 text-purple-600" />
            Contenido Principal
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título Principal</label>
              <input
                type="text"
                value={widgetConfig.captureTitle || "¡Gira y Gana!"}
                onChange={(e) => updateConfig({ captureTitle: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                placeholder="¡Gira y Gana!"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Texto del Botón</label>
              <input
                type="text"
                value={widgetConfig.captureButtonText || "🎰 GIRAR AHORA →"}
                onChange={(e) => updateConfig({ captureButtonText: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                placeholder="¡Quiero Participar!"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
              <input
                type="text"
                value={widgetConfig.captureSubtitle || ""}
                onChange={(e) => updateConfig({ captureSubtitle: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ingresa tu email para participar"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Texto de Privacidad</label>
              <input
                type="text"
                value={widgetConfig.capturePrivacyText || ""}
                onChange={(e) => updateConfig({ capturePrivacyText: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                placeholder="Al participar, aceptas recibir emails promocionales"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Image className="w-3 h-3" />
                URL de Imagen (Opcional)
              </label>
              <input
                type="text"
                value={widgetConfig.captureImageUrl || ""}
                onChange={(e) => updateConfig({ captureImageUrl: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
        </div>

        {/* Engagement Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Countdown Timer */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-500" />
                Temporizador
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.showCountdownTimer ?? true}
                  onChange={(e) => updateConfig({ showCountdownTimer: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {widgetConfig.showCountdownTimer !== false && (
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={widgetConfig.countdownMinutes || 15}
                    onChange={(e) => updateConfig({ countdownMinutes: parseInt(e.target.value) || 15 })}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                    min="1"
                    max="60"
                  />
                  <span className="text-xs text-gray-600">minutos</span>
                </div>
                <input
                  type="text"
                  value={widgetConfig.countdownText || "¡OFERTA LIMITADA!"}
                  onChange={(e) => updateConfig({ countdownText: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="¡OFERTA LIMITADA!"
                />
              </div>
            )}
          </div>

          {/* Live Activity */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Users className="w-4 h-4 text-green-500" />
                Actividad en Vivo
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.showLiveActivity ?? true}
                  onChange={(e) => updateConfig({ showLiveActivity: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {widgetConfig.showLiveActivity !== false && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={widgetConfig.liveActivityMin || 100}
                    onChange={(e) => updateConfig({ liveActivityMin: parseInt(e.target.value) || 100 })}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 rounded"
                    min="1"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={widgetConfig.liveActivityMax || 200}
                    onChange={(e) => updateConfig({ liveActivityMax: parseInt(e.target.value) || 200 })}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 rounded"
                    min="1"
                    placeholder="Max"
                  />
                </div>
                <input
                  type="text"
                  value={widgetConfig.liveActivityText || "{count} jugadores activos"}
                  onChange={(e) => updateConfig({ liveActivityText: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="{count} jugadores activos"
                />
              </div>
            )}
          </div>

          {/* Social Proof */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Prueba Social
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.showSocialProof ?? true}
                  onChange={(e) => updateConfig({ showSocialProof: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {widgetConfig.showSocialProof !== false && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={widgetConfig.socialProofText || "María S. ganó 20% OFF"}
                  onChange={(e) => updateConfig({ socialProofText: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="Juan P. ganó 15% OFF"
                />
                <input
                  type="text"
                  value={widgetConfig.socialProofTimeAgo || "hace 2 min"}
                  onChange={(e) => updateConfig({ socialProofTimeAgo: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="hace 2 min"
                />
              </div>
            )}
          </div>

          {/* Prize Highlight */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Premio Mayor
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.showPrizeHighlight ?? true}
                  onChange={(e) => updateConfig({ showPrizeHighlight: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {widgetConfig.showPrizeHighlight !== false && (
              <input
                type="text"
                value={widgetConfig.prizeHighlightText || "Premio Mayor: {prize}"}
                onChange={(e) => updateConfig({ prizeHighlightText: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="Premio: {prize}"
              />
            )}
          </div>

          {/* Urgency Message */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Urgencia
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.showUrgencyMessage ?? true}
                  onChange={(e) => updateConfig({ showUrgencyMessage: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {widgetConfig.showUrgencyMessage !== false && (
              <input
                type="text"
                value={widgetConfig.urgencyMessageText || "SOLO 1 INTENTO POR EMAIL"}
                onChange={(e) => updateConfig({ urgencyMessageText: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="SOLO 1 INTENTO"
              />
            )}
          </div>

          {/* Trust Badges */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                Confianza
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.showTrustBadges ?? true}
                  onChange={(e) => updateConfig({ showTrustBadges: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {widgetConfig.showTrustBadges !== false && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={widgetConfig.trustBadge1 || "Sin trucos"}
                  onChange={(e) => updateConfig({ trustBadge1: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="Insignia 1"
                />
                <input
                  type="text"
                  value={widgetConfig.trustBadge2 || "100% Gratis"}
                  onChange={(e) => updateConfig({ trustBadge2: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="Insignia 2"
                />
                <input
                  type="text"
                  value={widgetConfig.trustBadge3 || "Instantáneo"}
                  onChange={(e) => updateConfig({ trustBadge3: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="Insignia 3"
                />
              </div>
            )}
          </div>
        </div>

        {/* Visual Effects Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            Efectos Visuales
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-xs font-medium text-gray-700">Micro Animaciones</span>
              <input
                type="checkbox"
                checked={widgetConfig.showMicroAnimations ?? true}
                onChange={(e) => updateConfig({ showMicroAnimations: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
            </label>
            
            <label className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-xs font-medium text-gray-700">Efectos de Brillo</span>
              <input
                type="checkbox"
                checked={widgetConfig.showGlowEffects ?? true}
                onChange={(e) => updateConfig({ showGlowEffects: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mt-2">
          <p className="text-xs text-gray-700 flex items-start gap-2">
            <span className="text-purple-600 text-base">💡</span>
            <span><strong className="text-purple-700">Tip:</strong> Urgencia + prueba social = +40% conversión. Prueba diferentes combinaciones.</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};