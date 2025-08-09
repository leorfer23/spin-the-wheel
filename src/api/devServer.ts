// Development server middleware for widget API
import type { Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';

// Lazy-load Supabase client to avoid initialization during config loading
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    // Use fallback values for dev server if env vars are missing
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ufliwvyssoqqbejydyjg.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGl3dnlzc29xcWJlanlkeWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTE1ODgsImV4cCI6MjA2NzIyNzU4OH0.irrZRHA9gWU5g7ep0wspJII5k0zkhrYVR_PBJDDmylI';
    
    supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: 'spinawheel'
      }
    }) as any;
  }
  return supabase;
}

export function widgetAPIPlugin(): Plugin {
  return {
    name: 'widget-api',
    configureServer(server) {
      // GET /api/widget/wheel/:wheelId
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/widget/wheel/') && req.method === 'GET') {
          const wheelId = req.url.split('/').pop() || '';
          const { widgetService } = await import('../services/widgetService');
          const result = await widgetService.getWheelConfig(wheelId);
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.setHeader('Cache-Control', 'public, max-age=300');
          
          if (result.success) {
            res.statusCode = 200;
            res.end(JSON.stringify(result.data));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: result.error }));
          }
          return;
        }
        
        // GET /api/widget/store/:storeId/active-wheel
        if (req.url?.match(/^\/api\/widget\/store\/[^\/]+\/active-wheel/) && req.method === 'GET') {
          const urlParts = req.url.split('?');
          const matches = urlParts[0].match(/\/api\/widget\/store\/([^\/]+)\/active-wheel/);
          const storeId = matches?.[1] || '';
          
          console.log('[DevServer] Active wheel endpoint called');
          console.log('[DevServer] Store ID:', storeId);
          console.log('[DevServer] Request URL:', req.url);
          
          console.log('[DevServer] Querying Supabase directly for store:', storeId);
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Store-ID');
          res.setHeader('Cache-Control', 'public, max-age=300');
          
          try {
            // Query the wheel directly
            const { data: wheel, error } = await getSupabaseClient()!
              .from('wheels')
              .select('*')
              .eq('tiendanube_store_id', storeId)
              .eq('is_active', true)
              .limit(1)
              .single();
            
            console.log('[DevServer] Supabase query result:', {
              error,
              hasWheel: !!wheel,
              wheelId: wheel?.id,
              wheelName: wheel?.name
            });
            
            if (error || !wheel) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'No active wheel found for this store' }));
              return;
            }
            
            // Transform the wheel data to widget format
            // Extract style_config safely
            const styleConfig = (wheel.style_config || {}) as any;
            
            const widgetConfig = {
              id: wheel.id,
              storeId: storeId,
              wheelData: {
                id: wheel.id,
                name: wheel.name,
                segments: wheel.segments_config || [],
                promotionalMessage: wheel.promotional_message || 'TODAY ONLY: Double rewards on all prizes!',
                style: {
                  // Wheel size - check multiple possible field names or use default
                  size: styleConfig.size || styleConfig.wheelSize || wheel.wheelSize || 400,
                  backgroundColor: styleConfig.backgroundColor || '#F3F4F6',
                  borderColor: styleConfig.borderColor || styleConfig.wheelBorderColor || '#E5E7EB',
                  borderWidth: styleConfig.borderWidth || styleConfig.wheelBorderWidth || 8,
                  centerCircleColor: styleConfig.centerCircleColor || styleConfig.centerButtonBackgroundColor || '#8B5CF6',
                  // Center circle size - use a proportional default based on wheel size
                  centerCircleSize: styleConfig.centerCircleSize || styleConfig.centerButtonSize || 100,
                  pointerColor: styleConfig.pointerColor || '#EF4444',
                  pointerStyle: styleConfig.pointerStyle || 'triangle',
                  fontFamily: styleConfig.fontFamily || 'Arial, sans-serif',
                  fontSize: styleConfig.fontSize || 16,
                  // Pass through any additional style properties
                  ...styleConfig,
                  // Ensure size and centerCircleSize are always present (override if they were undefined in spread)
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
                const handleConfig = (wheel.wheel_handle_config || wheel.handle_config || {}) as any;
                console.log('[DevServer] Raw handle config:', handleConfig);
                
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
                const emailConfig = (wheel.email_capture_config || {}) as any;
                console.log('[DevServer] Raw email capture config:', emailConfig);
                
                // Check if email capture should be enabled based on captureFormat
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
            
            console.log('[DevServer] Sending widget config with', (widgetConfig.wheelData.segments as any[]).length, 'segments');
            res.statusCode = 200;
            res.end(JSON.stringify(widgetConfig));
            
          } catch (err) {
            console.error('[DevServer] Error querying Supabase:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
          
          return;
        }
        
        // POST /api/widget/spin
        if (req.url === '/api/widget/spin' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { widgetService } = await import('../services/widgetService');
              const result = await widgetService.recordSpin(data);
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, ...result }));
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to record spin' }));
            }
          });
          return;
        }
        
        // POST /api/widget/prize-accepted
        if (req.url === '/api/widget/prize-accepted' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { widgetService } = await import('../services/widgetService');
              await widgetService.recordPrizeAcceptance(data);
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to record prize acceptance' }));
            }
          });
          return;
        }
        
        // POST /api/widget/impression
        if (req.url === '/api/widget/impression' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { widgetAnalytics } = await import('../services/widgetAnalyticsService');
              const impressionId = await widgetAnalytics.trackImpression(data);
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, impressionId }));
            } catch (error) {
              console.error('[DevServer] Failed to track impression:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to track impression' }));
            }
          });
          return;
        }
        
        // POST /api/widget/event
        if (req.url === '/api/widget/event' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { widgetAnalytics } = await import('../services/widgetAnalyticsService');
              await widgetAnalytics.trackEvent(data);
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              console.error('[DevServer] Failed to track event:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to track event' }));
            }
          });
          return;
        }
        
        // POST /api/widget/update-impression-time
        if (req.url === '/api/widget/update-impression-time' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { widgetAnalytics } = await import('../services/widgetAnalyticsService');
              await widgetAnalytics.updateImpressionTime(data.sessionId, data.timeOnWidget * 1000);
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              console.error('[DevServer] Failed to update impression time:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to update impression time' }));
            }
          });
          return;
        }
        
        // OPTIONS handler for CORS preflight
        if (req.url?.startsWith('/api/widget/') && req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.setHeader('Access-Control-Max-Age', '86400');
          res.statusCode = 204;
          res.end();
          return;
        }
        
        next();
      });
    }
  };
}