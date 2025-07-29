// Widget Configuration Types

export interface WheelWidgetConfig {
  id: string;
  storeId: string;
  wheelData: WheelConfiguration;
  handleConfig: HandleConfiguration;
  emailCaptureConfig: EmailCaptureConfiguration;
  celebrationConfig: CelebrationConfiguration;
  settings: WidgetSettings;
}

export interface WheelConfiguration {
  id: string;
  name: string;
  segments: WheelSegment[];
  style: WheelStyle;
  physics: WheelPhysics;
}

export interface WheelSegment {
  id: string;
  label: string;
  value: string;
  color: string;
  textColor: string;
  probability: number;
  prizeType: 'discount' | 'freebie' | 'points' | 'no_prize' | 'custom';
  prizeValue?: string;
  discountCode?: string;
  description?: string;
}

export interface WheelStyle {
  size: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  centerCircleColor: string;
  centerCircleSize: number;
  pointerColor: string;
  pointerStyle: 'arrow' | 'triangle' | 'custom';
  fontFamily: string;
  fontSize: number;
}

export interface WheelPhysics {
  spinDuration: number;
  spinEasing: 'linear' | 'ease-out' | 'cubic-bezier';
  minSpins: number;
  maxSpins: number;
  slowdownRate: number;
}

export interface HandleConfiguration {
  type: 'button' | 'pull_tab' | 'auto_spin' | 'shake' | 'swipe';
  style: HandleStyle;
  text?: string;
  icon?: string;
  animation?: HandleAnimation;
}

export interface HandleStyle {
  position: 'center' | 'bottom' | 'right' | 'custom';
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  padding: string;
  fontSize: number;
  customCSS?: string;
}

export interface HandleAnimation {
  type: 'pulse' | 'bounce' | 'glow' | 'none';
  duration: number;
  delay: number;
}

export interface EmailCaptureConfiguration {
  enabled: boolean;
  required: boolean;
  timing: 'before_spin' | 'after_spin' | 'with_prize';
  formStyle: EmailFormStyle;
  fields: EmailFormField[];
  consentText?: string;
  privacyPolicyUrl?: string;
  successMessage?: string;
}

export interface EmailFormStyle {
  backgroundColor: string;
  textColor: string;
  inputBackgroundColor: string;
  inputBorderColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  borderRadius: number;
  fontFamily: string;
}

export interface EmailFormField {
  name: string;
  label: string;
  type: 'email' | 'text' | 'tel' | 'checkbox';
  required: boolean;
  placeholder?: string;
  validation?: string;
}

export interface CelebrationConfiguration {
  type: 'confetti' | 'fireworks' | 'balloons' | 'custom' | 'none';
  duration: number;
  message: CelebrationMessage;
  sound?: CelebrationSound;
  animation?: CelebrationAnimation;
}

export interface CelebrationMessage {
  winTitle: string;
  winDescription: string;
  loseTitle: string;
  loseDescription: string;
  claimButtonText: string;
  dismissButtonText: string;
  customHTML?: string;
}

export interface CelebrationSound {
  enabled: boolean;
  winSound?: string;
  loseSound?: string;
  volume: number;
}

export interface CelebrationAnimation {
  entranceEffect: 'fade' | 'slide' | 'scale' | 'bounce';
  exitEffect: 'fade' | 'slide' | 'scale';
  duration: number;
}

export interface WidgetSettings {
  trigger: 'immediate' | 'delay' | 'scroll' | 'exit_intent' | 'click' | 'onfirstinteraction';
  triggerDelay?: number;
  triggerScrollPercentage?: number;
  showOnlyOnce: boolean;
  sessionCooldown?: number;
  mobileEnabled: boolean;
  desktopEnabled: boolean;
  targetPages?: string[];
  excludePages?: string[];
  targetAudience?: AudienceTargeting;
}

export interface AudienceTargeting {
  newVisitorsOnly?: boolean;
  returningVisitorsOnly?: boolean;
  minCartValue?: number;
  maxCartValue?: number;
  specificProducts?: string[];
  specificCategories?: string[];
  geoTargeting?: GeoTargeting;
}

export interface GeoTargeting {
  countries?: string[];
  regions?: string[];
  cities?: string[];
}

// API Response Types
export interface WidgetAPIResponse {
  success: boolean;
  data?: WheelWidgetConfig;
  error?: string;
}

export interface SpinResult {
  wheelId: string;
  storeId: string;
  segmentId: string;
  prize: WheelSegment;
  timestamp: string;
  sessionId: string;
  platform: string;
}

export interface PrizeAcceptance {
  wheelId: string;
  storeId: string;
  prize: WheelSegment;
  email: string;
  additionalData?: Record<string, any>;
  timestamp: string;
  platform: string;
}