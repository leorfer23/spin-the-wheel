// @ts-nocheck
// This file is only used in browser context via dynamic imports
import { supabase } from '../lib/supabase';

interface WidgetEvent {
  wheelId: string;
  storeId: string;
  sessionId: string;
  eventType: string;
  eventData?: Record<string, any>;
}

interface ImpressionData {
  wheelId: string;
  storeId: string;
  sessionId: string;
  triggerType: string;
  pageUrl?: string;
  referrerUrl?: string;
  platform?: string;
  deviceType?: string;
  browser?: string;
  userAgent?: string;
}

interface SpinData {
  wheelId: string;
  storeId: string;
  sessionId: string;
  impressionId?: string;
  segmentId: string;
  prizeData: any;
  spinDuration?: number;
  isMobile?: boolean;
  deviceType?: string;
}

interface EmailCaptureData {
  spinId?: string;
  impressionId?: string;
  email: string;
  marketingConsent?: boolean;
  capturedAtStep?: 'before_spin' | 'after_spin' | 'with_prize';
  additionalFields?: Record<string, any>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

class WidgetAnalyticsService {
  private impressionCache: Map<string, string> = new Map();

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDeviceType(): string {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  getBrowserInfo(): { browser: string; userAgent: string } {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let browser = 'unknown';
    
    if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      browser = 'Safari';
    } else if (userAgent.indexOf('Edge') > -1) {
      browser = 'Edge';
    }
    
    return { browser, userAgent };
  }

  getUTMParams(): Record<string, string> {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || ''
    };
  }

  async trackImpression(data: ImpressionData): Promise<string | null> {
    try {
      const { browser, userAgent } = this.getBrowserInfo();
      const deviceType = this.getDeviceType();
      
      // Truncate fields to match database constraints
      const browserValue = browser.substring(0, 100);
      const sessionIdValue = (data.sessionId || '').substring(0, 255);
      const triggerTypeValue = (data.triggerType || '').substring(0, 50);
      const platformValue = (data.platform || 'generic').substring(0, 50);
      const deviceTypeValue = deviceType.substring(0, 50);
      
      const { data: impression, error } = await supabase
        .from('widget_impressions')
        .insert({
          wheel_id: data.wheelId,
          tiendanube_store_id: data.storeId,  // Changed from store_id to tiendanube_store_id
          session_id: sessionIdValue,
          trigger_type: triggerTypeValue,
          page_url: data.pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
          referrer_url: data.referrerUrl || (typeof document !== 'undefined' ? document.referrer : ''),
          platform: platformValue,
          device_type: deviceTypeValue,
          browser: browserValue,
          user_agent: userAgent,
          widget_shown: true
        })
        .select('id')
        .single();

      if (error) {
        console.error('[WidgetAnalytics] Failed to track impression:', error);
        return null;
      }

      const impressionId = impression?.id;
      if (impressionId) {
        this.impressionCache.set(data.sessionId, impressionId);
      }
      
      return impressionId;
    } catch (error) {
      console.error('[WidgetAnalytics] Error tracking impression:', error);
      return null;
    }
  }

  async trackEvent(event: WidgetEvent): Promise<void> {
    try {
      const impressionId = this.impressionCache.get(event.sessionId);
      
      if (!impressionId && event.eventType !== 'widget_view') {
        console.warn('[WidgetAnalytics] No impression found for session:', event.sessionId);
        return;
      }

      const { error } = await supabase
        .from('widget_interactions')
        .insert({
          impression_id: impressionId,
          wheel_id: event.wheelId,
          session_id: event.sessionId,
          event_type: event.eventType,
          event_data: event.eventData || {}
        });

      if (error) {
        console.error('[WidgetAnalytics] Failed to track event:', error);
      }
    } catch (error) {
      console.error('[WidgetAnalytics] Error tracking event:', error);
    }
  }

  async trackSpin(data: SpinData): Promise<string | null> {
    try {
      const impressionId = data.impressionId || this.impressionCache.get(data.sessionId);
      const deviceType = this.getDeviceType();
      
      const { data: spin, error } = await supabase
        .from('spins')
        .insert({
          campaign_id: null, // Will need to handle this properly
          wheel_id: data.wheelId,
          email: '', // Will be updated when email is captured
          segment_won_id: data.segmentId,
          spin_result: data.prizeData,
          impression_id: impressionId,
          spin_duration: data.spinDuration,
          is_mobile: deviceType === 'mobile',
          device_type: deviceType
        })
        .select('id')
        .single();

      if (error) {
        console.error('[WidgetAnalytics] Failed to track spin:', error);
        return null;
      }

      await this.trackEvent({
        wheelId: data.wheelId,
        storeId: data.storeId,
        sessionId: data.sessionId,
        eventType: 'spin_complete',
        eventData: {
          segmentId: data.segmentId,
          prize: data.prizeData
        }
      });

      return spin?.id;
    } catch (error) {
      console.error('[WidgetAnalytics] Error tracking spin:', error);
      return null;
    }
  }

  async trackEmailCapture(data: EmailCaptureData): Promise<void> {
    try {
      const utmParams = this.getUTMParams();
      
      console.log('[WidgetAnalytics] Attempting to track email capture:', {
        email: data.email,
        impressionId: data.impressionId,
        capturedAtStep: data.capturedAtStep,
        additionalFields: data.additionalFields
      });
      
      const { data: insertResult, error } = await supabase
        .from('email_captures')
        .insert({
          email: data.email,
          marketing_consent: data.marketingConsent || false,
          impression_id: data.impressionId,
          captured_at_step: data.capturedAtStep,
          additional_fields: data.additionalFields,
          utm_source: data.utmSource || utmParams.utm_source,
          utm_medium: data.utmMedium || utmParams.utm_medium,
          utm_campaign: data.utmCampaign || utmParams.utm_campaign
        })
        .select()
        .single();

      if (error) {
        console.error('[WidgetAnalytics] Failed to track email capture:', error);
        console.error('[WidgetAnalytics] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        });
        throw error;
      } else {
        console.log('[WidgetAnalytics] Email capture tracked successfully:', insertResult);
      }

      // Also track as an event
      await this.trackEvent({
        wheelId: '',
        storeId: '',
        sessionId: '',
        eventType: 'email_captured',
        eventData: {
          capturedAtStep: data.capturedAtStep,
          hasMarketingConsent: data.marketingConsent
        }
      });
    } catch (error) {
      console.error('[WidgetAnalytics] Error tracking email capture:', error);
    }
  }

  async updateImpressionTime(sessionId: string, timeOnWidget: number): Promise<void> {
    try {
      const impressionId = this.impressionCache.get(sessionId);
      if (!impressionId) return;

      const { error } = await supabase
        .from('widget_impressions')
        .update({ time_on_widget: Math.round(timeOnWidget / 1000) })
        .eq('id', impressionId);

      if (error) {
        console.error('[WidgetAnalytics] Failed to update impression time:', error);
      }
    } catch (error) {
      console.error('[WidgetAnalytics] Error updating impression time:', error);
    }
  }

  async trackWidgetClose(sessionId: string): Promise<void> {
    try {
      const impressionId = this.impressionCache.get(sessionId);
      if (!impressionId) return;

      const { error } = await supabase
        .from('widget_impressions')
        .update({ widget_closed_at: new Date().toISOString() })
        .eq('id', impressionId);

      if (error) {
        console.error('[WidgetAnalytics] Failed to track widget close:', error);
      }
    } catch (error) {
      console.error('[WidgetAnalytics] Error tracking widget close:', error);
    }
  }

  async getAnalytics(wheelId: string, startDate?: Date, endDate?: Date) {
    try {
      const { data, error } = await supabase
        .rpc('get_widget_analytics', {
          p_wheel_id: wheelId,
          p_start_date: startDate?.toISOString().split('T')[0],
          p_end_date: endDate?.toISOString().split('T')[0]
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[WidgetAnalytics] Failed to get analytics:', error);
      return null;
    }
  }
}

export const widgetAnalytics = new WidgetAnalyticsService();