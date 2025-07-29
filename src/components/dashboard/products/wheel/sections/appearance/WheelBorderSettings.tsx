import React from "react";
import { motion } from "framer-motion";
import type { WheelDesignConfig } from "../../wheelConfigTypes";
import { ColorInput } from "./ColorInput";

interface WheelBorderSettingsProps {
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}

const borderStyles = [
  { id: 'solid', name: 'Sólido', preview: 'border-solid' },
  { id: 'double', name: 'Doble', preview: 'border-double' },
  { id: 'dotted', name: 'Punteado', preview: 'border-dotted' },
  { id: 'neon', name: 'Neón', preview: 'ring-2 ring-offset-2' },
  { id: 'gradient', name: 'Degradado', preview: 'bg-gradient-to-r' }
];

export const WheelBorderSettings: React.FC<WheelBorderSettingsProps> = ({
  wheelDesign,
  onUpdateDesign
}) => {
  const isGradientBorder = wheelDesign.wheelBorderStyle === 'gradient';
  const isNeonBorder = wheelDesign.wheelBorderStyle === 'neon';

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700 mb-3 block">Borde de la Rueda</label>
      
      {/* Border Style */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Estilo del Borde</label>
        <div className="grid grid-cols-5 gap-2">
          {borderStyles.map((style) => (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateDesign({ wheelBorderStyle: style.id as any })}
              className={`p-3 rounded-xl transition-all flex flex-col items-center gap-2 ${
                wheelDesign.wheelBorderStyle === style.id
                  ? "ring-2 ring-purple-500 bg-purple-50"
                  : "ring-1 ring-gray-200 hover:ring-purple-300"
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${style.preview} ${
                style.id === 'gradient' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : `border-4 ${wheelDesign.wheelBorderStyle === style.id ? 'border-purple-500' : 'border-gray-400'}`
              }`} />
              <span className="text-xs font-medium">{style.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Border Width */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          Grosor del Borde
          <span className="text-gray-400 ml-2">{wheelDesign.wheelBorderWidth || 4}px</span>
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={wheelDesign.wheelBorderWidth || 4}
          onChange={(e) => onUpdateDesign({ wheelBorderWidth: parseInt(e.target.value) })}
          className="w-full accent-purple-600"
        />
      </div>
      
      {/* Border Colors */}
      {isGradientBorder ? (
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Color Inicial"
            value={wheelDesign.wheelBorderGradientFrom || '#8b5cf6'}
            onChange={(color) => onUpdateDesign({ wheelBorderGradientFrom: color })}
          />
          <ColorInput
            label="Color Final"
            value={wheelDesign.wheelBorderGradientTo || '#ec4899'}
            onChange={(color) => onUpdateDesign({ wheelBorderGradientTo: color })}
          />
        </div>
      ) : (
        <ColorInput
          label="Color del Borde"
          value={wheelDesign.wheelBorderColor}
          onChange={(color) => onUpdateDesign({ wheelBorderColor: color })}
        />
      )}
      
      {/* Neon Glow Settings */}
      {isNeonBorder && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-purple-50 rounded-xl space-y-3"
        >
          <p className="text-xs text-purple-700">
            El efecto neón añade un brillo alrededor del borde
          </p>
          <ColorInput
            label="Color del Brillo"
            value={wheelDesign.wheelBorderColor}
            onChange={(color) => onUpdateDesign({ wheelBorderColor: color })}
          />
        </motion.div>
      )}
      
      {/* Wheel Background */}
      <div className="border-t pt-4">
        <label className="text-sm font-medium text-gray-700 mb-3 block">Fondo de la Rueda</label>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="wheelBackground"
              checked={!!wheelDesign.wheelBackgroundColor}
              onChange={(e) => {
                if (e.target.checked) {
                  onUpdateDesign({ wheelBackgroundColor: '#ffffff' });
                } else {
                  onUpdateDesign({ 
                    wheelBackgroundColor: undefined,
                    wheelBackgroundGradientFrom: undefined,
                    wheelBackgroundGradientTo: undefined
                  });
                }
              }}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label htmlFor="wheelBackground" className="text-sm text-gray-700">
              Usar color de fondo personalizado
            </label>
          </div>
          
          {wheelDesign.wheelBackgroundColor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => onUpdateDesign({ 
                    wheelBackgroundGradientFrom: undefined,
                    wheelBackgroundGradientTo: undefined
                  })}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    !wheelDesign.wheelBackgroundGradientFrom
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Color Sólido
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateDesign({ 
                    wheelBackgroundGradientFrom: wheelDesign.wheelBackgroundColor,
                    wheelBackgroundGradientTo: '#ec4899'
                  })}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    wheelDesign.wheelBackgroundGradientFrom
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Degradado
                </button>
              </div>
              
              {wheelDesign.wheelBackgroundGradientFrom ? (
                <div className="grid grid-cols-2 gap-4">
                  <ColorInput
                    label="Color Inicial"
                    value={wheelDesign.wheelBackgroundGradientFrom}
                    onChange={(color) => onUpdateDesign({ wheelBackgroundGradientFrom: color })}
                  />
                  <ColorInput
                    label="Color Final"
                    value={wheelDesign.wheelBackgroundGradientTo || '#ec4899'}
                    onChange={(color) => onUpdateDesign({ wheelBackgroundGradientTo: color })}
                  />
                </div>
              ) : (
                <ColorInput
                  label="Color de Fondo"
                  value={wheelDesign.wheelBackgroundColor}
                  onChange={(color) => onUpdateDesign({ wheelBackgroundColor: color })}
                />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};