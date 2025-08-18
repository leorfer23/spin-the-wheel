import React from "react";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { WidgetConfig } from "../wheelConfigTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HandleSectionProps {
  widgetConfig: WidgetConfig;
  onUpdateWidgetConfig: (config: Partial<WidgetConfig>) => void;
  saveStatus?: "idle" | "pending" | "saving" | "saved" | "error";
}

export const HandleSection: React.FC<HandleSectionProps> = ({
  widgetConfig,
  onUpdateWidgetConfig,
  saveStatus: _saveStatus // Unused, keeping for backward compatibility
}) => {
  // Use centralized auto-save
  const { save, saveStatus } = useAutoSave({
    type: 'handle',
    onSave: async (updates) => {
      // This is called after debounce - just save to backend
      // The UI has already been updated optimistically
      await onUpdateWidgetConfig(updates);
    }
  });

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    // Optimistic update - update UI immediately
    onUpdateWidgetConfig(updates);
    // Queue save for background processing
    save(updates);
  };

  // Curated emojis perfect for Spin to Win wheels
  const curatedEmojis = [
    { emoji: '🎁', label: 'Gift' },
    { emoji: '🎉', label: 'Party' },
    { emoji: '🎯', label: 'Target' },
    { emoji: '🎰', label: 'Slot Machine' },
    { emoji: '💰', label: 'Money Bag' },
    { emoji: '🏆', label: 'Trophy' },
    { emoji: '⭐', label: 'Star' },
    { emoji: '🎊', label: 'Confetti' },
    { emoji: '🎈', label: 'Balloon' },
    { emoji: '✨', label: 'Sparkles' }
  ];

  return (
    <TooltipProvider>
      <motion.div
        key="handle"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6 flex-1 flex flex-col overflow-hidden"
      >
        {/* Fixed header with title and preview side by side */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-start justify-between gap-6">
            {/* Title and save status on the left */}
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Configuración del Botón Flotante
              </h3>
              <SaveStatusIndicator status={saveStatus} />
            </div>
            
            {/* Compact preview on the right */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-3 border border-gray-200 flex-shrink-0" style={{ width: '200px', height: '80px' }}>
              <p className="text-[10px] text-gray-500 mb-1 font-medium">Vista Previa</p>
              <div className="relative h-14 flex items-center justify-center bg-white rounded-lg">
                {widgetConfig.handleType === 'floating' && (
                  <motion.div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-md"
                    style={{
                      backgroundColor: widgetConfig.handleBackgroundColor,
                      color: widgetConfig.handleTextColor,
                      borderRadius: widgetConfig.handleBorderRadius || '12px',
                      fontSize: widgetConfig.handleSize === 'small' ? '12px' : widgetConfig.handleSize === 'large' ? '14px' : '13px',
                    }}
                    animate={
                      widgetConfig.handleAnimation === 'pulse' ? { scale: [1, 1.05, 1] } :
                      widgetConfig.handleAnimation === 'bounce' ? { y: [0, -3, 0] } :
                      widgetConfig.handleAnimation === 'rotate' ? { rotate: [0, 5, -5, 0] } :
                      {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-base">{widgetConfig.handleIcon}</span>
                    <span className="font-medium">{widgetConfig.handleText}</span>
                  </motion.div>
                )}
                {widgetConfig.handleType === 'tab' && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 text-xs"
                    style={{
                      [widgetConfig.handlePosition]: 0,
                      writingMode: 'vertical-rl',
                      backgroundColor: widgetConfig.handleBackgroundColor,
                      color: widgetConfig.handleTextColor,
                      padding: '8px 4px',
                      borderRadius: widgetConfig.handlePosition === 'left' ? '0 6px 6px 0' : '6px 0 0 6px',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{widgetConfig.handleIcon}</span>
                      <span className="font-medium text-[10px]">{widgetConfig.handleText}</span>
                    </div>
                  </div>
                )}
                {widgetConfig.handleType === 'bubble' && (
                  <motion.div
                    className="rounded-full shadow-md flex items-center justify-center"
                    style={{
                      backgroundColor: widgetConfig.handleBackgroundColor,
                      color: widgetConfig.handleTextColor,
                      width: widgetConfig.handleSize === 'small' ? '36px' : widgetConfig.handleSize === 'large' ? '48px' : '42px',
                      height: widgetConfig.handleSize === 'small' ? '36px' : widgetConfig.handleSize === 'large' ? '48px' : '42px',
                    }}
                    animate={
                      widgetConfig.handleAnimation === 'pulse' ? { scale: [1, 1.1, 1] } :
                      widgetConfig.handleAnimation === 'bounce' ? { y: [0, -5, 0] } :
                      widgetConfig.handleAnimation === 'rotate' ? { rotate: [0, 360] } :
                      {}
                    }
                    transition={{ duration: widgetConfig.handleAnimation === 'rotate' ? 3 : 2, repeat: Infinity }}
                  >
                    <span style={{ fontSize: widgetConfig.handleSize === 'small' ? '16px' : widgetConfig.handleSize === 'large' ? '22px' : '19px' }}>
                      {widgetConfig.handleIcon}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrollable content */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-gray-800">Selecciona el Tipo de Botón</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Elige cómo se mostrará el botón en tu tienda. Cada opción tiene un estilo único de presentación.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {/* Handle type selection with visual previews */}
          <div className="grid grid-cols-3 gap-3 px-2">
            <button
              onClick={() => updateConfig({ handleType: 'floating' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                widgetConfig.handleType === 'floating' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center space-y-2">
                {/* Mini preview of floating button */}
                <div className="h-12 flex items-center justify-center">
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded shadow-sm text-[10px]"
                    style={{
                      backgroundColor: widgetConfig.handleBackgroundColor,
                      color: widgetConfig.handleTextColor,
                    }}
                  >
                    <span>{widgetConfig.handleIcon}</span>
                    <span>¡Gira!</span>
                  </div>
                </div>
                <p className="font-medium">Botón Flotante</p>
                <p className="text-sm text-gray-600">Se desliza desde el lateral</p>
              </div>
            </button>
            
            <button
              onClick={() => updateConfig({ handleType: 'tab' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                widgetConfig.handleType === 'tab' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center space-y-2">
                {/* Mini preview of tab */}
                <div className="h-12 flex items-center justify-center">
                  <div className="relative w-full h-10">
                    <div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 px-1 py-2 text-[8px] rounded-l"
                      style={{
                        backgroundColor: widgetConfig.handleBackgroundColor,
                        color: widgetConfig.handleTextColor,
                        writingMode: 'vertical-rl',
                      }}
                    >
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px]">{widgetConfig.handleIcon}</span>
                        <span>Gira</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="font-medium">Pestaña Lateral</p>
                <p className="text-sm text-gray-600">Pestaña vertical en el lateral</p>
              </div>
            </button>
            
            <button
              onClick={() => updateConfig({ handleType: 'bubble' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                widgetConfig.handleType === 'bubble' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center space-y-2">
                {/* Mini preview of bubble */}
                <div className="h-12 flex items-center justify-center">
                  <div 
                    className="rounded-full shadow-sm flex items-center justify-center"
                    style={{
                      backgroundColor: widgetConfig.handleBackgroundColor,
                      color: widgetConfig.handleTextColor,
                      width: '32px',
                      height: '32px',
                    }}
                  >
                    <span className="text-base">{widgetConfig.handleIcon}</span>
                  </div>
                </div>
                <p className="font-medium">Botón Burbuja</p>
                <p className="text-sm text-gray-600">Botón de acción flotante</p>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-gray-800">
              Configura tu Botón {widgetConfig.handleType === 'tab' ? 'Pestaña' : widgetConfig.handleType === 'bubble' ? 'Burbuja' : 'Flotante'}
            </h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Personaliza el aspecto y comportamiento del botón. Los cambios se reflejarán en tiempo real en la vista previa.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Posición</label>
              <select
                value={widgetConfig.handlePosition}
                onChange={(e) => updateConfig({ handlePosition: e.target.value as 'left' | 'right' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="right">Lado Derecho</option>
                <option value="left">Lado Izquierdo</option>
              </select>
            </div>
            
            {(widgetConfig.handleType === 'bubble' || widgetConfig.handleType === 'floating') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
                <select
                  value={widgetConfig.handleSize}
                  onChange={(e) => updateConfig({ handleSize: e.target.value as 'small' | 'medium' | 'large' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texto del Botón</label>
              <input
                type="text"
                value={widgetConfig.handleText}
                onChange={(e) => updateConfig({ handleText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="¡Gana Premios!"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icono (Emoji)</label>
              <div className="grid grid-cols-5 gap-2">
                {curatedEmojis.map((item) => (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => updateConfig({ handleIcon: item.emoji })}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      widgetConfig.handleIcon === item.emoji
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    title={item.label}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color de Fondo</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={widgetConfig.handleBackgroundColor}
                  onChange={(e) => updateConfig({ handleBackgroundColor: e.target.value })}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={widgetConfig.handleBackgroundColor}
                  onChange={(e) => updateConfig({ handleBackgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color del Texto</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={widgetConfig.handleTextColor}
                  onChange={(e) => updateConfig({ handleTextColor: e.target.value })}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={widgetConfig.handleTextColor}
                  onChange={(e) => updateConfig({ handleTextColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">Animación</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Añade movimiento al botón para llamar la atención. Pulso: expande y contrae, Rebote: sube y baja, Rotación: gira ligeramente.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <select
                value={widgetConfig.handleAnimation}
                onChange={(e) => updateConfig({ handleAnimation: e.target.value as 'none' | 'pulse' | 'bounce' | 'rotate' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="none">Sin animación</option>
                <option value="pulse">Pulso</option>
                <option value="bounce">Rebote</option>
                <option value="rotate">Rotación</option>
              </select>
            </div>
            
            {widgetConfig.handleType === 'floating' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Radio de Borde</label>
                <input
                  type="text"
                  value={widgetConfig.handleBorderRadius}
                  onChange={(e) => updateConfig({ handleBorderRadius: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="12px"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </TooltipProvider>
  );
};

export default HandleSection;
