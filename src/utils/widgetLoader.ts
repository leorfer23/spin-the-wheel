/**
 * Widget loader utility for async script loading and initialization
 */

export interface WidgetConfig {
  wheelId: string;
  apiUrl: string;
  container?: HTMLElement;
  trigger?: {
    type: 'timer' | 'exit-intent' | 'scroll' | 'button';
    delay?: number;
    scrollPercentage?: number;
  };
  whitelist?: string[];
  rateLimit?: {
    maxAttempts: number;
    windowMs: number;
  };
}

export class RateLimiter {
  private attempts: number[] = [];
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  
  constructor(maxAttempts: number = 10, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  canAttempt(): boolean {
    const now = Date.now();
    // Remove old attempts outside the window
    this.attempts = this.attempts.filter(time => now - time < this.windowMs);
    
    if (this.attempts.length >= this.maxAttempts) {
      return false;
    }
    
    this.attempts.push(now);
    return true;
  }
  
  reset(): void {
    this.attempts = [];
  }
}

export class WidgetLoader {
  private static instance: WidgetLoader | null = null;
  private rateLimiter: RateLimiter;
  private loadedScripts: Set<string> = new Set();
  private styleElement: HTMLStyleElement | null = null;
  
  constructor(config?: { maxAttempts?: number; windowMs?: number }) {
    this.rateLimiter = new RateLimiter(
      config?.maxAttempts || 10,
      config?.windowMs || 60000
    );
  }
  
  static getInstance(): WidgetLoader {
    if (!WidgetLoader.instance) {
      WidgetLoader.instance = new WidgetLoader();
    }
    return WidgetLoader.instance;
  }
  
  /**
   * Load widget script asynchronously
   */
  async loadScript(url: string): Promise<void> {
    // Check if already loaded
    if (this.loadedScripts.has(url)) {
      return Promise.resolve();
    }
    
    // Check rate limit
    if (!this.rateLimiter.canAttempt()) {
      throw new Error('Rate limit exceeded');
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        this.loadedScripts.add(url);
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load script: ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Inject widget styles without conflicts
   */
  injectStyles(css: string): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'coolpops-widget-styles';
      document.head.appendChild(this.styleElement);
    }
    
    // Use high specificity and z-index to avoid conflicts
    const scopedCss = css.replace(/\.coolpops-/g, '.coolpops-widget-container .coolpops-');
    this.styleElement.textContent = scopedCss;
  }
  
  /**
   * Validate domain against whitelist
   */
  validateDomain(whitelist: string[]): boolean {
    if (whitelist.includes('*')) return true;
    
    const currentDomain = window.location.hostname;
    
    return whitelist.some(allowed => {
      if (allowed.startsWith('*.')) {
        const baseDomain = allowed.slice(2);
        return currentDomain.endsWith(baseDomain);
      }
      return currentDomain === allowed;
    });
  }
  
  /**
   * Initialize widget with configuration
   */
  async initialize(config: WidgetConfig): Promise<void> {
    // Validate required fields
    if (!config.wheelId) {
      throw new Error('Wheel ID is required');
    }
    
    if (!config.apiUrl) {
      throw new Error('API URL is required');
    }
    
    // Validate domain if whitelist provided
    if (config.whitelist && !this.validateDomain(config.whitelist)) {
      throw new Error('Domain not whitelisted');
    }
    
    // Create container if not provided
    const container = config.container || this.createDefaultContainer();
    
    // Setup trigger
    if (config.trigger) {
      await this.setupTrigger(config.trigger, () => {
        this.showWidget(container);
      });
    } else {
      // Show immediately if no trigger specified
      this.showWidget(container);
    }
  }
  
  /**
   * Create default widget container
   */
  private createDefaultContainer(): HTMLElement {
    const existing = document.getElementById('coolpops-widget-container');
    if (existing) return existing;
    
    const container = document.createElement('div');
    container.id = 'coolpops-widget-container';
    container.className = 'coolpops-widget-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      pointer-events: none;
    `;
    
    document.body.appendChild(container);
    return container;
  }
  
  /**
   * Setup widget trigger
   */
  private async setupTrigger(
    trigger: WidgetConfig['trigger'],
    callback: () => void
  ): Promise<void> {
    if (!trigger) return;
    
    switch (trigger.type) {
      case 'timer':
        if (trigger.delay) {
          setTimeout(callback, trigger.delay);
        }
        break;
        
      case 'exit-intent':
        this.setupExitIntentTrigger(callback);
        break;
        
      case 'scroll':
        if (trigger.scrollPercentage) {
          this.setupScrollTrigger(trigger.scrollPercentage, callback);
        }
        break;
        
      case 'button':
        // Button trigger handled separately
        break;
    }
  }
  
  /**
   * Setup exit intent trigger
   */
  private setupExitIntentTrigger(callback: () => void): void {
    let triggered = false;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return;
      
      // Check if mouse is leaving viewport from top
      if (e.clientY <= 0 && e.relatedTarget === null) {
        triggered = true;
        callback();
        document.removeEventListener('mouseout', handleMouseLeave);
      }
    };
    
    document.addEventListener('mouseout', handleMouseLeave);
  }
  
  /**
   * Setup scroll percentage trigger
   */
  private setupScrollTrigger(percentage: number, callback: () => void): void {
    let triggered = false;
    
    const handleScroll = () => {
      if (triggered) return;
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const scrollPercentage = (scrolled / scrollHeight) * 100;
      
      if (scrollPercentage >= percentage) {
        triggered = true;
        callback();
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
  }
  
  /**
   * Show widget
   */
  private showWidget(container: HTMLElement): void {
    container.style.pointerEvents = 'auto';
    container.style.display = 'block';
  }
  
  /**
   * Hide widget
   */
  hideWidget(container?: HTMLElement): void {
    const target = container || document.getElementById('coolpops-widget-container');
    if (target) {
      target.style.pointerEvents = 'none';
      target.style.display = 'none';
    }
  }
  
  /**
   * Destroy widget and cleanup
   */
  destroy(): void {
    // Remove style element
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    
    // Remove container
    const container = document.getElementById('coolpops-widget-container');
    if (container) {
      container.remove();
    }
    
    // Clear loaded scripts
    this.loadedScripts.clear();
    
    // Reset rate limiter
    this.rateLimiter.reset();
  }
}