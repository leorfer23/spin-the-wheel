import React from "react";
import { motion } from "framer-motion";
import type { WheelDesignConfig } from "../../wheelConfigTypes";
import { ColorInput } from "./ColorInput";

interface BackgroundSettingsProps {
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}

export const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
  wheelDesign,
  onUpdateDesign
}) => {
  const backgroundStyles = [
    { id: 'solid', name: 'Sólido', preview: 'bg-gray-100' },
    { id: 'gradient', name: 'Degradado', preview: 'bg-gradient-to-br from-purple-100 to-pink-100' },
    { id: 'transparent', name: 'Transparente', preview: 'bg-white/20 backdrop-blur' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Estilo de Fondo</label>
        <div className="grid grid-cols-3 gap-3">
          {backgroundStyles.map((style) => (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUpdateDesign({ backgroundStyle: style.id })}
              className={`relative overflow-hidden rounded-2xl transition-all h-24 ${
                wheelDesign.backgroundStyle === style.id
                  ? "ring-2 ring-purple-500 shadow-lg scale-105"
                  : "ring-1 ring-gray-200 hover:ring-gray-300"
              }`}
            >
              <div className={`absolute inset-0 ${style.preview}`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-medium text-gray-800 bg-white/80 px-3 py-1 rounded-lg">
                  {style.name}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Background Color Controls */}
      {wheelDesign.backgroundStyle === 'solid' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <ColorInput
            label="Color de Fondo"
            value={wheelDesign.backgroundColor}
            onChange={(value) => onUpdateDesign({ backgroundColor: value })}
          />
        </motion.div>
      )}

      {wheelDesign.backgroundStyle === 'gradient' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 overflow-hidden"
        >
          <div className="grid grid-cols-2 gap-4">
            <ColorInput
              label="Color Inicial"
              value={wheelDesign.backgroundGradientFrom}
              onChange={(value) => onUpdateDesign({ backgroundGradientFrom: value })}
            />
            <ColorInput
              label="Color Final"
              value={wheelDesign.backgroundGradientTo}
              onChange={(value) => onUpdateDesign({ backgroundGradientTo: value })}
            />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <ColorInput
          label="Color de Sombra"
          value={wheelDesign.shadowColor}
          onChange={(value) => onUpdateDesign({ shadowColor: value })}
        />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">Intensidad de Sombra</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={wheelDesign.shadowIntensity}
              onChange={(e) => onUpdateDesign({ shadowIntensity: parseInt(e.target.value) })}
              className="flex-1 accent-purple-600"
            />
            <span className="text-sm font-medium text-gray-600 w-12 text-right">
              {wheelDesign.shadowIntensity}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};