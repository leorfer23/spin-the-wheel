import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import type { SpinResult } from '../types/wheel.types';

interface MinimalCelebrationProps {
  result: SpinResult | null;
  onClose: () => void;
}

export const MinimalCelebration: React.FC<MinimalCelebrationProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0, y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm mx-4 pointer-events-auto relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Sparkle icon */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 left-1/2 -translate-x-1/2"
            >
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="text-center mt-2">
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
              >
                ¡Felicidades!
              </motion.h3>
              
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 mb-4"
              >
                Has ganado
              </motion.p>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-block"
              >
                <div 
                  className="px-6 py-3 rounded-full text-white font-bold text-xl"
                  style={{ backgroundColor: result.segment.color }}
                >
                  {result.segment.label}
                </div>
              </motion.div>

              {/* Confetti dots */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)],
                    y: [0, -30 - i * 5, 40],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.1 * i,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'][i % 5],
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};