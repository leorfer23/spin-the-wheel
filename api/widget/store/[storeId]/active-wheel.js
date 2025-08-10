import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'spinawheel'
    }
  }
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Store-ID');
  res.setHeader('Cache-Control', 'public, max-age=300');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { storeId } = req.query;

  if (!storeId) {
    res.status(400).json({ error: 'Store ID is required' });
    return;
  }

  try {
    console.log('[Widget API] Fetching active wheel for store:', storeId);

    // Query the first active wheel for this store (backward compatibility)
    const { data: wheel, error } = await supabase
      .from('wheels')
      .select('*')
      .eq('tiendanube_store_id', storeId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error || !wheel) {
      console.error('[Widget API] No active wheel found:', error);
      res.status(404).json({ error: 'No active wheel found for this store' });
      return;
    }

    // Transform the wheel data to widget format
    const styleConfig = (wheel.style_config || {});
    
    const widgetConfig = {
      id: wheel.id,
      storeId: storeId,
      wheelData: {
        id: wheel.id,
        name: wheel.name,
        segments: wheel.segments_config || [],
        promotionalMessage: wheel.promotional_message || 'TODAY ONLY: Double rewards on all prizes!',
        style: {
          size: styleConfig.size || styleConfig.wheelSize || wheel.wheelSize || 400,
          backgroundColor: styleConfig.backgroundColor || '#F3F4F6',
          borderColor: styleConfig.borderColor || styleConfig.wheelBorderColor || '#E5E7EB',
          borderWidth: styleConfig.borderWidth || styleConfig.wheelBorderWidth || 8,
          centerCircleColor: styleConfig.centerCircleColor || styleConfig.centerButtonBackgroundColor || '#8B5CF6',
          centerCircleSize: styleConfig.centerCircleSize || styleConfig.centerButtonSize || 100,
          pointerColor: styleConfig.pointerColor || '#EF4444',
          pointerStyle: styleConfig.pointerStyle || 'triangle',
          fontFamily: styleConfig.fontFamily || 'Arial, sans-serif',
          fontSize: styleConfig.fontSize || 16,
          ...styleConfig,
          ...((!styleConfig.size && !styleConfig.wheelSize) ? { size: 400 } : {}),
          ...((!styleConfig.centerCircleSize && !styleConfig.centerButtonSize) ? { centerCircleSize: 100 } : {})
        },
        physics: wheel.physics || {
          spinDuration: 4000,
          spinEasing: 'ease-out',
          minSpins: 3,
          maxSpins: 5,
          slowdownRate: 0.98
        }
      },
      handleConfig: (() => {
        const handleConfig = (wheel.wheel_handle_config || wheel.handle_config || {});
        
        return {
          type: handleConfig.handleType || handleConfig.type || 'floating',
          style: {
            position: handleConfig.handlePosition || handleConfig.position || 'right',
            backgroundColor: handleConfig.handleBackgroundColor || handleConfig.backgroundColor || '#8B5CF6',
            textColor: handleConfig.handleTextColor || handleConfig.textColor || '#FFFFFF',
            borderRadius: handleConfig.handleBorderRadius || handleConfig.borderRadius || '9999px',
            padding: handleConfig.padding || '20px',
            fontSize: handleConfig.fontSize || 18,
            customCSS: handleConfig.customCSS || ''
          },
          text: handleConfig.handleText || handleConfig.text || '¡Gana Premios!',
          icon: handleConfig.handleIcon || handleConfig.icon || '🎁',
          size: handleConfig.handleSize || handleConfig.size || 'medium',
          animation: handleConfig.handleAnimation || {
            type: handleConfig.animationType || 'pulse',
            duration: handleConfig.animationDuration || 2000,
            delay: handleConfig.animationDelay || 0
          }
        };
      })(),
      emailCaptureConfig: (() => {
        const emailConfig = (wheel.email_capture_config || {});
        const isEnabled = emailConfig.captureFormat !== undefined && emailConfig.captureFormat !== 'none';
        
        return {
          enabled: isEnabled,
          required: emailConfig.required !== false,
          timing: emailConfig.timing || 'before_spin',
          formStyle: {
            backgroundColor: emailConfig.backgroundColor || '#FFFFFF',
            textColor: emailConfig.textColor || '#1F2937',
            inputBackgroundColor: emailConfig.inputBackgroundColor || '#F9FAFB',
            inputBorderColor: emailConfig.inputBorderColor || '#D1D5DB',
            buttonBackgroundColor: emailConfig.buttonBackgroundColor || '#8B5CF6',
            buttonTextColor: emailConfig.buttonTextColor || '#FFFFFF',
            borderRadius: emailConfig.borderRadius || 8,
            fontFamily: emailConfig.fontFamily || 'Arial, sans-serif'
          },
          fields: emailConfig.fields || [
            {
              name: 'email',
              label: emailConfig.captureTitle || 'Enter your email to spin!',
              type: 'email',
              required: true,
              placeholder: 'your@email.com'
            }
          ],
          consentText: emailConfig.consentText,
          privacyPolicyUrl: emailConfig.privacyPolicyUrl,
          successMessage: emailConfig.successMessage
        };
      })(),
      celebrationConfig: wheel.celebration_config || {
        type: 'confetti',
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
      settings: wheel.settings || {
        trigger: 'delay',
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

    console.log('[Widget API] Returning wheel config for wheel:', wheel.id);
    res.status(200).json(widgetConfig);

  } catch (error) {
    console.error('[Widget API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}