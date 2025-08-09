import React from "react";
import { Palette, Zap, Sparkles, Brush } from "lucide-react";
import { motion } from "framer-motion";
import type { WheelDesignConfig } from "../wheelConfigTypes";
import { 
  BackgroundSettings, 
  PegSettings, 
  EffectsSettings,
  DesignThemeSelector,
  ShadowSettings,
  WheelBorderSettings,
  SegmentStyleSettings
} from "./appearance";
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
  saveStatus: _saveStatus // Unused, keeping for backward compatibility
}) => {
  const [mode, setMode] = React.useState<'easy' | 'advanced'>('easy');
  
  // Use centralized auto-save
  const { save, saveStatus } = useAutoSave({
    type: 'appearance',
    onSave: async (updates) => {
      await onUpdateWheelDesign(updates);
    }
  });
  
  const updateDesign = (updates: Partial<WheelDesignConfig>) => {
    save(updates);
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
        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Modo de Configuración</h3>
              <p className="text-xs text-gray-600">
                {mode === 'easy' ? 'Configuración simplificada' : 'Todas las opciones disponibles'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl p-1">
            <button
              onClick={() => setMode('easy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'easy'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Fácil
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'advanced'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Avanzado
            </button>
          </div>
        </div>

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

          <DesignThemeSelector 
            wheelDesign={wheelDesign} 
            onUpdateDesign={updateDesign} 
          />
        </motion.div>

        {/* Visual Design Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Diseño Visual
              </h3>
            </div>
            <SaveStatusIndicator status={saveStatus} />
          </div>

          <div className="space-y-6">
            <BackgroundSettings 
              wheelDesign={wheelDesign} 
              onUpdateDesign={updateDesign} 
            />
            
            {mode === 'advanced' && (
              <>
                <div className="border-t pt-6">
                  <WheelBorderSettings
                    wheelDesign={wheelDesign}
                    onUpdateDesign={updateDesign}
                  />
                </div>
                
                <div className="border-t pt-6">
                  <ShadowSettings
                    wheelDesign={wheelDesign}
                    onUpdateDesign={updateDesign}
                  />
                </div>
              </>
            )}
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
            <PegSettings 
              wheelDesign={wheelDesign} 
              onUpdateDesign={updateDesign} 
            />

            {/* Center Button */}
            <CenterButtonConfig 
              wheelDesign={wheelDesign} 
              onUpdateDesign={updateDesign} 
            />
            
            {/* Pointer Configuration */}
            <PointerConfig 
              wheelDesign={wheelDesign} 
              onUpdateDesign={updateDesign} 
            />
          </div>
        </motion.div>

        {/* Segment Styling Card - Advanced only */}
        {mode === 'advanced' && (
          <motion.div 
            className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-2xl">
                <Brush className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Estilo de Segmentos</h3>
            </div>

            <SegmentStyleSettings
              wheelDesign={wheelDesign}
              onUpdateDesign={updateDesign}
            />
          </motion.div>
        )}

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
            <h3 className="text-xl font-bold text-gray-800">Efectos y Animación</h3>
          </div>

          <div className="space-y-6">
            <SpinningEffects 
              wheelDesign={wheelDesign} 
              onUpdateDesign={updateDesign} 
            />

            {mode === 'advanced' && (
              <>
                <AnimationSettings 
                  wheelDesign={wheelDesign} 
                  onUpdateDesign={updateDesign} 
                />

                <EffectsSettings 
                  wheelDesign={wheelDesign} 
                  onUpdateDesign={updateDesign} 
                />
              </>
            )}
          </div>
        </motion.div>

        {/* Quick Presets */}
        <QuickPresets onUpdateDesign={updateDesign} />
      </div>
    </motion.div>
  );
};

const CenterButtonConfig: React.FC<{
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}> = ({ wheelDesign, onUpdateDesign }) => (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-3 block">Botón Central</label>
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => onUpdateDesign({ centerButtonLogo: '' })}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            !wheelDesign.centerButtonLogo
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Texto
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Ingresa la URL de la imagen del logo:');
            if (url) {
              onUpdateDesign({ centerButtonLogo: url });
            }
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            wheelDesign.centerButtonLogo
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Logo
        </button>
      </div>
      
      {wheelDesign.centerButtonLogo ? (
        <div className="space-y-3">
          <div className="relative">
            <label className="text-xs font-medium text-gray-600 mb-2 block">URL del Logo</label>
            <input
              type="text"
              value={wheelDesign.centerButtonLogo}
              onChange={(e) => onUpdateDesign({ centerButtonLogo: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm"
              placeholder="https://example.com/logo.png"
            />
          </div>
          {wheelDesign.centerButtonLogo && (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl">
              <img 
                src={wheelDesign.centerButtonLogo} 
                alt="Center logo preview"
                className="max-h-24 max-w-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Texto del Botón</label>
            <input
              type="text"
              value={wheelDesign.centerButtonText}
              onChange={(e) => onUpdateDesign({ centerButtonText: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium"
              placeholder="Ingresa el texto del botón"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Tamaño del Texto</label>
            <select 
              value={wheelDesign.centerButtonTextSize}
              onChange={(e) => onUpdateDesign({ centerButtonTextSize: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
              <option value="extra-large">Extra Grande</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Color de Fondo</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={wheelDesign.centerButtonBackgroundColor}
              onChange={(e) => onUpdateDesign({ centerButtonBackgroundColor: e.target.value })}
              className="w-12 h-12 rounded-xl cursor-pointer ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
            />
            <input
              type="text"
              value={wheelDesign.centerButtonBackgroundColor}
              onChange={(e) => onUpdateDesign({ centerButtonBackgroundColor: e.target.value })}
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
              onChange={(e) => onUpdateDesign({ centerButtonTextColor: e.target.value })}
              className="w-12 h-12 rounded-xl cursor-pointer ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
            />
            <input
              type="text"
              value={wheelDesign.centerButtonTextColor}
              onChange={(e) => onUpdateDesign({ centerButtonTextColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PointerConfig: React.FC<{
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}> = ({ wheelDesign, onUpdateDesign }) => (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-3 block">Diseño del Puntero</label>
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Estilo del Puntero</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'arrow', name: 'Flecha', icon: '▼' },
            { id: 'circle', name: 'Círculo', icon: '●' },
            { id: 'triangle', name: 'Triángulo', icon: '▲' }
          ].map((style) => (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateDesign({ pointerStyle: style.id })}
              className={`p-4 rounded-2xl transition-all flex flex-col items-center gap-2 ${
                wheelDesign.pointerStyle === style.id
                  ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg scale-105"
                  : "ring-1 ring-gray-200 hover:ring-purple-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl" style={{ color: wheelDesign.pointerColor }}>{style.icon}</span>
              <span className="text-sm font-medium text-gray-700">{style.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Color del Puntero</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={wheelDesign.pointerColor}
            onChange={(e) => onUpdateDesign({ pointerColor: e.target.value })}
            className="w-14 h-14 rounded-xl cursor-pointer ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
          />
          <input
            type="text"
            value={wheelDesign.pointerColor}
            onChange={(e) => onUpdateDesign({ pointerColor: e.target.value })}
            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm font-mono"
            placeholder="#FF1744"
          />
        </div>
      </div>
    </div>
  </div>
);

const SpinningEffects: React.FC<{
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}> = ({ wheelDesign, onUpdateDesign }) => (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-3 block">Efecto de Giro</label>
    <div className="grid grid-cols-3 gap-3">
      {[
        { 
          id: 'smooth', 
          name: 'Suave', 
          description: 'Giro suave clásico',
          animation: 'animate-spin',
        },
        { 
          id: 'elastic', 
          name: 'Elástico', 
          description: 'Final con rebote',
          animation: 'animate-[spin_1s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite]',
        },
        { 
          id: 'power', 
          name: 'Potente', 
          description: 'Desaceleración fuerte',
          animation: 'animate-[spin_1s_cubic-bezier(0.87,0,0.13,1)_infinite]',
        }
      ].map((effect) => (
        <motion.button
          key={effect.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onUpdateDesign({ spinningEffect: effect.id })}
          className={`relative p-4 rounded-2xl transition-all text-left overflow-hidden ${
            wheelDesign.spinningEffect === effect.id
              ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg scale-105"
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
);

const AnimationSettings: React.FC<{
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}> = ({ wheelDesign, onUpdateDesign }) => (
  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        Duración del Giro
        <span className="text-xs text-gray-500">(Más lento ← → Más rápido)</span>
      </label>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="2"
            max="10"
            value={wheelDesign.spinDuration}
            onChange={(e) => onUpdateDesign({ spinDuration: parseInt(e.target.value) })}
            className="flex-1 accent-purple-600"
          />
          <span className="text-sm font-medium text-gray-600 w-12 text-right">{wheelDesign.spinDuration}s</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Rápido</span>
          <span>Largo</span>
        </div>
      </div>
    </div>

    <div>
      <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        Rotaciones
        <span className="text-xs text-gray-500">(Menos giros ← → Más giros)</span>
      </label>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="3"
            max="10"
            value={wheelDesign.rotations}
            onChange={(e) => onUpdateDesign({ rotations: parseInt(e.target.value) })}
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
);


const QuickPresets: React.FC<{
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}> = ({ onUpdateDesign }) => (
  <motion.div 
    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.4 }}
  >
    <h4 className="text-lg font-semibold text-gray-800 mb-4">Presets Rápidos</h4>
    <div className="grid grid-cols-4 gap-3">
      {[
        { 
          name: 'Elegante', 
          colors: ['#1a1a1a', '#FFD700'],
          design: {
            shadowColor: '#1a1a1a',
            pegColor: '#FFD700',
            centerButtonBackgroundColor: '#1a1a1a',
            centerButtonTextColor: '#FFD700'
          }
        },
        { 
          name: 'Juguetón', 
          colors: ['#FF6B6B', '#4ECDC4'],
          design: {
            shadowColor: '#FF6B6B',
            pegColor: '#4ECDC4',
            centerButtonBackgroundColor: '#FF6B6B',
            centerButtonTextColor: '#FFFFFF'
          }
        },
        { 
          name: 'Moderno', 
          colors: ['#8B5CF6', '#EC4899'],
          design: {
            shadowColor: '#8B5CF6',
            pegColor: '#EC4899',
            centerButtonBackgroundColor: '#8B5CF6',
            centerButtonTextColor: '#FFFFFF'
          }
        },
        { 
          name: 'Clásico', 
          colors: ['#DC2626', '#059669'],
          design: {
            shadowColor: '#DC2626',
            pegColor: '#059669',
            centerButtonBackgroundColor: '#DC2626',
            centerButtonTextColor: '#FFFFFF'
          }
        }
      ].map((preset) => (
        <motion.button
          key={preset.name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onUpdateDesign(preset.design)}
          className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex gap-1 mb-2 justify-center">
            {preset.colors.map((color, i) => (
              <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">{preset.name}</span>
        </motion.button>
      ))}
    </div>
  </motion.div>
);