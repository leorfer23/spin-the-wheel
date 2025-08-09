import type { Segment } from "./types";
import type { WheelScheduleConfig } from "../../../../types/models";

export interface WheelDesignConfig {
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
}

export interface WidgetConfig {
  handlePosition: 'left' | 'right';
  handleType?: 'floating' | 'tab' | 'bubble';
  handleText: string;
  handleBackgroundColor: string;
  handleTextColor: string;
  handleIcon?: string;
  handleSize?: 'small' | 'medium' | 'large';
  handleAnimation?: 'none' | 'pulse' | 'bounce' | 'rotate';
  handleBorderRadius?: string;
  captureImageUrl: string;
  captureTitle: string;
  captureSubtitle: string;
  captureButtonText: string;
  capturePrivacyText: string;
  captureFormat?: 'instant' | 'minimal' | 'social';
  // Conversion optimization toggles
  showCountdownTimer?: boolean;
  countdownMinutes?: number;
  countdownText?: string;
  showLiveActivity?: boolean;
  liveActivityMin?: number;
  liveActivityMax?: number;
  liveActivityText?: string;
  showSocialProof?: boolean;
  socialProofText?: string;
  socialProofTimeAgo?: string;
  showTrustBadges?: boolean;
  trustBadge1?: string;
  trustBadge2?: string;
  trustBadge3?: string;
  showPrizeHighlight?: boolean;
  prizeHighlightText?: string;
  showMicroAnimations?: boolean;
  showGlowEffects?: boolean;
  showUrgencyMessage?: boolean;
  urgencyMessageText?: string;
}

export interface WheelConfigurationProps {
  segments: Segment[];
  onUpdateSegments: (segments: Segment[]) => void;
  wheelId: string;
  isUpdating?: boolean;
  widgetConfig?: WidgetConfig;
  onUpdateWidgetConfig?: (config: any) => void;
  wheelDesignConfig?: WheelDesignConfig;
  onUpdateWheelDesign?: (updates: Partial<WheelDesignConfig>) => void;
  onActiveSectionChange?: (section: string) => void;
  scheduleConfig?: WheelScheduleConfig;
  onUpdateScheduleConfig?: (config: WheelScheduleConfig) => void;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}