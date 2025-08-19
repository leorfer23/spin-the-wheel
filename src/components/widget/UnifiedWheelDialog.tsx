import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailCapture } from './EmailCapture';
import { FortuneWheel } from '../wheel/FortuneWheel';
import { TicketAnimation } from './TicketAnimation';
import { PrizePreview } from './PrizePreview';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface UnifiedWheelDialogProps {
  config: any;
  onEmailSubmit?: (email: string, marketingConsent: boolean) => void;
  onSpinComplete?: (result: any) => void;
  onClose?: () => void;
}

export const UnifiedWheelDialog: React.FC<UnifiedWheelDialogProps> = ({
  config,
  onEmailSubmit,
  onSpinComplete,
  onClose
}) => {
  const [hasTicket, setHasTicket] = useState(false);
  const [showTicketAnimation, setShowTicketAnimation] = useState(false);
  const [isWheelActivating, setIsWheelActivating] = useState(false);
  const [wheelPreviewRotation, setWheelPreviewRotation] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ minutes: 15, seconds: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

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

  const handleEmailSubmit = useCallback(async (submittedEmail: string, marketingConsent: boolean) => {
    // Check if user declined to provide email
    if (submittedEmail === 'skip@user.declined') {
      // Close the widget without giving a ticket
      onClose?.();
      return;
    }
    
    setIsSubmittingEmail(true);
    soundEffects.play('click');
    
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onEmailSubmit?.(submittedEmail, marketingConsent);
    
    // Start ticket animation
    setShowTicketAnimation(true);
    setIsSubmittingEmail(false);
  }, [onEmailSubmit, onClose]);

  const handleTicketAnimationComplete = useCallback(() => {
    setShowTicketAnimation(false);
    setIsWheelActivating(true);
    soundEffects.play('unlock');
    
    // Reset wheel rotation to default position
    setWheelPreviewRotation(0);
    
    // Activate wheel after a brief delay
    setTimeout(() => {
      setHasTicket(true);
      setIsWheelActivating(false);
      soundEffects.play('whoosh');
    }, 500);
  }, []);

  const handleSpinComplete = useCallback((result: any) => {
    soundEffects.play('win');
    onSpinComplete?.(result);
  }, [onSpinComplete]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newState = !prev;
      soundEffects.setEnabled(newState);
      soundEffects.play('click');
      return newState;
    });
  }, []);

  // Prepare prizes for preview
  const getPrizesForPreview = () => {
    return config.segments.map((seg: any) => ({
      id: seg.id,
      label: seg.label,
      color: seg.color,
      icon: seg.icon,
      rarity: seg.weight > 30 ? 'common' : seg.weight > 15 ? 'rare' : seg.weight > 5 ? 'epic' : 'legendary',
      probability: seg.weight
    }));
  };

  // Removed best prize calculation for minimalistic design

  // Generate wheel configuration from config prop
  const generateWheelConfig = () => ({
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
      pegSize: config.wheelDesign?.pegSize || 8,
      pegCount: 20
    },
    style: config.wheelDesign ? {
      shadow: `${config.wheelDesign.shadowOffsetX || 0}px ${config.wheelDesign.shadowOffsetY || 0}px ${config.wheelDesign.shadowBlur || 30}px rgba(0, 0, 0, ${config.wheelDesign.shadowIntensity || 0.3})`,
      borderColor: config.wheelDesign.wheelBorderColor || "#8B5CF6",
      borderWidth: config.wheelDesign.wheelBorderWidth || 4,
      backgroundColor: config.wheelDesign.wheelBackgroundColor || 'transparent',
    } : undefined,
    pegConfig: {
      style: (config.wheelDesign?.pegStyle as 'dots' | 'stars' | 'diamonds' | 'sticks' | 'none') || 'dots',
      color: config.wheelDesign?.pegColor || '#FFD700',
      size: config.wheelDesign?.pegSize || 8,
    },
    pointer: {
      color: config.wheelDesign?.pointerColor || "#FF1744",
      size: config.wheelDesign?.pointerSize || 60,
      style: (config.wheelDesign?.pointerStyle as 'arrow' | 'circle' | 'triangle') || "triangle",
    },
    spinConfig: {
      duration: config.wheelDesign?.spinDuration || (config.spinDuration || 5000) / 1000,
      easing: (config.wheelDesign?.spinningEffect === 'elastic' ? "ease-in-out" : 
              config.wheelDesign?.spinningEffect === 'power' ? "ease-out" : "ease-out") as "ease-out" | "ease-in-out" | "linear",
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
  });

  return (
    <>
      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:flex flex-row h-full bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Desktop: Left side - Wheel with excitement elements */}
        <div className="flex-[1.2] flex flex-col items-center justify-center p-8 relative">
          {/* Sound control button */}
          <button
            onClick={toggleSound}
            className="absolute top-4 left-4 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Prize preview carousel - centered in the middle of the pane */}
          {!hasTicket && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <PrizePreview prizes={getPrizesForPreview()} />
            </motion.div>
          )}

          {/* Strong overlay when no ticket - heavy blur and darkening for maximum contrast */}
          <AnimatePresence>
            {!hasTicket && (
              <motion.div
                className="absolute inset-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Strong overlay with heavy blur and darkening to make prizes pop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[5px]" />
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

          <div className={`transition-all duration-700 w-full h-full flex items-center justify-center ${!hasTicket ? 'opacity-30 scale-85' : 'opacity-100 scale-100'}`}>
            <motion.div
              className="relative"
              style={{ 
                width: '90%',
                maxWidth: '450px',
                aspectRatio: '1',
                transform: !hasTicket ? `rotate(${wheelPreviewRotation}deg)` : 'rotate(0deg)'
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
                  pegConfig: {
                    style: (config.wheelDesign?.pegStyle as 'dots' | 'stars' | 'diamonds' | 'sticks' | 'none') || 'dots',
                    color: config.wheelDesign?.pegColor || '#FFD700',
                    size: config.wheelDesign?.pegSize || 8,
                  },
                  pointer: {
                    color: config.wheelDesign?.pointerColor || "#FF1744",
                    size: config.wheelDesign?.pointerSize || 60,
                    style: (config.wheelDesign?.pointerStyle as 'arrow' | 'circle' | 'triangle') || "triangle",
                  },
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
                  {isSubmittingEmail && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-8 h-8 text-purple-600" />
                      </motion.div>
                    </div>
                  )}
                  <EmailCapture
                    onSubmit={handleEmailSubmit}
                    imageUrl={config.captureImageUrl}
                    title=""
                    subtitle=""
                    buttonText={isSubmittingEmail ? '...' : 'GIRAR'}
                    privacyText=""
                    primaryColor={config.primaryColor || "#8B5CF6"}
                    format="instant"
                    emailPlaceholder="Tu email para participar"
                    autoFocus={true}
                    showConsent={false}
                  />
                  
                  {/* Bigger note */}
                  <p className="text-sm text-gray-500 text-center mt-3 font-medium">
                    ✉️ Ingresa tu email para desbloquear la ruleta
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

      {/* Mobile Layout - Unified experience (vertical stack) */}
      <div className="lg:hidden flex flex-col h-full bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 relative overflow-y-auto">
        {/* Animated background for mobile */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {/* Sound control button for mobile */}
        <button
          onClick={toggleSound}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-white" />
          ) : (
            <VolumeX className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Mobile: Show wheel and email form together (vertical stack) */}
        <div className="flex flex-col min-h-full relative z-10">
          {/* Top section - Wheel (smaller on mobile) */}
          <div className="flex-1 flex items-center justify-center p-4 relative min-h-[400px]">
            {/* Overlay when no ticket - subtle blur only */}
            <AnimatePresence>
              {!hasTicket && (
                <motion.div
                  className="absolute inset-0 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20 backdrop-blur-[1px]" />
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
                      <Sparkles className="w-16 h-16 text-yellow-400" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The wheel - smaller for mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: hasTicket ? 1 : 0.5, 
                scale: 1,
                rotate: !hasTicket ? wheelPreviewRotation : 0
              }}
              transition={{ duration: 0.5 }}
              className={`relative ${!hasTicket ? 'pointer-events-none' : ''}`}
              style={{ 
                transform: `scale(0.8)`,
                maxWidth: '350px',
                width: '100%'
              }}
            >
              <FortuneWheel
                config={generateWheelConfig()}
                onSpinComplete={handleSpinComplete}
                autoSpin={false}
              />
            </motion.div>
          </div>

          {/* Bottom section - Email capture (if not submitted) */}
          {!hasTicket && (
            <motion.div 
              className="bg-white relative z-10 p-6 rounded-t-3xl shadow-2xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Compact prize preview for mobile */}
              <div className="mb-4">
                <PrizePreview prizes={getPrizesForPreview()} compact />
              </div>

              {/* Countdown timer */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <span>Oferta limitada:</span>
                  <span className="font-mono font-medium text-red-600">
                    {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">🎁 ¡Tu Descuento Te Espera!</h2>
                <p className="text-sm text-gray-600 mt-1">100% de probabilidad de ganar</p>
              </div>

              {/* Email capture form */}
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
            </motion.div>
          )}
        </div>
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
