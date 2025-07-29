// Campaign and Scheduling Types

export interface Campaign {
  id: string;
  storeId: string;
  wheelId: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number; // Higher priority campaigns show first
  
  // Scheduling
  startDate: string;
  endDate: string;
  schedule?: CampaignSchedule;
  
  // Targeting
  targeting?: CampaignTargeting;
  
  // Performance
  impressions?: number;
  spins?: number;
  conversions?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSchedule {
  // Time-based scheduling
  timezone?: string;
  daysOfWeek?: number[]; // 0-6 (Sunday to Saturday)
  hoursOfDay?: {
    start: number; // 0-23
    end: number;   // 0-23
  };
  
  // Special scheduling
  showOnHolidays?: boolean;
  blackoutDates?: string[]; // Dates to exclude
  
  // Frequency
  showFrequency?: 'always' | 'once_per_session' | 'once_per_day' | 'once_per_week';
  cooldownHours?: number; // Hours before showing again to same user
}

export interface CampaignTargeting {
  // Page targeting
  pages?: PageTargeting;
  
  // Device targeting
  devices?: DeviceTargeting;
  
  // User targeting
  audience?: AudienceTargeting;
  
  // Geographic targeting
  geo?: GeoTargeting;
  
  // Traffic source
  trafficSource?: TrafficSourceTargeting;
}

export interface PageTargeting {
  includeUrls?: string[]; // URL patterns to include
  excludeUrls?: string[]; // URL patterns to exclude
  includePages?: PageType[];
  excludePages?: PageType[];
}

export type PageType = 
  | 'home'
  | 'product'
  | 'category'
  | 'cart'
  | 'checkout'
  | 'search'
  | 'blog'
  | 'other';

export interface DeviceTargeting {
  includeDevices?: DeviceType[];
  excludeDevices?: DeviceType[];
  includeBrowsers?: string[];
  excludeBrowsers?: string[];
  includeOS?: string[];
  excludeOS?: string[];
}

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface AudienceTargeting {
  visitorType?: 'all' | 'new' | 'returning';
  hasOrderedBefore?: boolean;
  cartValue?: {
    min?: number;
    max?: number;
  };
  itemsInCart?: {
    min?: number;
    max?: number;
  };
  customerTags?: string[];
  language?: string[];
}

export interface GeoTargeting {
  includeCountries?: string[]; // ISO country codes
  excludeCountries?: string[];
  includeRegions?: string[];
  excludeRegions?: string[];
  includeCities?: string[];
  excludeCities?: string[];
}

export interface TrafficSourceTargeting {
  includeReferrers?: string[]; // Domain patterns
  excludeReferrers?: string[];
  includeUtmSources?: string[];
  excludeUtmSources?: string[];
  includeUtmMediums?: string[];
  excludeUtmMediums?: string[];
  includeUtmCampaigns?: string[];
  excludeUtmCampaigns?: string[];
}

// Context for evaluating campaigns
export interface WidgetContext {
  storeId: string;
  url: string;
  referrer: string;
  userAgent: string;
  language: string;
  isMobile: boolean;
  timestamp: string;
  
  // Additional context from the page
  pageType?: PageType;
  cartValue?: number;
  itemsInCart?: number;
  isLoggedIn?: boolean;
  customerTags?: string[];
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

// Campaign evaluation result
export interface CampaignEvaluationResult {
  eligible: boolean;
  campaign?: Campaign;
  reason?: string; // Why campaign was selected or rejected
}