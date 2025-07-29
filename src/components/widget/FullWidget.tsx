import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FloatingHandle } from './FloatingHandle';
import { EmailCapture } from './EmailCapture';
import { FortuneWheel } from '../wheel/FortuneWheel';
import { CelebrationPopup } from '../CelebrationPopup';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface WidgetConfig {
  // Floating Handle
  handlePosition?: 'left' | 'right';
  handleText?: string;
  handleBackgroundColor?: string;
  handleTextColor?: string;
  
  // Email Capture
  captureImageUrl?: string;
  captureTitle?: string;
  captureSubtitle?: string;
  captureButtonText?: string;
  capturePrivacyText?: string;
  
  // Wheel
  segments: Array<{ label: string; value: string; color: string; weight: number }>;
  spinDuration?: number;
  
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

type WidgetStage = 'hidden' | 'email' | 'wheel' | 'celebration';

export const FullWidget: React.FC<FullWidgetProps> = ({
  config,
  onClose,
  onEmailSubmit,
  onSpinComplete
}) => {
  const [stage, setStage] = useState<WidgetStage>('hidden');
  const [email, setEmail] = useState('');
  const [spinResult, setSpinResult] = useState<any>(null);
  const [showAttentionCue, setShowAttentionCue] = useState(true);

  const handleOpen = () => {
    setStage('email');
  };

  const handleEmailSubmit = (email: string, marketingConsent: boolean) => {
    setEmail(email);
    onEmailSubmit?.(email, marketingConsent);
    setStage('wheel');
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
      setEmail('');
      setSpinResult(null);
    }, 300);
  };

  return (
    <>
      {stage === 'hidden' && (
        <>
          <FloatingHandle
            onClick={handleOpen}
            position={config.handlePosition}
            text={config.handleText}
            backgroundColor={config.handleBackgroundColor}
            textColor={config.handleTextColor}
          />
          
          {/* Attention-grabbing arrows */}
          {showAttentionCue && (
            <div className={`fixed top-1/2 -translate-y-1/2 z-40 ${
              config.handlePosition === 'right' ? 'right-20' : 'left-20'
            }`}>
              <motion.div
                initial={{ opacity: 0, x: config.handlePosition === 'right' ? 20 : -20 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  x: config.handlePosition === 'right' ? [20, 0, 0, -10] : [-20, 0, 0, 10]
                }}
                transition={{
                  duration: 2,
                  times: [0, 0.2, 0.8, 1],
                  repeat: 2,
                  repeatDelay: 0.5
                }}
                onAnimationComplete={() => setShowAttentionCue(false)}
                className="flex items-center gap-2"
              >
                {config.handlePosition === 'right' ? (
                  <>
                    <span className="text-purple-600 font-semibold text-sm">Click here!</span>
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                    <ChevronRight className="w-5 h-5 text-purple-600 -ml-3" />
                    <ChevronRight className="w-5 h-5 text-purple-600 -ml-3" />
                  </>
                ) : (
                  <>
                    <ChevronLeft className="w-5 h-5 text-purple-600" />
                    <ChevronLeft className="w-5 h-5 text-purple-600 -mr-3" />
                    <ChevronLeft className="w-5 h-5 text-purple-600 -mr-3" />
                    <span className="text-purple-600 font-semibold text-sm">Click here!</span>
                  </>
                )}
              </motion.div>
            </div>
          )}
          
          {/* Pulsing glow effect */}
          {showAttentionCue && (
            <motion.div
              className={`fixed top-1/2 -translate-y-1/2 z-30 pointer-events-none ${
                config.handlePosition === 'right' ? 'right-0' : 'left-0'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{
                duration: 1.5,
                repeat: 4,
                repeatType: "loop"
              }}
            >
              <div 
                className="w-32 h-32 rounded-full blur-xl"
                style={{ backgroundColor: config.handleBackgroundColor || '#4F46E5' }}
              />
            </motion.div>
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
              className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ backgroundColor: config.backgroundColor }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {stage === 'email' && (
                <div className="p-8">
                  <EmailCapture
                    onSubmit={handleEmailSubmit}
                    imageUrl={config.captureImageUrl}
                    title={config.captureTitle}
                    subtitle={config.captureSubtitle}
                    buttonText={config.captureButtonText}
                    privacyText={config.capturePrivacyText}
                    primaryColor={config.primaryColor}
                  />
                </div>
              )}

              {stage === 'wheel' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-center mb-6">
                    Spin the Wheel, {email.split('@')[0]}!
                  </h2>
                  <div className="mx-auto" style={{ maxWidth: '500px' }}>
                    <FortuneWheel
                      config={{
                        segments: config.segments.map((seg, idx) => ({
                          id: `seg-${idx}`,
                          ...seg
                        })),
                        dimensions: {
                          diameter: 400,
                          innerRadius: 60,
                          pegRingWidth: 30,
                          pegSize: 8,
                          pegCount: 24
                        },
                        spinConfig: {
                          duration: (config.spinDuration || 5000) / 1000,
                          easing: 'ease-out',
                          minRotations: 3,
                          maxRotations: 5,
                          allowDrag: true
                        }
                      }}
                      onSpinComplete={handleSpinComplete}
                    />
                  </div>
                </div>
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