import { supabase } from '../lib/supabase';
import type { 
  WheelWidgetConfig, 
  SpinResult, 
  PrizeAcceptance,
  WidgetAPIResponse 
} from '../types/widget';

// Mock data for development
const mockWheelConfig: WheelWidgetConfig = {
  id: 'test-wheel-123',
  storeId: 'demo-store-123',
  wheelData: {
    id: 'test-wheel-123',
    name: 'Welcome Wheel',
    segments: [
      {
        id: '1',
        label: '20% OFF',
        value: '20_percent_off',
        color: '#8B5CF6',
        textColor: '#FFFFFF',
        probability: 0.15,
        prizeType: 'discount',
        prizeValue: '20',
        discountCode: 'SPIN20',
        description: 'Get 20% off your entire purchase!'
      },
      {
        id: '2',
        label: 'Free Shipping',
        value: 'free_shipping',
        color: '#7C3AED',
        textColor: '#FFFFFF',
        probability: 0.2,
        prizeType: 'freebie',
        prizeValue: 'free_shipping',
        discountCode: 'SHIPFREE',
        description: 'Free shipping on your next order!'
      },
      {
        id: '3',
        label: 'Try Again',
        value: 'no_prize',
        color: '#6D28D9',
        textColor: '#FFFFFF',
        probability: 0.3,
        prizeType: 'no_prize',
        description: 'Better luck next time!'
      },
      {
        id: '4',
        label: '10% OFF',
        value: '10_percent_off',
        color: '#5B21B6',
        textColor: '#FFFFFF',
        probability: 0.25,
        prizeType: 'discount',
        prizeValue: '10',
        discountCode: 'SPIN10',
        description: 'Save 10% on your purchase!'
      },
      {
        id: '5',
        label: '$5 OFF',
        value: '5_dollars_off',
        color: '#4C1D95',
        textColor: '#FFFFFF',
        probability: 0.1,
        prizeType: 'discount',
        prizeValue: '5',
        discountCode: 'SAVE5',
        description: 'Get $5 off your order!'
      }
    ],
    style: {
      size: 400,
      backgroundColor: '#F3F4F6',
      borderColor: '#E5E7EB',
      borderWidth: 8,
      centerCircleColor: '#8B5CF6',
      centerCircleSize: 80,
      pointerColor: '#EF4444',
      pointerStyle: 'arrow',
      fontFamily: 'Arial, sans-serif',
      fontSize: 16
    },
    physics: {
      spinDuration: 4000,
      spinEasing: 'ease-out',
      minSpins: 3,
      maxSpins: 5,
      slowdownRate: 0.98
    }
  },
  handleConfig: {
    type: 'button',
    style: {
      position: 'center',
      backgroundColor: '#8B5CF6',
      textColor: '#FFFFFF',
      borderRadius: 50,
      padding: '20px',
      fontSize: 18,
      customCSS: `
        box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.5);
        transition: all 0.3s ease;
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.6);
        }
      `
    },
    text: 'SPIN',
    animation: {
      type: 'pulse',
      duration: 2000,
      delay: 0
    }
  },
  emailCaptureConfig: {
    enabled: true,
    required: true,
    timing: 'before_spin',
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
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter your email'
      }
    ],
    consentText: 'I agree to receive marketing emails',
    privacyPolicyUrl: 'https://example.com/privacy',
    successMessage: 'Thanks! Now spin the wheel for your prize!'
  },
  celebrationConfig: {
    type: 'confetti',
    duration: 3000,
    message: {
      winTitle: '🎉 Congratulations!',
      winDescription: 'You won {prize}! Check your email for the discount code.',
      loseTitle: 'Better Luck Next Time!',
      loseDescription: 'Thanks for playing! Check back later for more chances to win.',
      claimButtonText: 'Claim Prize',
      dismissButtonText: 'Close'
    },
    sound: {
      enabled: true,
      winSound: '/sounds/win.mp3',
      loseSound: '/sounds/lose.mp3',
      volume: 0.5
    },
    animation: {
      entranceEffect: 'scale',
      exitEffect: 'fade',
      duration: 300
    }
  },
  settings: {
    trigger: 'exit_intent',
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

export const widgetService = {
  // Get active wheel for store based on tienda_nube_store_id
  async getActiveWheelForStore(storeId: string, _context?: {
    url?: string;
    userAgent?: string;
    referrer?: string;
    timestamp?: string;
  }): Promise<WidgetAPIResponse> {
    try {
      // Query wheels table directly by tienda_nube_store_id
      const { data, error } = await supabase
        .from('wheels')
        .select(`
          *,
          segments:wheel_segments(*)
        `)
        .eq('tienda_nube_store_id', storeId)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching wheel:', error);
        throw error;
      }

      if (!data) {
        return {
          success: false,
          error: 'No active wheel found for this store'
        };
      }

      // Transform to widget config format
      const widgetConfig: WheelWidgetConfig = {
        id: data.id,
        storeId: storeId,
        wheelData: {
          id: data.id,
          name: data.name,
          segments: data.segments || [],
          style: data.style || mockWheelConfig.wheelData.style,
          physics: data.physics || mockWheelConfig.wheelData.physics
        },
        handleConfig: data.handle_config || mockWheelConfig.handleConfig,
        emailCaptureConfig: data.email_capture_config || mockWheelConfig.emailCaptureConfig,
        celebrationConfig: data.celebration_config || mockWheelConfig.celebrationConfig,
        settings: data.settings || mockWheelConfig.settings
      };

      return {
        success: true,
        data: widgetConfig
      };
    } catch (error) {
      console.error('Error fetching active wheel:', error);
      
      // In development, return mock data as fallback
      if ((import.meta as any).env.DEV) {
        console.log('Returning mock data for development');
        return {
          success: true,
          data: { ...mockWheelConfig, storeId }
        };
      }
      
      return {
        success: false,
        error: 'No active wheel found for this store'
      };
    }
  },

  // Fetch wheel configuration by ID (for backwards compatibility)
  async getWheelConfig(wheelId: string): Promise<WidgetAPIResponse> {
    try {
      // In development, return mock data
      if ((import.meta as any).env.DEV) {
        return {
          success: true,
          data: mockWheelConfig
        };
      }

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
      console.error('Error fetching wheel config:', error);
      return {
        success: false,
        error: 'Failed to load wheel configuration'
      };
    }
  },

  // Fetch default wheel for a store
  async getDefaultWheelForStore(storeId: string): Promise<WidgetAPIResponse> {
    try {
      // In development, return mock data
      if ((import.meta as any).env.DEV) {
        return {
          success: true,
          data: { ...mockWheelConfig, storeId }
        };
      }

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
      console.error('Error fetching default wheel:', error);
      return {
        success: false,
        error: 'No default wheel found for this store'
      };
    }
  },

  // Record a spin
  async recordSpin(spinResult: SpinResult): Promise<void> {
    try {
      // In development, just log
      if ((import.meta as any).env.DEV) {
        console.log('Recording spin:', spinResult);
        return;
      }

      // In production, save to Supabase
      const { error } = await supabase
        .from('wheel_spins')
        .insert({
          wheel_id: spinResult.wheelId,
          store_id: spinResult.storeId,
          segment_id: spinResult.segmentId,
          prize_data: spinResult.prize,
          session_id: spinResult.sessionId,
          platform: spinResult.platform,
          created_at: spinResult.timestamp
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording spin:', error);
    }
  },

  // Record prize acceptance
  async recordPrizeAcceptance(acceptance: PrizeAcceptance): Promise<void> {
    try {
      // In development, just log
      if ((import.meta as any).env.DEV) {
        console.log('Recording prize acceptance:', acceptance);
        return;
      }

      // In production, save to Supabase
      const { error } = await supabase
        .from('prize_claims')
        .insert({
          wheel_id: acceptance.wheelId,
          store_id: acceptance.storeId,
          prize_data: acceptance.prize,
          email: acceptance.email,
          additional_data: acceptance.additionalData,
          platform: acceptance.platform,
          created_at: acceptance.timestamp
        });

      if (error) throw error;

      // Also create a lead record
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          wheel_id: acceptance.wheelId,
          store_id: acceptance.storeId,
          email: acceptance.email,
          source: 'widget',
          platform: acceptance.platform,
          created_at: acceptance.timestamp
        });
      
      if (leadError) throw leadError;
    } catch (error) {
      console.error('Error recording prize acceptance:', error);
    }
  }
};

// Helper function to transform Supabase data to widget config
function transformToWidgetConfig(_data: any): WheelWidgetConfig {
  // This would map the database structure to our widget config structure
  // For now, returning mock data as example
  return mockWheelConfig;
}