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
  const [playersOnline] = useState(Math.floor(Math.random() * 50) + 127);

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

  // Calculate best prize for display
  const bestPrize = config.segments?.reduce((best: any, current: any) => {
    const currentValue = parseInt(current.text?.match(/\d+/)?.[0] || '0');
    const bestValue = parseInt(best?.text?.match(/\d+/)?.[0] || '0');
    return currentValue > bestValue ? current : best;
  }, config.segments?.[0]);

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
          {/* Prize showcase at top */}
          {!hasTicket && bestPrize && (
            <motion.div 
              className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
                <motion.span 
                  className="text-2xl"
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎯
                </motion.span>
                <span className="font-bold text-lg">Premio Mayor: {bestPrize.text}</span>
                <motion.span 
                  className="text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⭐
                </motion.span>
              </div>
            </motion.div>
          )}

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
                      <span className="text-6xl">🎰</span>
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
                    allowDrag: hasTicket
                  },
                  centerCircle: {
                    text: hasTicket ? 'GIRAR' : '🔒',
                    textColor: '#FFFFFF',
                    backgroundColor: hasTicket ? '#8B5CF6' : '#6B7280',
                    fontSize: hasTicket ? 22 : 28,
                    showButton: hasTicket
                  }
                }}
                onSpinComplete={handleSpinComplete}
                autoSpin={false}
              />
            </motion.div>
          </div>

          {/* Live players indicator */}
          <motion.div 
            className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-green-400/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-white text-sm font-medium">{playersOnline} jugadores activos</span>
            </div>
          </motion.div>
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
                {/* Countdown timer - URGENCY */}
                <motion.div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 shadow-xl"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⏰</span>
                      <span className="font-bold">¡OFERTA LIMITADA!</span>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">
                      {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                  </div>
                </motion.div>

                {/* Value proposition */}
                <div className="text-center space-y-3">
                  <motion.h2 
                    className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    ¡GIRA Y GANA!
                  </motion.h2>
                  
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-800">
                      🎁 Premios GARANTIZADOS
                    </p>
                    <p className="text-lg text-gray-600">
                      Todo el mundo gana algo - ¡Sin excepciones!
                    </p>
                  </div>

                  {/* Trust badges */}
                  <div className="flex justify-center gap-4 py-3">
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Sin trucos</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">100% Gratis</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Instantáneo</span>
                    </div>
                  </div>
                </div>

                {/* Email capture form with minimal friction */}
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                  
                  <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                        SOLO 1 INTENTO POR EMAIL
                      </span>
                    </div>
                    
                    <EmailCapture
                      onSubmit={handleEmailSubmit}
                      imageUrl={config.captureImageUrl}
                      title=""
                      subtitle=""
                      buttonText="🎰 GIRAR AHORA →"
                      privacyText={config.capturePrivacyText || ""}
                      primaryColor={config.primaryColor || "#8B5CF6"}
                      format="instant"
                    />
                    
                    {/* Security note */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Tu información está 100% segura</span>
                    </div>
                  </div>
                </div>

                {/* Social proof */}
                <motion.div 
                  className="bg-purple-50 rounded-xl p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">María S.</span> ganó 20% OFF hace 2 min
                      </p>
                    </div>
                  </div>
                </motion.div>
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
                
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
                  
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <h3 className="text-3xl font-black mb-3">
                      ¡TICKET ACTIVADO! 🎫
                    </h3>
                    <p className="text-xl opacity-95 font-bold">
                      ¡Haz clic en la ruleta para descubrir tu premio!
                    </p>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <p className="text-gray-800 font-medium flex items-center justify-center gap-2">
                    <span className="text-2xl">👈</span>
                    <span>Gira la ruleta AHORA</span>
                    <span className="text-2xl">👈</span>
                  </p>
                </motion.div>

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
                {/* Prize preview */}
                <motion.div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-4 shadow-xl"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-center">
                    <span className="text-3xl">🎁</span>
                    <p className="font-bold text-lg mt-2">Premios GARANTIZADOS</p>
                    <p className="text-sm opacity-90">¡Todos ganan algo!</p>
                  </div>
                </motion.div>

                {/* Title and subtitle */}
                <div className="text-center space-y-3">
                  <motion.h2 
                    className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ¡GIRA Y GANA!
                  </motion.h2>
                  
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
                      buttonText="🎰 GIRAR AHORA"
                      privacyText={config.capturePrivacyText || ""}
                      primaryColor={config.primaryColor || "#8B5CF6"}
                      format="instant"
                    />
                  </div>
                </div>

                {/* Live activity */}
                <div className="bg-purple-50 rounded-xl p-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">
                      <span className="font-bold">{playersOnline}</span> jugando ahora
                    </span>
                  </div>
                </div>
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
            {/* Success header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
              <motion.div
                className="text-center p-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-3xl">🎊</span>
                </motion.div>
                <h3 className="text-xl font-bold mt-2">
                  ¡TICKET ACTIVADO!
                </h3>
                <p className="text-sm opacity-90">Gira para ganar tu premio</p>
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
                      id: `seg-${idx}`,
                      ...seg
                    })),
                    dimensions: {
                      diameter: 400,
                      innerRadius: 50,
                      pegRingWidth: 25,
                      pegSize: 6,
                      pegCount: 20
                    },
                    spinConfig: {
                      duration: (config.spinDuration || 5000) / 1000,
                      easing: 'ease-out',
                      minRotations: 3,
                      maxRotations: 5,
                      allowDrag: true
                    },
                    centerCircle: {
                      text: 'GIRAR',
                      textColor: '#FFFFFF',
                      backgroundColor: '#8B5CF6',
                      fontSize: 20,
                      showButton: true
                    }
                  }}
                  onSpinComplete={handleSpinComplete}
                  autoSpin={false}
                />
              </motion.div>

              {/* Tap indicator */}
              <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="bg-white/90 backdrop-blur rounded-full px-6 py-3 shadow-xl">
                  <span className="text-gray-800 font-bold flex items-center gap-2">
                    <span className="text-2xl">👆</span>
                    TAP PARA GIRAR
                  </span>
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