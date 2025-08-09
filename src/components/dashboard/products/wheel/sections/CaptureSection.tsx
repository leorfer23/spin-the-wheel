import React from "react";
import { Eye, Check } from "lucide-react";
import { motion } from "framer-motion";
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

  const handlePreview = () => {
    // Preview functionality temporarily disabled - production mode
    alert('La vista previa estará disponible próximamente');
    return;
    /* const previewUrl = `/preview?widget=true&config=${encodeURIComponent(JSON.stringify({
      segments,
      handlePosition: widgetConfig.handlePosition,
      handleText: widgetConfig.handleText,
      handleBackgroundColor: widgetConfig.handleBackgroundColor,
      handleTextColor: widgetConfig.handleTextColor,
      captureImageUrl: widgetConfig.captureImageUrl,
      captureTitle: widgetConfig.captureTitle,
      captureSubtitle: widgetConfig.captureSubtitle,
      captureButtonText: widgetConfig.captureButtonText,
      capturePrivacyText: widgetConfig.capturePrivacyText,
      captureFormat: widgetConfig.captureFormat
    }))}`;
    window.open(previewUrl, 'widget-preview', 'width=1200,height=800'); */
  };

  return (
    <motion.div
      key="capture"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6 space-y-4 flex-1 overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Configuración de Captura de Email
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePreview}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Vista Previa
        </motion.button>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {/* Format Selection */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Elige el Formato de Captura de Email</h4>
          <p className="text-sm text-gray-600 mb-6">Selecciona el formato que mejor convierta para tu audiencia:</p>
          
          <div className="grid grid-cols-3 gap-4">
            <CaptureFormatCard
              format="instant"
              icon="⚡"
              title="Juego Instantáneo"
              subtitle="Conversión más rápida - ¡email y listo!"
              features={[
                "Campo de entrada único",
                "Consentimiento automático en pie",
                "Botón de envío integrado"
              ]}
              isSelected={widgetConfig.captureFormat === 'instant'}
              onClick={() => updateConfig({ captureFormat: 'instant' })}
            />
            
            <CaptureFormatCard
              format="minimal"
              icon="✨"
              title="Enfoque Minimalista"
              subtitle="Limpio y sin distracciones"
              features={[
                "Diseño centrado",
                "Campo de entrada grande",
                "Botón CTA claro"
              ]}
              isSelected={widgetConfig.captureFormat === 'minimal'}
              onClick={() => updateConfig({ captureFormat: 'minimal' })}
            />
            
            <CaptureFormatCard
              format="social"
              icon="🔥"
              title="Prueba Social"
              subtitle="Muestra urgencia y popularidad"
              features={[
                "Contador de jugadores en vivo",
                "Calificaciones de 5 estrellas",
                "Vista previa de premios"
              ]}
              isSelected={widgetConfig.captureFormat === 'social'}
              onClick={() => updateConfig({ captureFormat: 'social' })}
            />
          </div>
          
          <div className="mt-4 p-3 bg-white/60 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Consejo pro:</strong> Prueba diferentes formatos para ver cuál convierte mejor con tu audiencia. 
              El formato "Juego Instantáneo" típicamente tiene la tasa de conversión más alta para compras impulsivas.
            </p>
          </div>
        </div>
        
        {/* Form Configuration Fields */}
        <div className="space-y-4 bg-gray-50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Personaliza el Contenido</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen Principal</label>
            <input
              type="text"
              value={widgetConfig.captureImageUrl}
              onChange={(e) => updateConfig({ captureImageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Imagen principal que aparecerá en el formulario de captura</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título Principal</label>
            <input
              type="text"
              value={widgetConfig.captureTitle}
              onChange={(e) => updateConfig({ captureTitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="¡Gira y Gana Premios Increíbles!"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
            <textarea
              value={widgetConfig.captureSubtitle}
              onChange={(e) => updateConfig({ captureSubtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
              placeholder="Ingresa tu email para participar y ganar descuentos exclusivos"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texto del Botón</label>
            <input
              type="text"
              value={widgetConfig.captureButtonText}
              onChange={(e) => updateConfig({ captureButtonText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="¡Quiero Participar!"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texto de Privacidad</label>
            <textarea
              value={widgetConfig.capturePrivacyText}
              onChange={(e) => updateConfig({ capturePrivacyText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
              placeholder="Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento."
            />
            <p className="text-xs text-gray-500 mt-1">Texto de consentimiento GDPR/privacidad</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CaptureFormatCard: React.FC<{
  format: string;
  icon: string;
  title: string;
  subtitle: string;
  features: string[];
  isSelected: boolean;
  onClick: () => void;
}> = ({ icon, title, subtitle, features, isSelected, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative p-6 rounded-2xl border-2 transition-all ${
      isSelected 
        ? 'border-purple-500 bg-purple-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:border-purple-200'
    }`}
  >
    <div className="text-3xl mb-3">{icon}</div>
    <h5 className="font-bold text-gray-800 mb-2">{title}</h5>
    <p className="text-xs text-gray-600 mb-3">{subtitle}</p>
    <ul className="text-xs text-left space-y-1">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-1">
          <span className="text-green-500 mt-0.5">✓</span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    {isSelected && (
      <motion.div
        className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <Check className="w-4 h-4 text-white" />
      </motion.div>
    )}
  </motion.button>
);