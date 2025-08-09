/**
 * Core type definitions for the Fortune Wheel component system.
 * These types define the configuration and data structures used throughout the wheel components.
 */

/**
 * Represents a single segment on the wheel
 */
export interface WheelSegment {
  /** Unique identifier for the segment */
  id: string;
  /** Display text shown on the wheel segment */
  label: string;
  /** The actual value/code associated with this segment (e.g., promo code) */
  value: string;
  /** Background color of the segment */
  color: string;
  /** Text color for the label (defaults to white if not specified) */
  textColor?: string;
  /** Weight for probability-based selection (higher = more likely to win) */
  weight?: number;
}

/**
 * Configuration for wheel dimensions
 */
export interface WheelDimensions {
  /** Overall diameter of the wheel in pixels */
  diameter: number;
  /** Radius of the center circle in pixels */
  innerRadius: number;
  /** Width of the outer peg ring in pixels */
  pegRingWidth: number;
  /** Size of individual pegs in pixels */
  pegSize: number;
  /** Number of pegs around the wheel */
  pegCount: number;
}

/**
 * Visual styling options for the wheel
 */
export interface WheelStyle {
  /** CSS box-shadow property for the wheel */
  shadow?: string;
  /** Color of the wheel border */
  borderColor?: string;
  /** Width of the wheel border in pixels */
  borderWidth?: number;
  /** Background color behind the wheel */
  backgroundColor?: string;
  /** Color of the decorative pegs around the wheel */
  pegColor?: string;
}

/**
 * Configuration for the center circle of the wheel
 */
export interface CenterCircleConfig {
  /** Text to display in the center (e.g., "SPIN") */
  text?: string;
  /** URL/path to a logo image to display in the center */
  logo?: string;
  /** Background color of the center circle */
  backgroundColor?: string;
  /** Color of the center text */
  textColor?: string;
  /** Font size for the center text in pixels */
  fontSize?: number;
  /** Whether to make the center circle clickable as a spin button */
  showButton?: boolean;
  /** Border color for the center circle */
  borderColor?: string;
  /** Border width for the center circle in pixels */
  borderWidth?: number;
}

/**
 * Configuration for the wheel pointer/indicator
 */
export interface PointerConfig {
  /** Color of the pointer */
  color?: string;
  /** Size of the pointer in pixels */
  size?: number;
  /** Shape style of the pointer */
  style?: 'arrow' | 'circle' | 'triangle';
}

/**
 * Configuration for the wheel pegs
 */
export interface PegConfig {
  /** Style of the pegs */
  style?: 'dots' | 'stars' | 'diamonds' | 'sticks' | 'none';
  /** Color of the pegs */
  color?: string;
  /** Size of the pegs in pixels */
  size?: number;
}

/**
 * Configuration for wheel spinning behavior
 */
export interface SpinConfig {
  /** Duration of the spin animation in seconds */
  duration: number;
  /** Easing function for the spin animation */
  easing: 'ease-out' | 'ease-in-out' | 'linear';
  /** Minimum number of full rotations before stopping */
  minRotations: number;
  /** Maximum number of full rotations before stopping */
  maxRotations: number;
  /** Whether to allow drag-to-spin interaction */
  allowDrag?: boolean;
}

/**
 * Complete configuration object for the wheel component
 */
export interface WheelConfig {
  /** Array of segments that make up the wheel */
  segments: WheelSegment[];
  /** Dimensional configuration for the wheel */
  dimensions: WheelDimensions;
  /** Visual styling options */
  style?: WheelStyle;
  /** Center circle configuration */
  centerCircle?: CenterCircleConfig;
  /** Center button configuration (alternative to centerCircle) */
  centerButton?: {
    enabled?: boolean;
    text?: string;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
  };
  /** Pointer/indicator configuration */
  pointer?: PointerConfig;
  /** Peg configuration */
  pegConfig?: PegConfig;
  /** Spin behavior configuration */
  spinConfig: SpinConfig;
}

/**
 * Result data from a completed spin
 */
export interface SpinResult {
  /** The winning segment */
  segment: WheelSegment;
  /** Final rotation angle in degrees */
  rotation: number;
  /** Actual duration of the spin animation */
  duration: number;
}