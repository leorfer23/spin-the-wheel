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
  const [timeLeft, setTimeLeft] = useState({ minutes: 15, seconds: 0 });

  // Add countdown timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds === 0) {
          if (prev.minutes === 0) {
            return { minutes: 15, seconds: 0 };
          }
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Removed best prize calculation for minimalistic design

  return (
    <>
      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:flex flex-row h-full min-h-[600px] bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Desktop: Left side - Wheel with excitement elements */}
        <div className="flex-[1.2] flex flex-col items-center justify-center p-8 relative">
          {/* Removed prize showcase for minimalistic design */}

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
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-transparent to-pink-900/60 backdrop-blur-[2px]" />
                
                {/* Lock overlay with message */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-yellow-400/50">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <span className="text-5xl">🎁</span>
                    </motion.div>
                    <p className="text-white text-xl font-bold mt-4">¡Ingresa tu email para desbloquear!</p>
                    <p className="text-yellow-400 text-sm mt-2">Solo 1 intento por usuario</p>
                  </div>
                </motion.div>
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

          <div className={`transition-all duration-700 w-full h-full flex items-center justify-center ${!hasTicket ? 'opacity-75 scale-95' : 'opacity-100 scale-100'}`}>
            <motion.div
              className="relative"
              style={{ 
                width: '90%',
                maxWidth: '450px',
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
              {/* Glowing ring around wheel */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-50 blur-xl animate-pulse"></div>
              
              <FortuneWheel
                config={{
                  segments: config.segments.map((seg: any, idx: number) => ({
                    id: seg.id || `seg-${idx}`,
                    label: seg.label,
                    value: seg.value,
                    color: seg.color,
                    weight: seg.weight || 10,
                  })),
                  dimensions: {
                    diameter: 450,
                    innerRadius: 60,
                    pegRingWidth: 30,
                    pegSize: config.wheelDesign?.pegSize || 8,
                    pegCount: 20
                  },
                  style: config.wheelDesign ? {
                    shadow: `${config.wheelDesign.shadowOffsetX || 0}px ${config.wheelDesign.shadowOffsetY || 0}px ${config.wheelDesign.shadowBlur || 30}px rgba(0, 0, 0, ${config.wheelDesign.shadowIntensity || 0.3})`,
                    borderColor: config.wheelDesign.wheelBorderColor || "#8B5CF6",
                    borderWidth: config.wheelDesign.wheelBorderWidth || 4,
                    backgroundColor: config.wheelDesign.wheelBackgroundColor || 'transparent',
                  } : undefined,
                  pegConfig: config.wheelDesign ? {
                    style: (config.wheelDesign.pegStyle as 'dots' | 'stars' | 'diamonds' | 'sticks' | 'none') || 'dots',
                    color: config.wheelDesign.pegColor || '#FFD700',
                    size: config.wheelDesign.pegSize || 8,
                  } : undefined,
                  pointer: config.wheelDesign ? {
                    color: config.wheelDesign.pointerColor || "#FF1744",
                    size: config.wheelDesign.pointerSize || 60,
                    style: (config.wheelDesign.pointerStyle as 'arrow' | 'circle' | 'triangle') || "triangle",
                  } : undefined,
                  spinConfig: {
                    duration: config.wheelDesign?.spinDuration || (config.spinDuration || 5000) / 1000,
                    easing: config.wheelDesign?.spinningEffect === 'elastic' ? "ease-in-out" : 
                            config.wheelDesign?.spinningEffect === 'power' ? "ease-out" : "ease-out",
                    minRotations: config.wheelDesign?.rotations || 3,
                    maxRotations: (config.wheelDesign?.rotations || 5) + 2,
                    allowDrag: hasTicket
                  },
                  centerCircle: {
                    text: hasTicket ? (config.wheelDesign?.centerButtonText || 'GIRAR') : '🔒',
                    textColor: hasTicket ? (config.wheelDesign?.centerButtonTextColor || '#FFFFFF') : '#FFFFFF',
                    backgroundColor: hasTicket ? (config.wheelDesign?.centerButtonBackgroundColor || '#8B5CF6') : '#6B7280',
                    fontSize: hasTicket ? (
                      config.wheelDesign?.centerButtonTextSize === 'small' ? 18 : 
                      config.wheelDesign?.centerButtonTextSize === 'large' ? 28 :
                      config.wheelDesign?.centerButtonTextSize === 'extra-large' ? 32 : 22
                    ) : 28,
                    showButton: hasTicket,
                    logo: config.wheelDesign?.centerButtonLogo
                  }
                }}
                onSpinComplete={handleSpinComplete}
                autoSpin={false}
              />
            </motion.div>
          </div>

          {/* Removed live players indicator for minimalistic design */}
        </div>

        {/* Desktop: Right side - Conversion-optimized Email Capture */}
        <div className="flex-[0.8] flex items-center justify-center bg-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(139, 92, 246, 0.1) 35px, rgba(139, 92, 246, 0.1) 70px)`
            }}></div>
          </div>

          <div className="w-full max-w-md px-8 relative z-10">
            {!hasTicket ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Minimalistic countdown timer */}
                <motion.div 
                  className="text-center"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <span>Oferta limitada:</span>
                    <span className="font-mono font-medium text-red-600">
                      {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>

                {/* Minimalistic value proposition */}
                <div className="text-center space-y-2">
                  <motion.h2 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Gira y Gana
                  </motion.h2>
                  
                  <p className="text-gray-600">
                    Premios garantizados para todos
                  </p>
                </div>

                {/* Minimalistic email capture */}
                <div className="relative">
                  <EmailCapture
                    onSubmit={handleEmailSubmit}
                    imageUrl={config.captureImageUrl}
                    title=""
                    subtitle=""
                    buttonText="→"
                    privacyText=""
                    primaryColor={config.primaryColor || "#8B5CF6"}
                    format="instant"
                    emailPlaceholder="Ingresa tu email"
                    autoFocus={true}
                    showConsent={false}
                  />
                  
                  {/* Small note */}
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Presiona enter o → para continuar
                  </p>
                </div>

                {/* Removed social proof for minimalistic design */}
              </motion.div>
            ) : (
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-6xl">🎊</span>
                </motion.div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <motion.div
                    animate={{
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <h3 className="text-lg font-medium text-green-600 mb-2">
                      ✓ Ticket Activado
                    </h3>
                    <p className="text-gray-600">
                      Haz clic o arrastra la ruleta
                    </p>
                  </motion.div>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-sm">
                  <p className="text-gray-600 text-sm">
                    💡 <strong>Pro tip:</strong> También puedes arrastrar para girar
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Full screen sections with conversion optimization */}
      <div className="lg:hidden flex flex-col h-full min-h-[600px] bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 relative">
        {/* Animated background for mobile */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {!hasTicket ? (
          /* Mobile: Show only email capture with high conversion design */
          <motion.div 
            className="flex-1 flex flex-col bg-white relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Countdown timer bar */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">⏰ OFERTA LIMITADA</span>
                <span className="text-lg font-bold tabular-nums">
                  {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 w-full max-w-md"
              >
                {/* Simplified title */}
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Gira y Gana
                  </h2>
                  
                  {config.captureSubtitle && (
                    <p className="text-lg text-gray-700 font-medium">{config.captureSubtitle}</p>
                  )}

                  {/* Trust badges */}
                  <div className="flex justify-center gap-3">
                    <span className="text-green-600 text-sm font-bold">✓ Gratis</span>
                    <span className="text-green-600 text-sm font-bold">✓ Instantáneo</span>
                    <span className="text-green-600 text-sm font-bold">✓ Seguro</span>
                  </div>
                </div>

                {/* Email capture form */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-50"></div>
                  
                  <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
                    <EmailCapture
                      onSubmit={handleEmailSubmit}
                      imageUrl={config.captureImageUrl}
                      title=""
                      subtitle=""
                      buttonText="→"
                      privacyText=""
                      primaryColor={config.primaryColor || "#8B5CF6"}
                      format="instant"
                    />
                  </div>
                </div>

                {/* Removed live activity for minimalistic design */}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Mobile: Show only wheel after email submission */
          <motion.div 
            className="flex-1 flex flex-col relative z-10"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Minimalistic success header */}
            <div className="text-center p-3 border-b border-gray-200">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-sm text-green-600 font-medium">✓ Listo para girar</span>
              </motion.div>
            </div>

            {/* Wheel section */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
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

              <motion.div
                className="relative"
                style={{ 
                  width: '90%',
                  maxWidth: '400px',
                  aspectRatio: '1'
                }}
                initial={{ scale: 0.8, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut"
                }}
              >
                {/* Glowing ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-30 blur-xl animate-pulse"></div>
                
                <FortuneWheel
                  config={{
                    segments: config.segments.map((seg: any, idx: number) => ({
                      id: seg.id || `seg-${idx}`,
                      label: seg.label,
                      value: seg.value,
                      color: seg.color,
                      weight: seg.weight || 10,
                    })),
                    dimensions: {
                      diameter: 400,
                      innerRadius: 50,
                      pegRingWidth: 25,
                      pegSize: config.wheelDesign?.pegSize ? Math.floor(config.wheelDesign.pegSize * 0.75) : 6,
                      pegCount: 20
                    },
                    style: config.wheelDesign ? {
                      shadow: `${config.wheelDesign.shadowOffsetX || 0}px ${config.wheelDesign.shadowOffsetY || 0}px ${config.wheelDesign.shadowBlur || 30}px rgba(0, 0, 0, ${config.wheelDesign.shadowIntensity || 0.3})`,
                      borderColor: config.wheelDesign.wheelBorderColor || "#8B5CF6",
                      borderWidth: config.wheelDesign.wheelBorderWidth || 4,
                      backgroundColor: config.wheelDesign.wheelBackgroundColor || 'transparent',
                    } : undefined,
                    pegConfig: config.wheelDesign ? {
                      style: (config.wheelDesign.pegStyle as 'dots' | 'stars' | 'diamonds' | 'sticks' | 'none') || 'dots',
                      color: config.wheelDesign.pegColor || '#FFD700',
                      size: config.wheelDesign.pegSize ? Math.floor(config.wheelDesign.pegSize * 0.75) : 6,
                    } : undefined,
                    pointer: config.wheelDesign ? {
                      color: config.wheelDesign.pointerColor || "#FF1744",
                      size: config.wheelDesign.pointerSize ? Math.floor(config.wheelDesign.pointerSize * 0.85) : 50,
                      style: (config.wheelDesign.pointerStyle as 'arrow' | 'circle' | 'triangle') || "triangle",
                    } : undefined,
                    spinConfig: {
                      duration: config.wheelDesign?.spinDuration || (config.spinDuration || 5000) / 1000,
                      easing: config.wheelDesign?.spinningEffect === 'elastic' ? "ease-in-out" : 
                              config.wheelDesign?.spinningEffect === 'power' ? "ease-out" : "ease-out",
                      minRotations: config.wheelDesign?.rotations || 3,
                      maxRotations: (config.wheelDesign?.rotations || 5) + 2,
                      allowDrag: true
                    },
                    centerCircle: {
                      text: config.wheelDesign?.centerButtonText || 'GIRAR',
                      textColor: config.wheelDesign?.centerButtonTextColor || '#FFFFFF',
                      backgroundColor: config.wheelDesign?.centerButtonBackgroundColor || '#8B5CF6',
                      fontSize: config.wheelDesign?.centerButtonTextSize === 'small' ? 16 : 
                               config.wheelDesign?.centerButtonTextSize === 'large' ? 24 :
                               config.wheelDesign?.centerButtonTextSize === 'extra-large' ? 28 : 20,
                      showButton: true,
                      logo: config.wheelDesign?.centerButtonLogo
                    }
                  }}
                  onSpinComplete={handleSpinComplete}
                  autoSpin={false}
                />
              </motion.div>

              {/* Subtle tap indicator with pulsing animation */}
              <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-center">
                  <motion.div
                    className="inline-block"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-3xl">👆</span>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-1">Toca para girar</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Ticket Animation Overlay */}
      <TicketAnimation
        show={showTicketAnimation}
        onComplete={handleTicketAnimationComplete}
      />

      {/* Add custom animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};