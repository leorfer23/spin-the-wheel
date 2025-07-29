import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

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
   * Get analytics overview for a wheel within a date range
   */
  async getWheelAnalytics(
    wheelId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<{
    overview: AnalyticsOverview;
    timeSeries: TimeSeriesData[];
  }> {
    // Use the function we created in the migration
    const { data, error } = await supabase.rpc('get_wheel_analytics', {
      p_wheel_id: wheelId,
      p_start_date: format(startDate, 'yyyy-MM-dd'),
      p_end_date: format(endDate, 'yyyy-MM-dd')
    });

    if (error) throw error;

    // Calculate overview from time series
    const timeSeries = (data || []).map((day: any) => ({
      date: day.date,
      totalSpins: Number(day.total_spins),
      uniqueVisitors: Number(day.unique_visitors),
      emailsCaptured: Number(day.emails_captured),
      conversionRate: Number(day.conversion_rate)
    }));

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
   * Get email captures for a wheel
   */
  async getEmailCaptures(wheelId: string): Promise<EmailCapture[]> {
    const { data, error } = await supabase
      .from('email_captures')
      .select(`
        id,
        email,
        marketing_consent,
        created_at,
        spins!inner(
          id,
          segment_won_id,
          campaigns!inner(
            wheel_id
          ),
          segments!inner(
            label,
            value,
            prize_type
          )
        )
      `)
      .eq('spins.campaigns.wheel_id', wheelId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Process and aggregate by email
    const emailMap = new Map<string, EmailCapture>();
    
    data?.forEach(capture => {
      const email = capture.email;
      
      if (!emailMap.has(email)) {
        emailMap.set(email, {
          id: capture.id,
          email: email,
          capturedAt: capture.created_at,
          marketingConsent: capture.marketing_consent,
          prizesWon: [],
          totalSpins: 0
        });
      }
      
      const entry = emailMap.get(email)!;
      entry.totalSpins++;
      
      // Add prize if it's not a "no prize" segment
      const segment = (capture.spins as any)?.segments;
      if (segment && segment.prize_type !== 'no_prize') {
        entry.prizesWon.push(segment.label);
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
    // Get spins from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('spins')
      .select(`
        email,
        created_at,
        segments!inner(label),
        campaigns!inner(wheel_id)
      `)
      .eq('campaigns.wheel_id', wheelId)
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const recentSpins = (data || []).map(spin => ({
      email: spin.email,
      prize: (spin.segments as any).label,
      timestamp: spin.created_at
    }));

    // Count unique emails in last 5 minutes as active sessions
    const activeSessions = new Set(recentSpins.map(s => s.email)).size;

    return { activeSessions, recentSpins };
  }
};