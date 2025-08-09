import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailCapture } from './EmailCapture';
import { FortuneWheel } from '../wheel/FortuneWheel';
import { TicketAnimation } from './TicketAnimation';
import { Sparkles } from 'lucide-react';

interface UnifiedWheelDialogProps {
  config: any;
  onEmailSubmit?: (email: string, marketingConsent: boolean) => void;
  onSpinComplete?: (result: any) => void;
}

export const UnifiedWheelDialog: React.FC<UnifiedWheelDialogProps> = ({
  config,
  onEmailSubmit,
  onSpinComplete
}) => {
  const [hasTicket, setHasTicket] = useState(false);
  const [showTicketAnimation, setShowTicketAnimation] = useState(false);
  const [isWheelActivating, setIsWheelActivating] = useState(false);
  const [wheelPreviewRotation, setWheelPreviewRotation] = useState(0);

  // Add subtle wheel preview animation
  useEffect(() => {
    if (!hasTicket) {
      const interval = setInterval(() => {
        setWheelPreviewRotation(prev => prev + 0.5);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [hasTicket]);

  const handleEmailSubmit = useCallback((submittedEmail: string, marketingConsent: boolean) => {
    onEmailSubmit?.(submittedEmail, marketingConsent);
    
    // Start ticket animation
    setShowTicketAnimation(true);
  }, [onEmailSubmit]);

  const handleTicketAnimationComplete = useCallback(() => {
    setShowTicketAnimation(false);
    setIsWheelActivating(true);
    
    // Activate wheel after a brief delay
    setTimeout(() => {
      setHasTicket(true);
      setIsWheelActivating(false);
    }, 500);
  }, []);

  const handleSpinComplete = useCallback((result: any) => {
    onSpinComplete?.(result);
  }, [onSpinComplete]);

  return (
    <>
      <div className="flex flex-col h-full min-h-[600px] bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Top section - Text/Email Capture */}
        <div className="flex-shrink-0 bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {!hasTicket ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {config.captureTitle || "Ingresa tu email para girar"}
                  </h2>
                  {config.captureSubtitle && (
                    <p className="text-gray-600 mt-1">{config.captureSubtitle}</p>
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  <EmailCapture
                    onSubmit={handleEmailSubmit}
                    imageUrl={config.captureImageUrl}
                    title=""
                    subtitle=""
                    buttonText={config.captureButtonText || "GIRAR →"}
                    privacyText={config.capturePrivacyText || ""}
                    primaryColor={config.primaryColor || "#8B5CF6"}
                    format="instant"
                  />
                </div>
              </div>
            ) : (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-800">
                  ¡Haz clic en la ruleta para girar!
                </h3>
                <p className="text-gray-600 mt-1">¡Buena suerte!</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Main section - Large Wheel */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Simple overlay when no ticket - just grayed out */}
          <AnimatePresence>
            {!hasTicket && (
              <motion.div
                className="absolute inset-0 z-10 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Simple gray overlay */}
                <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activation effect */}
          <AnimatePresence>
            {isWheelActivating && (
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-pink-500/30 to-purple-600/30 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-24 h-24 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`transition-all duration-700 w-full h-full flex items-center justify-center ${!hasTicket ? 'opacity-60' : 'opacity-100'}`}>
            <motion.div
              className="relative"
              style={{ 
                width: '90%',
                maxWidth: '500px',
                aspectRatio: '1',
                transform: !hasTicket ? `rotate(${wheelPreviewRotation}deg)` : undefined
              }}
              animate={hasTicket ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              <FortuneWheel
                config={{
                  segments: config.segments.map((seg: any, idx: number) => ({
                    id: `seg-${idx}`,
                    ...seg
                  })),
                  dimensions: {
                    diameter: 450,
                    innerRadius: 60,
                    pegRingWidth: 30,
                    pegSize: 8,
                    pegCount: 20
                  },
                  spinConfig: {
                    duration: (config.spinDuration || 5000) / 1000,
                    easing: 'ease-out',
                    minRotations: 3,
                    maxRotations: 5,
                    allowDrag: hasTicket // Only allow interaction when ticket is earned
                  },
                  centerCircle: {
                    text: hasTicket ? 'GIRAR' : '🔒',
                    textColor: '#FFFFFF',
                    backgroundColor: hasTicket ? '#8B5CF6' : '#9CA3AF',
                    fontSize: hasTicket ? 22 : 28,
                    showButton: hasTicket
                  }
                }}
                onSpinComplete={handleSpinComplete}
                autoSpin={false}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Ticket Animation Overlay */}
      <TicketAnimation
        show={showTicketAnimation}
        onComplete={handleTicketAnimationComplete}
      />
    </>
  );
};