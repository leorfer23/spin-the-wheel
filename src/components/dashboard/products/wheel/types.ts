import type { WheelScheduleConfig } from '@/types/models';
import type { TiendaNubeCoupon } from '@/types/tiendanube.types';

export interface Segment {
  id: string;
  label: string;
  value: string;
  color: string;
  weight?: number;
  prizeType?: 'custom' | 'coupon';
  coupon?: TiendaNubeCoupon;
}

export interface WheelConfig {
  id: string;
  name: string;
  segments: Segment[];
  schedule: WheelSchedule | WheelScheduleConfig;
  wheelDesign?: any;
  widgetConfig?: any;
}

export interface WheelSchedule {
  enabled: boolean;
  days: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  timezone: string;
}