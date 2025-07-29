import React, { useState } from 'react';
import { FortuneWheel } from './wheel/FortuneWheel';
import type { WheelConfig } from '../types/wheel.types';

export const DebugWheel: React.FC = () => {
  const [segmentCount, setSegmentCount] = useState(3);
  const [rotation, setRotation] = useState(0);
  
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA500', '#98D8C8', '#FFD93D', '#6BCF7F', '#E91E63'];
  
  const segments = Array.from({ length: segmentCount }, (_, i) => ({
    id: `segment-${i}`,
    label: `Seg ${i + 1}`,
    value: `prize-${i}`,
    color: colors[i % colors.length],
    weight: 1
  }));
  
  const config: WheelConfig = {
    segments,
    dimensions: {
      diameter: 300,
      innerRadius: 30,
      pegRingWidth: 15,
      pegCount: segmentCount,
      pegSize: 6,
    },
    style: {
      borderColor: '#333333',
      borderWidth: 3
    },
    spinConfig: {
      duration: 3,
      minRotations: 3,
      maxRotations: 5,
      easing: 'ease-out',
      allowDrag: false
    },
    centerCircle: {
      showButton: true,
      text: 'SPIN',
      fontSize: 20,
      textColor: '#ffffff',
      backgroundColor: '#333333'
    },
    pointer: {
      style: 'arrow',
      size: 45,
      color: '#FF0000'
    }
  };
  
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Wheel Alignment Debug</h2>
      
      <div className="mb-4">
        <label className="block mb-2">
          Segment Count: {segmentCount}
          <input
            type="range"
            min="2"
            max="12"
            value={segmentCount}
            onChange={(e) => setSegmentCount(Number(e.target.value))}
            className="block w-full"
          />
        </label>
        
        <label className="block mb-2">
          Manual Rotation: {rotation}°
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="block w-full"
          />
        </label>
      </div>
      
      <div className="relative">
        <FortuneWheel config={config} />
        
        {/* Debug overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative" style={{ width: 300, height: 300 }}>
            {/* Center crosshairs */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500 opacity-30" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500 opacity-30" />
            
            {/* Segment angle indicators */}
            {segments.map((_, i) => {
              const angle = 360 / segmentCount;
              const segmentOffset = -angle / 2;
              const startAngle = i * angle + segmentOffset;
              const centerAngle = startAngle + angle / 2;
              const rad = (centerAngle - 90) * (Math.PI / 180);
              const x = 150 + 120 * Math.cos(rad);
              const y = 150 + 120 * Math.sin(rad);
              
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-500 rounded-full"
                  style={{
                    left: x - 4,
                    top: y - 4,
                  }}
                  title={`Segment ${i + 1} center: ${centerAngle.toFixed(1)}°`}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm">
        <p>Segment Type: {segmentCount % 2 === 0 ? 'Even' : 'Odd'}</p>
        <p>Segment Angle: {(360 / segmentCount).toFixed(1)}°</p>
        <p>Offset: {(-360 / segmentCount / 2).toFixed(1)}°</p>
      </div>
    </div>
  );
};