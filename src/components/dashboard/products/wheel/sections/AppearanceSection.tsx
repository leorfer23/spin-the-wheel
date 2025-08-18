import React from "react";
import { Palette, Zap, Sparkles, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { WheelDesignConfig } from "../wheelConfigTypes";
import { SaveStatusIndicator } from "../components/SaveStatusIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";

interface AppearanceSectionProps {
  wheelDesign: WheelDesignConfig;
  onUpdateWheelDesign: (updates: Partial<WheelDesignConfig>) => void;
  saveStatus: "idle" | "pending" | "saving" | "saved" | "error";
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  wheelDesign,
  onUpdateWheelDesign,
  saveStatus: _saveStatus
}) => {
  const { save, saveStatus } = useAutoSave({
    type: 'appearance',
    onSave: async (updates) => {
      await onUpdateWheelDesign(updates);
    }
  });
  
  const updateDesign = (updates: Partial<WheelDesignConfig>) => {
    save(updates);
  };

  const simpleThemes = [
    {
      id: 'modern' as const,
      name: 'Moderno',
      description: 'Limpio y profesional',
      preview: {
        backgroundColor: '#f3f4f6',
        wheelBorderColor: '#8b5cf6',
        shadowColor: '#8b5cf6',
        pegColor: '#ec4899',
        centerButtonBackgroundColor: '#8b5cf6',
        centerButtonTextColor: '#ffffff',
        pointerColor: '#FF1744',
        wheelBorderStyle: 'solid' as const,
        wheelBorderWidth: 4,
        shadowBlur: 30,
        shadowIntensity: 0.3,
        glowEffect: true,
        pegStyle: 'sticks',
        pegSize: 10,
        pointerStyle: 'triangle',
        pointerSize: 60
      }
    },
    {
      id: 'circus' as const,
      name: 'Circo',
      description: 'Festivo y divertido',
      preview: {
        backgroundColor: '#fef3c7',
        wheelBorderColor: '#dc2626',
        wheelBorderStyle: 'double' as const,
        wheelBorderWidth: 8,
        shadowColor: '#f59e0b',
        pegColor: '#fbbf24',
        centerButtonBackgroundColor: '#dc2626',
        centerButtonTextColor: '#ffffff',
        pointerColor: '#FF1744',
        shadowBlur: 40,
        shadowIntensity: 0.4,
        sparkleEffect: true,
        centerButtonBorderColor: '#fbbf24',
        centerButtonBorderWidth: 3,
        pegStyle: 'dots',
        pegSize: 10,
        pointerStyle: 'triangle',
        pointerSize: 60
      }
    },
    {
      id: 'elegant' as const,
      name: 'Elegante',
      description: 'Sofisticado y premium',
      preview: {
        backgroundColor: '#1f2937',
        wheelBorderColor: '#fbbf24',
        wheelBorderStyle: 'solid' as const,
        wheelBorderWidth: 3,
        wheelBackgroundColor: '#111827',
        shadowColor: '#fbbf24',
        pegColor: '#fbbf24',
        centerButtonBackgroundColor: '#111827',
        centerButtonTextColor: '#fbbf24',
        pointerColor: '#FF1744',
        shadowBlur: 50,
        shadowIntensity: 0.5,
        glowEffect: true,
        pegGlowEnabled: true,
        pegGlowColor: '#fbbf24',
        pegStyle: 'sticks',
        pegSize: 10,
        pointerStyle: 'triangle',
        pointerSize: 60
      }
    }
  ];

  const applyTheme = (theme: typeof simpleThemes[0]) => {
    updateDesign({
      designTheme: theme.id,
      ...theme.preview
    });
  };

  return (
    <motion.div
      key="appearance"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6 flex-1 overflow-hidden"
    >
      <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Design Theme Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl">
                <Palette className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tema de Diseño
              </h3>
            </div>
            <SaveStatusIndicator status={saveStatus} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {simpleThemes.map((theme) => {
              const isSelected = wheelDesign.designTheme === theme.id;
              
              return (
                <motion.button
                  key={theme.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyTheme(theme)}
                  className={`relative p-6 rounded-2xl transition-all text-center overflow-hidden group ${
                    isSelected
                      ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg"
                      : "ring-1 ring-gray-200 hover:ring-purple-300 hover:bg-gray-50"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                  
                  <h5 className={`font-bold text-lg mb-2 ${isSelected ? 'text-purple-900' : 'text-gray-800'}`}>
                    {theme.name}
                  </h5>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                  
                  {/* Preview circle */}
                  <div className="mt-4 flex justify-center">
                    <div 
                      className="w-16 h-16 rounded-full border-4 shadow-lg"
                      style={{
                        borderColor: theme.preview.wheelBorderColor,
                        backgroundColor: theme.preview.centerButtonBackgroundColor
                      }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Wheel Elements Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Elementos de la Rueda</h3>
          </div>

          <div className="space-y-6">
            {/* Simplified Peg Settings */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Decoración del Borde</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateDesign({ pegStyle: 'sticks', pegSize: 10 })}
                  className={`p-4 rounded-2xl transition-all flex flex-col items-center gap-2 ${
                    wheelDesign.pegStyle === 'sticks'
                      ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg"
                      : "ring-1 ring-gray-200 hover:ring-purple-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">|</span>
                  <span className="text-sm font-medium text-gray-700">Palitos</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateDesign({ pegStyle: 'dots', pegSize: 10 })}
                  className={`p-4 rounded-2xl transition-all flex flex-col items-center gap-2 ${
                    wheelDesign.pegStyle === 'dots'
                      ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg"
                      : "ring-1 ring-gray-200 hover:ring-purple-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">•</span>
                  <span className="text-sm font-medium text-gray-700">Puntos</span>
                </motion.button>
              </div>
            </div>

            {/* Peg Color Only */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Color de Decoración</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={wheelDesign.pegColor}
                  onChange={(e) => updateDesign({ pegColor: e.target.value })}
                  className="w-14 h-14 rounded-xl cursor-pointer ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
                />
                <input
                  type="text"
                  value={wheelDesign.pegColor}
                  onChange={(e) => updateDesign({ pegColor: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm font-mono"
                  placeholder="#FF0000"
                />
              </div>
            </div>

            {/* Center Button - Simplified */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Botón Central</label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Texto del Botón</label>
                    <input
                      type="text"
                      value={wheelDesign.centerButtonText}
                      onChange={(e) => updateDesign({ centerButtonText: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium"
                      placeholder="GIRAR"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Tamaño del Texto</label>
                    <select 
                      value={wheelDesign.centerButtonTextSize}
                      onChange={(e) => updateDesign({ centerButtonTextSize: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm"
                    >
                      <option value="small">Pequeño</option>
                      <option value="medium">Mediano</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Color de Fondo</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={wheelDesign.centerButtonBackgroundColor}
                        onChange={(e) => updateDesign({ centerButtonBackgroundColor: e.target.value })}
                        className="w-12 h-12 rounded-xl cursor-pointer ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
                      />
                      <input
                        type="text"
                        value={wheelDesign.centerButtonBackgroundColor}
                        onChange={(e) => updateDesign({ centerButtonBackgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Color del Texto</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={wheelDesign.centerButtonTextColor}
                        onChange={(e) => updateDesign({ centerButtonTextColor: e.target.value })}
                        className="w-12 h-12 rounded-xl cursor-pointer ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
                      />
                      <input
                        type="text"
                        value={wheelDesign.centerButtonTextColor}
                        onChange={(e) => updateDesign({ centerButtonTextColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Effects & Animation Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-2xl">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Efectos y Animación
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs whitespace-normal">
                    <p className="mb-2">Los efectos de giro cambian cómo se siente la rueda al girar:</p>
                    <ul className="space-y-1">
                      <li>• <strong>Suave:</strong> Giro clásico y uniforme</li>
                      <li>• <strong>Elástico:</strong> Rebota un poco al parar</li>
                      <li>• <strong>Potente:</strong> Empieza rápido y frena fuerte</li>
                    </ul>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Efecto de Giro</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { 
                    id: 'smooth', 
                    name: 'Suave', 
                    description: 'Giro uniforme',
                    animation: 'animate-spin',
                  },
                  { 
                    id: 'elastic', 
                    name: 'Elástico', 
                    description: 'Con rebote',
                    animation: 'animate-[spin_1s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite]',
                  },
                  { 
                    id: 'power', 
                    name: 'Potente', 
                    description: 'Frenado fuerte',
                    animation: 'animate-[spin_1s_cubic-bezier(0.87,0,0.13,1)_infinite]',
                  }
                ].map((effect) => (
                  <motion.button
                    key={effect.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateDesign({ spinningEffect: effect.id })}
                    className={`relative p-4 rounded-2xl transition-all text-left overflow-hidden ${
                      wheelDesign.spinningEffect === effect.id
                        ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg"
                        : "ring-1 ring-gray-200 hover:ring-purple-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 ${
                        wheelDesign.spinningEffect === effect.id ? effect.animation : ''
                      }`}>
                        <div className="absolute inset-1 bg-white rounded-full"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-purple-600 rounded-full"></div>
                      </div>
                    </div>
                    <h5 className="font-medium text-gray-800 mb-1">{effect.name}</h5>
                    <p className="text-xs text-gray-600">{effect.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  Duración del Giro
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={wheelDesign.spinDuration}
                      onChange={(e) => updateDesign({ spinDuration: parseInt(e.target.value) })}
                      className="flex-1 accent-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">{wheelDesign.spinDuration}s</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Rápido</span>
                    <span>Lento</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  Número de Vueltas
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={wheelDesign.rotations}
                      onChange={(e) => updateDesign({ rotations: parseInt(e.target.value) })}
                      className="flex-1 accent-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">{wheelDesign.rotations}x</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Pocas</span>
                    <span>Muchas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};