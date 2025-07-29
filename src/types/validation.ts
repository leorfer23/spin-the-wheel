import { z } from 'zod';

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Store validation schemas
export const createStoreSchema = z.object({
  store_name: z.string().min(1, 'Store name is required').max(255),
  platform: z.enum(['shopify', 'tienda_nube', 'custom']),
  store_url: z.string().url('Invalid URL'),
  api_credentials: z.object({
    api_key: z.string().optional(),
    api_secret: z.string().optional(),
    access_token: z.string().optional(),
  }).optional(),
});

// Wheel validation schemas
export const segmentSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  weight: z.number().min(1, 'Weight must be at least 1'),
  prizeType: z.enum(['discount', 'product', 'custom', 'no_prize']),
  prizeData: z.object({
    discountPercentage: z.number().min(0).max(100).optional(),
    discountCode: z.string().optional(),
    productName: z.string().optional(),
    productSku: z.string().optional(),
    customMessage: z.string().optional(),
  }).optional(),
});

export const wheelConfigSchema = z.object({
  segments: z.array(segmentSchema).min(2, 'At least 2 segments required'),
  spinDuration: z.number().min(1).max(10),
  spinRevolutions: z.number().min(1).max(10),
  friction: z.number().min(0).max(1),
  easeType: z.enum(['power4.out', 'elastic.out', 'back.out']),
  brandLogo: z.string().url().optional(),
  appearance: z.object({
    showConfetti: z.boolean(),
    soundEnabled: z.boolean(),
    pointerStyle: z.enum(['arrow', 'triangle', 'star']),
    wheelSize: z.number().min(200).max(800),
    fontSize: z.number().min(10).max(30),
    borderWidth: z.number().min(0).max(20),
    borderColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    shadow: z.string().optional(),
  }),
  messages: z.object({
    title: z.string(),
    subtitle: z.string(),
    spinButton: z.string(),
    emailModalTitle: z.string(),
    emailModalDescription: z.string(),
    emailPlaceholder: z.string(),
    emailSubmitButton: z.string(),
    tryAgainButton: z.string(),
    winMessage: z.string(),
    promoCodeLabel: z.string(),
    copyButtonText: z.string(),
    copiedText: z.string(),
  }),
});

export const createWheelSchema = z.object({
  name: z.string().min(1, 'Wheel name is required').max(255),
  config: wheelConfigSchema,
  theme_preset: z.string().optional(),
  custom_css: z.string().optional(),
  custom_js: z.string().optional(),
});

// Campaign validation schemas
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  spin_limit_per_user: z.number().min(1).optional(),
  total_spin_limit: z.number().min(1).optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

// Spin validation schemas
export const createSpinSchema = z.object({
  email: z.string().email('Invalid email address'),
  marketing_consent: z.boolean().default(false),
});

// Integration validation schemas
export const createIntegrationSchema = z.object({
  provider: z.enum(['mailchimp', 'klaviyo', 'sendgrid', 'activecampaign', 'custom']),
  api_credentials: z.object({
    api_key: z.string().min(1, 'API key is required'),
    api_secret: z.string().optional(),
    list_id: z.string().optional(),
    webhook_url: z.string().url().optional(),
  }),
  settings: z.object({
    auto_sync: z.boolean().default(true),
    sync_interval: z.number().min(5).default(30),
    custom_fields: z.record(z.string(), z.string()).optional(),
  }).optional(),
});

// Widget validation schemas
export const widgetConfigSchema = z.object({
  wheelId: z.string().min(1, 'Wheel ID is required'),
  trigger: z.enum(['immediate', 'exit_intent', 'scroll', 'time_delay', 'click']),
  triggerConfig: z.object({
    scrollPercentage: z.number().min(0).max(100).optional(),
    timeDelay: z.number().min(0).optional(),
    clickSelector: z.string().optional(),
  }).optional(),
  position: z.enum(['center', 'bottom_right', 'bottom_left', 'top_right', 'top_left']),
  mobilePosition: z.enum(['center', 'bottom', 'top']).optional(),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type CreateWheelInput = z.infer<typeof createWheelSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type CreateSpinInput = z.infer<typeof createSpinSchema>;
export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;
export type WidgetConfigInput = z.infer<typeof widgetConfigSchema>;