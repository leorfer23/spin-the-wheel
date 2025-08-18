import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trophy, Gift, Star, Sparkles } from 'lucide-react';

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

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + prizes.length) % prizes.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % prizes.length);
  };

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
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-1">
          🎯 Lo Que Puedes Ganar
        </h3>
        <p className="text-xs text-white/70">
          {prizes.length} premios increíbles te esperan
        </p>
      </div>

      <div className="relative">
        {/* Prize display */}
        <div className="relative h-32 flex items-center justify-center">
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
                {/* Rarity badge */}
                {prizes[currentIndex].rarity && (
                  <motion.div
                    className={`absolute -top-3 -right-3 px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(prizes[currentIndex].rarity)} shadow-lg`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-1">
                      {getRarityIcon(prizes[currentIndex].rarity)}
                      {getRarityLabel(prizes[currentIndex].rarity)}
                    </div>
                  </motion.div>
                )}

                {/* Prize card */}
                <motion.div
                  className="relative bg-white rounded-2xl p-6 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${prizes[currentIndex].color}15, ${prizes[currentIndex].color}05)`,
                    borderColor: prizes[currentIndex].color,
                    borderWidth: '2px',
                    borderStyle: 'solid'
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Prize icon */}
                  <div className="text-4xl mb-2 text-center">
                    {prizes[currentIndex].icon || '🎁'}
                  </div>
                  
                  {/* Prize label */}
                  <h4 className="text-lg font-bold text-gray-800 text-center">
                    {prizes[currentIndex].label}
                  </h4>

                  {/* Probability indicator */}
                  {prizes[currentIndex].probability && (
                    <div className="mt-2">
                      <div className="flex items-center justify-center gap-1">
                        <div className="text-xs text-gray-500">Probabilidad:</div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < Math.ceil((prizes[currentIndex].probability || 0) / 20)
                                  ? 'bg-yellow-400'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-30"
                  style={{
                    background: `radial-gradient(circle at center, ${prizes[currentIndex].color}, transparent)`,
                    filter: 'blur(20px)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        {prizes.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              aria-label="Previous prize"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              aria-label="Next prize"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Pagination dots */}
      {prizes.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {prizes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 h-2 bg-white rounded-full'
                  : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'
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