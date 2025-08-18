export interface JackpotSymbol {
  id: string;
  label: string;
  icon: string;
  asset?: string;
  color?: string;
}

export interface ReelConfig {
  id: string;
  symbols: string[];
  weights: Record<string, number>;
  visibleWindow: number;
  stopMode: 'index' | 'symbol';
}

export interface PayoutRule {
  id: string;
  pattern: [string, string, string];
  rewardTierId: string;
  nearMiss?: boolean;
}

export interface RewardTier {
  id: string;
  name: string;
  description: string;
  couponConfig?: {
    code?: string;
    discount: number;
    type: 'percentage' | 'fixed';
    minPurchase?: number;
  };
}

export interface AppearanceConfig {
  machineFrame: {
    style: string;
    color: string;
    borderRadius: number;
  };
  reelMask: {
    style: string;
    opacity: number;
  };
  symbolStyle: {
    size: number;
    spacing: number;
  };
  lights: {
    enabled: boolean;
    color: string;
    pattern: string;
  };
  glow: boolean;
  shadow: boolean;
  background: string;
  designThemeId?: string;
}

export interface HandleConfig {
  style: {
    shape: 'classic' | 'modern' | 'minimal';
    size: 'small' | 'medium' | 'large';
    color: string;
  };
  behavior: {
    pullDistanceThreshold: number;
    elasticity: number;
    haptics: boolean;
  };
  ctaText: string;
}

export interface SoundConfig {
  handlePull?: string;
  reelTick?: string;
  reelStop?: string;
  winFanfare?: string;
  nearMiss?: string;
  volumes: {
    master: number;
    effects: number;
  };
}

export interface JackpotConfig {
  id: string;
  name: string;
  symbols: JackpotSymbol[];
  reels: ReelConfig[];
  payouts: PayoutRule[];
  rewards: RewardTier[];
  appearance: AppearanceConfig;
  handle: HandleConfig;
  sounds: SoundConfig;
  widgetConfig?: Record<string, unknown>;
  captureConfig?: Record<string, unknown>;
  scheduleConfig?: Record<string, unknown>;
}
