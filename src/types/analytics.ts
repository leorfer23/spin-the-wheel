export interface WheelDailyAnalytics {
  wheel_id: string;
  wheel_name: string;
  store_id: string;
  date: string;
  
  // Impression metrics
  total_impressions: number;
  unique_sessions: number;
  unique_visitors: number;
  
  // Interaction metrics
  widget_loads: number;
  wheel_views: number;
  wheel_opens: number;
  spin_starts: number;
  spin_completes: number;
  prizes_claimed: number;
  widget_closes: number;
  
  // Email metrics
  emails_captured: number;
  unique_emails: number;
  
  // Spin metrics
  total_spins: number;
  winning_spins: number;
  losing_spins: number;
  
  // Conversion rates
  open_rate: number;
  email_capture_rate: number;
  spin_rate: number;
  
  // Device breakdown
  mobile_impressions: number;
  desktop_impressions: number;
  tablet_impressions: number;
  
  // Timestamps
  first_impression_at: string;
  last_impression_at: string;
}

export interface EmailAnalytics {
  capture_id: string;
  email: string;
  captured_at: string;
  wheel_id: string;
  wheel_name: string;
  store_id: string;
  store_name: string | null;
  
  // Impression details
  impression_id: string;
  session_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: 'mobile' | 'desktop' | 'tablet' | null;
  referrer_url: string | null;
  page_url: string | null;
  
  // Spin details
  spin_id: string | null;
  is_winner: boolean | null;
  segment_id: string | null;
  segment_name: string | null;
  prize_value: string | null;
  prize_type: string | null;
  spin_at: string | null;
  
  // Interaction events
  interaction_events: Array<{
    event_type: string;
    created_at: string;
  }> | null;
  
  // Engagement score
  engagement_score: number;
}

export interface WheelHourlyAnalytics {
  wheel_id: string;
  wheel_name: string;
  hour: string;
  impressions: number;
  sessions: number;
  emails_captured: number;
  spins: number;
  wins: number;
}

export interface SegmentPerformance {
  wheel_id: string;
  wheel_name: string;
  segment_id: string;
  segment_name: string;
  segment_value: string;
  probability: number;
  segment_type: string;
  total_spins: number;
  times_won: number;
  win_rate: number;
  last_won_at: string | null;
}

export interface AnalyticsDateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface AnalyticsSummary {
  totalImpressions: number;
  uniqueVisitors: number;
  emailsCaptured: number;
  totalSpins: number;
  conversionRate: number;
  openRate: number;
  emailCaptureRate: number;
  spinRate: number;
  averageEngagement: number;
}

export interface ChartDataPoint {
  date: string;
  impressions: number;
  emails: number;
  spins: number;
  conversions: number;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface SegmentAnalytics {
  id: string;
  name: string;
  value: string;
  probability: number;
  timesWon: number;
  winRate: number;
  lastWonAt: string | null;
}

export interface RealtimeMetrics {
  currentActiveUsers: number;
  lastHourImpressions: number;
  lastHourEmails: number;
  lastHourSpins: number;
  recentEvents: Array<{
    type: string;
    timestamp: string;
    email?: string;
    prize?: string;
  }>;
}