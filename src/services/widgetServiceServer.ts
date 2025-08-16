// Server-side version of widget service that uses SERVICE_ROLE_KEY to bypass RLS
import { createClient } from '@supabase/supabase-js';

class WidgetServiceServer {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    // Use SERVICE_ROLE_KEY to bypass RLS for widget operations
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.VITE_SERVICE_ROLE_KEY ||
                       process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[WidgetServiceServer] Missing Supabase environment variables');
      this.supabase = null;
    } else {
      console.log('[WidgetServiceServer] Initializing with service role key for RLS bypass');
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

  // Record prize acceptance and email capture
  async recordPrizeAcceptance(acceptance: any): Promise<void> {
    if (!this.supabase) {
      console.error('[WidgetServiceServer] Supabase client not initialized');
      return;
    }

    try {
      console.log('[WidgetServiceServer] Recording prize acceptance:', {
        spinId: acceptance.spinId,
        email: acceptance.email,
        wheelId: acceptance.wheelId,
        storeId: acceptance.storeId
      });

      // Note: Since we're not using the spins table (requires campaign_id),
      // we'll skip updating spin with email

      // Skip email_captures table since it requires spin_id from spins table
      // We'll only use widget_emails table for now

      // Also record in widget_emails table for store-specific tracking
      const widgetEmailData = {
        email: acceptance.email,
        tiendanube_store_id: acceptance.storeId,
        wheel_id: acceptance.wheelId,
        marketing_consent: acceptance.marketingConsent !== false,
        source: 'widget_spin',
        captured_at: new Date().toISOString()
      };

      console.log('[WidgetServiceServer] Inserting widget email:', widgetEmailData);

      const { data: widgetEmailResult, error: widgetEmailError } = await this.supabase
        .from('widget_emails')
        .upsert(widgetEmailData, {
          onConflict: 'email,tiendanube_store_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (widgetEmailError) {
        console.error('[WidgetServiceServer] Error recording widget email:', widgetEmailError);
      } else {
        console.log('[WidgetServiceServer] Widget email recorded:', widgetEmailResult?.email);
      }

      // Track the interaction event
      if (acceptance.impressionId) {
        const interactionData = {
          impression_id: acceptance.impressionId,
          wheel_id: acceptance.wheelId,
          session_id: acceptance.sessionId,
          event_type: 'prize_claimed',
          event_data: {
            prize: acceptance.prize,
            email: acceptance.email,
            discountCode: acceptance.prize?.discountCode
          },
          created_at: new Date().toISOString()
        };

        console.log('[WidgetServiceServer] Inserting interaction:', interactionData);

        const { error: interactionError } = await this.supabase
          .from('widget_interactions')
          .insert(interactionData);

        if (interactionError) {
          console.error('[WidgetServiceServer] Error recording interaction:', interactionError);
        } else {
          console.log('[WidgetServiceServer] Interaction recorded');
        }
      }

      // Record prize acceptance in dedicated table
      const prizeAcceptanceData = {
        wheel_id: acceptance.wheelId,
        tiendanube_store_id: acceptance.storeId,
        session_id: acceptance.sessionId,
        impression_id: acceptance.impressionId || null,
        spin_id: acceptance.spinId || null,
        email: acceptance.email,
        prize_type: acceptance.prize?.prizeType,
        prize_value: acceptance.prize?.value,
        discount_code: acceptance.prize?.discountCode,
        platform: acceptance.platform || 'web',
        captured_at_step: acceptance.capturedAtStep || 'with_prize',
        timestamp: new Date().toISOString()
      };

      console.log('[WidgetServiceServer] Inserting prize acceptance:', prizeAcceptanceData);

      const { data: acceptanceResult, error: acceptanceError } = await this.supabase
        .from('widget_prize_acceptances')
        .insert(prizeAcceptanceData)
        .select()
        .single();

      if (acceptanceError) {
        console.error('[WidgetServiceServer] Error recording prize acceptance:', acceptanceError);
      } else {
        console.log('[WidgetServiceServer] Prize acceptance recorded:', acceptanceResult?.id);
      }

    } catch (error) {
      console.error('[WidgetServiceServer] Unexpected error in recordPrizeAcceptance:', error);
    }
  }

  // Record spin data
  async recordSpin(spinData: any): Promise<any> {
    if (!this.supabase) {
      console.error('[WidgetServiceServer] Supabase client not initialized');
      return { spinId: null };
    }

    try {
      console.log('[WidgetServiceServer] Recording spin:', spinData);

      // Note: spins table requires campaign_id, but we're using it without campaigns for widget
      // We'll need to either make campaign_id nullable or create a default campaign
      // For now, we'll just track the spin without using the spins table
      // Instead, we'll track it in widget_interactions
      
      const spinInteraction = {
        wheel_id: spinData.wheelId,
        session_id: spinData.sessionId,
        impression_id: spinData.impressionId || null,
        event_type: 'spin_complete',
        event_data: {
          segment_id: spinData.segmentId,
          prize_data: spinData.prizeData || {},
          spin_duration: spinData.spinDuration || null,
          device_type: spinData.deviceType || 'desktop',
          is_mobile: spinData.deviceType === 'mobile'
        },
        created_at: new Date().toISOString()
      };

      const { data: interaction, error } = await this.supabase
        .from('widget_interactions')
        .insert(spinInteraction)
        .select()
        .single();

      if (error) {
        console.error('[WidgetServiceServer] Error recording spin interaction:', error);
        return { spinId: null };
      }

      console.log('[WidgetServiceServer] Spin interaction recorded:', interaction?.id);
      // Return the interaction ID as spinId for tracking purposes
      return { spinId: interaction?.id };
    } catch (error) {
      console.error('[WidgetServiceServer] Unexpected error in recordSpin:', error);
      return { spinId: null };
    }
  }
}

export const widgetServiceServer = new WidgetServiceServer();