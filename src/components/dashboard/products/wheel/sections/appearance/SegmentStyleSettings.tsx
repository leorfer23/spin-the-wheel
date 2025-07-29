import React from "react";
import { motion } from "framer-motion";
import type { WheelDesignConfig } from "../../wheelConfigTypes";
import { ColorInput } from "./ColorInput";

interface SegmentStyleSettingsProps {
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}

const fontOptions = [
  { value: 'default', label: 'Predeterminada' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'cursive', label: 'Cursiva' },
  { value: 'fantasy', label: 'Fantasía' }
];

export const SegmentStyleSettings: React.FC<SegmentStyleSettingsProps> = ({
  wheelDesign,
  onUpdateDesign
}) => {
  return (
    <div className="space-y-6">
      <label className="text-sm font-medium text-gray-700 mb-3 block">Estilo de Segmentos</label>
      
      {/* Segment Borders */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Bordes de Segmentos</h5>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wheelDesign.segmentBorderEnabled || false}
              onChange={(e) => onUpdateDesign({ segmentBorderEnabled: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${
              wheelDesign.segmentBorderEnabled ? 'bg-purple-600' : 'bg-gray-300'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                wheelDesign.segmentBorderEnabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>
        
        {wheelDesign.segmentBorderEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <ColorInput
              label="Color del Borde"
              value={wheelDesign.segmentBorderColor || '#ffffff'}
              onChange={(color) => onUpdateDesign({ segmentBorderColor: color })}
            />
            
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">
                Grosor del Borde
                <span className="text-gray-400 ml-2">{wheelDesign.segmentBorderWidth || 2}px</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={wheelDesign.segmentBorderWidth || 2}
                onChange={(e) => onUpdateDesign({ segmentBorderWidth: parseInt(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Segment Separators */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider">Separadores</h5>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wheelDesign.segmentSeparatorEnabled || false}
              onChange={(e) => onUpdateDesign({ segmentSeparatorEnabled: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${
              wheelDesign.segmentSeparatorEnabled ? 'bg-purple-600' : 'bg-gray-300'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                wheelDesign.segmentSeparatorEnabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>
        
        {wheelDesign.segmentSeparatorEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <ColorInput
              label="Color del Separador"
              value={wheelDesign.segmentSeparatorColor || '#e5e7eb'}
              onChange={(color) => onUpdateDesign({ segmentSeparatorColor: color })}
            />
          </motion.div>
        )}
      </div>
      
      {/* Text Styling */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">Estilo de Texto</h5>
        
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Fuente</label>
          <select
            value={wheelDesign.segmentTextFont || 'default'}
            onChange={(e) => onUpdateDesign({ segmentTextFont: e.target.value })}
            className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          >
            {fontOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={wheelDesign.segmentTextBold || false}
              onChange={(e) => onUpdateDesign({ segmentTextBold: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 font-medium">Texto en Negrita</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={wheelDesign.segmentTextShadow || false}
              onChange={(e) => onUpdateDesign({ segmentTextShadow: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 font-medium">Sombra de Texto</span>
          </label>
        </div>
      </div>
      
      {/* Preview */}
      <div className="p-4 bg-white rounded-xl">
        <p className="text-xs text-gray-600 mb-3">Vista previa del segmento</p>
        <div className="relative w-full h-24 overflow-hidden rounded-lg">
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: '#8b5cf6',
              borderTop: wheelDesign.segmentBorderEnabled ? `${wheelDesign.segmentBorderWidth || 2}px solid ${wheelDesign.segmentBorderColor || '#ffffff'}` : 'none',
              borderBottom: wheelDesign.segmentBorderEnabled ? `${wheelDesign.segmentBorderWidth || 2}px solid ${wheelDesign.segmentBorderColor || '#ffffff'}` : 'none'
            }}
          >
            <span 
              className={`text-white text-lg ${wheelDesign.segmentTextBold ? 'font-bold' : ''}`}
              style={{
                fontFamily: wheelDesign.segmentTextFont === 'default' ? 'inherit' : wheelDesign.segmentTextFont,
                textShadow: wheelDesign.segmentTextShadow ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              Premio Ejemplo
            </span>
          </div>
          {wheelDesign.segmentSeparatorEnabled && (
            <>
              <div 
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: wheelDesign.segmentSeparatorColor || '#e5e7eb' }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: wheelDesign.segmentSeparatorColor || '#e5e7eb' }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};