// Server-side version of widget analytics service
// Uses process.env for environment variables
import { createClient } from '@supabase/supabase-js';

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

class WidgetAnalyticsServiceServer {
  private supabase: any;
  private impressionCache: Map<string, string> = new Map();

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    // Use SERVICE_ROLE_KEY to bypass RLS for widget tracking
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.VITE_SERVICE_ROLE_KEY ||
                       process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[WidgetAnalyticsServer] Missing Supabase environment variables');
      this.supabase = null;
    } else {
      console.log('[WidgetAnalyticsServer] Initializing with service role key for RLS bypass');
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'spinawheel'
        }
      });
    }
  }

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDeviceType(): string {
    return 'desktop'; // Default for server-side
  }

  getBrowserInfo(): { browser: string; userAgent: string } {
    return { browser: 'unknown', userAgent: '' };
  }

  getUTMParams(): Record<string, string> {
    return {
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: ''
    };
  }

  async trackImpression(data: ImpressionData): Promise<string | null> {
    if (!this.supabase) {
      console.error('[WidgetAnalyticsServer] Supabase client not initialized');
      return null;
    }

    try {
      // Truncate fields to match database constraints
      const browserValue = (data.browser || 'unknown').substring(0, 100);
      const sessionIdValue = (data.sessionId || '').substring(0, 255);
      const triggerTypeValue = (data.triggerType || '').substring(0, 50);
      const platformValue = (data.platform || 'generic').substring(0, 50);
      const deviceTypeValue = (data.deviceType || 'desktop').substring(0, 50);

      const { data: impression, error } = await this.supabase
        .from('widget_impressions')
        .insert({
          wheel_id: data.wheelId,
          tiendanube_store_id: data.storeId,  // Changed from store_id to tiendanube_store_id
          session_id: sessionIdValue,
          trigger_type: triggerTypeValue,
          page_url: data.pageUrl || '',
          referrer_url: data.referrerUrl || '',
          platform: platformValue,
          device_type: deviceTypeValue,
          browser: browserValue,
          user_agent: data.userAgent || '',
          widget_shown: true
        })
        .select('id')
        .single();

      if (error) {
        console.error('[WidgetAnalyticsServer] Failed to track impression:', error);
        return null;
      }

      const impressionId = impression?.id;
      if (impressionId) {
        this.impressionCache.set(data.sessionId, impressionId);
      }
      
      console.log('[WidgetAnalyticsServer] Impression tracked:', impressionId);
      return impressionId;
    } catch (error) {
      console.error('[WidgetAnalyticsServer] Error tracking impression:', error);
      return null;
    }
  }

  async trackEvent(event: WidgetEvent): Promise<void> {
    if (!this.supabase) {
      console.error('[WidgetAnalyticsServer] Supabase client not initialized');
      return;
    }

    try {
      const impressionId = this.impressionCache.get(event.sessionId);
      
      if (!impressionId && event.eventType !== 'widget_view') {
        console.warn('[WidgetAnalyticsServer] No impression found for session:', event.sessionId);
        return;
      }

      const { error } = await this.supabase
        .from('widget_interactions')
        .insert({
          impression_id: impressionId,
          wheel_id: event.wheelId,
          session_id: event.sessionId,
          event_type: event.eventType,
          event_data: event.eventData || {}
        });

      if (error) {
        console.error('[WidgetAnalyticsServer] Failed to track event:', error);
      } else {
        console.log('[WidgetAnalyticsServer] Event tracked:', event.eventType);
      }
    } catch (error) {
      console.error('[WidgetAnalyticsServer] Error tracking event:', error);
    }
  }

  async trackSpin(data: SpinData): Promise<string | null> {
    if (!this.supabase) {
      console.error('[WidgetAnalyticsServer] Supabase client not initialized');
      return null;
    }

    try {
      // Track spin as a widget interaction since spins table requires campaign_id
      // which we don't have in widget context
      await this.trackEvent({
        wheelId: data.wheelId,
        storeId: data.storeId,
        sessionId: data.sessionId,
        eventType: 'spin_complete',
        eventData: {
          segmentId: data.segmentId,
          prize: data.prizeData,
          spinDuration: data.spinDuration,
          deviceType: data.deviceType || 'desktop',
          isMobile: data.deviceType === 'mobile'
        }
      });

      // Return a generated ID for the spin
      const spinId = `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return spinId;
    } catch (error) {
      console.error('[WidgetAnalyticsServer] Error tracking spin:', error);
      return null;
    }
  }

  async trackEmailCapture(data: EmailCaptureData): Promise<void> {
    if (!this.supabase) {
      console.error('[WidgetAnalyticsServer] Supabase client not initialized');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('email_captures')
        .insert({
          spin_id: data.spinId,
          impression_id: data.impressionId,
          email: data.email,
          marketing_consent: data.marketingConsent || false,
          captured_at_step: data.capturedAtStep,
          additional_fields: data.additionalFields,
          utm_source: data.utmSource || '',
          utm_medium: data.utmMedium || '',
          utm_campaign: data.utmCampaign || ''
        });

      if (error) {
        console.error('[WidgetAnalyticsServer] Failed to track email capture:', error);
      }
    } catch (error) {
      console.error('[WidgetAnalyticsServer] Error tracking email capture:', error);
    }
  }

  async updateImpressionTime(sessionId: string, timeOnWidget: number): Promise<void> {
    if (!this.supabase) {
      console.error('[WidgetAnalyticsServer] Supabase client not initialized');
      return;
    }

    try {
      const impressionId = this.impressionCache.get(sessionId);
      if (!impressionId) return;

      const { error } = await this.supabase
        .from('widget_impressions')
        .update({ time_on_widget: Math.round(timeOnWidget / 1000) })
        .eq('id', impressionId);

      if (error) {
        console.error('[WidgetAnalyticsServer] Failed to update impression time:', error);
      }
    } catch (error) {
      console.error('[WidgetAnalyticsServer] Error updating impression time:', error);
    }
  }

  async trackWidgetClose(sessionId: string): Promise<void> {
    if (!this.supabase) {
      console.error('[WidgetAnalyticsServer] Supabase client not initialized');
      return;
    }

    try {
      const impressionId = this.impressionCache.get(sessionId);
      if (!impressionId) return;

      const { error } = await this.supabase
        .from('widget_impressions')
        .update({ widget_closed_at: new Date().toISOString() })
        .eq('id', impressionId);

      if (error) {
        console.error('[WidgetAnalyticsServer] Failed to track widget close:', error);
      }
    } catch (error) {
      console.error('[WidgetAnalyticsServer] Error tracking widget close:', error);
    }
  }
}

export const widgetAnalytics = new WidgetAnalyticsServiceServer();