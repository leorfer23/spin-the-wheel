import type { 
  Campaign, 
  CampaignEvaluationResult, 
  WidgetContext,
  PageType 
} from '@/types/campaign';

export class CampaignService {
  /**
   * Find the best active campaign for the given context
   */
  static evaluateCampaigns(
    campaigns: Campaign[], 
    context: WidgetContext
  ): CampaignEvaluationResult {
    // Filter active campaigns
    const activeCampaigns = campaigns.filter(campaign => {
      // Check if campaign is active
      if (!campaign.isActive) return false;
      
      // Check date range
      const now = new Date(context.timestamp);
      const start = new Date(campaign.startDate);
      const end = new Date(campaign.endDate);
      
      if (now < start || now > end) return false;
      
      // Check schedule
      if (!this.isInSchedule(campaign, context)) return false;
      
      // Check targeting
      if (!this.matchesTargeting(campaign, context)) return false;
      
      return true;
    });

    if (activeCampaigns.length === 0) {
      return {
        eligible: false,
        reason: 'No active campaigns match the current context'
      };
    }

    // Sort by priority (highest first)
    activeCampaigns.sort((a, b) => b.priority - a.priority);
    
    // Return the highest priority campaign
    return {
      eligible: true,
      campaign: activeCampaigns[0],
      reason: `Selected campaign: ${activeCampaigns[0].name} (priority: ${activeCampaigns[0].priority})`
    };
  }

  /**
   * Check if current time matches campaign schedule
   */
  private static isInSchedule(campaign: Campaign, context: WidgetContext): boolean {
    const schedule = campaign.schedule;
    if (!schedule) return true; // No schedule means always show

    const now = new Date(context.timestamp);
    
    // Check day of week
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      const currentDay = now.getDay();
      if (!schedule.daysOfWeek.includes(currentDay)) {
        return false;
      }
    }
    
    // Check hour of day
    if (schedule.hoursOfDay) {
      const currentHour = now.getHours();
      const { start, end } = schedule.hoursOfDay;
      
      if (start <= end) {
        // Normal range (e.g., 9-17)
        if (currentHour < start || currentHour >= end) return false;
      } else {
        // Overnight range (e.g., 22-2)
        if (currentHour < start && currentHour >= end) return false;
      }
    }
    
    // Check blackout dates
    if (schedule.blackoutDates && schedule.blackoutDates.length > 0) {
      const todayStr = now.toISOString().split('T')[0];
      if (schedule.blackoutDates.includes(todayStr)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if context matches campaign targeting
   */
  private static matchesTargeting(campaign: Campaign, context: WidgetContext): boolean {
    const targeting = campaign.targeting;
    if (!targeting) return true; // No targeting means show to everyone

    // Page targeting
    if (targeting.pages) {
      if (!this.matchesPageTargeting(targeting.pages, context)) {
        return false;
      }
    }

    // Device targeting
    if (targeting.devices) {
      const deviceType = context.isMobile ? 'mobile' : 'desktop';
      
      if (targeting.devices.includeDevices && 
          !targeting.devices.includeDevices.includes(deviceType)) {
        return false;
      }
      
      if (targeting.devices.excludeDevices && 
          targeting.devices.excludeDevices.includes(deviceType)) {
        return false;
      }
    }

    // Audience targeting
    if (targeting.audience) {
      if (!this.matchesAudienceTargeting(targeting.audience, context)) {
        return false;
      }
    }

    // Geo targeting
    if (targeting.geo && context.geo) {
      if (!this.matchesGeoTargeting(targeting.geo, context.geo)) {
        return false;
      }
    }

    // Traffic source targeting
    if (targeting.trafficSource) {
      if (!this.matchesTrafficSourceTargeting(targeting.trafficSource, context)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check page targeting
   */
  private static matchesPageTargeting(
    pages: any, 
    context: WidgetContext
  ): boolean {
    // URL pattern matching
    if (pages.includeUrls && pages.includeUrls.length > 0) {
      const matches = pages.includeUrls.some((pattern: string) => 
        this.matchesUrlPattern(context.url, pattern)
      );
      if (!matches) return false;
    }

    if (pages.excludeUrls && pages.excludeUrls.length > 0) {
      const matches = pages.excludeUrls.some((pattern: string) => 
        this.matchesUrlPattern(context.url, pattern)
      );
      if (matches) return false;
    }

    // Page type matching
    if (context.pageType) {
      if (pages.includePages && !pages.includePages.includes(context.pageType)) {
        return false;
      }
      
      if (pages.excludePages && pages.excludePages.includes(context.pageType)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check audience targeting
   */
  private static matchesAudienceTargeting(
    audience: any,
    context: WidgetContext
  ): boolean {
    // Language targeting
    if (audience.language && audience.language.length > 0) {
      const userLang = context.language.split('-')[0]; // Get primary language
      if (!audience.language.includes(userLang)) {
        return false;
      }
    }

    // Cart value targeting
    if (audience.cartValue && context.cartValue !== undefined) {
      const { min, max } = audience.cartValue;
      if (min !== undefined && context.cartValue < min) return false;
      if (max !== undefined && context.cartValue > max) return false;
    }

    return true;
  }

  /**
   * Check geo targeting
   */
  private static matchesGeoTargeting(
    geoTarget: any,
    userGeo: any
  ): boolean {
    if (geoTarget.includeCountries && geoTarget.includeCountries.length > 0) {
      if (!userGeo.country || !geoTarget.includeCountries.includes(userGeo.country)) {
        return false;
      }
    }

    if (geoTarget.excludeCountries && geoTarget.excludeCountries.length > 0) {
      if (userGeo.country && geoTarget.excludeCountries.includes(userGeo.country)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check traffic source targeting
   */
  private static matchesTrafficSourceTargeting(
    trafficTarget: any,
    context: WidgetContext
  ): boolean {
    // Referrer matching
    if (context.referrer) {
      if (trafficTarget.includeReferrers && trafficTarget.includeReferrers.length > 0) {
        const matches = trafficTarget.includeReferrers.some((pattern: string) =>
          context.referrer.includes(pattern)
        );
        if (!matches) return false;
      }

      if (trafficTarget.excludeReferrers && trafficTarget.excludeReferrers.length > 0) {
        const matches = trafficTarget.excludeReferrers.some((pattern: string) =>
          context.referrer.includes(pattern)
        );
        if (matches) return false;
      }
    }

    // UTM parameter matching
    if (context.utm) {
      if (trafficTarget.includeUtmSources && 
          !trafficTarget.includeUtmSources.includes(context.utm.source)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Match URL against pattern (supports wildcards)
   */
  private static matchesUrlPattern(url: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '\\?')
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  }

  /**
   * Detect page type from URL (Tienda Nube specific)
   */
  static detectPageType(url: string): PageType {
    const path = new URL(url).pathname;
    
    // Tienda Nube URL patterns
    if (path === '/' || path === '') return 'home';
    if (path.includes('/productos/') || path.includes('/products/')) return 'product';
    if (path.includes('/categorias/') || path.includes('/categories/')) return 'category';
    if (path.includes('/carrito') || path.includes('/cart')) return 'cart';
    if (path.includes('/checkout')) return 'checkout';
    if (path.includes('/buscar') || path.includes('/search')) return 'search';
    if (path.includes('/blog') || path.includes('/noticias')) return 'blog';
    
    return 'other';
  }
}