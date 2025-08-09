import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpinResult } from '../types/wheel.types';

/**
 * Props for the CelebrationPopup component
 */
interface CelebrationPopupProps {
  /** The spin result containing the won segment data */
  result: SpinResult | null;
  /** Callback to close the popup */
  onClose: () => void;
  /** Optional custom message to display */
  customMessage?: string;
}

/**
 * CelebrationPopup displays a congratulatory modal when a user wins a prize.
 * Features animated confetti, prize display, and promo code with copy functionality.
 */
export const CelebrationPopup: React.FC<CelebrationPopupProps> = ({ result, onClose, customMessage }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  /**
   * Copies the promo code to clipboard and shows confirmation
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(result.segment.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Generates random confetti particles for the celebration animation
   */
  const generateConfetti = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1,
      size: 4 + Math.random() * 6,
      color: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'][Math.floor(Math.random() * 5)]
    }));
  };

  return (
    <AnimatePresence>
      {result && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateZ: -10 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotateZ: 0,
                transition: {
                  type: "spring",
                  damping: 15,
                  stiffness: 300
                }
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {generateConfetti().map((confetti) => (
                  <motion.div
                    key={confetti.id}
                    className="absolute"
                    style={{
                      left: `${confetti.x}%`,
                      width: confetti.size,
                      height: confetti.size,
                      backgroundColor: confetti.color,
                      borderRadius: '50%'
                    }}
                    initial={{ y: -20, opacity: 1 }}
                    animate={{
                      y: window.innerHeight,
                      x: [0, (Math.random() - 0.5) * 200],
                      rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      duration: confetti.duration,
                      delay: confetti.delay,
                      ease: "linear"
                    }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center relative z-10"
              >
                <motion.h2 
                  className="text-4xl font-bold mb-2"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 3,
                    repeatType: "reverse"
                  }}
                >
                  🎉 ¡Felicitaciones! 🎉
                </motion.h2>
                
                <p className="text-gray-600 mb-6">{customMessage || '¡Has ganado un premio increíble!'}</p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="mb-6"
                >
                  <div 
                    className="inline-block px-8 py-4 rounded-xl text-white font-bold text-2xl shadow-lg"
                    style={{ backgroundColor: result.segment.color }}
                  >
                    {result.segment.label}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-100 rounded-lg p-4 mb-6"
                >
                  <p className="text-sm text-gray-600 mb-2">Tu código promocional:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-2xl font-mono font-bold text-gray-800">
                      {result.segment.value}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      {copied ? '✓ ¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  ¡Genial, gracias!
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};