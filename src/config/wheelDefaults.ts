/**
 * Centralized default configurations for all wheel-related settings
 * This ensures consistency across the application and complete data in the database
 */

import type { Segment } from '../components/dashboard/products/wheel/types';
import type { WheelScheduleConfig } from '../types/models';

// Extended Segment type with UI properties for default configurations
interface ExtendedSegment extends Segment {
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  icon?: string | null;
  image?: string | null;
  description?: string | null;
  terms?: string | null;
  isJackpot?: boolean;
  soundEffect?: string | null;
}

// Extended schedule config with additional properties
interface ExtendedScheduleConfig extends WheelScheduleConfig {
  scheduleType?: string;
  startDate?: string | null;
  endDate?: string | null;
  recurringDays?: number[];
  recurringStartTime?: string | null;
  recurringEndTime?: string | null;
  specificDates?: string[];
  timeWindows?: any[];
  maxSpinsPerUser?: number;
  maxSpinsPerDay?: number | null;
  maxSpinsTotal?: number | null;
  resetFrequency?: string;
  blackoutDates?: string[];
  blackoutMessage?: string;
  disableOnHolidays?: boolean;
  holidayCountry?: string;
  requireLogin?: boolean;
  requireMinimumCart?: boolean;
  minimumCartValue?: number;
  onlyNewCustomers?: boolean;
  onlyReturningCustomers?: boolean;
  prizeExpirationDays?: number;
  showCountdown?: boolean;
  countdownMessage?: string;
  [key: string]: any; // Allow additional properties
}

// ============================================
// WHEEL DESIGN/STYLE CONFIGURATION
// ============================================
export const DEFAULT_WHEEL_DESIGN = {
  // Theme
  designTheme: 'modern',
  
  // Background
  backgroundStyle: 'solid',
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#8B5CF6',
  backgroundGradientTo: '#EC4899',
  backgroundImage: null,
  backgroundOpacity: 1,
  
  // Wheel specific background
  wheelBackgroundColor: null,
  wheelBackgroundGradientFrom: null,
  wheelBackgroundGradientTo: null,
  wheelBorderStyle: 'solid',
  wheelBorderColor: '#8B5CF6',
  wheelBorderWidth: 4,
  wheelBorderGradientFrom: null,
  wheelBorderGradientTo: null,
  
  // Shadow
  shadowColor: '#8B5CF6',
  shadowIntensity: 0.3,
  shadowBlur: 30,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  innerShadowEnabled: false,
  innerShadowColor: '#000000',
  
  // Pegs
  pegStyle: 'dots',
  pegColor: '#FFD700',
  pegSize: 10,
  pegGlowEnabled: false,
  pegGlowColor: '#FFD700',
  
  // Center Button
  centerButtonText: 'GIRAR',
  centerButtonTextSize: 'medium',
  centerButtonBackgroundColor: '#8B5CF6',
  centerButtonTextColor: '#FFFFFF',
  centerButtonLogo: null,
  centerButtonBorderColor: null,
  centerButtonBorderWidth: 0,
  centerButtonGlowEnabled: false,
  centerButtonGlowColor: '#8B5CF6',
  centerButtonFont: 'default',
  centerButtonFontWeight: 'bold',
  
  // Pointer
  pointerStyle: 'triangle',
  pointerColor: '#FF1744',
  pointerSize: 60,
  pointerGlowEnabled: false,
  pointerGlowColor: '#FF1744',
  
  // Effects
  spinningEffect: 'smooth',
  spinDuration: 5,
  rotations: 5,
  soundEnabled: false,
  confettiEnabled: true,
  glowEffect: true,
  sparkleEffect: false,
  pulseEffect: false,
  
  // Segment styling
  segmentBorderEnabled: false,
  segmentBorderColor: '#ffffff',
  segmentBorderWidth: 2,
  segmentSeparatorEnabled: false,
  segmentSeparatorColor: '#e5e7eb',
  segmentTextFont: 'default',
  segmentTextBold: false,
  segmentTextShadow: false,
};

// ============================================
// WIDGET HANDLE CONFIGURATION
// ============================================
export const DEFAULT_WIDGET_HANDLE_CONFIG = {
  // Handle Position & Type
  handlePosition: 'right',
  handleType: 'floating',
  
  // Handle Appearance
  handleText: '¡Gana Premios!',
  handleBackgroundColor: '#8B5CF6',
  handleTextColor: '#FFFFFF',
  handleIcon: '🎁',
  handleSize: 'medium',
  handleAnimation: 'pulse',
  handleBorderRadius: '9999px',
  handleBorderColor: null,
  handleBorderWidth: 0,
  handleShadow: true,
  handleShadowColor: '#000000',
  handleShadowBlur: 10,
  handleShadowOpacity: 0.2,
  
  // Handle Behavior
  handleShowOnMobile: true,
  handleShowOnDesktop: true,
  handleDelay: 0,
  handleTrigger: 'load',
  handleFrequency: 'always',
  handleZIndex: 9999,
  
  // Handle Custom CSS
  handleCustomCSS: null,
  handleFontFamily: 'default',
  handleFontWeight: 'bold',
  handleLetterSpacing: 'normal',
};

// ============================================
// EMAIL CAPTURE CONFIGURATION
// ============================================
export const DEFAULT_EMAIL_CAPTURE_CONFIG = {
  // Capture Content
  captureImageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
  captureTitle: '¡Gira y Gana Premios Increíbles!',
  captureSubtitle: 'Ingresa tu email para participar y ganar descuentos exclusivos',
  captureButtonText: '¡Quiero Participar!',
  capturePrivacyText: 'Al participar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.',
  captureFormat: 'instant',
  
  // Form Configuration
  emailPlaceholder: 'tu@email.com',
  emailRequired: true,
  emailValidation: true,
  collectName: false,
  namePlaceholder: 'Tu nombre',
  collectPhone: false,
  phonePlaceholder: 'Tu teléfono',
  
  // Appearance
  captureBackgroundColor: '#FFFFFF',
  capturePrimaryColor: '#8B5CF6',
  captureTextColor: '#111827',
  captureButtonStyle: 'filled',
  captureBorderRadius: 'rounded',
  captureImagePosition: 'top',
  captureImageHeight: 200,
  
  // Consent & Legal
  showConsent: true,
  consentText: 'Acepto recibir comunicaciones promocionales',
  consentRequired: true,
  showTerms: false,
  termsUrl: null,
  termsText: 'Términos y condiciones',
  
  // Social Proof
  showPlayerCount: true,
  playerCount: '2,847 personas jugaron hoy',
  showPopularPrize: true,
  popularPrize: '25% de descuento',
  showTrustBadges: false,
  trustBadges: [],
  
  // Success Configuration
  successTitle: '¡Registro exitoso!',
  successMessage: 'Ahora gira la ruleta para ganar tu premio',
  successButtonText: 'Girar ahora',
};

// ============================================
// SEGMENTS CONFIGURATION
// ============================================
export const DEFAULT_SEGMENTS: ExtendedSegment[] = [
  { 
    id: '1', 
    label: '10% Descuento', 
    value: 'DESC10', 
    color: '#FF6B6B', 
    weight: 30,
    textColor: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'normal',
    icon: null,
    image: null,
    description: null,
    terms: null,
    isJackpot: false,
    soundEffect: null,
  },
  { 
    id: '2', 
    label: '20% Descuento', 
    value: 'DESC20', 
    color: '#4ECDC4', 
    weight: 20,
    textColor: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'normal',
    icon: null,
    image: null,
    description: null,
    terms: null,
    isJackpot: false,
    soundEffect: null,
  },
  { 
    id: '3', 
    label: 'Envío Gratis', 
    value: 'ENVIOGRATIS', 
    color: '#FFE66D', 
    weight: 25,
    textColor: '#333333',
    fontSize: 14,
    fontWeight: 'normal',
    icon: null,
    image: null,
    description: null,
    terms: null,
    isJackpot: false,
    soundEffect: null,
  },
  { 
    id: '4', 
    label: '2x1', 
    value: '2X1', 
    color: '#A8E6CF', 
    weight: 15,
    textColor: '#333333',
    fontSize: 14,
    fontWeight: 'normal',
    icon: null,
    image: null,
    description: null,
    terms: null,
    isJackpot: false,
    soundEffect: null,
  },
  { 
    id: '5', 
    label: '50% Descuento', 
    value: 'DESC50', 
    color: '#C7B3FF', 
    weight: 10,
    textColor: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    icon: '⭐',
    image: null,
    description: null,
    terms: null,
    isJackpot: true,
    soundEffect: null,
  },
];

// Simplified version for quick setup
export const DEFAULT_SEGMENTS_SIMPLE: ExtendedSegment[] = [
  { id: '1', label: 'Premio 1', value: 'PREMIO1', color: '#FF6B6B', weight: 20 },
  { id: '2', label: 'Premio 2', value: 'PREMIO2', color: '#4ECDC4', weight: 20 },
  { id: '3', label: 'Premio 3', value: 'PREMIO3', color: '#FFE66D', weight: 20 },
  { id: '4', label: 'Premio 4', value: 'PREMIO4', color: '#A8E6CF', weight: 20 },
  { id: '5', label: 'Premio 5', value: 'PREMIO5', color: '#C7B3FF', weight: 20 },
];

// ============================================
// SCHEDULE CONFIGURATION
// ============================================
export const DEFAULT_SCHEDULE_CONFIG: ExtendedScheduleConfig = {
  enabled: false,
  timezone: 'America/Argentina/Buenos_Aires',
  
  // Schedule Type
  scheduleType: 'always', // 'always', 'dateRange', 'recurring', 'specific'
  
  // Date Range (when scheduleType is 'dateRange')
  startDate: null,
  endDate: null,
  
  // Recurring Schedule (when scheduleType is 'recurring')
  recurringDays: [], // [0,1,2,3,4,5,6] where 0=Sunday
  recurringStartTime: null, // "09:00"
  recurringEndTime: null, // "18:00"
  
  // Specific Dates (when scheduleType is 'specific')
  specificDates: [],
  
  // Time Windows
  timeWindows: [],
  
  // Availability Rules
  maxSpinsPerUser: undefined,
  maxSpinsPerDay: null,
  maxSpinsTotal: null,
  resetFrequency: 'never', // 'daily', 'weekly', 'monthly', 'never'
  
  // Blackout Periods
  blackoutDates: [],
  blackoutMessage: 'La ruleta no está disponible en este momento',
  
  // Holiday Settings
  disableOnHolidays: false,
  holidayCountry: 'AR',
  
  // Advanced Settings
  requireLogin: false,
  requireMinimumCart: false,
  minimumCartValue: 0,
  onlyNewCustomers: false,
  onlyReturningCustomers: false,
  
  // Expiration
  prizeExpirationDays: 30,
  showCountdown: false,
  countdownMessage: 'La ruleta termina en',
  
  // Notifications
  sendReminderEmail: false,
  reminderEmailDays: 3,
  sendExpirationWarning: false,
  expirationWarningDays: 7,
};

// ============================================
// COMPLETE WHEEL CONFIGURATION
// ============================================
export interface CompleteWheelConfig {
  segments: Segment[];
  style: typeof DEFAULT_WHEEL_DESIGN;
  widgetHandle: typeof DEFAULT_WIDGET_HANDLE_CONFIG;
  emailCapture: typeof DEFAULT_EMAIL_CAPTURE_CONFIG;
  schedule: WheelScheduleConfig;
}

export const DEFAULT_WHEEL_CONFIG: CompleteWheelConfig = {
  segments: DEFAULT_SEGMENTS,
  style: DEFAULT_WHEEL_DESIGN,
  widgetHandle: DEFAULT_WIDGET_HANDLE_CONFIG,
  emailCapture: DEFAULT_EMAIL_CAPTURE_CONFIG,
  schedule: DEFAULT_SCHEDULE_CONFIG,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Merges partial config with defaults to ensure complete object
 */
export function mergeWithDefaults<T extends Record<string, any>>(
  defaults: T,
  partial?: Partial<T>
): T {
  return {
    ...defaults,
    ...partial
  } as T;
}

/**
 * Creates a complete wheel config from partial data
 */
export function createCompleteWheelConfig(partial?: Partial<CompleteWheelConfig>): CompleteWheelConfig {
  return {
    segments: partial?.segments || DEFAULT_SEGMENTS,
    style: mergeWithDefaults(DEFAULT_WHEEL_DESIGN, partial?.style),
    widgetHandle: mergeWithDefaults(DEFAULT_WIDGET_HANDLE_CONFIG, partial?.widgetHandle),
    emailCapture: mergeWithDefaults(DEFAULT_EMAIL_CAPTURE_CONFIG, partial?.emailCapture),
    schedule: mergeWithDefaults(DEFAULT_SCHEDULE_CONFIG, partial?.schedule),
  };
}

/**
 * Validates that a config object has all required properties
 */
export function validateCompleteConfig(config: any): boolean {
  const hasAllStyleProps = Object.keys(DEFAULT_WHEEL_DESIGN).every(key => key in config.style);
  const hasAllHandleProps = Object.keys(DEFAULT_WIDGET_HANDLE_CONFIG).every(key => key in config.widgetHandle);
  const hasAllCaptureProps = Object.keys(DEFAULT_EMAIL_CAPTURE_CONFIG).every(key => key in config.emailCapture);
  const hasAllScheduleProps = Object.keys(DEFAULT_SCHEDULE_CONFIG).every(key => key in config.schedule);
  
  return hasAllStyleProps && hasAllHandleProps && hasAllCaptureProps && hasAllScheduleProps;
}