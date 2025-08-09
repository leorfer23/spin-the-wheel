import React from "react";
import { motion } from "framer-motion";
import type { WheelDesignConfig } from "../../wheelConfigTypes";

interface PegSettingsProps {
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}

export const PegSettings: React.FC<PegSettingsProps> = ({
  wheelDesign,
  onUpdateDesign
}) => {
  const pegStyles = [
    { id: 'dots', name: 'Puntos', icon: '•' },
    { id: 'stars', name: 'Estrellas', icon: '★' },
    { id: 'diamonds', name: 'Diamantes', icon: '◆' },
    { id: 'sticks', name: 'Palitos', icon: '|' },
    { id: 'none', name: 'Ninguno', icon: '○' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">Estilo de Clavijas</label>
        <div className="grid grid-cols-5 gap-3">
          {pegStyles.map((peg) => (
            <motion.button
              key={peg.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateDesign({ pegStyle: peg.id })}
              className={`p-4 rounded-2xl transition-all flex flex-col items-center gap-2 ${
                wheelDesign.pegStyle === peg.id
                  ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg scale-105"
                  : "ring-1 ring-gray-200 hover:ring-purple-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl">{peg.icon}</span>
              <span className="text-sm font-medium text-gray-700">{peg.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">Color de Clavijas</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={wheelDesign.pegColor}
              onChange={(e) => onUpdateDesign({ pegColor: e.target.value, pegStyle: wheelDesign.pegStyle })}
              className="w-14 h-14 rounded-xl cursor-pointer ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
            />
            <input
              type="text"
              value={wheelDesign.pegColor}
              onChange={(e) => onUpdateDesign({ pegColor: e.target.value, pegStyle: wheelDesign.pegStyle })}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">Tamaño de Clavijas</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="40"
              value={wheelDesign.pegSize}
              onChange={(e) => onUpdateDesign({ pegSize: parseInt(e.target.value), pegStyle: wheelDesign.pegStyle })}
              className="flex-1 accent-purple-600"
            />
            <span className="text-sm font-medium text-gray-600 w-12 text-right">{wheelDesign.pegSize}px</span>
          </div>
        </div>
      </div>
    </div>
  );
};