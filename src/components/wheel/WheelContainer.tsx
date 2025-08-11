import React from 'react';
import type { WheelDimensions, WheelStyle } from '../../types/wheel.types';

interface WheelContainerProps {
  dimensions: WheelDimensions;
  style?: WheelStyle;
  children: React.ReactNode;
  className?: string;
}

export const WheelContainer: React.FC<WheelContainerProps> = ({
  dimensions,
  style = {},
  children,
  className = ''
}) => {
  const {
    shadow = '0 10px 30px rgba(0, 0, 0, 0.3)',
    borderColor = '#ffffff',
    borderWidth = 8,
    backgroundColor = 'transparent'
  } = style;

  // Handle gradient border
  const isGradientBorder = borderColor.includes('gradient');
  
  const containerStyle: React.CSSProperties = {
    width: `${dimensions.diameter + borderWidth * 2}px`,
    height: `${dimensions.diameter + borderWidth * 2}px`,
    borderRadius: '50%',
    position: 'relative',
    boxShadow: shadow,
    backgroundColor,
    overflow: 'visible',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    ...(isGradientBorder ? {
      background: `${borderColor}, ${backgroundColor}`,
      backgroundClip: 'padding-box, border-box',
      backgroundOrigin: 'padding-box, border-box',
      border: `${borderWidth}px solid transparent`
    } : {
      border: `${borderWidth}px solid ${borderColor}`
    })
  };

  return (
    <div 
      className={`wheel-container ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};