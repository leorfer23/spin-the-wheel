import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmailCapture } from "./EmailCapture";
import { FortuneWheel } from "../wheel/FortuneWheel";
import type { Segment } from "../dashboard/products/wheel/types";

interface PreviewCarouselProps {
  segments: Segment[];
  widgetConfig: {
    handlePosition: "left" | "right";
    handleText: string;
    handleBackgroundColor: string;
    handleTextColor: string;
    captureImageUrl: string;
    captureTitle: string;
    captureSubtitle: string;
    captureButtonText: string;
    capturePrivacyText: string;
    captureFormat?: 'instant' | 'minimal' | 'social';
  };
  wheelDesignConfig?: {
    // Theme
    designTheme: 'modern' | 'circus' | 'elegant' | 'futuristic' | 'minimal' | 'casino' | 'custom';
    
    // Background
    backgroundStyle: string;
    backgroundColor: string;
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    backgroundImage?: string;
    backgroundOpacity?: number;
    
    // Wheel specific background
    wheelBackgroundColor?: string;
    wheelBackgroundGradientFrom?: string;
    wheelBackgroundGradientTo?: string;
    wheelBorderStyle: 'solid' | 'double' | 'dotted' | 'neon' | 'gradient';
    wheelBorderColor: string;
    wheelBorderWidth: number;
    wheelBorderGradientFrom?: string;
    wheelBorderGradientTo?: string;
    
    // Shadow
    shadowColor: string;
    shadowIntensity: number;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    innerShadowEnabled: boolean;
    innerShadowColor?: string;
    
    // Pegs
    pegStyle: string;
    pegColor: string;
    pegSize: number;
    pegGlowEnabled?: boolean;
    pegGlowColor?: string;
    
    // Center Button
    centerButtonText: string;
    centerButtonTextSize: string;
    centerButtonBackgroundColor: string;
    centerButtonTextColor: string;
    centerButtonLogo?: string;
    centerButtonBorderColor?: string;
    centerButtonBorderWidth?: number;
    centerButtonGlowEnabled?: boolean;
    centerButtonGlowColor?: string;
    centerButtonFont?: string;
    centerButtonFontWeight?: string;
    
    // Pointer
    pointerStyle: string;
    pointerColor: string;
    pointerSize?: number;
    pointerGlowEnabled?: boolean;
    pointerGlowColor?: string;
    
    // Effects
    spinningEffect: string;
    spinDuration: number;
    rotations: number;
    soundEnabled: boolean;
    confettiEnabled: boolean;
    glowEffect: boolean;
    sparkleEffect?: boolean;
    pulseEffect?: boolean;
    
    // Segment styling
    segmentBorderEnabled?: boolean;
    segmentBorderColor?: string;
    segmentBorderWidth?: number;
    segmentSeparatorEnabled?: boolean;
    segmentSeparatorColor?: string;
    segmentTextFont?: string;
    segmentTextBold?: boolean;
    segmentTextShadow?: boolean;
  };
  onShowFullFlow?: () => void;
  activeConfigSection?: string;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

export const PreviewCarousel: React.FC<PreviewCarouselProps> = ({
  segments,
  widgetConfig,
  wheelDesignConfig,
  activeConfigSection,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "wheel",
      title: "Wheel",
      content: (
        <div className="w-full h-full flex items-center justify-center p-8">
          <div 
            className="relative transition-all duration-300"
            style={{
              width: '580px',
              height: '580px',
              padding: '40px',
              background: 'transparent',
              opacity: wheelDesignConfig?.backgroundOpacity || 1
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-[500px] h-[500px]">
                <FortuneWheel
              config={{
                segments: segments.map((seg, idx) => ({
                  id: seg.id || `seg-${idx}`,
                  label: seg.label,
                  value: seg.value,
                  color: seg.color,
                  weight: seg.weight || 10,
                })),
                dimensions: {
                  diameter: 500,
                  innerRadius: 80,
                  pegRingWidth: 40,
                  pegSize: wheelDesignConfig?.pegSize || 14,
                  pegCount: 20,
                },
                style: {
                  shadow: wheelDesignConfig 
                    ? `${wheelDesignConfig.shadowOffsetX || 0}px ${wheelDesignConfig.shadowOffsetY || 0}px ${wheelDesignConfig.shadowBlur || 30}px rgba(${hexToRgb(wheelDesignConfig.shadowColor)}, ${wheelDesignConfig.shadowIntensity})`
                    : "0 15px 40px rgba(0, 0, 0, 0.25)",
                  borderColor: wheelDesignConfig?.wheelBorderStyle === 'gradient' && wheelDesignConfig.wheelBorderGradientFrom && wheelDesignConfig.wheelBorderGradientTo
                    ? `linear-gradient(45deg, ${wheelDesignConfig.wheelBorderGradientFrom}, ${wheelDesignConfig.wheelBorderGradientTo})`
                    : (wheelDesignConfig?.wheelBorderColor || "#ffffff"),
                  borderWidth: wheelDesignConfig?.wheelBorderWidth || 12,
                  backgroundColor: wheelDesignConfig?.wheelBackgroundGradientFrom 
                    ? `linear-gradient(135deg, ${wheelDesignConfig.wheelBackgroundGradientFrom}, ${wheelDesignConfig.wheelBackgroundGradientTo})`
                    : (wheelDesignConfig?.wheelBackgroundColor || 'transparent'),
                },
                pegConfig: {
                  style: wheelDesignConfig?.pegStyle as 'dots' | 'stars' | 'diamonds' | 'sticks' | 'none' || 'dots',
                  color: wheelDesignConfig?.pegColor || '#FFD700',
                  size: wheelDesignConfig?.pegSize || 14,
                },
                centerCircle: {
                  text: wheelDesignConfig?.centerButtonText || "SPIN",
                  logo: wheelDesignConfig?.centerButtonLogo,
                  backgroundColor: wheelDesignConfig?.centerButtonBackgroundColor || "#ffffff",
                  textColor: wheelDesignConfig?.centerButtonTextColor || "#333333",
                  fontSize: wheelDesignConfig?.centerButtonTextSize === 'small' ? 24 : 
                           wheelDesignConfig?.centerButtonTextSize === 'large' ? 48 :
                           wheelDesignConfig?.centerButtonTextSize === 'extra-large' ? 60 : 36,
                  showButton: true,
                },
                pointer: {
                  color: wheelDesignConfig?.pointerColor || "#FF1744",
                  size: wheelDesignConfig?.pointerSize || 60,
                  style: (wheelDesignConfig?.pointerStyle as 'arrow' | 'circle' | 'triangle') || "triangle",
                },
                spinConfig: {
                  duration: wheelDesignConfig?.spinDuration || 4,
                  easing: wheelDesignConfig?.spinningEffect === 'elastic' ? "ease-in-out" : 
                          wheelDesignConfig?.spinningEffect === 'power' ? "ease-out" : "ease-out",
                  minRotations: wheelDesignConfig?.rotations || 3,
                  maxRotations: (wheelDesignConfig?.rotations || 5) + 2,
                  allowDrag: true,
                },
              }}
              onSpinComplete={(_result) => {
                // Handle spin completion
              }}
            />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "email-capture",
      title: "Email Capture",
      content: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full max-w-2xl px-8">
            <EmailCapture
              onSubmit={() => {}}
              imageUrl={widgetConfig.captureImageUrl}
              title={widgetConfig.captureTitle}
              subtitle={widgetConfig.captureSubtitle}
              buttonText={widgetConfig.captureButtonText}
              privacyText={widgetConfig.capturePrivacyText}
              primaryColor={widgetConfig.handleBackgroundColor}
              format={widgetConfig.captureFormat || 'instant'}
              backgroundColor='#FFFFFF'
              emailPlaceholder='Enter your email'
              titleColor='#111827'
              playerCount='2,847 people played today'
              popularPrize='25% OFF Everything!'
              autoFocus={true}
              showConsent={true}
            />
          </div>
        </div>
      ),
    },
    {
      id: "celebration",
      title: "Win Celebration",
      content: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-3xl font-bold text-gray-800 mb-4">
              Congratulations!
            </h4>
            <p className="text-xl text-gray-600 mb-6">
              You won: {segments[0]?.label || "25% OFF"}
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 shadow-inner mb-6">
              <p className="text-base text-gray-500 mb-2">Your discount code:</p>
              <p className="text-3xl font-mono font-bold text-purple-600">
                {segments[0]?.value || "SAVE25"}
              </p>
            </div>
            <button className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity">
              Copy Code & Continue Shopping
            </button>
          </div>
        </div>
      ),
    },
  ];

  // Sync carousel with active config section
  useEffect(() => {
    if (activeConfigSection === 'capture') {
      setCurrentSlide(1); // Email capture slide
    } else if (activeConfigSection === 'segments' || activeConfigSection === 'appearance' || 
               activeConfigSection === 'handle' || activeConfigSection === 'embed' || 
               activeConfigSection === 'schedule') {
      setCurrentSlide(0); // Wheel slide
    }
  }, [activeConfigSection]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };


  return (
    <div className="h-full w-full relative">
      {/* Slide Title */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm font-medium text-gray-700">
            {slides[currentSlide].title}
          </p>
        </div>
      </div>

      {/* Carousel Container - Uses all available space */}
      <div
        className="absolute top-0 bottom-10 left-0 right-0 overflow-hidden flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full select-none"
            drag={false}
          >
            {slides[currentSlide].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Fixed Dots Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-10 flex justify-center items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-purple-600"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
