import React from 'react';
import ReactDOM from 'react-dom/client';
import { SpinWheelWidget } from './SpinWheelWidget';
import type { WheelWidgetConfig } from '@/types/widget';
import './widget.css';
import './coolpops-widget.css';

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

    } catch (error) {
      console.error('[CoolPops Widget] Initialization error:', error);
      config.callbacks.onClose();
    }
  },

  close: () => {
    // Clean up React root if it exists
    if (window.CoolPopsWidget.instance) {
      window.CoolPopsWidget.instance.unmount();
      window.CoolPopsWidget.instance = undefined;
    }
  }
};