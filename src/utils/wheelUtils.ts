export interface WheelSegment {
  id: string;
  label: string;
  weight: number;
  color: string;
  inventory?: number;
  enabled?: boolean;
  prizeType?: string;
  prizeValue?: string;
}

/**
 * Selects a winning segment based on weighted probability
 */
export const selectWinningSegment = (
  segments: WheelSegment[],
  randomValue: number = Math.random()
): WheelSegment | null => {
  if (segments.length === 0) return null;
  
  // Filter available segments (with inventory and enabled)
  const availableSegments = segments.filter(s => 
    (s.inventory === undefined || s.inventory > 0) && 
    (s.enabled === undefined || s.enabled === true)
  );
  
  // If no available segments, fall back to all enabled segments
  const targetSegments = availableSegments.length > 0 ? availableSegments : 
    segments.filter(s => s.enabled !== false);
  
  if (targetSegments.length === 0) {
    // If all segments are disabled, return the first segment as fallback
    return segments[0] || null;
  }
  
  // Single segment case
  if (targetSegments.length === 1) {
    return targetSegments[0];
  }
  
  // Calculate total weight
  const totalWeight = targetSegments.reduce((sum, seg) => sum + seg.weight, 0);
  
  // Random selection based on weight
  let threshold = randomValue * totalWeight;
  
  for (const segment of targetSegments) {
    threshold -= segment.weight;
    if (threshold <= 0) {
      return segment;
    }
  }
  
  return targetSegments[targetSegments.length - 1];
};

/**
 * Calculates the angle for a given segment index
 */
export const getSegmentAngle = (index: number, totalSegments: number): number => {
  const segmentAngle = 360 / totalSegments;
  return index * segmentAngle + segmentAngle / 2;
};

/**
 * Calculates the final rotation angle for a winning segment
 */
export const calculateFinalRotation = (
  segmentIndex: number,
  totalSegments: number,
  currentRotation: number,
  extraSpins: number = 3
): number => {
  const segmentAngle = getSegmentAngle(segmentIndex, totalSegments);
  const totalRotation = 360 * extraSpins + segmentAngle;
  return currentRotation + totalRotation;
};