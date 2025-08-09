import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket } from 'lucide-react';

interface TicketAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const TicketAnimation: React.FC<TicketAnimationProps> = ({ show, onComplete }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Ticket/Coin that appears and moves to wheel */}
          <motion.div
            className="absolute"
            initial={{ 
              scale: 0,
              x: 200, // Start from email form side (right)
              y: 0,
              rotate: -180
            }}
            animate={{ 
              scale: [0, 1.5, 1],
              x: [-200, -200, -350], // Move towards wheel (left)
              y: [0, -50, 0],
              rotate: [0, 360, 720]
            }}
            transition={{
              duration: 0.75,
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }}
            onAnimationComplete={onComplete}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse" />
              
              {/* Ticket icon with golden styling */}
              <div className="relative bg-gradient-to-br from-yellow-400 to-amber-500 p-4 rounded-full shadow-2xl">
                <Ticket className="w-12 h-12 text-white" />
              </div>
              
              {/* Sparkles */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                  repeatType: "loop"
                }}
              >
                <span className="text-2xl">✨</span>
              </motion.div>
              
              <motion.div
                className="absolute -bottom-2 -left-2"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                  repeatType: "loop",
                  delay: 0.15
                }}
              >
                <span className="text-2xl">✨</span>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Success message */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.25, duration: 0.25 }}
          >
            <p className="text-2xl font-bold text-yellow-500 drop-shadow-lg">
              ¡Has ganado 1 ticket para girar!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};