import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with SERVICE ROLE to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'spinawheel'
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
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
    // Ensure storeId is a string
    const storeIdString = String(storeId);
    console.log('[Widget API] Fetching active wheels for store:', storeIdString, 'Type:', typeof storeIdString);

    // Query all active wheels for this store - MUST use spinawheel schema
    const { data: wheels, error } = await supabase
      .schema('spinawheel')
      .from('wheels')
      .select('*')
      .eq('tiendanube_store_id', storeIdString)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Widget API] Supabase error:', error);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    console.log('[Widget API] Supabase query error:', error);
    console.log('[Widget API] Raw query results:', {
      storeId: storeIdString,
      wheelsFound: wheels?.length || 0,
      wheels: wheels?.map(w => ({ 
        id: w.id, 
        name: w.name, 
        is_active: w.is_active,
        tiendanube_store_id: w.tiendanube_store_id,
        has_schedule: !!w.schedule_config,
        schedule_enabled: w.schedule_config?.enabled
      }))
    });

    if (!wheels || wheels.length === 0) {
      // Let's also check without the is_active filter to debug
      const { data: allWheels, error: allError } = await supabase
        .schema('spinawheel')
        .from('wheels')
        .select('id, name, is_active, tiendanube_store_id')
        .eq('tiendanube_store_id', storeIdString);
      
      console.log('[Widget API] Debug - All wheels for store (including inactive):', {
        storeIdQueried: storeIdString,
        error: allError,
        wheelsFound: allWheels?.length || 0,
        wheels: allWheels
      });
      
      // Also check ALL wheels to see what store IDs exist
      const { data: sampleWheels } = await supabase
        .schema('spinawheel')
        .from('wheels')
        .select('tiendanube_store_id, name')
        .limit(10);
      
      console.log('[Widget API] Sample store IDs in database:', sampleWheels?.map(w => ({
        store_id: w.tiendanube_store_id,
        type: typeof w.tiendanube_store_id,
        name: w.name
      })));
      
      res.status(404).json({ error: 'No active wheels found for this store' });
      return;
    }

    // Transform all wheels to widget format
    const widgetConfigs = wheels.map(wheel => {
      const styleConfig = (wheel.style_config || {});
      
      return {
        id: wheel.id,
        name: wheel.name,
        storeId: storeId,
        priority: wheel.priority || 0,
        created_at: wheel.created_at,
        schedule_config: wheel.schedule_config || { enabled: false },
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
    });

    console.log('[Widget API] Returning', widgetConfigs.length, 'wheel configs');
    res.status(200).json(widgetConfigs);

  } catch (error) {
    console.error('[Widget API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}