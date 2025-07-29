import React from "react";
import type { WheelDesignConfig } from "../../wheelConfigTypes";

interface EffectsSettingsProps {
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}

export const EffectsSettings: React.FC<EffectsSettingsProps> = ({
  wheelDesign,
  onUpdateDesign
}) => {
  return (
    <div className="space-y-3">
      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className={`text-2xl transition-all ${wheelDesign.soundEnabled ? 'animate-pulse' : ''}`}>
                {wheelDesign.soundEnabled ? '🔊' : '🔇'}
              </span>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Efectos de Sonido</span>
            <p className="text-xs text-gray-500 mt-1">Reproduce sonidos durante el giro y al ganar</p>
          </div>
        </div>
        <input 
          type="checkbox" 
          checked={wheelDesign.soundEnabled}
          onChange={(e) => onUpdateDesign({ soundEnabled: e.target.checked })}
          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
        />
      </label>
      
      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
              {wheelDesign.confettiEnabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="animate-[bounce_1s_ease-in-out_infinite] text-xs">🎊</span>
                  <span className="absolute animate-[bounce_1s_ease-in-out_infinite_0.2s] text-xs translate-x-2 -translate-y-2">🎉</span>
                  <span className="absolute animate-[bounce_1s_ease-in-out_infinite_0.4s] text-xs -translate-x-2 translate-y-2">✨</span>
                </div>
              )}
              {!wheelDesign.confettiEnabled && <span className="text-lg opacity-30">🎉</span>}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Celebración con Confeti</span>
            <p className="text-xs text-gray-500 mt-1">Muestra animación de confeti al ganar</p>
          </div>
        </div>
        <input 
          type="checkbox" 
          checked={wheelDesign.confettiEnabled}
          onChange={(e) => onUpdateDesign({ confettiEnabled: e.target.checked })}
          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
        />
      </label>
      
      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 ${
                wheelDesign.glowEffect ? 'animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'opacity-30'
              }`}></div>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Efecto de Brillo</span>
            <p className="text-xs text-gray-500 mt-1">Añade efecto de brillo al segmento ganador</p>
          </div>
        </div>
        <input 
          type="checkbox" 
          checked={wheelDesign.glowEffect}
          onChange={(e) => onUpdateDesign({ glowEffect: e.target.checked })}
          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
        />
      </label>
    </div>
  );
};