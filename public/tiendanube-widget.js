/*!
 * CoolPops Widget Loader for Tienda Nube
 * (c) 2024 CoolPops
 * 
 * This script is specifically designed for Tienda Nube integration
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.__coolPopsInitialized) return;
  window.__coolPopsInitialized = true;

  // Load schedule validator
  const scheduleScript = document.createElement('script');
  scheduleScript.src = (document.currentScript?.src.includes('localhost') ? '' : 'https://www.rooleta.com/') + 'schedule-validator.js';
  document.head.appendChild(scheduleScript);

  // Get current script reference - IMPORTANT: must be captured immediately
  const currentScript = document.currentScript || document.querySelector('script[src*="tiendanube-widget.js"]');
  const scriptStoreId = currentScript?.getAttribute('data-store-id');
  const platformStoreId = window.LS?.store?.id || document.querySelector('[data-store-id]')?.dataset.storeId;
  const storeId = scriptStoreId || platformStoreId;

  if (!storeId) {
    console.error('[CoolPops Widget] No store ID found. Please add data-store-id to the script tag.');
    return;
  }

  // Detect API URL from script source
  const scriptSrc = currentScript?.src || '';
  const isLocalScript = scriptSrc.includes('localhost');
  const isProduction = scriptSrc.includes('rooleta.com') || scriptSrc.includes('vercel.app');
  const detectedApiUrl = isProduction ? 'https://www.rooleta.com' : 
                         isLocalScript ? `${window.location.protocol}//${window.location.host}` : 
                         'https://www.rooleta.com';
  
  // Configuration
  const config = {
    // Development mode detection
    isDevelopment: isLocalScript || window.location.hostname === 'localhost' || window.location.hostname.includes('demo.tiendanube'),
    // Allow override via global variable or script parameter
    apiUrl: window.__coolPopsApiUrl || 
            currentScript?.getAttribute('data-api-url') ||
            detectedApiUrl,
    
    // Store information
    storeId: storeId,
    storeData: window.LS || window.TiendaNube || {},
    
    // Widget configuration (can be overridden by script parameters)
    trigger: currentScript?.getAttribute('data-trigger') || 'delay',
    position: currentScript?.getAttribute('data-position') || 'center',
    delaySeconds: parseInt(currentScript?.getAttribute('data-delay') || '1'),
    scrollPercentage: parseInt(currentScript?.getAttribute('data-scroll-percentage') || '50'),
    testMode: currentScript?.getAttribute('data-test') === 'true',
    
    // Context for wheel selection
    context: {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: window.LS?.store?.language || navigator.language,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    }
  };

  // Log configuration in development
  if (config.isDevelopment || config.testMode) {
    console.log('[CoolPops Widget] Script source:', scriptSrc);
    console.log('[CoolPops Widget] Detected API URL:', detectedApiUrl);
    console.log('[CoolPops Widget] Configuration:', config);
  }

  // Session management for analytics
  function getSessionId() {
    let sessionId = sessionStorage.getItem('coolpops_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('coolpops_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Analytics tracking variables
  let impressionId = null;
  let impressionStartTime = null;
  
  // Track widget impression
  async function trackImpression() {
    try {
      impressionStartTime = Date.now();
      const response = await fetch(`${config.apiUrl}/api/widget/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'impression',
          wheelId: wheelConfig?.id,
          storeId: config.storeId,
          sessionId: getSessionId(),
          triggerType: config.trigger,
          pageUrl: window.location.href,
          referrerUrl: document.referrer,
          platform: 'tiendanube',
          deviceType: config.context.isMobile ? 'mobile' : 'desktop',
          browser: navigator.userAgent,
          userAgent: navigator.userAgent
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        impressionId = data.impressionId;
        if (config.isDevelopment) {
          console.log('[CoolPops Widget] Impression tracked:', impressionId);
        }
      }
    } catch (error) {
      console.error('[CoolPops Widget] Failed to track impression:', error);
    }
  }
  
  // Track widget events
  async function trackEvent(eventType, eventData = {}) {
    try {
      await fetch(`${config.apiUrl}/api/widget/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'event',
          wheelId: wheelConfig?.id,
          storeId: config.storeId,
          sessionId: getSessionId(),
          impressionId: impressionId,
          eventType: eventType,
          eventData: eventData
        })
      });
      if (config.isDevelopment) {
        console.log('[CoolPops Widget] Event tracked:', eventType, eventData);
      }
    } catch (error) {
      console.error('[CoolPops Widget] Failed to track event:', error);
    }
  }

  // We'll set session key after we know which wheel to show
  let sessionKey = null;
  let wheelConfig = null;
  let tabElement = null;
  let container = null;

  // Create tab element for tab handle type
  function createTabElement(handleConfig) {
    const tab = document.createElement('div');
    tab.id = 'coolpops-tab';
    
    const position = handleConfig.style?.position || 'right';
    const backgroundColor = handleConfig.style?.backgroundColor || '#8B5CF6';
    const textColor = handleConfig.style?.textColor || '#FFFFFF';
    
    tab.style.cssText = `
      position: fixed;
      ${position === 'right' ? 'right: 0' : 'left: 0'};
      top: 50%;
      transform: translateY(-50%) ${position === 'right' ? 'rotate(-90deg) translateX(50%)' : 'rotate(90deg) translateX(-50%)'};
      transform-origin: ${position === 'right' ? 'right center' : 'left center'};
      background-color: ${backgroundColor};
      color: ${textColor};
      padding: 12px 24px;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 16px;
      font-weight: 600;
      z-index: 2147483646;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `;
    
    tab.innerHTML = handleConfig.text || 'Win Prizes!';
    
    // Add hover effect
    tab.addEventListener('mouseenter', function() {
      tab.style.transform = `translateY(-50%) ${position === 'right' ? 'rotate(-90deg) translateX(45%)' : 'rotate(90deg) translateX(-45%)'} scale(1.05)`;
    });
    
    tab.addEventListener('mouseleave', function() {
      tab.style.transform = `translateY(-50%) ${position === 'right' ? 'rotate(-90deg) translateX(50%)' : 'rotate(90deg) translateX(-50%)'}`;
    });
    
    // Click handler
    tab.addEventListener('click', function() {
      if (container) {
        showModal();
      }
    });
    
    return tab;
  }

  // Create widget container
  function createModalContainer() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'coolpops-widget-container';
    modalContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      display: none;
      pointer-events: none;
    `;
    
    // Add container HTML
    modalContainer.innerHTML = `
      <div id="coolpops-backdrop" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: auto;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      "></div>
      <div id="coolpops-content" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        max-width: 95vw;
        max-height: 95vh;
      ">
        <div id="coolpops-loading" style="
          width: 60px;
          height: 60px;
          position: relative;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border: 4px solid rgba(139, 92, 246, 0.2);
            border-radius: 50%;
          "></div>
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border: 4px solid transparent;
            border-top-color: #8B5CF6;
            border-radius: 50%;
            animation: coolpops-spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
          "></div>
        </div>
      </div>
      <style>
        @keyframes coolpops-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        #coolpops-widget-container * {
          box-sizing: border-box;
        }
        
        @media (max-width: 768px) {
          #coolpops-content {
            max-width: 100vw;
            max-height: 100vh;
          }
        }
      </style>
    `;
    
    return modalContainer;
  }

  // Show modal
  function showModal() {
    if (!container) return;
    
    container.style.display = 'block';
    setTimeout(() => {
      document.getElementById('coolpops-backdrop').style.opacity = '1';
      document.getElementById('coolpops-content').style.opacity = '1';
      document.getElementById('coolpops-content').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    
    // Track impression when modal is shown
    trackImpression();
    trackEvent('widget_view', { handleType: wheelConfig?.handleConfig?.type });
  }

  // Load widget configuration and bundle
  let widgetLoaded = false;
  async function loadWidget() {
    if (widgetLoaded) return;
    widgetLoaded = true;

    try {

      // Fetch all active wheels for this store
      const contextParams = new URLSearchParams({
        url: config.context.url,
        referrer: config.context.referrer,
        userAgent: config.context.userAgent,
        language: config.context.language,
        isMobile: config.context.isMobile.toString()
      });

      // Fetch all active wheels (let client-side filter by schedule)
      const apiUrl = `${config.apiUrl}/api/widget/store/${config.storeId}/active-wheels?${contextParams}`;
      console.log('[CoolPops Widget] Fetching active wheels from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-Store-ID': config.storeId
        }
      });

      console.log('[CoolPops Widget] API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CoolPops Widget] API Error Response:', errorText);
        throw new Error(`No active wheels found for this store (${response.status}: ${errorText})`);
      }

      const wheels = await response.json();
      console.log('[CoolPops Widget] Found', wheels.length, 'active wheels');
      
      // Wait for schedule validator to load if not available yet
      let attempts = 0;
      while (!window.ScheduleValidator && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!window.ScheduleValidator) {
        console.error('[CoolPops Widget] Schedule validator not loaded, using first wheel');
        wheelConfig = wheels[0];
      } else {
        // Use schedule validator to select the appropriate wheel
        const validator = new window.ScheduleValidator();
        if (config.isDevelopment || config.testMode) {
          validator.setDebug(true);
        }
        
        // Filter wheels by schedule
        const currentDate = new Date();
        console.log('[CoolPops Widget] Current date/time:', currentDate.toISOString());
        
        wheelConfig = validator.selectActiveWheel(wheels, currentDate);
        
        if (!wheelConfig) {
          throw new Error('No wheels are active at this time based on schedule configuration');
        }
      }
      
      console.log('[CoolPops Widget] Selected wheel:', wheelConfig.id, wheelConfig.name);
      console.log('[CoolPops Widget] Schedule config:', wheelConfig.schedule_config);
      console.log('[CoolPops Widget] Handle config:', wheelConfig.handleConfig);
      console.log('[CoolPops Widget] Wheel segments:', {
        count: wheelConfig.wheelData?.segments?.length,
        segments: wheelConfig.wheelData?.segments
      });
      
      // Now we know which wheel, set session key
      sessionKey = `coolpops_shown_${wheelConfig.id}`;
      
      // Check if already shown (unless in test mode)
      if (sessionStorage.getItem(sessionKey) && !config.testMode && !config.isDevelopment) {
        console.log('[CoolPops Widget] This wheel already shown in session');
        return;
      }
      
      // Mark as shown
      sessionStorage.setItem(sessionKey, 'true');

      // Create modal container
      container = createModalContainer();
      if (document.body) {
        document.body.appendChild(container);
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(container);
        });
      }

      // The widget bundle will handle all display logic including the handle
      // We just need to manage when to load the widget based on trigger settings
      const trigger = wheelConfig.settings?.trigger || config.trigger;
      
      // Store wheel config globally for the widget to access
      window.__coolPopsWheelConfig = wheelConfig;
      
      // For handle-based widgets (tab, bubble, floating), let the widget display immediately
      // The widget will manage its own visibility
      if (wheelConfig.handleConfig?.type === 'tab' || 
          wheelConfig.handleConfig?.type === 'bubble' || 
          wheelConfig.handleConfig?.type === 'floating') {
        // Load widget immediately, it will show its own handle
        console.log('[CoolPops Widget] Handle-based widget detected:', wheelConfig.handleConfig?.type);
        // Widget will be loaded below and will display its own handle
      } else if (trigger === 'immediate') {
        showModal();
      } else if (trigger === 'delay') {
        const delay = (wheelConfig.settings?.triggerDelay || config.delaySeconds) * 1000;
        setTimeout(() => showModal(), delay);
      }

      // Load widget bundle
      const script = document.createElement('script');
      script.src = config.apiUrl + '/widget-bundle.iife.js';
      script.onerror = function() {
        console.error('[CoolPops Widget] Failed to load widget bundle');
        hideWidget();
      };
      script.onload = function() {
        if (window.CoolPopsWidget && window.CoolPopsWidget.init) {
          // Initialize with full configuration
          window.CoolPopsWidget.init({
            ...config,
            wheelId: wheelConfig.id,
            wheelConfig,
            container,
            platform: 'tiendanube',
            storeData: {
              id: config.storeId,
              name: window.LS?.store?.name,
              currency: window.LS?.store?.currency,
              language: window.LS?.store?.language || 'es'
            },
            callbacks: {
              onClose: hideWidget,
              onSpin: handleSpin,
              onPrizeAccepted: handlePrizeAccepted
            }
          });
        } else {
          console.error('[CoolPops Widget] Widget initialization failed');
          hideWidget();
        }
      };
      document.head.appendChild(script);

      // Load widget styles
      const styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.href = config.apiUrl + '/widget-bundle.css';
      document.head.appendChild(styles);

    } catch (error) {
      console.error('[CoolPops Widget] Error loading widget:', error.message);
      console.error('[CoolPops Widget] Full error:', error);
      
      // Show user-friendly message in development mode
      if (config.isDevelopment || config.testMode) {
        document.getElementById('coolpops-loading').innerHTML = `
          <div style="
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            font-family: system-ui, -apple-system, sans-serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          ">
            <h3 style="margin: 0 0 10px 0; color: #ef4444;">Widget Error</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${error.message}</p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Check console for details</p>
          </div>
        `;
        setTimeout(hideWidget, 5000);
      } else {
        hideWidget();
      }
    }
  }

  // Hide widget function
  function hideWidget() {
    // Track close event and time spent
    if (impressionStartTime) {
      const timeSpent = Date.now() - impressionStartTime;
      trackEvent('widget_close', { timeSpentMs: timeSpent });
      
      // Note: We no longer update impression time as that endpoint was removed
    }
    
    document.getElementById('coolpops-backdrop').style.opacity = '0';
    document.getElementById('coolpops-content').style.opacity = '0';
    document.getElementById('coolpops-content').style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => {
      container.style.display = 'none';
    }, 300);
  }

  // Handle spin result
  async function handleSpin(result) {
    try {
      // Track spin event
      trackEvent('spin_complete', {
        segmentId: result.segment?.id,
        prize: result.segment?.value,
        prizeType: result.segment?.prizeType
      });
      
      // Send spin data to API with impression tracking
      const response = await fetch(`${config.apiUrl}/api/widget/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wheelId: wheelConfig?.id,
          storeId: config.storeId,
          sessionId: getSessionId(),
          impressionId: impressionId,
          result: result,
          platform: 'tiendanube',
          timestamp: new Date().toISOString(),
          deviceType: config.context.isMobile ? 'mobile' : 'desktop'
        })
      });
      
      if (!response.ok) {
        console.error('[CoolPops Widget] Failed to record spin');
      } else {
        const data = await response.json();
        // Store spin ID for email capture
        window.__coolPopsSpinId = data.spinId;
      }
    } catch (error) {
      console.error('[CoolPops Widget] Error recording spin:', error);
    }
  }

  // Handle prize acceptance
  async function handlePrizeAccepted(prize, email) {
    try {
      // Track email capture and prize acceptance
      trackEvent('email_captured', {
        capturedAtStep: 'with_prize',
        hasMarketingConsent: true
      });
      
      trackEvent('prize_claimed', {
        prizeType: prize.prizeType,
        prizeValue: prize.value,
        discountCode: prize.discountCode
      });
      
      // If prize includes a discount code, apply it to Tienda Nube
      if (prize.discountCode && window.LS) {
        // Store discount in local storage for checkout
        localStorage.setItem('coolpops_discount', prize.discountCode);
        
        // Show notification
        if (window.LS.notification) {
          window.LS.notification.show({
            type: 'success',
            message: `¡Tu código de descuento ${prize.discountCode} ha sido aplicado!`
          });
        }
      }

      // Send acceptance data to API with analytics
      const response = await fetch(`${config.apiUrl}/api/widget/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'prize-accepted',
          wheelId: wheelConfig?.id,
          storeId: config.storeId,
          sessionId: getSessionId(),
          impressionId: impressionId,
          spinId: window.__coolPopsSpinId,
          prize: prize,
          email: email,
          platform: 'tiendanube',
          timestamp: new Date().toISOString(),
          capturedAtStep: 'with_prize'
        })
      });
      
      if (!response.ok) {
        console.error('[CoolPops Widget] Failed to record prize acceptance');
      }
    } catch (error) {
      console.error('[CoolPops Widget] Error recording prize acceptance:', error);
    }
  }

  // Trigger handlers based on configuration
  function setupTriggers() {
    switch (config.trigger) {
      case 'immediate':
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', loadWidget);
        } else {
          setTimeout(loadWidget, 100); // Small delay for better UX
        }
        break;

      case 'delay':
        setTimeout(loadWidget, config.delaySeconds * 1000);
        break;

      case 'scroll':
        let scrollTriggered = false;
        function checkScroll() {
          if (scrollTriggered) return;
          const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
          if (scrollPercent >= config.scrollPercentage) {
            scrollTriggered = true;
            loadWidget();
            window.removeEventListener('scroll', checkScroll);
          }
        }
        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll();
        break;

      case 'exit_intent':
        if (!('ontouchstart' in window)) {
          let exitIntentTriggered = false;
          document.addEventListener('mouseout', function(e) {
            if (exitIntentTriggered) return;
            if (e.clientY < 10 && e.relatedTarget === null) {
              exitIntentTriggered = true;
              loadWidget();
            }
          });
        }
        // Fallback for mobile: show after 30 seconds
        setTimeout(() => {
          if (!widgetLoaded && 'ontouchstart' in window) {
            loadWidget();
          }
        }, 30000);
        break;

      case 'click':
        document.addEventListener('click', function(e) {
          const target = e.target;
          if (target.classList.contains('coolpops-trigger') || 
              target.closest('.coolpops-trigger')) {
            e.preventDefault();
            loadWidget();
          }
        });
        break;

      case 'onfirstinteraction':
        // Tienda Nube specific: trigger on first user interaction
        let interactionTriggered = false;
        const interactionHandler = function() {
          if (!interactionTriggered) {
            interactionTriggered = true;
            loadWidget();
            // Remove all listeners
            ['click', 'touchstart', 'mousemove', 'scroll'].forEach(event => {
              document.removeEventListener(event, interactionHandler);
            });
          }
        };
        ['click', 'touchstart', 'mousemove', 'scroll'].forEach(event => {
          document.addEventListener(event, interactionHandler, { once: true, passive: true });
        });
        break;
    }
  }

  // Initialize triggers
  setupTriggers();

  // Public API
  window.CoolPopsWidget = window.CoolPopsWidget || {};
  window.CoolPopsWidget.show = loadWidget;
  window.CoolPopsWidget.hide = hideWidget;
  window.CoolPopsWidget.config = config;
  
  // Debug helpers
  window.CoolPopsWidget.debug = function() {
    console.log('[CoolPops Widget] Debug Info:', {
      config: config,
      sessionKey: sessionKey,
      wheelConfig: wheelConfig,
      widgetLoaded: widgetLoaded,
      sessionStorage: {
        keys: Object.keys(sessionStorage).filter(k => k.includes('coolpops')),
        values: Object.keys(sessionStorage).filter(k => k.includes('coolpops')).reduce((acc, k) => {
          acc[k] = sessionStorage.getItem(k);
          return acc;
        }, {})
      }
    });
  };
  
  window.CoolPopsWidget.reset = function() {
    console.log('[CoolPops Widget] Resetting session...');
    Object.keys(sessionStorage).filter(k => k.includes('coolpops')).forEach(k => sessionStorage.removeItem(k));
    widgetLoaded = false;
    sessionKey = null;
    wheelConfig = null;
    console.log('[CoolPops Widget] Session reset complete. Call CoolPopsWidget.show() to test again.');
  };

  // Tienda Nube specific: Apply discount on checkout
  if (window.LS && window.LS.event) {
    window.LS.event.on('checkout:start', function() {
      const discount = localStorage.getItem('coolpops_discount');
      if (discount) {
        // Apply discount code to checkout
        if (window.LS.checkout && window.LS.checkout.setDiscount) {
          window.LS.checkout.setDiscount(discount);
        }
      }
    });
  }

})();