import React from "react";
import { motion } from "framer-motion";
import type { WheelDesignConfig } from "../../wheelConfigTypes";
import { ColorInput } from "./ColorInput";

interface ShadowSettingsProps {
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}

export const ShadowSettings: React.FC<ShadowSettingsProps> = ({
  wheelDesign,
  onUpdateDesign
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Configuración de Sombras</label>
        
        {/* Main Shadow */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
          <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Sombra Principal</h5>
          
          <ColorInput
            label="Color de Sombra"
            value={wheelDesign.shadowColor}
            onChange={(color) => onUpdateDesign({ shadowColor: color })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Intensidad</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wheelDesign.shadowIntensity * 100}
                  onChange={(e) => onUpdateDesign({ shadowIntensity: parseInt(e.target.value) / 100 })}
                  className="flex-1 accent-purple-600"
                />
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {Math.round(wheelDesign.shadowIntensity * 100)}%
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Desenfoque</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wheelDesign.shadowBlur || 30}
                  onChange={(e) => onUpdateDesign({ shadowBlur: parseInt(e.target.value) })}
                  className="flex-1 accent-purple-600"
                />
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {wheelDesign.shadowBlur || 30}px
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Desplazamiento X</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={wheelDesign.shadowOffsetX || 0}
                  onChange={(e) => onUpdateDesign({ shadowOffsetX: parseInt(e.target.value) })}
                  className="flex-1 accent-purple-600"
                />
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {wheelDesign.shadowOffsetX || 0}px
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Desplazamiento Y</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={wheelDesign.shadowOffsetY || 0}
                  onChange={(e) => onUpdateDesign({ shadowOffsetY: parseInt(e.target.value) })}
                  className="flex-1 accent-purple-600"
                />
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {wheelDesign.shadowOffsetY || 0}px
                </span>
              </div>
            </div>
          </div>
          
          {/* Shadow Preview */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <div 
              className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full transition-all"
              style={{
                boxShadow: `${wheelDesign.shadowOffsetX || 0}px ${wheelDesign.shadowOffsetY || 0}px ${wheelDesign.shadowBlur || 30}px rgba(${hexToRgb(wheelDesign.shadowColor)}, ${wheelDesign.shadowIntensity})`
              }}
            />
          </div>
        </div>
        
        {/* Inner Shadow */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl mt-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Sombra Interior</h5>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wheelDesign.innerShadowEnabled || false}
                onChange={(e) => onUpdateDesign({ innerShadowEnabled: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${
                wheelDesign.innerShadowEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                  wheelDesign.innerShadowEnabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>
          
          {wheelDesign.innerShadowEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <ColorInput
                label="Color de Sombra Interior"
                value={wheelDesign.innerShadowColor || '#000000'}
                onChange={(color) => onUpdateDesign({ innerShadowColor: color })}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}