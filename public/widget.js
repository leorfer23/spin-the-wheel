/*!
 * SpinWheel Pro Widget Loader
 * (c) 2024 SpinWheel Pro
 * 
 * This script is embedded on customer websites to load the spin wheel widget
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.__spinWheelProInitialized) return;
  window.__spinWheelProInitialized = true;

  // Get configuration from script tag
  const currentScript = document.currentScript || document.querySelector('script[data-wheel-id]');
  if (!currentScript) {
    console.error('[SpinWheel Pro] No script tag found with data-wheel-id');
    return;
  }

  // Widget configuration
  const config = {
    wheelId: currentScript.getAttribute('data-wheel-id'),
    apiUrl: currentScript.src.replace(/\/widget\.js.*$/, ''),
    trigger: currentScript.getAttribute('data-trigger') || 'exit_intent',
    position: currentScript.getAttribute('data-position') || 'center',
    delaySeconds: parseInt(currentScript.getAttribute('data-delay') || '0'),
    scrollPercentage: parseInt(currentScript.getAttribute('data-scroll-percentage') || '50'),
    testMode: currentScript.getAttribute('data-test') === 'true',
    shopifyShop: currentScript.getAttribute('data-shopify-shop'),
    storeId: currentScript.getAttribute('data-store-id')
  };

  // Validate required config
  if (!config.wheelId) {
    console.error('[SpinWheel Pro] Missing required data-wheel-id attribute');
    return;
  }

  // Check if already shown in this session
  const sessionKey = `spinwheel_shown_${config.wheelId}`;
  if (sessionStorage.getItem(sessionKey) && !config.testMode) {
    console.log('[SpinWheel Pro] Already shown in this session');
    return;
  }

  // Create widget container
  const container = document.createElement('div');
  container.id = 'spinwheel-widget-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483647;
    display: none;
    pointer-events: none;
  `;
  
  // Add loading state
  container.innerHTML = `
    <div id="spinwheel-backdrop" style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: auto;
    "></div>
    <div id="spinwheel-content" style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: auto;
    ">
      <div id="spinwheel-loading" style="
        width: 50px;
        height: 50px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #8B5CF6;
        border-radius: 50%;
        animation: spinwheel-spin 1s linear infinite;
      "></div>
    </div>
    <style>
      @keyframes spinwheel-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // Append to body when DOM is ready
  if (document.body) {
    document.body.appendChild(container);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(container);
    });
  }

  // Load widget bundle
  let widgetLoaded = false;
  function loadWidget() {
    if (widgetLoaded) return;
    widgetLoaded = true;

    // Show container
    container.style.display = 'block';
    setTimeout(() => {
      document.getElementById('spinwheel-backdrop').style.opacity = '1';
      document.getElementById('spinwheel-content').style.opacity = '1';
    }, 10);

    // Mark as shown
    sessionStorage.setItem(sessionKey, 'true');

    // Load the main widget bundle
    const script = document.createElement('script');
    script.src = config.apiUrl + '/widget-bundle.js';
    script.onerror = function() {
      console.error('[SpinWheel Pro] Failed to load widget bundle');
      container.style.display = 'none';
    };
    script.onload = function() {
      if (window.SpinWheelWidget && window.SpinWheelWidget.init) {
        window.SpinWheelWidget.init(config, container);
      } else {
        console.error('[SpinWheel Pro] Widget initialization failed');
        container.style.display = 'none';
      }
    };
    document.head.appendChild(script);

    // Load widget styles
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = config.apiUrl + '/widget.css';
    document.head.appendChild(styles);
  }

  // Close widget function
  window.SpinWheelWidget = window.SpinWheelWidget || {};
  window.SpinWheelWidget.close = function() {
    document.getElementById('spinwheel-backdrop').style.opacity = '0';
    document.getElementById('spinwheel-content').style.opacity = '0';
    setTimeout(() => {
      container.style.display = 'none';
    }, 300);
  };

  // Trigger handlers
  switch (config.trigger) {
    case 'immediate':
      // Load immediately
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadWidget);
      } else {
        loadWidget();
      }
      break;

    case 'delay':
      // Load after delay
      setTimeout(loadWidget, config.delaySeconds * 1000);
      break;

    case 'scroll':
      // Load on scroll percentage
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
      window.addEventListener('scroll', checkScroll);
      checkScroll(); // Check initial position
      break;

    case 'exit_intent':
      // Load on exit intent (desktop only)
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
      break;

    case 'click':
      // Load on click of elements with class 'spinwheel-trigger'
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('spinwheel-trigger') || 
            e.target.closest('.spinwheel-trigger')) {
          e.preventDefault();
          loadWidget();
        }
      });
      break;
  }

  // Public API
  window.SpinWheelWidget.show = loadWidget;
  
  // Log initialization
  if (config.testMode) {
    console.log('[SpinWheel Pro] Widget initialized with config:', config);
  }

})();