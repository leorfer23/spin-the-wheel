export interface Segment {
  id: string;
  label: string;
  value: string;
  color: string;
  weight?: number;
}

export interface WheelConfig {
  id: string;
  name: string;
  segments: Segment[];
  schedule: WheelSchedule;
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
}