import type { Database } from './database.types';

// Type aliases for easier use
export type Store = Database['spinawheel']['Tables']['stores']['Row'];
export type Wheel = Database['spinawheel']['Tables']['wheels']['Row'];
export type Campaign = Database['spinawheel']['Tables']['campaigns']['Row'];
export type Segment = Database['spinawheel']['Tables']['segments']['Row'];
export type Spin = Database['spinawheel']['Tables']['spins']['Row'];
export type EmailCapture = Database['spinawheel']['Tables']['email_captures']['Row'];
export type Integration = Database['spinawheel']['Tables']['integrations']['Row'];

// Input types for creating/updating
export type StoreInput = Database['spinawheel']['Tables']['stores']['Insert'];
export type WheelInput = Database['spinawheel']['Tables']['wheels']['Insert'];
export type CampaignInput = Database['spinawheel']['Tables']['campaigns']['Insert'];
export type SegmentInput = Database['spinawheel']['Tables']['segments']['Insert'];
export type SpinInput = Database['spinawheel']['Tables']['spins']['Insert'];
export type EmailCaptureInput = Database['spinawheel']['Tables']['email_captures']['Insert'];
export type IntegrationInput = Database['spinawheel']['Tables']['integrations']['Insert'];

// Extended types with relations
export interface StoreWithWheels extends Store {
  wheels?: Wheel[];
}

export interface WheelWithSegments extends Wheel {
  segments?: Segment[];
  campaigns?: Campaign[];
}

export interface CampaignWithStats extends Campaign {
  total_spins?: number;
  unique_participants?: number;
  conversion_rate?: number;
}

export interface SpinWithDetails extends Spin {
  segment?: Segment;
  email_capture?: EmailCapture;
}

// Configuration types
export interface WheelConfiguration {
  segments: SegmentConfig[];
  spinDuration: number;
  spinRevolutions: number;
  friction: number;
  easeType: 'power4.out' | 'elastic.out' | 'back.out';
  brandLogo?: string;
  appearance: WheelAppearanceConfig;
  messages: WheelMessagesConfig;
  schedule?: WheelScheduleConfig;
}

export interface SegmentConfig {
  id: string;
  label: string;
  value: string;
  color: string;
  textColor?: string;
  weight: number;
  prizeType: 'discount' | 'product' | 'custom' | 'no_prize';
  prizeData?: PrizeData;
}

export interface PrizeData {
  discountPercentage?: number;
  discountCode?: string;
  productName?: string;
  productSku?: string;
  customMessage?: string;
}

export interface WheelAppearanceConfig {
  showConfetti: boolean;
  soundEnabled: boolean;
  pointerStyle: 'arrow' | 'triangle' | 'star';
  wheelSize: number;
  fontSize: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor?: string;
  shadow?: string;
}

export interface WheelMessagesConfig {
  title: string;
  subtitle: string;
  spinButton: string;
  emailModalTitle: string;
  emailModalDescription: string;
  emailPlaceholder: string;
  emailSubmitButton: string;
  tryAgainButton: string;
  winMessage: string;
  promoCodeLabel: string;
  copyButtonText: string;
  copiedText: string;
}

// Scheduling configuration
export interface WheelScheduleConfig {
  enabled: boolean;
  timezone: string;
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
  timeSlots?: {
    enabled: boolean;
    slots: TimeSlot[];
  };
  weekDays?: {
    enabled: boolean;
    days: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
  specialDates?: {
    blacklistDates: string[]; // Dates to exclude (YYYY-MM-DD)
    whitelistDates: string[]; // Dates to include regardless of other rules
  };
}

export interface TimeSlot {
  startMinutes: number; // Minutes from midnight (0-1439)
  endMinutes: number;
  label?: string;
}

export interface ScheduleTemplate {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  schedule_config: WheelScheduleConfig;
  created_at: string;
  updated_at: string;
}

// Widget configuration
export interface WidgetConfig {
  wheelId: string;
  trigger: 'immediate' | 'exit_intent' | 'scroll' | 'time_delay' | 'click';
  triggerConfig?: {
    scrollPercentage?: number;
    timeDelay?: number;
    clickSelector?: string;
  };
  position: 'center' | 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
  mobilePosition?: 'center' | 'bottom' | 'top';
}

// Analytics types
export interface WheelAnalytics {
  wheelId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  totalSpins: number;
  uniqueParticipants: number;
  emailsCaptured: number;
  conversionRate: number;
  prizeDistribution: {
    segmentId: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  dailyStats: {
    date: string;
    spins: number;
    participants: number;
  }[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}