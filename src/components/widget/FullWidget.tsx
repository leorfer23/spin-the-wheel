import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FloatingHandle } from './FloatingHandle';
import { UnifiedWheelDialog } from './UnifiedWheelDialog';
import { CelebrationPopup } from '../CelebrationPopup';
import { X } from 'lucide-react';

export interface WidgetConfig {
  // Floating Handle
  handleType?: 'floating' | 'tab' | 'bubble';
  handlePosition?: 'left' | 'right';
  handleText?: string;
  handleBackgroundColor?: string;
  handleTextColor?: string;
  handleIcon?: string;
  handleSize?: 'small' | 'medium' | 'large';
  handleAnimation?: 'none' | 'pulse' | 'bounce' | 'rotate';
  handleBorderRadius?: string;
  
  // Email Capture
  captureImageUrl?: string;
  captureTitle?: string;
  captureSubtitle?: string;
  captureButtonText?: string;
  capturePrivacyText?: string;
  captureFormat?: 'instant' | 'minimal' | 'detailed';
  
  // Wheel
  segments: Array<{ 
    id?: string; 
    label: string; 
    value: string; 
    color: string; 
    weight: number;
    textColor?: string;
    fontSize?: number;
    fontWeight?: string;
    icon?: string | null;
    image?: string | null;
  }>;
  spinDuration?: number;
  
  // Wheel Design Configuration
  wheelDesign?: any; // Complete wheel design from database
  
  // Effects
  confettiEnabled?: boolean;
  soundEnabled?: boolean;
  
  // General
  primaryColor?: string;
  backgroundColor?: string;
}

interface FullWidgetProps {
  config: WidgetConfig;
  onClose?: () => void;
  onEmailSubmit?: (email: string, marketingConsent: boolean) => void;
  onSpinComplete?: (result: any) => void;
}

type WidgetStage = 'hidden' | 'unified' | 'celebration';

export const FullWidget: React.FC<FullWidgetProps> = ({
  config,
  onClose,
  onEmailSubmit,
  onSpinComplete
}) => {
  const [stage, setStage] = useState<WidgetStage>('hidden');
  const [spinResult, setSpinResult] = useState<any>(null);
  const [showAttentionCue, setShowAttentionCue] = useState(true);

  const handleOpen = () => {
    setStage('unified');
  };

  const handleEmailSubmit = (email: string, marketingConsent: boolean) => {
    onEmailSubmit?.(email, marketingConsent);
    // Stay in unified stage - the wheel will unlock within the same dialog
  };

  const handleSpinComplete = useCallback((result: any) => {
    setSpinResult(result);
    onSpinComplete?.(result);
    setStage('celebration');
  }, [onSpinComplete]);

  const handleClose = () => {
    setStage('hidden');
    setShowAttentionCue(true);
    onClose?.();
  };

  const handleCelebrationClose = () => {
    setStage('hidden');
    // Reset for next time
    setTimeout(() => {
      setSpinResult(null);
    }, 300);
  };

  return (
    <>
      {stage === 'hidden' && (
        <>
          <FloatingHandle
            onClick={handleOpen}
            type={config.handleType}
            position={config.handlePosition}
            text={config.handleText}
            backgroundColor={config.handleBackgroundColor}
            textColor={config.handleTextColor}
            icon={config.handleIcon}
            size={config.handleSize}
            animation={config.handleAnimation}
            borderRadius={config.handleBorderRadius}
          />
          

          
          {/* Enhanced pulsing glow effect */}
          {showAttentionCue && (
            <>
              {/* Primary glow */}
              <motion.div
                className={`fixed z-30 pointer-events-none ${
                  config.handleType === 'bubble' 
                    ? `bottom-8 ${config.handlePosition === 'right' ? 'right-8' : 'left-8'}`
                    : `top-1/2 -translate-y-1/2 ${config.handlePosition === 'right' ? 'right-0' : 'left-0'}`
                }`}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: 3,
                  repeatType: "loop"
                }}
                onAnimationComplete={() => setShowAttentionCue(false)}
              >
                <div 
                  className={`${
                    config.handleType === 'bubble' ? 'w-24 h-24' : 'w-32 h-32'
                  } rounded-full blur-2xl`}
                  style={{ backgroundColor: config.handleBackgroundColor || '#4F46E5' }}
                />
              </motion.div>
              
              {/* Secondary ripple effect */}
              <motion.div
                className={`fixed z-29 pointer-events-none ${
                  config.handleType === 'bubble' 
                    ? `bottom-8 ${config.handlePosition === 'right' ? 'right-8' : 'left-8'}`
                    : `top-1/2 -translate-y-1/2 ${config.handlePosition === 'right' ? 'right-0' : 'left-0'}`
                }`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0, 0.3, 0],
                  scale: [0.5, 1.5, 1.5]
                }}
                transition={{
                  duration: 2,
                  repeat: 3,
                  repeatType: "loop",
                  delay: 0.5
                }}
              >
                <div 
                  className={`${
                    config.handleType === 'bubble' ? 'w-24 h-24' : 'w-32 h-32'
                  } rounded-full border-2`}
                  style={{ 
                    borderColor: config.handleBackgroundColor || '#4F46E5',
                    opacity: 0.3
                  }}
                />
              </motion.div>
            </>
          )}
        </>
      )}

      <AnimatePresence>
        {stage !== 'hidden' && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50"
              onClick={handleClose}
            />
            
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-5xl h-[85vh] max-h-[650px] min-h-[500px] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ backgroundColor: config.backgroundColor }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {stage === 'unified' && (
                <UnifiedWheelDialog
                  config={config}
                  onEmailSubmit={handleEmailSubmit}
                  onSpinComplete={handleSpinComplete}
                />
              )}

              {stage === 'celebration' && spinResult && (
                <CelebrationPopup
                  result={spinResult}
                  onClose={handleCelebrationClose}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};