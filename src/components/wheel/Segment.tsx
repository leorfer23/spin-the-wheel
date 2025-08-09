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
export const Segment: React.FC<SegmentProps> = React.memo(({
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
  
  // Calculate available space for text
  const segmentRadialHeight = radius - innerRadius;
  const segmentArcLength = 2 * Math.PI * textRadius * (angle / 360);
  
  // Split text into words for potential wrapping
  const words = segment.label.split(' ');
  const needsWrapping = words.length > 1 && segment.label.length > 15;
  
  // Calculate dynamic font size based on multiple factors
  const baseFontSize = dimensions.diameter * 0.04; // 4% of diameter as base
  
  // Factor 1: Number of segments (more segments = smaller text)
  const segmentCountFactor = Math.min(1, 6 / totalSegments);
  
  // Factor 2: Text length (shorter text = bigger font)
  // Inverse relationship: as text gets shorter, font gets bigger
  const textLengthFactor = Math.min(1.5, 8 / Math.max(3, segment.label.length));
  // This gives us:
  // 3 chars (10%): 8/3 = 2.67 -> capped at 1.5
  // 4 chars (150%): 8/4 = 2.0 -> capped at 1.5  
  // 5 chars: 8/5 = 1.6 -> capped at 1.5
  // 8 chars: 8/8 = 1.0
  // 12 chars: 8/12 = 0.67
  // 20 chars: 8/20 = 0.4
  
  // Factor 3: Available arc width
  const arcWidthFactor = Math.min(1, segmentArcLength / (segment.label.length * 8));
  
  // Factor 4: Radial space (narrow segments need smaller text)
  const radialFactor = Math.min(1, segmentRadialHeight / 60);
  
  // Combine all factors with different weights
  const combinedFactor = 
    segmentCountFactor * 0.3 + 
    textLengthFactor * 0.3 + 
    arcWidthFactor * 0.2 + 
    radialFactor * 0.2;
  
  // Calculate final font size
  let fontSize = baseFontSize * combinedFactor;
  
  // Apply different limits based on text length
  // Shorter text gets higher min and max limits
  if (segment.label.length <= 3) {
    fontSize = Math.max(18, Math.min(32, fontSize)); // "10%" gets biggest range
  } else if (segment.label.length <= 5) {
    fontSize = Math.max(15, Math.min(26, fontSize)); // "150%" gets medium-large range
  } else if (segment.label.length <= 8) {
    fontSize = Math.max(13, Math.min(22, fontSize));
  } else if (segment.label.length <= 15) {
    fontSize = Math.max(11, Math.min(18, fontSize));
  } else {
    fontSize = Math.max(9, Math.min(14, fontSize));
  }
  
  // Further reduce if wrapping is needed
  if (needsWrapping) {
    fontSize *= 0.85;
  }
  
  // Function to split text into lines if needed
  const getTextLines = () => {
    if (!needsWrapping) {
      return [segment.label];
    }
    
    // Try to split at a reasonable point
    const midPoint = Math.floor(words.length / 2);
    const line1 = words.slice(0, midPoint).join(' ');
    const line2 = words.slice(midPoint).join(' ');
    
    // If one line is too much longer than the other, adjust
    if (line1.length > line2.length * 1.5 && midPoint > 1) {
      return [
        words.slice(0, midPoint - 1).join(' '),
        words.slice(midPoint - 1).join(' ')
      ];
    }
    
    return [line1, line2];
  };
  
  const textLines = getTextLines();
  const lineHeight = fontSize * 1.2;
  
  return (
    <g className="wheel-segment">
      <path
        d={pathData}
        fill={segment.color}
        stroke="#ffffff"
        strokeWidth="2"
      />
      {textLines.length === 1 ? (
        <text
          x={textX}
          y={textY}
          fill={segment.textColor || '#ffffff'}
          fontSize={fontSize}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
        >
          {textLines[0]}
        </text>
      ) : (
        <text
          x={textX}
          y={textY}
          fill={segment.textColor || '#ffffff'}
          fontSize={fontSize}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
        >
          {textLines.map((line, lineIndex) => (
            <tspan
              key={lineIndex}
              x={textX}
              dy={lineIndex === 0 ? -lineHeight / 2 : lineHeight}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
});

Segment.displayName = 'Segment';