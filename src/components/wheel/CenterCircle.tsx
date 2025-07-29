import React from 'react';
import type { CenterCircleConfig, WheelDimensions } from '../../types/wheel.types';
import { motion } from 'framer-motion';

interface CenterCircleProps {
  config?: CenterCircleConfig;
  dimensions: WheelDimensions;
  onSpinClick?: () => void;
  isSpinning?: boolean;
}

export const CenterCircle: React.FC<CenterCircleProps> = ({
  config = {},
  dimensions,
  onSpinClick,
  isSpinning = false
}) => {
  const {
    text = 'GIRAR',
    logo,
    backgroundColor = '#ffffff',
    textColor = '#333333',
    fontSize = 24,
    showButton = true
  } = config;

  const radius = dimensions.innerRadius;

  return (
    <g className="center-circle">
      <circle
        cx="0"
        cy="0"
        r={radius}
        fill={backgroundColor}
      />
      
      {logo ? (
        <image
          href={logo}
          x={-radius * 0.6}
          y={-radius * 0.6}
          width={radius * 1.2}
          height={radius * 1.2}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <>
          {showButton ? (
            <motion.g
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSpinClick}
              style={{ cursor: isSpinning ? 'not-allowed' : 'pointer' }}
            >
              <text
                x="0"
                y="0"
                fill={textColor}
                fontSize={fontSize * 0.8}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ userSelect: 'none' }}
              >
                {isSpinning ? '...' : text}
              </text>
            </motion.g>
          ) : (
            <text
              x="0"
              y="0"
              fill={textColor}
              fontSize={fontSize}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {text}
            </text>
          )}
        </>
      )}
    </g>
  );
};