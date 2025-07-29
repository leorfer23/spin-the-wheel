import React from 'react';
import type { WheelDimensions } from '../../types/wheel.types';

interface PegRingProps {
  dimensions: WheelDimensions;
  segmentCount?: number;
  pegColor?: string;
  pegStyle?: 'dots' | 'stars' | 'diamonds' | 'sticks' | 'none';
}

export const PegRing: React.FC<PegRingProps> = ({ 
  dimensions,
  segmentCount,
  pegColor = '#f5f5f5',
  pegStyle = 'dots'
}) => {
  const radius = dimensions.diameter / 2;
  // Position pegs at the edge of the segments, accounting for pegRingWidth
  const segmentRadius = radius - dimensions.pegRingWidth;
  const pegRadius = pegStyle === 'sticks' ? segmentRadius + 2 : radius - 8;
  
  // Use segment count if provided to position pegs between segments
  const pegCount = segmentCount || dimensions.pegCount;
  
  const pegs = Array.from({ length: pegCount }, (_, i) => {
    // Calculate angle to position pegs at segment boundaries
    const segmentAngle = 360 / pegCount;
    
    // Always offset by half a segment to align with segment boundaries
    // This ensures pegs are positioned between segments correctly
    const segmentOffset = -segmentAngle / 2;
    
    // Position pegs at the start of each segment (which are the boundaries)
    const angle = segmentAngle * i + segmentOffset;
    
    // Convert to radians, subtracting 90 to align with top being 0 degrees
    const rad = (angle - 90) * (Math.PI / 180);
    const x = pegRadius * Math.cos(rad);
    const y = pegRadius * Math.sin(rad);
    
    if (pegStyle === 'none') return null;
    
    return (
      <g key={i} transform={`translate(${x}, ${y}) rotate(${angle})`}>
        {pegStyle === 'dots' && (
          <circle
            cx={0}
            cy={0}
            r={dimensions.pegSize / 2}
            fill={pegColor}
            className="peg"
            style={{
              opacity: 0.9,
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
            }}
          />
        )}
        {pegStyle === 'stars' && (
          <path
            d="M0,-8 L2.4,-2.4 L8,-0.8 L2.4,1.6 L0,8 L-2.4,1.6 L-8,-0.8 L-2.4,-2.4 Z"
            fill={pegColor}
            transform={`scale(${dimensions.pegSize / 16})`}
            className="peg"
            style={{
              opacity: 0.9,
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
            }}
          />
        )}
        {pegStyle === 'diamonds' && (
          <rect
            x={-dimensions.pegSize / 2}
            y={-dimensions.pegSize / 2}
            width={dimensions.pegSize}
            height={dimensions.pegSize}
            fill={pegColor}
            transform="rotate(45)"
            className="peg"
            style={{
              opacity: 0.9,
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
            }}
          />
        )}
        {pegStyle === 'sticks' && (
          <rect
            x={-dimensions.pegSize / 3}
            y={-dimensions.pegSize * 2.5}
            width={dimensions.pegSize / 1.5}
            height={dimensions.pegSize * 3}
            rx={dimensions.pegSize / 6}
            ry={dimensions.pegSize / 6}
            fill={pegColor}
            className="peg"
            style={{
              opacity: 0.95,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              transform: 'translateY(10px)'
            }}
          />
        )}
      </g>
    );
  });

  return (
    <g className="peg-ring">
      {pegs}
    </g>
  );
};