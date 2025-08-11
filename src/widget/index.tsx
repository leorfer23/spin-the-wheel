import React from 'react';
import ReactDOM from 'react-dom/client';
import { SpinWheelWidget } from './SpinWheelWidget';
import type { WheelWidgetConfig } from '@/types/widget';
import './widget-main.css'; // Single entry point for all widget styles

// Global widget interface
interface CoolPopsWidgetGlobal {
  init: (config: any) => void;
  close: () => void;
  instance?: any;
}

interface WidgetInitConfig {
  apiUrl: string;
  wheelId: string;
  wheelConfig: WheelWidgetConfig;
  container: HTMLElement;
  platform: string;
  storeData: {
    id: string;
    name?: string;
    currency?: string;
    language?: string;
  };
  callbacks: {
    onClose: () => void;
    onSpin: (result: any) => Promise<void>;
    onPrizeAccepted: (prize: any, email: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    CoolPopsWidget: CoolPopsWidgetGlobal;
  }
}

// Initialize widget
window.CoolPopsWidget = {
  init: async (config: WidgetInitConfig) => {
    try {
      // Check if this is a handle-based widget
      const isHandleWidget = config.wheelConfig?.handleConfig?.type === 'pull_tab' || 
                            config.wheelConfig?.handleConfig?.type === 'button';

      if (isHandleWidget) {
        // For handle-based widgets, create a new container and render directly to body
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'coolpops-widget-root';
        // Make the container take full viewport but be transparent
        // Don't set pointer-events: none here as it will block the handle
        widgetContainer.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          z-index: 2147483647;
        `;
        document.body.appendChild(widgetContainer);

        // Hide the modal container since we're using our own
        if (config.container) {
          config.container.style.display = 'none';
        }

        // Create React root and render widget with handle
        const root = ReactDOM.createRoot(widgetContainer);
        window.CoolPopsWidget.instance = root;

        root.render(
          <React.StrictMode>
            <SpinWheelWidget
              wheelConfig={config.wheelConfig}
              platform={config.platform}
              storeData={config.storeData}
              callbacks={{
                ...config.callbacks,
                onClose: () => {
                  // Clean up our container
                  widgetContainer.remove();
                  config.callbacks.onClose();
                }
              }}
            />
          </React.StrictMode>
        );
      } else {
        // For non-handle widgets, use the existing modal approach
        // Remove loading state
        const loadingElement = document.getElementById('coolpops-loading');
        if (loadingElement) {
          loadingElement.style.display = 'none';
        }

        // Get content element
        const contentElement = document.getElementById('coolpops-content');
        if (!contentElement) {
          throw new Error('Widget content element not found');
        }

        // Create React root and render widget
        const root = ReactDOM.createRoot(contentElement);
        window.CoolPopsWidget.instance = root;

        root.render(
          <React.StrictMode>
            <SpinWheelWidget
              wheelConfig={config.wheelConfig}
              platform={config.platform}
              storeData={config.storeData}
              callbacks={config.callbacks}
            />
          </React.StrictMode>
        );
      }

    } catch (error) {
      // Handle initialization error silently
      config.callbacks.onClose();
    }
  },

  close: () => {
    // Clean up React root if it exists
    if (window.CoolPopsWidget.instance) {
      window.CoolPopsWidget.instance.unmount();
      window.CoolPopsWidget.instance = undefined;
    }
    // Clean up any widget containers
    const widgetRoot = document.getElementById('coolpops-widget-root');
    if (widgetRoot) {
      widgetRoot.remove();
    }
  }
};