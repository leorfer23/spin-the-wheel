import { supabase } from '../lib/supabase';
import type { 
  WheelWidgetConfig, 
  WidgetAPIResponse 
} from '../types/widget';

export const widgetService = {
  // Get active wheel for store based on tiendanube_store_id
  async getActiveWheelForStore(storeId: string, _context?: {
    url?: string;
    userAgent?: string;
    referrer?: string;
    timestamp?: string;
  }): Promise<WidgetAPIResponse> {
    console.log('[WidgetService] getActiveWheelForStore called with storeId:', storeId);
    
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
      
      console.log('[WidgetService] Supabase config:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        url: supabaseUrl ? 'SET' : 'NOT SET',
        processEnv: !!process.env.VITE_SUPABASE_URL,
        importMeta: !!(import.meta as any).env?.VITE_SUPABASE_URL
      });

      // First, let's test if we can query the wheels table at all
      const testQuery = await supabase
        .from('wheels')
        .select('id, name, tiendanube_store_id, is_active')
        .limit(5);
      
      console.log('[WidgetService] Test query - List of wheels:', {
        error: testQuery.error,
        dataCount: testQuery.data?.length,
        data: testQuery.data
      });
      
      // Also specifically look for this store ID without the is_active filter
      const storeTestQuery = await supabase
        .from('wheels')
        .select('id, name, tiendanube_store_id, is_active')
        .eq('tiendanube_store_id', String(storeId));
      
      console.log('[WidgetService] Store-specific test query (without is_active filter):', {
        storeId: storeId,
        storeIdAsString: String(storeId),
        error: storeTestQuery.error,
        dataCount: storeTestQuery.data?.length,
        data: storeTestQuery.data
      });

      // Try both string and number formats for the store ID
      console.log('[WidgetService] Attempting query with storeId:', storeId, 'type:', typeof storeId);
      
      // Convert to string to ensure it matches the database format
      const storeIdString = String(storeId);
      
      // Query wheels table directly by tiendanube_store_id
      const { data, error } = await supabase
        .from('wheels')
        .select('*')
        .eq('tiendanube_store_id', storeIdString)
        .eq('is_active', true)
        .limit(1)
        .single();

      console.log('[WidgetService] Supabase query executed');
      console.log('[WidgetService] Query details:', {
        table: 'wheels',
        filters: {
          tiendanube_store_id: storeId,
          is_active: true
        }
      });
      
      console.log('[WidgetService] Supabase query result:', {
        error: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null,
        data: data ? {
          id: data.id,
          name: data.name,
          tiendanube_store_id: data.tiendanube_store_id,
          is_active: data.is_active,
          segments_config: data.segments_config,
          style_config: data.style_config,
          hasSegmentsConfig: !!data.segments_config,
          segmentsLength: data.segments_config?.length
        } : null,
        dataExists: !!data
      });

      if (error) {
        console.error('[WidgetService] Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        console.log('[WidgetService] No data returned from query');
        return {
          success: false,
          error: 'No active wheel found for this store'
        };
      }

      // Transform segments from segments_config field
      console.log('[WidgetService] Processing segments_config:', data.segments_config);
      
      const segments = data.segments_config ? data.segments_config.map((segment: any, index: number) => {
        const transformed = {
          id: segment.id,
          label: segment.label,
          value: segment.value || segment.label.toUpperCase().replace(/\s+/g, '_'),
          color: segment.color,
          textColor: segment.textColor || '#FFFFFF',
          probability: segment.weight / 100, // Convert weight to probability (0-1)
          prizeType: segment.prizeType || 'custom',
          prizeValue: segment.prizeValue || segment.value,
          discountCode: segment.discountCode || segment.value,
          description: segment.description || segment.label
        };
        console.log(`[WidgetService] Transformed segment ${index}:`, transformed);
        return transformed;
      }) : [];
      
      console.log('[WidgetService] Final segments array:', segments);

      // Transform style from style_config field
      const styleConfig = data.style_config || {};
      const style = {
        size: 400, // Default size
        backgroundColor: styleConfig.backgroundColor || '#F3F4F6',
        borderColor: styleConfig.wheelBorderColor || '#E5E7EB',
        borderWidth: styleConfig.wheelBorderWidth || 8,
        centerCircleColor: styleConfig.centerButtonBackgroundColor || '#8B5CF6',
        centerCircleSize: 80,
        pointerColor: styleConfig.pointerColor || '#EF4444',
        pointerStyle: 'triangle' as const,
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        // Additional style properties from database
        pegColor: styleConfig.pegColor,
        pegSize: styleConfig.pegSize || 8,
        shadowBlur: styleConfig.shadowBlur,
        shadowColor: styleConfig.shadowColor,
        glowEffect: styleConfig.glowEffect,
        sparkleEffect: styleConfig.sparkleEffect,
        centerButtonLogo: styleConfig.centerButtonLogo,
        centerButtonTextColor: styleConfig.centerButtonTextColor,
        centerButtonBorderColor: styleConfig.centerButtonBorderColor,
        centerButtonBorderWidth: styleConfig.centerButtonBorderWidth,
        wheelBackgroundColor: styleConfig.wheelBackgroundColor || styleConfig.backgroundColor
      };

      // Transform to widget config format
      const widgetConfig: WheelWidgetConfig = {
        id: data.id,
        storeId: storeId,
        wheelData: {
          id: data.id,
          name: data.name,
          segments: segments,
          style: style,
          physics: data.physics || {
            spinDuration: 4000,
            spinEasing: 'ease-out' as const,
            minSpins: 3,
            maxSpins: 5,
            slowdownRate: 0.98
          }
        },
        handleConfig: data.handle_config || {
          type: 'button' as const,
          style: {
            position: 'center',
            backgroundColor: '#8B5CF6',
            textColor: '#FFFFFF',
            borderRadius: 50,
            padding: '20px',
            fontSize: 18,
            customCSS: ''
          },
          text: 'SPIN',
          animation: {
            type: 'pulse' as const,
            duration: 2000,
            delay: 0
          }
        },
        emailCaptureConfig: data.email_capture_config || {
          enabled: false,
          required: false,
          timing: 'before_spin' as const,
          formStyle: {
            backgroundColor: '#FFFFFF',
            textColor: '#1F2937',
            inputBackgroundColor: '#F9FAFB',
            inputBorderColor: '#D1D5DB',
            buttonBackgroundColor: '#8B5CF6',
            buttonTextColor: '#FFFFFF',
            borderRadius: 8,
            fontFamily: 'Arial, sans-serif'
          },
          fields: []
        },
        celebrationConfig: data.celebration_config || {
          type: 'confetti' as const,
          duration: 3000,
          message: {
            winTitle: '🎉 Congratulations!',
            winDescription: 'You won {prize}!',
            loseTitle: 'Better Luck Next Time!',
            loseDescription: 'Thanks for playing!',
            claimButtonText: 'Claim Prize',
            dismissButtonText: 'Close'
          }
        },
        settings: data.settings || {
          trigger: 'delay' as const,
          triggerDelay: 5,
          triggerScrollPercentage: 50,
          showOnlyOnce: true,
          sessionCooldown: 24,
          mobileEnabled: true,
          desktopEnabled: true,
          targetAudience: {
            newVisitorsOnly: false,
            returningVisitorsOnly: false
          }
        }
      };

      console.log('[WidgetService] Final widgetConfig:', {
        id: widgetConfig.id,
        storeId: widgetConfig.storeId,
        segmentsCount: widgetConfig.wheelData.segments.length,
        segments: widgetConfig.wheelData.segments
      });

      return {
        success: true,
        data: widgetConfig
      };
    } catch (error) {
      console.error('[WidgetService] Error in getActiveWheelForStore:', error);
      
      return {
        success: false,
        error: 'No active wheel found for this store'
      };
    }
  },

  // Fetch wheel configuration by ID (for backwards compatibility)
  async getWheelConfig(wheelId: string): Promise<WidgetAPIResponse> {
    try {

      // In production, fetch from Supabase
      const { data, error } = await supabase
        .from('wheel_widgets')
        .select(`
          *,
          wheel:wheels(
            *,
            segments:wheel_segments(*),
            campaign:campaigns(*)
          ),
          handle_config:handle_configs(*),
          email_config:email_capture_configs(*),
          celebration_config:celebration_configs(*)
        `)
        .eq('wheel_id', wheelId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Transform the data to match our widget config structure
      const widgetConfig: WheelWidgetConfig = transformToWidgetConfig(data);

      return {
        success: true,
        data: widgetConfig
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load wheel configuration'
      };
    }
  },

  // Fetch default wheel for a store
  async getDefaultWheelForStore(storeId: string): Promise<WidgetAPIResponse> {
    try {

      // In production, fetch from Supabase
      const { data, error } = await supabase
        .from('wheel_widgets')
        .select(`
          *,
          wheel:wheels(
            *,
            segments:wheel_segments(*),
            campaign:campaigns(*)
          ),
          handle_config:handle_configs(*),
          email_config:email_capture_configs(*),
          celebration_config:celebration_configs(*)
        `)
        .eq('store_id', storeId)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      const widgetConfig: WheelWidgetConfig = transformToWidgetConfig(data);

      return {
        success: true,
        data: widgetConfig
      };
    } catch (error) {
      return {
        success: false,
        error: 'No default wheel found for this store'
      };
    }
  },

  // Record a spin
  async recordSpin(spinResult: any): Promise<{ spinId?: string }> {
    try {
      // First, try to get or create a campaign for this wheel
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('wheel_id', spinResult.wheelId)
        .eq('is_active', true)
        .limit(1);

      let campaignId = campaigns?.[0]?.id;
      
      // If no campaign exists, create a default one
      if (!campaignId) {
        const { data: newCampaign } = await supabase
          .from('campaigns')
          .insert({
            wheel_id: spinResult.wheelId,
            name: 'Default Campaign',
            is_active: true
          })
          .select('id')
          .single();
        
        campaignId = newCampaign?.id;
      }

      // Record the spin with analytics data
      const { data: spin, error } = await supabase
        .from('spins')
        .insert({
          campaign_id: campaignId,
          email: spinResult.email || '',
          segment_won_id: spinResult.segmentId,
          spin_result: spinResult.prize,
          impression_id: spinResult.impressionId,
          spin_duration: spinResult.spinDuration,
          is_mobile: spinResult.deviceType === 'mobile',
          device_type: spinResult.deviceType
        })
        .select('id')
        .single();

      if (error) throw error;
      
      return { spinId: spin?.id };
    } catch (error) {
      console.error('[WidgetService] Failed to record spin:', error);
      return {};
    }
  },

  // Record prize acceptance
  async recordPrizeAcceptance(acceptance: any): Promise<void> {
    try {
      // Update the spin with the email if we have a spinId
      if (acceptance.spinId) {
        await supabase
          .from('spins')
          .update({ 
            email: acceptance.email,
            claimed_at: new Date().toISOString(),
            claim_code: acceptance.prize?.discountCode
          })
          .eq('id', acceptance.spinId);
      }

      // Record email capture with analytics data
      const { error: emailError } = await supabase
        .from('email_captures')
        .insert({
          spin_id: acceptance.spinId,
          impression_id: acceptance.impressionId,
          email: acceptance.email,
          marketing_consent: acceptance.marketingConsent !== false,
          captured_at_step: acceptance.capturedAtStep || 'with_prize',
          additional_fields: acceptance.additionalData,
          synced_to_provider: false
        });

      if (emailError) {
        console.error('[WidgetService] Failed to record email capture:', emailError);
      }

      // Track the interaction event
      if (acceptance.impressionId) {
        await supabase
          .from('widget_interactions')
          .insert({
            impression_id: acceptance.impressionId,
            wheel_id: acceptance.wheelId,
            session_id: acceptance.sessionId,
            event_type: 'prize_claimed',
            event_data: {
              prize: acceptance.prize,
              email: acceptance.email,
              discountCode: acceptance.prize?.discountCode
            }
          });
      }
    } catch (error) {
      console.error('[WidgetService] Failed to record prize acceptance:', error);
    }
  }
};

// Helper function to transform Supabase data to widget config
function transformToWidgetConfig(data: any): WheelWidgetConfig {
  // Transform the database structure to widget config structure
  return {
    id: data.id,
    storeId: data.store_id,
    wheelData: {
      id: data.wheel?.id || data.id,
      name: data.wheel?.name || 'Wheel',
      segments: data.wheel?.segments || [],
      style: data.wheel?.style || {},
      physics: data.wheel?.physics || {}
    },
    handleConfig: data.handle_config || {},
    emailCaptureConfig: data.email_config || {},
    celebrationConfig: data.celebration_config || {},
    settings: data.settings || {}
  };
}