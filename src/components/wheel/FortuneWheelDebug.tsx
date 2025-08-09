import React, { useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

interface DebugWheelProps {
  segmentCount: number;
}

export const FortuneWheelDebug: React.FC<DebugWheelProps> = ({ segmentCount }) => {
  const wheelRef = useRef<SVGGElement>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  
  const segmentAngle = 360 / segmentCount;
  const segmentOffset = -segmentAngle / 2; // Centers segment 0 at top
  
  // Log initial state
  React.useEffect(() => {
    console.log('\n🎯 FIRST PRINCIPLES DEBUG WHEEL');
    console.log('================================');
    console.log(`Segments: ${segmentCount}`);
    console.log(`Segment angle: ${segmentAngle}°`);
    console.log(`Offset: ${segmentOffset}° (to center segment 0 at top)`);
    console.log('\n📍 SEGMENT POSITIONS AT ROTATION=0:');
    
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = i * segmentAngle + segmentOffset;
      const endAngle = startAngle + segmentAngle;
      const centerAngle = startAngle + segmentAngle / 2;
      console.log(`Segment ${i}: ${startAngle.toFixed(1)}° to ${endAngle.toFixed(1)}° (center: ${centerAngle.toFixed(1)}°)`);
    }
  }, [segmentCount, segmentAngle, segmentOffset]);
  
  const testRotation = useCallback((degrees: number) => {
    if (!wheelRef.current) return;
    
    console.log(`\n🔄 TESTING ROTATION: ${degrees}°`);
    
    // Apply rotation with GSAP - set transform origin to center
    gsap.to(wheelRef.current, {
      rotation: degrees,
      duration: 2,
      ease: 'none',
      transformOrigin: "center center",
      onComplete: () => {
        setCurrentRotation(degrees);
        
        // Calculate where each segment ends up
        console.log('\n📍 SEGMENT POSITIONS AFTER ROTATION:');
        for (let i = 0; i < segmentCount; i++) {
          const initialCenter = i * segmentAngle + segmentOffset + segmentAngle / 2;
          
          // Test both addition and subtraction
          const finalCenterAdd = (initialCenter + degrees) % 360;
          const finalCenterSub = (initialCenter - degrees + 360) % 360;
          
          const normalizedAdd = finalCenterAdd < 0 ? finalCenterAdd + 360 : finalCenterAdd;
          const normalizedSub = finalCenterSub < 0 ? finalCenterSub + 360 : finalCenterSub;
          
          console.log(`Segment ${i}:`);
          console.log(`  Initial: ${initialCenter.toFixed(1)}°`);
          console.log(`  If ADD rotation: ${normalizedAdd.toFixed(1)}°`);
          console.log(`  If SUB rotation: ${normalizedSub.toFixed(1)}°`);
          
          // Check which one is at top (0°)
          if (Math.abs(normalizedAdd) < 15 || Math.abs(normalizedAdd - 360) < 15) {
            console.log(`  ✅ WITH ADD: Segment ${i} is at POINTER!`);
          }
          if (Math.abs(normalizedSub) < 15 || Math.abs(normalizedSub - 360) < 15) {
            console.log(`  ✅ WITH SUB: Segment ${i} is at POINTER!`);
          }
        }
      }
    });
  }, [segmentCount, segmentAngle, segmentOffset]);
  
  const spinToSegment = useCallback((segmentIndex: number) => {
    console.log(`\n🎯 GOAL: Bring segment ${segmentIndex} to the pointer at top`);
    
    // Reset first with proper transform origin
    if (wheelRef.current) {
      gsap.set(wheelRef.current, { 
        rotation: 0,
        transformOrigin: "center center"
      });
      setCurrentRotation(0);
    }
    
    // Where is this segment initially?
    const segmentCenter = segmentIndex * segmentAngle + segmentOffset + segmentAngle / 2;
    console.log(`Segment ${segmentIndex} starts at: ${segmentCenter.toFixed(1)}°`);
    
    // Test different formulas
    const formula1 = -segmentCenter; // Rotate backwards by segment position
    const formula2 = 360 - segmentCenter; // Rotate forwards to reach 0
    const formula3 = -segmentIndex * segmentAngle; // Rotate by index * angle
    const formula4 = 360 - (segmentIndex * segmentAngle); // Forward by index * angle
    
    console.log('\n🧪 FORMULA OPTIONS:');
    console.log(`Formula 1 (backward by position): ${formula1.toFixed(1)}°`);
    console.log(`Formula 2 (forward to 0): ${formula2.toFixed(1)}°`);
    console.log(`Formula 3 (backward by index): ${formula3.toFixed(1)}°`);
    console.log(`Formula 4 (forward by index): ${formula4.toFixed(1)}°`);
    
    // Test Formula 2 (most logical)
    const targetRotation = formula2 + 720; // Add 2 full rotations for effect
    console.log(`\n✅ Using Formula 2 with 2 full spins: ${targetRotation.toFixed(1)}°`);
    
    testRotation(targetRotation);
  }, [segmentAngle, segmentOffset, testRotation]);
  
  // Draw the wheel
  const radius = 150;
  const segments = [];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D'];
  
  for (let i = 0; i < segmentCount; i++) {
    const startAngle = i * segmentAngle + segmentOffset;
    const endAngle = startAngle + segmentAngle;
    
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = radius * Math.cos(startRad);
    const y1 = radius * Math.sin(startRad);
    const x2 = radius * Math.cos(endRad);
    const y2 = radius * Math.sin(endRad);
    
    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
    
    const pathData = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    segments.push(
      <g key={i}>
        <path
          d={pathData}
          fill={colors[i % colors.length]}
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={(radius * 0.7) * Math.cos((startAngle + segmentAngle/2 - 90) * Math.PI / 180)}
          y={(radius * 0.7) * Math.sin((startAngle + segmentAngle/2 - 90) * Math.PI / 180)}
          fill="white"
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {i}
        </text>
      </g>
    );
  }
  
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Debug Wheel - First Principles</h2>
      
      <div className="relative">
        <svg width="400" height="400">
          <g transform="translate(200, 200)">
            <g ref={wheelRef}>
              {segments}
            </g>
          </g>
        </svg>
        
        {/* Pointer at top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-500"></div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => testRotation(90)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Rotate 90°
        </button>
        <button
          onClick={() => testRotation(180)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Rotate 180°
        </button>
        <button
          onClick={() => testRotation(360)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Rotate 360°
        </button>
      </div>
      
      <div className="flex gap-2">
        {Array.from({ length: segmentCount }, (_, i) => (
          <button
            key={i}
            onClick={() => spinToSegment(i)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Spin to {i}
          </button>
        ))}
      </div>
      
      <div className="text-sm">
        Current Rotation: {currentRotation.toFixed(1)}°
      </div>
    </div>
  );
};