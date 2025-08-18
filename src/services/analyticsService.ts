import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import type { 
  WheelDailyAnalytics, 
  EmailAnalytics,
  AnalyticsSummary
} from '@/types/analytics';

export interface AnalyticsOverview {
  totalSpins: number;
  uniqueVisitors: number;
  emailsCaptured: number;
  conversionRate: number;
}

export interface TimeSeriesData {
  date: string;
  totalSpins: number;
  uniqueVisitors: number;
  emailsCaptured: number;
  conversionRate: number;
}

export interface SegmentPerformance {
  segmentId: string;
  label: string;
  value: string;
  timesWon: number;
  weight: number;
  winPercentage: number;
  expectedPercentage: number;
}

export interface EmailCapture {
  id: string;
  email: string;
  capturedAt: string;
  marketingConsent: boolean;
  prizesWon: string[];
  totalSpins: number;
}

/**
 * Service for fetching and processing analytics data
 */
export const analyticsService = {
  /**
   * Get analytics overview for a wheel within a date range using the new views
   */
  async getWheelAnalytics(
    wheelId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<{
    overview: AnalyticsOverview;
    timeSeries: TimeSeriesData[];
  }> {
    // Use the new wheel_daily_analytics view
    const { data, error } = await supabase
      .from('wheel_daily_analytics')
      .select('*')
      .eq('wheel_id', wheelId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (error) throw error;

    // Convert to time series format
    const timeSeries = (data || []).map((day: WheelDailyAnalytics) => ({
      date: day.date,
      totalSpins: day.total_spins,
      uniqueVisitors: day.unique_visitors,
      emailsCaptured: day.emails_captured,
      conversionRate: day.email_capture_rate
    }));

    // Calculate overview
    const overview = timeSeries.reduce((acc: AnalyticsOverview, day: TimeSeriesData) => ({
      totalSpins: acc.totalSpins + day.totalSpins,
      uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
      emailsCaptured: acc.emailsCaptured + day.emailsCaptured,
      conversionRate: 0
    }), {
      totalSpins: 0,
      uniqueVisitors: 0,
      emailsCaptured: 0,
      conversionRate: 0
    });

    // Calculate overall conversion rate
    overview.conversionRate = overview.uniqueVisitors > 0 
      ? (overview.emailsCaptured / overview.uniqueVisitors) * 100 
      : 0;

    return { overview, timeSeries };
  },

  /**
   * Get segment performance data
   */
  async getSegmentPerformance(wheelId: string): Promise<SegmentPerformance[]> {
    const { data, error } = await supabase
      .from('segment_performance')
      .select('*')
      .eq('wheel_id', wheelId);

    if (error) throw error;

    // Calculate expected percentages based on weights
    const totalWeight = data?.reduce((sum, seg) => sum + seg.weight, 0) || 1;

    return (data || []).map(seg => ({
      segmentId: seg.segment_id,
      label: seg.label,
      value: seg.value,
      timesWon: seg.times_won,
      weight: seg.weight,
      winPercentage: seg.win_percentage,
      expectedPercentage: (seg.weight / totalWeight) * 100
    }));
  },

  /**
   * Get email captures for a wheel using the new email_analytics view
   */
  async getEmailCaptures(wheelId: string): Promise<EmailCapture[]> {
    const { data, error } = await supabase
      .from('email_analytics')
      .select('*')
      .eq('wheel_id', wheelId)
      .order('captured_at', { ascending: false });

    if (error) throw error;

    // Process and aggregate by email
    const emailMap = new Map<string, EmailCapture>();
    
    (data as EmailAnalytics[])?.forEach(capture => {
      const email = capture.email;
      
      if (!emailMap.has(email)) {
        emailMap.set(email, {
          id: capture.capture_id,
          email: email,
          capturedAt: capture.captured_at,
          marketingConsent: true, // This field might need to be added to the view
          prizesWon: [],
          totalSpins: 0
        });
      }
      
      const entry = emailMap.get(email)!;
      
      // Count spins
      if (capture.spin_id) {
        entry.totalSpins++;
        
        // Add prize if won
        if (capture.is_winner && capture.segment_name) {
          entry.prizesWon.push(capture.segment_name);
        }
      }
    });

    return Array.from(emailMap.values());
  },

  /**
   * Export emails to CSV
   */
  exportEmailsToCSV(emails: EmailCapture[]): void {
    const headers = ['Email', 'Captured Date', 'Marketing Consent', 'Total Spins', 'Prizes Won'];
    const csvData = emails.map(email => [
      email.email,
      format(new Date(email.capturedAt), 'yyyy-MM-dd HH:mm:ss'),
      email.marketingConsent ? 'Yes' : 'No',
      email.totalSpins,
      email.prizesWon.join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `email_list_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Get real-time analytics for live updates
   */
  async getRealtimeStats(wheelId: string): Promise<{
    activeSessions: number;
    recentSpins: Array<{
      email: string;
      prize: string;
      timestamp: string;
    }>;
  }> {
    // Get hourly analytics for current hour
    await supabase
      .from('wheel_hourly_analytics')
      .select('*')
      .eq('wheel_id', wheelId)
      .order('hour', { ascending: false })
      .limit(1);

    // Get recent email captures with spin info
    const { data: recentActivity } = await supabase
      .from('email_analytics')
      .select('email, captured_at, segment_name, is_winner')
      .eq('wheel_id', wheelId)
      .order('captured_at', { ascending: false })
      .limit(10);

    const recentSpins = (recentActivity || [])
      .filter((activity: any) => activity.segment_name)
      .map((activity: any) => ({
        email: activity.email,
        prize: activity.segment_name || '',
        timestamp: activity.captured_at
      }));

    // Get active sessions from impressions in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const { count: activeSessions } = await supabase
      .from('widget_impressions')
      .select('*', { count: 'exact', head: true })
      .eq('wheel_id', wheelId)
      .gte('created_at', fiveMinutesAgo.toISOString());

    return { 
      activeSessions: activeSessions || 0, 
      recentSpins 
    };
  },

  /**
   * Get detailed analytics summary
   */
  async getAnalyticsSummary(
    wheelId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsSummary> {
    const { data } = await supabase
      .from('wheel_daily_analytics')
      .select('*')
      .eq('wheel_id', wheelId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'));

    const dailyData = data as WheelDailyAnalytics[] || [];
    
    const totals = dailyData.reduce((acc, day) => ({
      totalImpressions: acc.totalImpressions + day.total_impressions,
      uniqueVisitors: acc.uniqueVisitors + day.unique_visitors,
      emailsCaptured: acc.emailsCaptured + day.emails_captured,
      totalSpins: acc.totalSpins + day.total_spins,
      openRate: acc.openRate + day.open_rate,
      emailCaptureRate: acc.emailCaptureRate + day.email_capture_rate,
      spinRate: acc.spinRate + day.spin_rate,
    }), {
      totalImpressions: 0,
      uniqueVisitors: 0,
      emailsCaptured: 0,
      totalSpins: 0,
      openRate: 0,
      emailCaptureRate: 0,
      spinRate: 0,
    });

    const days = dailyData.length || 1;
    
    return {
      totalImpressions: totals.totalImpressions,
      uniqueVisitors: totals.uniqueVisitors,
      emailsCaptured: totals.emailsCaptured,
      totalSpins: totals.totalSpins,
      conversionRate: totals.totalImpressions > 0 
        ? (totals.emailsCaptured / totals.totalImpressions) * 100 
        : 0,
      openRate: totals.openRate / days,
      emailCaptureRate: totals.emailCaptureRate / days,
      spinRate: totals.spinRate / days,
      averageEngagement: totals.emailsCaptured > 0 
        ? (totals.totalSpins / totals.emailsCaptured) * 100 
        : 0,
    };
  }
};