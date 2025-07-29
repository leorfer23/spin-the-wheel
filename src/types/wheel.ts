export interface WheelSegment {
  id: string;
  label: string;
  value: string;
  color: string;
  textColor?: string;
  probability?: number;
}

export interface WheelMessages {
  title: string;
  subtitle: string;
  spinButton: string;
  emailModalTitle: string;
  emailModalDescription: string;
  emailPlaceholder: string;
  emailSubmitButton: string;
  tryAgainButton: string;
  winMessage: string;
  promoCodeLabel: string;
  copyButtonText: string;
  copiedText: string;
}

export interface WheelAppearance {
  showConfetti: boolean;
  soundEnabled: boolean;
  pointerStyle: "arrow" | "triangle" | "star";
  wheelSize: number;
  fontSize: number;
  borderWidth: number;
  borderColor: string;
}

export interface WheelConfig {
  segments: WheelSegment[];
  spinDuration: number;
  spinRevolutions: number;
  friction: number;
  easeType: "power4.out" | "elastic.out" | "back.out";
  brandLogo?: string;
  messages?: WheelMessages;
  appearance?: WheelAppearance;
}

export interface SpinResult {
  segment: WheelSegment;
  timestamp: Date;
  userEmail: string;
}
