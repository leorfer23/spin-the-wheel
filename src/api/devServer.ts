// Development server middleware for widget API
import type { Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';

// Lazy-load Supabase client to avoid initialization during config loading
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    // Use SERVICE ROLE KEY to bypass RLS for widget API
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ufliwvyssoqqbejydyjg.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.VITE_SERVICE_ROLE_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGl3dnlzc29xcWJlanlkeWpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTY1MTU4OCwiZXhwIjoyMDY3MjI3NTg4fQ.PItcPs_CP4Wu46RLDPa5FObfCNPmPBpieKjIxg4-NfE';
    
    console.log('[DevServer] Initializing Supabase with service role for RLS bypass');
    
    supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: 'spinawheel'
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
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
        
        // GET /api/widget/store/:storeId/active-wheels (plural - returns all active wheels)
        if (req.url?.match(/^\/api\/widget\/store\/[^\/]+\/active-wheels/) && req.method === 'GET') {
          const urlParts = req.url.split('?');
          const matches = urlParts[0].match(/\/api\/widget\/store\/([^\/]+)\/active-wheels/);
          const storeId = matches?.[1] || '';
          
          console.log('[DevServer] Active wheels endpoint called');
          console.log('[DevServer] Store ID:', storeId, 'Type:', typeof storeId);
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Store-ID');
          res.setHeader('Cache-Control', 'public, max-age=300');
          
          try {
            // Ensure storeId is a string
            const storeIdString = String(storeId);
            console.log('[DevServer] Querying with storeId:', storeIdString, 'Type:', typeof storeIdString);
            
            // Query all active wheels for this store - MUST use spinawheel schema
            const { data: wheels, error } = await (getSupabaseClient() as any)
              .schema('spinawheel')
              .from('wheels')
              .select('*')
              .eq('tiendanube_store_id', storeIdString)
              .eq('is_active', true)
              .order('created_at', { ascending: false });
            
            console.log('[DevServer] Supabase query error:', error);
            console.log('[DevServer] Raw query results:', {
              storeId: storeIdString,
              wheelsFound: wheels?.length || 0,
              wheels: wheels?.map((w: any) => ({ 
                id: w.id, 
                name: w.name, 
                is_active: w.is_active,
                tiendanube_store_id: w.tiendanube_store_id,
                has_schedule: !!w.schedule_config,
                schedule_enabled: w.schedule_config?.enabled
              }))
            });
            
            if (error || !wheels || wheels.length === 0) {
              // Let's also check without the is_active filter to debug
              const { data: allWheels, error: allError } = await (getSupabaseClient() as any)
                .schema('spinawheel')
                .from('wheels')
                .select('id, name, is_active, tiendanube_store_id')
                .eq('tiendanube_store_id', storeIdString);
              
              console.log('[DevServer] Debug - All wheels for store (including inactive):', {
                storeIdQueried: storeIdString,
                error: allError,
                wheelsFound: allWheels?.length || 0,
                wheels: allWheels
              });
              
              // Also check ALL wheels to see what store IDs exist
              const { data: sampleWheels } = await (getSupabaseClient() as any)
                .schema('spinawheel')
                .from('wheels')
                .select('tiendanube_store_id, name')
                .limit(10);
              
              console.log('[DevServer] Sample store IDs in database:', sampleWheels?.map((w: any) => ({
                store_id: w.tiendanube_store_id,
                type: typeof w.tiendanube_store_id,
                name: w.name
              })));
              
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'No active wheels found for this store' }));
              return;
            }
            
            // Transform all wheels to widget format
            const widgetConfigs = wheels.map((wheel: any) => {
              const styleConfig = (wheel.style_config || {}) as any;
              
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
                  const handleConfig = (wheel.wheel_handle_config || wheel.handle_config || {}) as any;
                  
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
            
            console.log('[DevServer] Returning', widgetConfigs.length, 'wheel configs');
            res.statusCode = 200;
            res.end(JSON.stringify(widgetConfigs));
            
          } catch (err) {
            console.error('[DevServer] Error querying Supabase:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
          
          return;
        }
        
        // GET /api/widget/store/:storeId/active-wheel (singular - for backward compatibility)
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
            // Query the wheel directly - MUST use spinawheel schema
            const { data: wheel, error } = await (getSupabaseClient() as any)
              .schema('spinawheel')
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
              const { widgetServiceServer } = await import('../services/widgetServiceServer');
              const result = await widgetServiceServer.recordSpin(data);
              
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
        
        // POST /api/widget/track - Consolidated tracking endpoint
        if (req.url === '/api/widget/track' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            let data: any;
            try {
              data = JSON.parse(body);
              const { type, ...trackingData } = data;
              
              let result;
              switch (type) {
                case 'impression':
                  const { widgetAnalytics: impressionAnalytics } = await import('../services/widgetAnalyticsServiceServer');
                  const impressionId = await impressionAnalytics.trackImpression(trackingData);
                  result = { success: true, id: impressionId, type };
                  break;
                  
                case 'prize-accepted':
                  const { widgetServiceServer } = await import('../services/widgetServiceServer');
                  await widgetServiceServer.recordPrizeAcceptance(trackingData);
                  result = { success: true, type };
                  break;
                  
                case 'event':
                  const { widgetAnalytics: eventAnalytics } = await import('../services/widgetAnalyticsServiceServer');
                  await eventAnalytics.trackEvent(trackingData);
                  result = { success: true, type };
                  break;
                  
                default:
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: `Unknown tracking type: ${type}` }));
                  return;
              }
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (error) {
              console.error(`[DevServer] Failed to track ${data?.type}:`, error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: `Failed to track ${data?.type}` }));
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