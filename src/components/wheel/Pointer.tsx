import React, { useEffect, useState } from 'react';
import type { PointerConfig } from '../../types/wheel.types';
import { motion, useAnimation } from 'framer-motion';

interface PointerProps {
  config?: PointerConfig;
  isSpinning: boolean;
  onPegHit?: () => void;
}

export const Pointer: React.FC<PointerProps> = ({
  config = {},
  isSpinning,
  onPegHit
}) => {
  const {
    color = '#FF1744',
    size = 40,
    style = 'arrow'
  } = config;
  
  const controls = useAnimation();
  const [pegHitAnimation, setPegHitAnimation] = useState(false);

  useEffect(() => {
    if (isSpinning) {
      controls.start({
        rotate: [0, -15, 0],
        transition: {
          duration: 0.1,
          repeat: Infinity,
          repeatType: 'loop' as const
        }
      });
    } else {
      // Smoothly animate back to original position
      controls.start({
        rotate: 0,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      });
    }
  }, [isSpinning, controls]);

  const renderPointer = () => {
    switch (style) {
      case 'arrow':
        return (
          <g>
            {/* Modern arrow design with gradient and shadow */}
            <defs>
              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.8" />
              </linearGradient>
              <filter id="arrowShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feFlood floodColor="#000000" floodOpacity="0.3"/>
                <feComposite in2="offsetblur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Base circle with gradient */}
            <circle 
              cx="0" 
              cy={-size * 0.7} 
              r={size/2.5} 
              fill="url(#arrowGradient)" 
              filter="url(#arrowShadow)"
            />
            
            {/* Arrow shaft */}
            <path
              d={`M 0,${-size * 0.3} L ${size/4},${-size * 0.6} L ${size/6},${-size * 0.9} L 0,${-size * 1.1} L ${-size/6},${-size * 0.9} L ${-size/4},${-size * 0.6} Z`}
              fill="url(#arrowGradient)"
              filter="url(#arrowShadow)"
            />
            
            {/* Highlight */}
            <ellipse 
              cx="0" 
              cy={-size * 0.7} 
              rx={size/5} 
              ry={size/6} 
              fill="#ffffff" 
              opacity="0.4"
            />
          </g>
        );
      case 'circle':
        return (
          <g>
            {/* Professional circle pointer with depth */}
            <defs>
              <radialGradient id="circleGradient">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="40%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.7" />
              </radialGradient>
              <filter id="circleShadow">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            {/* Outer ring */}
            <circle 
              cx="0" 
              cy={-size * 0.8} 
              r={size/2} 
              fill={color} 
              opacity="0.3"
              filter="url(#circleShadow)"
            />
            
            {/* Main circle */}
            <circle 
              cx="0" 
              cy={-size * 0.8} 
              r={size/2.5} 
              fill="url(#circleGradient)"
              filter="url(#circleShadow)"
            />
            
            {/* Pointer tip */}
            <path
              d={`M ${-size/4},${-size * 0.5} L 0,0 L ${size/4},${-size * 0.5} Z`}
              fill={color}
              filter="url(#circleShadow)"
            />
            
            {/* Center dot */}
            <circle 
              cx="0" 
              cy={-size * 0.8} 
              r={size/8} 
              fill="#ffffff"
              opacity="0.8"
            />
          </g>
        );
      case 'triangle':
        return (
          <path
            d={`M 0,0 L ${size/2},-${size} L -${size/2},-${size} Z`}
            fill={color}
            stroke="#ffffff"
            strokeWidth="2"
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.g
      className="wheel-pointer"
      animate={controls}
      style={{ transformOrigin: '0 0' }}
      initial={{ rotate: 0 }}
      onAnimationComplete={() => {
        if (pegHitAnimation && onPegHit) {
          onPegHit();
          setPegHitAnimation(false);
        }
      }}
    >
      {renderPointer()}
    </motion.g>
  );
};