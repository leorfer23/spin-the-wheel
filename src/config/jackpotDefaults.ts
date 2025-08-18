import type { 
  JackpotSymbol, 
  ReelConfig, 
  PayoutRule, 
  RewardTier,
  AppearanceConfig,
  HandleConfig,
  SoundConfig
} from '@/components/dashboard/products/jackpot/types';

export const DEFAULT_JACKPOT_SYMBOLS: JackpotSymbol[] = [
  { id: 'cherry', label: 'Cereza', icon: '🍒', color: '#FF0000' },
  { id: 'lemon', label: 'Limón', icon: '🍋', color: '#FFD700' },
  { id: 'orange', label: 'Naranja', icon: '🍊', color: '#FFA500' },
  { id: 'plum', label: 'Ciruela', icon: '🍇', color: '#8B008B' },
  { id: 'bell', label: 'Campana', icon: '🔔', color: '#FFD700' },
  { id: 'bar', label: 'Bar', icon: '🍫', color: '#8B4513' },
  { id: 'seven', label: 'Siete', icon: '7️⃣', color: '#FF0000' },
  { id: 'diamond', label: 'Diamante', icon: '💎', color: '#00CED1' }
];

export const DEFAULT_REELS: ReelConfig[] = [
  {
    id: 'reel1',
    symbols: ['cherry', 'lemon', 'orange', 'plum', 'bell', 'bar', 'seven', 'diamond'],
    weights: {
      cherry: 20,
      lemon: 20,
      orange: 15,
      plum: 15,
      bell: 10,
      bar: 10,
      seven: 5,
      diamond: 5
    },
    visibleWindow: 3,
    stopMode: 'index'
  },
  {
    id: 'reel2',
    symbols: ['cherry', 'lemon', 'orange', 'plum', 'bell', 'bar', 'seven', 'diamond'],
    weights: {
      cherry: 20,
      lemon: 20,
      orange: 15,
      plum: 15,
      bell: 10,
      bar: 10,
      seven: 5,
      diamond: 5
    },
    visibleWindow: 3,
    stopMode: 'index'
  },
  {
    id: 'reel3',
    symbols: ['cherry', 'lemon', 'orange', 'plum', 'bell', 'bar', 'seven', 'diamond'],
    weights: {
      cherry: 20,
      lemon: 20,
      orange: 15,
      plum: 15,
      bell: 10,
      bar: 10,
      seven: 5,
      diamond: 5
    },
    visibleWindow: 3,
    stopMode: 'index'
  }
];

export const DEFAULT_REWARD_TIERS: RewardTier[] = [
  {
    id: 'jackpot',
    name: 'Jackpot',
    description: '¡Felicidades! Has ganado el premio mayor',
    couponConfig: {
      discount: 50,
      type: 'percentage',
      minPurchase: 0
    }
  },
  {
    id: 'major',
    name: 'Premio Mayor',
    description: '¡Excelente! Has ganado un gran premio',
    couponConfig: {
      discount: 30,
      type: 'percentage',
      minPurchase: 50
    }
  },
  {
    id: 'minor',
    name: 'Premio Menor',
    description: '¡Bien! Has ganado un premio',
    couponConfig: {
      discount: 15,
      type: 'percentage',
      minPurchase: 100
    }
  },
  {
    id: 'consolation',
    name: 'Premio de Consolación',
    description: 'Has ganado un descuento especial',
    couponConfig: {
      discount: 10,
      type: 'percentage',
      minPurchase: 150
    }
  }
];

export const DEFAULT_PAYOUT_RULES: PayoutRule[] = [
  { id: 'p1', pattern: ['seven', 'seven', 'seven'], rewardTierId: 'jackpot' },
  { id: 'p2', pattern: ['diamond', 'diamond', 'diamond'], rewardTierId: 'jackpot' },
  { id: 'p3', pattern: ['bar', 'bar', 'bar'], rewardTierId: 'major' },
  { id: 'p4', pattern: ['bell', 'bell', 'bell'], rewardTierId: 'major' },
  { id: 'p5', pattern: ['plum', 'plum', 'plum'], rewardTierId: 'minor' },
  { id: 'p6', pattern: ['orange', 'orange', 'orange'], rewardTierId: 'minor' },
  { id: 'p7', pattern: ['lemon', 'lemon', 'lemon'], rewardTierId: 'consolation' },
  { id: 'p8', pattern: ['cherry', 'cherry', 'cherry'], rewardTierId: 'consolation' }
];

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  machineFrame: {
    style: 'classic',
    color: '#1a1a2e',
    borderRadius: 16
  },
  reelMask: {
    style: 'default',
    opacity: 0.9
  },
  symbolStyle: {
    size: 80,
    spacing: 10
  },
  lights: {
    enabled: true,
    color: '#FFD700',
    pattern: 'alternating'
  },
  glow: true,
  shadow: true,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  designThemeId: 'classic'
};

export const DEFAULT_HANDLE: HandleConfig = {
  style: {
    shape: 'classic',
    size: 'medium',
    color: '#FF0000'
  },
  behavior: {
    pullDistanceThreshold: 100,
    elasticity: 0.8,
    haptics: true
  },
  ctaText: '¡Tira de la palanca!'
};

export const DEFAULT_SOUNDS: SoundConfig = {
  volumes: {
    master: 0.5,
    effects: 0.7
  }
};

export const DEFAULT_JACKPOT_WIDGET_CONFIG = {
  buttonText: 'Girar',
  buttonColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: 12,
  showLogo: true,
  logoUrl: '',
  position: 'bottom-right' as const,
  trigger: 'immediate' as const,
  delay: 3000,
  mobilePosition: 'bottom' as const
};

export const DEFAULT_JACKPOT_SCHEDULE = {
  enabled: false,
  startDate: '',
  endDate: '',
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  startTime: '00:00',
  endTime: '23:59',
  timezone: 'America/Buenos_Aires'
};
