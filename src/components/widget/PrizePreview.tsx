import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gift, Star, Sparkles } from 'lucide-react';

interface Prize {
  id: string;
  label: string;
  color: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  probability?: number;
}

interface PrizePreviewProps {
  prizes: Prize[];
  compact?: boolean;
}

export const PrizePreview: React.FC<PrizePreviewProps> = ({ prizes, compact = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate through prizes
  useEffect(() => {
    if (!isAutoPlaying || prizes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % prizes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, prizes.length]);


  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-indigo-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return <Trophy className="w-5 h-5" />;
      case 'epic':
        return <Star className="w-5 h-5" />;
      case 'rare':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getRarityLabel = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return 'LEGENDARIO';
      case 'epic':
        return 'ÉPICO';
      case 'rare':
        return 'RARO';
      default:
        return 'COMÚN';
    }
  };

  if (prizes.length === 0) return null;

  if (compact) {
    // Compact horizontal scroll view for mobile
    return (
      <div className="w-full">
        <p className="text-xs font-medium text-gray-600 mb-2 text-center">
          🎁 Premios Disponibles
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {prizes.map((prize, idx) => (
            <motion.div
              key={prize.id || idx}
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div
                className="px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm"
                style={{ backgroundColor: prize.color }}
              >
                {prize.icon && <span className="mr-1">{prize.icon}</span>}
                {prize.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Full carousel view for desktop
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-2xl">
          🎯 Lo Que Puedes Ganar
        </h3>
        <p className="text-lg text-white font-semibold drop-shadow-lg">
          Ingresa tu email para participar
        </p>
      </div>

      <div className="relative">
        {/* Prize display with extra padding for badge */}
        <div className="relative h-56 flex items-center justify-center pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Rarity badge - positioned well above the card with more space */}
                {prizes[currentIndex].rarity && (
                  <motion.div
                    className={`absolute -top-14 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getRarityColor(prizes[currentIndex].rarity)} shadow-xl z-10`}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-1">
                      {getRarityIcon(prizes[currentIndex].rarity)}
                      {getRarityLabel(prizes[currentIndex].rarity)}
                    </div>
                  </motion.div>
                )}

                {/* Prize card - improved layout */}
                <motion.div
                  className="relative bg-white rounded-2xl shadow-2xl border-3 min-w-[280px]"
                  style={{
                    background: `linear-gradient(135deg, white, ${prizes[currentIndex].color}10)`,
                    borderColor: prizes[currentIndex].color,
                    borderWidth: '3px',
                    boxShadow: `0 0 30px 5px ${prizes[currentIndex].color}30`
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="p-6">
                    {/* Prize icon */}
                    <div className="text-5xl mb-3 text-center">
                      {prizes[currentIndex].icon || '🎁'}
                    </div>
                    
                    {/* Prize label - with text wrapping */}
                    <h4 className="text-base font-bold text-gray-800 text-center px-2 min-h-[48px] flex items-center justify-center">
                      {prizes[currentIndex].label}
                    </h4>

                    {/* Probability indicator - better layout */}
                    {prizes[currentIndex].probability && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-gray-500">Probabilidad</div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                  i < Math.ceil((prizes[currentIndex].probability || 0) / 20)
                                    ? 'bg-yellow-400 shadow-sm'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Pagination dots - clickable for manual navigation */}
      {prizes.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {prizes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsAutoPlaying(false);
                // Resume auto-play after 5 seconds
                setTimeout(() => setIsAutoPlaying(true), 5000);
              }}
              className={`transition-all duration-300 cursor-pointer hover:bg-white/80 ${
                idx === currentIndex
                  ? 'w-8 h-2.5 bg-white rounded-full shadow-lg'
                  : 'w-2.5 h-2.5 bg-white/60 rounded-full'
              }`}
              aria-label={`Go to prize ${idx + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};