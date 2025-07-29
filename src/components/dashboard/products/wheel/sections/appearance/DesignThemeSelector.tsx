import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Crown, 
  Rocket, 
  CircleDot, 
  Dices,
  Palette
} from "lucide-react";
import type { WheelDesignConfig } from "../../wheelConfigTypes";

interface DesignThemeSelectorProps {
  wheelDesign: WheelDesignConfig;
  onUpdateDesign: (updates: Partial<WheelDesignConfig>) => void;
}

const themes = [
  {
    id: 'modern' as const,
    name: 'Moderno',
    icon: CircleDot,
    description: 'Limpio y minimalista',
    preview: {
      backgroundColor: '#f3f4f6',
      wheelBorderColor: '#8b5cf6',
      shadowColor: '#8b5cf6',
      pegColor: '#ec4899',
      centerButtonBackgroundColor: '#8b5cf6',
      centerButtonTextColor: '#ffffff',
      pointerColor: '#ec4899',
      wheelBorderStyle: 'solid' as const,
      wheelBorderWidth: 4,
      shadowBlur: 30,
      shadowIntensity: 0.3,
      glowEffect: true
    }
  },
  {
    id: 'circus' as const,
    name: 'Circo',
    icon: Sparkles,
    description: 'Festivo y colorido',
    preview: {
      backgroundColor: '#fef3c7',
      wheelBorderColor: '#dc2626',
      wheelBorderStyle: 'double' as const,
      wheelBorderWidth: 8,
      shadowColor: '#f59e0b',
      pegColor: '#fbbf24',
      centerButtonBackgroundColor: '#dc2626',
      centerButtonTextColor: '#ffffff',
      pointerColor: '#dc2626',
      shadowBlur: 40,
      shadowIntensity: 0.4,
      sparkleEffect: true,
      centerButtonBorderColor: '#fbbf24',
      centerButtonBorderWidth: 3
    }
  },
  {
    id: 'elegant' as const,
    name: 'Elegante',
    icon: Crown,
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
      pointerColor: '#fbbf24',
      shadowBlur: 50,
      shadowIntensity: 0.5,
      glowEffect: true,
      pegGlowEnabled: true,
      pegGlowColor: '#fbbf24'
    }
  },
  {
    id: 'futuristic' as const,
    name: 'Futurista',
    icon: Rocket,
    description: 'Tecnológico y moderno',
    preview: {
      backgroundColor: '#0f172a',
      wheelBorderStyle: 'neon' as const,
      wheelBorderColor: '#06b6d4',
      wheelBorderGradientFrom: '#06b6d4',
      wheelBorderGradientTo: '#8b5cf6',
      wheelBorderWidth: 4,
      shadowColor: '#06b6d4',
      pegColor: '#06b6d4',
      centerButtonBackgroundColor: '#1e293b',
      centerButtonTextColor: '#06b6d4',
      pointerColor: '#06b6d4',
      shadowBlur: 60,
      shadowIntensity: 0.7,
      glowEffect: true,
      pegGlowEnabled: true,
      pegGlowColor: '#06b6d4',
      centerButtonGlowEnabled: true,
      centerButtonGlowColor: '#06b6d4',
      pointerGlowEnabled: true,
      pointerGlowColor: '#06b6d4'
    }
  },
  {
    id: 'minimal' as const,
    name: 'Minimalista',
    icon: CircleDot,
    description: 'Simple y limpio',
    preview: {
      backgroundColor: '#ffffff',
      wheelBorderColor: '#e5e7eb',
      wheelBorderStyle: 'solid' as const,
      wheelBorderWidth: 2,
      shadowColor: '#9ca3af',
      pegStyle: 'none',
      centerButtonBackgroundColor: '#f3f4f6',
      centerButtonTextColor: '#374151',
      pointerColor: '#374151',
      shadowBlur: 20,
      shadowIntensity: 0.1,
      glowEffect: false
    }
  },
  {
    id: 'casino' as const,
    name: 'Casino',
    icon: Dices,
    description: 'Las Vegas clásico',
    preview: {
      backgroundColor: '#7f1d1d',
      wheelBorderColor: '#fbbf24',
      wheelBorderStyle: 'double' as const,
      wheelBorderWidth: 6,
      wheelBackgroundColor: '#991b1b',
      shadowColor: '#fbbf24',
      pegStyle: 'stars',
      pegColor: '#fbbf24',
      centerButtonBackgroundColor: '#991b1b',
      centerButtonTextColor: '#fbbf24',
      centerButtonBorderColor: '#fbbf24',
      centerButtonBorderWidth: 2,
      pointerColor: '#fbbf24',
      shadowBlur: 40,
      shadowIntensity: 0.5,
      glowEffect: true,
      sparkleEffect: true
    }
  }
];

export const DesignThemeSelector: React.FC<DesignThemeSelectorProps> = ({
  wheelDesign,
  onUpdateDesign
}) => {
  const applyTheme = (theme: typeof themes[0]) => {
    onUpdateDesign({
      designTheme: theme.id,
      ...theme.preview
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Tema de Diseño</label>
        {wheelDesign.designTheme === 'custom' && (
          <span className="text-xs text-purple-600 font-medium px-2 py-1 bg-purple-50 rounded-full">
            Personalizado
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = wheelDesign.designTheme === theme.id;
          
          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyTheme(theme)}
              className={`relative p-4 rounded-2xl transition-all text-left overflow-hidden group ${
                isSelected
                  ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg"
                  : "ring-1 ring-gray-200 hover:ring-purple-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-purple-600 rounded-full"
                  />
                )}
              </div>
              
              <h5 className={`font-medium mb-1 ${isSelected ? 'text-purple-900' : 'text-gray-800'}`}>
                {theme.name}
              </h5>
              <p className="text-xs text-gray-600">{theme.description}</p>
              
              {/* Preview circle */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <div 
                  className="w-full h-full rounded-full border-4"
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
      
      {/* Custom theme button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onUpdateDesign({ designTheme: 'custom' })}
        className={`w-full p-4 rounded-2xl transition-all flex items-center gap-3 ${
          wheelDesign.designTheme === 'custom'
            ? "ring-2 ring-purple-500 bg-purple-50 shadow-lg"
            : "ring-1 ring-gray-200 hover:ring-purple-300 hover:bg-gray-50"
        }`}
      >
        <Palette className={`w-5 h-5 ${
          wheelDesign.designTheme === 'custom' ? 'text-purple-600' : 'text-gray-600'
        }`} />
        <div className="text-left">
          <h5 className={`font-medium ${
            wheelDesign.designTheme === 'custom' ? 'text-purple-900' : 'text-gray-800'
          }`}>
            Personalizado
          </h5>
          <p className="text-xs text-gray-600">Crea tu propio estilo único</p>
        </div>
      </motion.button>
    </div>
  );
};