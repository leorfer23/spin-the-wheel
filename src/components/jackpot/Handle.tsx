import React, { useState, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import type { HandleConfig } from '@/components/dashboard/products/jackpot/types';
import { soundEffects } from '@/utils/soundEffects';

interface HandleProps {
  config: HandleConfig;
  onPull: () => void;
  disabled?: boolean;
  className?: string;
  machineFrameColor?: string;
}

export const Handle = ({
  config,
  onPull,
  disabled = false,
  className = ''
}: HandleProps) => {
  const [isPulling, setIsPulling] = useState(false);
  
  // Motion values for handle rotation
  // Start at -90 degrees (pointing right), pull to 0 (pointing down)
  const handleRotation = useMotionValue(-90);
  const springRotation = useSpring(handleRotation, { 
    stiffness: 500, 
    damping: 30,
    restDelta: 0.001
  });
  
  // Transform for knob squish effect
  const knobScale = useTransform(
    springRotation,
    [-90, 0],
    [1, 0.9]
  );
  
  const knobScaleY = useTransform(
    springRotation,
    [-90, 0],
    [1, 1.15]
  );

  const handlePull = useCallback(() => {
    if (disabled || isPulling) return;
    
    setIsPulling(true);
    
    // Animate to pulled position (0 degrees - pointing down)
    handleRotation.set(0);
    
    // Play pull sound if sound effects are available
    soundEffects.play('leverPull');
    
    // Trigger slot machine after reaching bottom
    setTimeout(() => {
      onPull();
      
      // Haptic feedback
      if (config.behavior.haptics && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Spring back with overshoot
      setTimeout(() => {
        // Play release sound if sound effects are available
        soundEffects.play('leverRelease');
        
        handleRotation.set(-95); // Slight overshoot past horizontal
        setTimeout(() => {
          handleRotation.set(-90); // Settle at rest (pointing right)
          setIsPulling(false);
        }, 150);
      }, 200);
    }, 300);
  }, [disabled, isPulling, handleRotation, onPull, config.behavior]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled || isPulling) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePull();
    }
  }, [disabled, isPulling, handlePull]);

  const sizeConfig = {
    small: { handle: 80, ball: 24, shaft: 8 },
    medium: { handle: 100, ball: 32, shaft: 10 },
    large: { handle: 120, ball: 40, shaft: 12 }
  };

  const size = sizeConfig[config.style.size];

  return (
    <div className={`relative ${className}`} style={{ width: 120, height: 200 }}>
      {/* Mount/Base - matches machine aesthetic */}
      <div 
        className="absolute left-2"
        style={{
          top: 10, // Moved even higher up on the machine
          width: 60,
          height: 60,
          background: `radial-gradient(circle at 30% 30%, #d4af37, #b8941f)`, // Gold like slot machine
          borderRadius: '50%',
          boxShadow: `
            inset -3px -3px 6px rgba(0,0,0,0.5),
            inset 3px 3px 6px rgba(255,215,0,0.3),
            0 6px 12px rgba(0,0,0,0.4)
          `,
          border: '3px solid #8b7514',
          zIndex: 2
        }}
      >
        {/* Inner decorative ring */}
        <div 
          className="absolute inset-2"
          style={{
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, #2a2a2a, #1a1a1a)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7)'
          }}
        />
        {/* Center pivot with gold accent */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #d4af37, #8b7514)',
            boxShadow: `
              inset 0 1px 2px rgba(0,0,0,0.6),
              0 1px 2px rgba(255,215,0,0.4)
            `,
            border: '1px solid #5a4a0c'
          }}
        />
        {/* Gold highlight */}
        <div 
          className="absolute top-2 left-2"
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'rgba(255,215,0,0.6)',
            filter: 'blur(3px)'
          }}
        />
      </div>
      
      {/* Lever arm with Framer Motion */}
      <motion.div
        className={`absolute ${disabled || isPulling ? 'cursor-not-allowed' : 'cursor-pointer'} ${disabled ? 'opacity-50' : ''}`}
        style={{
          top: 40, // Align with mount center (10px mount top + 30px half height)
          left: 32, // Center of mount (2px left offset + 30px half width)
          width: size.shaft + 2,
          height: size.handle,
          transformOrigin: 'center top',
          rotate: springRotation,
          zIndex: 3
        }}
        onClick={handlePull}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={config.ctaText}
        aria-disabled={disabled}
        whileHover={!disabled && !isPulling ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isPulling ? { scale: 0.98 } : {}}
      >
        {/* Shaft - black with gold accents matching machine */}
        <div 
          className="absolute inset-x-0 top-0"
          style={{
            width: size.shaft + 2,
            height: '100%',
            background: `linear-gradient(90deg, 
              #1a1a1a 0%, 
              #3a3a3a 25%, 
              #4a4a4a 50%,
              #3a3a3a 75%,
              #1a1a1a 100%
            )`,
            borderRadius: (size.shaft + 2) / 2,
            boxShadow: `
              inset -1px 0 2px rgba(0,0,0,0.5),
              inset 1px 0 2px rgba(255,255,255,0.1),
              0 3px 6px rgba(0,0,0,0.4)
            `,
            border: '1px solid #444'
          }}
        >
          {/* Gold stripe accents on shaft */}
          <div 
            className="absolute"
            style={{
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
              boxShadow: '0 1px 2px rgba(255,215,0,0.3)'
            }}
          />
          <div 
            className="absolute"
            style={{
              top: '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
              boxShadow: '0 1px 2px rgba(255,215,0,0.3)'
            }}
          />
        </div>
        
        {/* Ball/Knob with squish effect */}
        <motion.div 
          className="absolute bottom-0 left-1/2"
          style={{
            width: size.ball,
            height: size.ball,
            x: '-50%',
            y: size.ball / 2,
            scaleX: knobScale,
            scaleY: knobScaleY,
            transformOrigin: 'center top'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${config.style.color}, ${config.style.color}dd)`,
              boxShadow: `
                inset 3px 3px 6px rgba(255,255,255,0.4), 
                inset -3px -3px 6px rgba(0,0,0,0.4),
                0 4px 12px rgba(0,0,0,0.3)
              `,
              position: 'relative'
            }}
          >
            {/* Glossy highlight */}
            <div 
              className="absolute"
              style={{
                top: '15%',
                left: '20%',
                width: '30%',
                height: '30%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)',
                filter: 'blur(2px)'
              }}
            />
            {/* Secondary highlight */}
            <div 
              className="absolute"
              style={{
                top: '10%',
                left: '25%',
                width: '15%',
                height: '15%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                filter: 'blur(1px)'
              }}
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Pull instruction text */}
      <motion.div 
        className="absolute text-center"
        style={{
          top: 50, // Position near the handle when at rest (adjusted for new position)
          right: -10, // To the right of the handle
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: !disabled && !isPulling ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-white font-semibold text-sm mb-1 animate-pulse">
          {config.ctaText}
        </div>
        <div className="text-yellow-400 text-xs">
          ↓
        </div>
      </motion.div>
      
      {/* Shadow on ground when lever is pulled */}
      <motion.div
        className="absolute"
        style={{
          top: 140, // Below the lever when pulled down (adjusted for new position)
          left: 32,
          width: 40,
          height: 8,
          x: '-50%',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.3)',
          filter: 'blur(4px)',
          opacity: useTransform(springRotation, [-90, 0], [0, 0.5]),
          scaleX: useTransform(springRotation, [-90, 0], [0.5, 1.5]),
          zIndex: 1
        }}
      />
    </div>
  );
};