import React from 'react';
import { motion } from 'framer-motion';

interface FloatingHandleProps {
  onClick: () => void;
  type?: 'floating' | 'tab' | 'bubble';
  position?: 'left' | 'right';
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  animation?: 'none' | 'pulse' | 'bounce' | 'rotate';
  borderRadius?: string;
}

export const FloatingHandle: React.FC<FloatingHandleProps> = ({
  onClick,
  type = 'floating',
  position = 'right',
  text = 'Win Prizes!',
  backgroundColor = '#4F46E5',
  textColor = '#FFFFFF',
  icon = '🎯',
  size = 'medium',
  animation = 'pulse',
  borderRadius = '9999px'
}) => {
  console.log('[FloatingHandle] Rendering with:', {
    type,
    position,
    text,
    backgroundColor,
    icon,
    size
  });
  const getAnimationProps = () => {
    switch (animation) {
      case 'pulse':
        return { scale: [1, 1.05, 1] };
      case 'bounce':
        return { y: [0, -10, 0] };
      case 'rotate':
        return { rotate: [0, 10, -10, 0] };
      default:
        return {};
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm px-3 py-2';
      case 'large':
        return 'text-lg px-6 py-4';
      default:
        return 'text-base px-4 py-3';
    }
  };

  const getBubbleSize = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-12 text-xl';
      case 'large':
        return 'w-20 h-20 text-3xl';
      default:
        return 'w-16 h-16 text-2xl';
    }
  };

  if (type === 'tab') {
    return (
      <motion.button
        onClick={onClick}
        className={`fixed top-1/2 -translate-y-1/2 px-3 py-6 shadow-lg cursor-pointer font-semibold ${
          position === 'right' ? 'right-0' : 'left-0'
        }`}
        style={{ 
          backgroundColor, 
          color: textColor,
          borderTopLeftRadius: position === 'right' ? '12px' : '0',
          borderBottomLeftRadius: position === 'right' ? '12px' : '0',
          borderTopRightRadius: position === 'left' ? '12px' : '0',
          borderBottomRightRadius: position === 'left' ? '12px' : '0',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          pointerEvents: 'auto',
          zIndex: 2147483647
        }}
        animate={getAnimationProps()}
        transition={{ repeat: Infinity, duration: animation === 'bounce' ? 1.5 : animation === 'rotate' ? 3 : 2 }}
        whileHover={{ 
          scale: 1.05,
          x: position === 'right' ? -5 : 5
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span>{text}</span>
        </div>
      </motion.button>
    );
  }

  if (type === 'bubble') {
    return (
      <motion.button
        onClick={onClick}
        className={`fixed bottom-8 ${getBubbleSize()} rounded-full shadow-lg cursor-pointer font-semibold flex items-center justify-center ${
          position === 'right' ? 'right-8' : 'left-8'
        }`}
        style={{ 
          backgroundColor, 
          color: textColor,
          pointerEvents: 'auto',  // Ensure button can be clicked
          zIndex: 2147483647  // Ensure it's on top
        }}
        animate={getAnimationProps()}
        transition={{ repeat: Infinity, duration: animation === 'rotate' ? 3 : 2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span>{icon}</span>
      </motion.button>
    );
  }

  // Default: floating type
  return (
    <motion.button
      onClick={onClick}
      className={`fixed top-1/2 -translate-y-1/2 ${getSizeClasses()} shadow-lg cursor-pointer font-semibold ${
        position === 'right' ? 'right-0' : 'left-0'
      }`}
      style={{ 
        backgroundColor, 
        color: textColor,
        borderRadius,
        borderTopRightRadius: position === 'right' ? '0' : borderRadius,
        borderBottomRightRadius: position === 'right' ? '0' : borderRadius,
        borderTopLeftRadius: position === 'left' ? '0' : borderRadius,
        borderBottomLeftRadius: position === 'left' ? '0' : borderRadius,
        pointerEvents: 'auto',
        zIndex: 2147483647
      }}
      animate={getAnimationProps()}
      transition={{ repeat: Infinity, duration: 2 }}
      whileHover={{ 
        scale: 1.05,
        x: position === 'right' ? -5 : 5
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span>{text}</span>
      </div>
    </motion.button>
  );
};