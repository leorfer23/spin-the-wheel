import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import type { WidgetConfig } from "../wheelConfigTypes";

interface HandleSectionProps {
  widgetConfig: WidgetConfig;
  onUpdateWidgetConfig: (config: Partial<WidgetConfig>) => void;
}

export const HandleSection: React.FC<HandleSectionProps> = ({
  widgetConfig,
  onUpdateWidgetConfig
}) => {
  const updateConfig = (updates: Partial<WidgetConfig>) => {
    onUpdateWidgetConfig(updates);
  };

  return (
    <motion.div
      key="handle"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6 flex-1 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Configuración del Botón Flotante
        </h3>
        <div className="relative bg-gray-100 rounded-xl shadow-inner" style={{ width: '200px', height: '80px' }}>
          <LiveHandlePreview config={widgetConfig} />
        </div>
      </div>
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2">

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Selecciona el Tipo de Botón</h4>
          <div className="grid grid-cols-3 gap-4">
            <HandleTypeCard
              type="floating"
              title="Botón Flotante"
              description="Se desliza desde el lateral"
              isSelected={widgetConfig.handleType === 'floating'}
              onClick={() => updateConfig({ handleType: 'floating' })}
              config={widgetConfig}
            />
            
            <HandleTypeCard
              type="tab"
              title="Pestaña Lateral"
              description="Pestaña vertical en el lateral"
              isSelected={widgetConfig.handleType === 'tab'}
              onClick={() => updateConfig({ handleType: 'tab' })}
              config={widgetConfig}
            />
            
            <HandleTypeCard
              type="bubble"
              title="Botón Burbuja"
              description="Botón de acción flotante"
              isSelected={widgetConfig.handleType === 'bubble'}
              onClick={() => updateConfig({ handleType: 'bubble' })}
              config={widgetConfig}
            />
          </div>
        </div>

        <div className="space-y-6 bg-gray-50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-800">
            Configura tu Botón {widgetConfig.handleType === 'tab' ? 'Pestaña' : widgetConfig.handleType === 'bubble' ? 'Burbuja' : 'Flotante'}
          </h4>
        
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
              <input
                type="text"
                value={widgetConfig.handleIcon}
                onChange={(e) => updateConfig({ handleIcon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="🎁"
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Animación</label>
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
  );
};

const HandleTypeCard: React.FC<{
  type: 'floating' | 'tab' | 'bubble';
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  config: WidgetConfig;
}> = ({ type, title, description, isSelected, onClick, config }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all ${
      isSelected 
        ? 'border-purple-500 bg-purple-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:border-purple-300'
    }`}
  >
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="mt-4 mx-4 space-y-2">
            <div className="h-2 bg-gray-300 rounded w-3/4"></div>
            <div className="h-2 bg-gray-300 rounded w-1/2"></div>
            <div className="h-16 bg-gray-200 rounded mt-4"></div>
          </div>
        </div>
        <HandlePreview type={type} config={config} />
      </div>
      <div className="text-center">
        <h5 className="font-semibold text-gray-800">{title}</h5>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      {isSelected && (
        <Check className="absolute top-2 right-2 w-5 h-5 text-purple-600" />
      )}
    </div>
  </motion.div>
);

const HandlePreview: React.FC<{
  type: 'floating' | 'tab' | 'bubble';
  config: WidgetConfig;
}> = ({ type, config }) => {
  if (type === 'floating') {
    return (
      <motion.div 
        className={`absolute ${config.handlePosition === 'right' ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2`}
        animate={config.handleAnimation === 'pulse' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div 
          className="px-4 py-3 rounded-l-full shadow-lg flex items-center gap-2"
          style={{ 
            backgroundColor: config.handleBackgroundColor,
            color: config.handleTextColor,
            marginRight: config.handlePosition === 'right' ? '-1px' : '0',
            marginLeft: config.handlePosition === 'left' ? '-1px' : '0',
            borderTopRightRadius: config.handlePosition === 'right' ? '0' : '9999px',
            borderBottomRightRadius: config.handlePosition === 'right' ? '0' : '9999px',
            borderTopLeftRadius: config.handlePosition === 'left' ? '0' : '9999px',
            borderBottomLeftRadius: config.handlePosition === 'left' ? '0' : '9999px',
          }}
        >
          <span className="text-sm">{config.handleIcon}</span>
          <span className="text-xs font-medium">¡Gana!</span>
        </div>
      </motion.div>
    );
  }

  if (type === 'tab') {
    return (
      <motion.div 
        className={`absolute ${config.handlePosition === 'right' ? 'right-0' : 'left-0'} bottom-8`}
        animate={config.handleAnimation === 'bounce' ? { y: [0, -5, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div 
          className="px-3 py-2 shadow-lg"
          style={{ 
            backgroundColor: config.handleBackgroundColor,
            color: config.handleTextColor,
            borderTopLeftRadius: config.handlePosition === 'right' ? '8px' : '0',
            borderBottomLeftRadius: config.handlePosition === 'right' ? '8px' : '0',
            borderTopRightRadius: config.handlePosition === 'left' ? '8px' : '0',
            borderBottomRightRadius: config.handlePosition === 'left' ? '8px' : '0',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          <div className="flex items-center gap-1">
            <span className="text-sm">{config.handleIcon}</span>
            <span className="text-xs font-medium">Girar</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // bubble
  return (
    <motion.div 
      className={`absolute ${config.handlePosition === 'right' ? 'right-4' : 'left-4'} bottom-4`}
      animate={config.handleAnimation === 'rotate' ? { rotate: [0, 10, -10, 0] } : {}}
      transition={{ repeat: Infinity, duration: 3 }}
    >
      <div 
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ 
          backgroundColor: config.handleBackgroundColor,
          color: config.handleTextColor,
        }}
      >
        <span className="text-lg">{config.handleIcon}</span>
      </div>
    </motion.div>
  );
};

const LiveHandlePreview: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  const getAnimationProps = () => {
    switch (config.handleAnimation) {
      case 'pulse':
        return { scale: [1, 1.05, 1] };
      case 'bounce':
        return { y: [0, -10, 0] };
      case 'rotate':
        return { rotate: [0, 10, -10, 0] };
      default:
        return {};
    }
  };

  const getSizeClasses = () => {
    switch (config.handleSize) {
      case 'small':
        return 'text-sm px-3 py-2';
      case 'large':
        return 'text-lg px-6 py-4';
      default:
        return 'text-base px-4 py-3';
    }
  };

  const getBubbleSize = () => {
    switch (config.handleSize) {
      case 'small':
        return 'w-12 h-12 text-base';
      case 'large':
        return 'w-20 h-20 text-2xl';
      default:
        return 'w-16 h-16 text-xl';
    }
  };

  if (config.handleType === 'floating') {
    return (
      <motion.div 
        className={`absolute ${config.handlePosition === 'right' ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 cursor-pointer`}
        animate={getAnimationProps()}
        transition={{ repeat: Infinity, duration: 2 }}
        whileHover={{ 
          scale: 1.05,
          x: config.handlePosition === 'right' ? -5 : 5
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div 
          className={`${getSizeClasses()} font-semibold shadow-lg flex items-center gap-2`}
          style={{ 
            backgroundColor: config.handleBackgroundColor,
            color: config.handleTextColor,
            borderRadius: config.handleBorderRadius || '12px',
            borderTopRightRadius: config.handlePosition === 'right' ? '0' : config.handleBorderRadius || '12px',
            borderBottomRightRadius: config.handlePosition === 'right' ? '0' : config.handleBorderRadius || '12px',
            borderTopLeftRadius: config.handlePosition === 'left' ? '0' : config.handleBorderRadius || '12px',
            borderBottomLeftRadius: config.handlePosition === 'left' ? '0' : config.handleBorderRadius || '12px',
          }}
        >
          <span className="text-xl">{config.handleIcon}</span>
          <span>{config.handleText}</span>
        </div>
      </motion.div>
    );
  }

  if (config.handleType === 'tab') {
    return (
      <motion.div 
        className={`absolute ${config.handlePosition === 'right' ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 cursor-pointer`}
        animate={getAnimationProps()}
        transition={{ repeat: Infinity, duration: 1.5 }}
        whileHover={{ 
          scale: 1.05,
          x: config.handlePosition === 'right' ? -5 : 5
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div 
          className={`px-4 py-8 shadow-lg`}
          style={{ 
            backgroundColor: config.handleBackgroundColor,
            color: config.handleTextColor,
            borderTopLeftRadius: config.handlePosition === 'right' ? '12px' : '0',
            borderBottomLeftRadius: config.handlePosition === 'right' ? '12px' : '0',
            borderTopRightRadius: config.handlePosition === 'left' ? '12px' : '0',
            borderBottomRightRadius: config.handlePosition === 'left' ? '12px' : '0',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-xl">{config.handleIcon}</span>
            <span>{config.handleText}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // bubble
  return (
    <motion.div 
      className={`absolute ${config.handlePosition === 'right' ? 'right-6' : 'left-6'} bottom-6 cursor-pointer`}
      animate={getAnimationProps()}
      transition={{ repeat: Infinity, duration: 3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div 
        className={`${getBubbleSize()} rounded-full shadow-lg flex items-center justify-center font-semibold`}
        style={{ 
          backgroundColor: config.handleBackgroundColor,
          color: config.handleTextColor,
        }}
      >
        <span>{config.handleIcon}</span>
      </div>
      {config.handleText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg shadow-md text-sm font-medium whitespace-nowrap"
          style={{ 
            backgroundColor: config.handleBackgroundColor,
            color: config.handleTextColor,
          }}
        >
          {config.handleText}
        </motion.div>
      )}
    </motion.div>
  );
};