import React from 'react';
import { motion } from 'framer-motion';

interface FloatingHandleProps {
  onClick: () => void;
  position?: 'left' | 'right';
  text?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const FloatingHandle: React.FC<FloatingHandleProps> = ({
  onClick,
  position = 'right',
  text = 'Win Prizes!',
  backgroundColor = '#4F46E5',
  textColor = '#FFFFFF'
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed top-1/2 -translate-y-1/2 z-50 px-4 py-3 rounded-lg shadow-lg cursor-pointer font-semibold text-sm ${
        position === 'right' ? 'right-0 rounded-r-none' : 'left-0 rounded-l-none'
      }`}
      style={{ backgroundColor, color: textColor }}
      initial={{ x: position === 'right' ? 10 : -10 }}
      animate={{ x: 0 }}
      whileHover={{ 
        scale: 1.05,
        x: position === 'right' ? -5 : 5
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        <span className="writing-mode-vertical">{text}</span>
      </div>
    </motion.button>
  );
};