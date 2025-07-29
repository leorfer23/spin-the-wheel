import React from 'react';
import type { WheelSegment, WheelDimensions } from '../../types/wheel.types';

/**
 * Props for the Segment component
 */
interface SegmentProps {
  /** Segment data including label, color, and value */
  segment: WheelSegment;
  /** Wheel dimensions for calculating segment size */
  dimensions: WheelDimensions;
  /** Index of this segment in the wheel */
  index: number;
  /** Total number of segments in the wheel */
  totalSegments: number;
}

/**
 * Segment renders a single slice of the wheel using SVG paths.
 * Handles the mathematical calculations for creating wedge shapes
 * and positioning text labels at the correct angle and location.
 */
export const Segment: React.FC<SegmentProps> = ({
  segment,
  dimensions,
  index,
  totalSegments
}) => {
  const angle = (360 / totalSegments);
  // Offset to ensure first segment is always centered at top
  // Always offset by half a segment to center the first segment at 0° (top)
  const segmentOffset = -angle / 2;
  const startAngle = index * angle + segmentOffset;
  const endAngle = startAngle + angle;
  
  // Convert angles to radians
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  
  const radius = dimensions.diameter / 2 - dimensions.pegRingWidth;
  const innerRadius = dimensions.innerRadius;
  
  // Calculate path points
  const x1 = radius * Math.cos(startRad);
  const y1 = radius * Math.sin(startRad);
  const x2 = radius * Math.cos(endRad);
  const y2 = radius * Math.sin(endRad);
  const x3 = innerRadius * Math.cos(endRad);
  const y3 = innerRadius * Math.sin(endRad);
  const x4 = innerRadius * Math.cos(startRad);
  const y4 = innerRadius * Math.sin(startRad);
  
  const largeArcFlag = angle > 180 ? 1 : 0;
  
  const pathData = [
    `M ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
    'Z'
  ].join(' ');
  
  // Calculate text position
  const textAngle = startAngle + angle / 2;
  const textRad = (textAngle - 90) * (Math.PI / 180);
  const textRadius = (radius + innerRadius) / 2;
  const textX = textRadius * Math.cos(textRad);
  const textY = textRadius * Math.sin(textRad);
  
  return (
    <g className="wheel-segment">
      <path
        d={pathData}
        fill={segment.color}
        stroke="#ffffff"
        strokeWidth="2"
      />
      <text
        x={textX}
        y={textY}
        fill={segment.textColor || '#ffffff'}
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${textAngle}, ${textX}, ${textY})`}
      >
        {segment.label}
      </text>
    </g>
  );
};