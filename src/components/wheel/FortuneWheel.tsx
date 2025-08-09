import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import type { WheelConfig, SpinResult } from "../../types/wheel.types";
import { WheelContainer } from "./WheelContainer";
import { Segment } from "./Segment";
import { PegRing } from "./PegRing";
import { Pointer } from "./Pointer";
import { CenterCircle } from "./CenterCircle";

// Configure GSAP
gsap.config({
  nullTargetWarn: false,
  force3D: true
});

interface FortuneWheelProps {
  config: WheelConfig;
  onSpinComplete?: (result: SpinResult) => void;
  className?: string;
  hidePointer?: boolean;
  onSpinReady?: (spin: () => void) => void;
  autoSpin?: boolean;
  autoSpinDelay?: number;
}

export const FortuneWheel: React.FC<FortuneWheelProps> = ({
  config,
  onSpinComplete,
  className = "",
  hidePointer = false,
  onSpinReady,
  autoSpin = false,
  autoSpinDelay = 2000,
}) => {
  const wheelRef = useRef<SVGGElement>(null);
  const pointerRef = useRef<SVGGElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const angleHistoryRef = useRef<Array<{angle: number, time: number}>>([]);

  const selectRandomSegment = useCallback(() => {
    // Select winner based on weights
    const totalWeight = config.segments.reduce((sum, seg) => sum + (seg.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    let selectedIndex = 0;
    for (let i = 0; i < config.segments.length; i++) {
      random -= (config.segments[i].weight || 1);
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const segmentAngle = 360 / config.segments.length;
    
    console.log('====== SIMPLE WHEEL SPIN ======');
    console.log('Selected Winner:', config.segments[selectedIndex].label, '(Index:', selectedIndex, ')');
    console.log('Segments:', config.segments.map((s, i) => `[${i}] ${s.label}`).join(', '));
    
    // SIMPLIFIED APPROACH:
    // Segments are drawn with -segmentAngle/2 offset so segment 0 is centered at top
    // When rotation = 0, segment 0 is at top
    // When we rotate the wheel by X degrees clockwise:
    // - The wheel visually moves clockwise
    // - Segments appear to move counter-clockwise relative to the pointer
    // So to bring segment N to the top, we need to account for the off-by-one issue
    
    const rotations = config.spinConfig.minRotations + 
      Math.random() * (config.spinConfig.maxRotations - config.spinConfig.minRotations);
    
    // Add small random offset for realism (but keep within the segment)
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.3;
    
    // FIX: We were off by one segment, so subtract an additional segment angle
    // This accounts for the segment positioning offset in the rendering
    const targetRotation = (rotations * 360) - ((selectedIndex + 1) * segmentAngle) + randomOffset;
    
    console.log('Target rotation:', targetRotation.toFixed(1), '°');
    console.log('This will spin', rotations.toFixed(1), 'times and land on segment', selectedIndex);
    console.log('================================');

    return { 
      segment: config.segments[selectedIndex], 
      selectedIndex,
      targetRotation 
    };
  }, [config.segments, config.spinConfig]);

  const spin = useCallback(() => {
    if (isSpinning || !wheelRef.current) return;

    setIsSpinning(true);
    
    // Always reset to 0 for consistent behavior
    gsap.set(wheelRef.current, { rotation: 0 });
    rotationRef.current = 0;
    
    const { segment, selectedIndex, targetRotation } = selectRandomSegment();

    // Create spin timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setIsSpinning(false);
        rotationRef.current = targetRotation;
        
        // Let's debug what's actually happening
        const finalRotation = targetRotation % 360;
        const normalizedRotation = finalRotation < 0 ? finalRotation + 360 : finalRotation;
        const segmentAngle = 360 / config.segments.length;
        
        console.log('====== SPIN COMPLETE DEBUG ======');
        console.log('Intended Winner:', segment.label, '(Index:', selectedIndex, ')');
        console.log('Final rotation:', targetRotation.toFixed(1), '°');
        console.log('Normalized (0-360):', normalizedRotation.toFixed(1), '°');
        
        // Check each segment's angular position relative to top
        console.log('--- Segment positions ---');
        for (let i = 0; i < config.segments.length; i++) {
          // Each segment starts at i * segmentAngle
          // After rotation, its position is (starting position - rotation)
          const startAngle = i * segmentAngle;
          const currentAngle = (startAngle - normalizedRotation + 360) % 360;
          const distanceFromTop = Math.min(currentAngle, 360 - currentAngle);
          console.log(`[${i}] ${config.segments[i].label}: starts at ${startAngle}°, now at ${currentAngle.toFixed(1)}° (distance from top: ${distanceFromTop.toFixed(1)}°)`);
        }
        
        // Find which segment is actually at top
        let actualWinner = 0;
        let minDistance = 360;
        for (let i = 0; i < config.segments.length; i++) {
          const startAngle = i * segmentAngle;
          const currentAngle = (startAngle - normalizedRotation + 360) % 360;
          const distanceFromTop = Math.min(currentAngle, 360 - currentAngle);
          if (distanceFromTop < minDistance) {
            minDistance = distanceFromTop;
            actualWinner = i;
          }
        }
        
        console.log('Visual winner (closest to top):', config.segments[actualWinner].label, '(Index:', actualWinner, ')');
        console.log('Match?', actualWinner === selectedIndex ? '✅ YES' : `❌ NO - Off by ${(actualWinner - selectedIndex + config.segments.length) % config.segments.length} segments clockwise`);
        
        // Let's try to understand the pattern
        const offset = (actualWinner - selectedIndex + config.segments.length) % config.segments.length;
        console.log('Pattern: When we want segment', selectedIndex, 'we get segment', actualWinner);
        console.log('This is an offset of', offset, 'segments clockwise');
        console.log('===========================');
        
        const result: SpinResult = {
          segment,
          rotation: targetRotation,
          duration: config.spinConfig.duration
        };
        onSpinComplete?.(result);
      }
    });

    // Main wheel spin animation with custom easing
    const easingMap = {
      'ease-out': 'power3.out',
      'ease-in-out': 'power3.inOut',
      'linear': 'none'
    };

    tl.to(wheelRef.current, {
      rotation: targetRotation,
      duration: config.spinConfig.duration,
      ease: easingMap[config.spinConfig.easing] || 'power3.out',
      svgOrigin: "0 0",
      onUpdate: function() {
        rotationRef.current = gsap.getProperty(wheelRef.current!, "rotation") as number;
        
        // Trigger pointer wobble based on peg positions
        if (pointerRef.current) {
          const currentAngle = rotationRef.current % (360 / config.segments.length);
          const pegHit = currentAngle < 2 || currentAngle > (360 / config.segments.length - 2);
          
          if (pegHit) {
            gsap.to(pointerRef.current, {
              rotation: -10,
              duration: 0.05,
              yoyo: true,
              repeat: 1,
              ease: "power2.inOut",
              overwrite: true
            });
          }
        }
      }
    });
  }, [isSpinning, selectRandomSegment, config.spinConfig, config.segments.length, onSpinComplete]);

  // Manual drag implementation with velocity tracking
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!config.spinConfig.allowDrag || isSpinning) return;
    
    setIsDragging(true);
    const rect = wheelRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90;
    lastAngleRef.current = angle - rotationRef.current;
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();
    angleHistoryRef.current = [{angle: rotationRef.current, time: Date.now()}];
  }, [config.spinConfig.allowDrag, isSpinning]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!config.spinConfig.allowDrag || isSpinning) return;
    e.preventDefault(); // Prevent scrolling
    
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = wheelRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * (180 / Math.PI) + 90;
    lastAngleRef.current = angle - rotationRef.current;
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();
    angleHistoryRef.current = [{angle: rotationRef.current, time: Date.now()}];
  }, [config.spinConfig.allowDrag, isSpinning]);

  useEffect(() => {
    if (!config.spinConfig.allowDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !wheelRef.current) return;
      
      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90;
      const newRotation = angle - lastAngleRef.current;
      
      // Calculate time-based velocity
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;
      
      if (deltaTime > 0) {
        const deltaRotation = newRotation - rotationRef.current;
        velocityRef.current = deltaRotation / deltaTime * 16.67; // Normalize to ~60fps
        
        // Keep history of last few angles for smoother velocity calculation
        angleHistoryRef.current.push({angle: newRotation, time: currentTime});
        if (angleHistoryRef.current.length > 5) {
          angleHistoryRef.current.shift();
        }
        
        lastTimeRef.current = currentTime;
      }
      
      rotationRef.current = newRotation;
      gsap.set(wheelRef.current, { rotation: newRotation, svgOrigin: "0 0" });
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Calculate average velocity from history for smoother results
      let avgVelocity = velocityRef.current;
      if (angleHistoryRef.current.length > 2) {
        const recent = angleHistoryRef.current[angleHistoryRef.current.length - 1];
        const older = angleHistoryRef.current[0];
        const totalDelta = recent.angle - older.angle;
        const totalTime = recent.time - older.time;
        if (totalTime > 0) {
          avgVelocity = totalDelta / totalTime * 16.67;
        }
      }
      
      // Lower threshold for easier spinning (was 5, now 2)
      if (Math.abs(avgVelocity) > 2) {
        // Reset to 0 for consistent behavior
        gsap.set(wheelRef.current!, { rotation: 0 });
        rotationRef.current = 0;
        
        // Select winner and calculate rotation
        const { segment, selectedIndex, targetRotation } = selectRandomSegment();
        
        setIsSpinning(true);
        
        gsap.to(wheelRef.current!, {
          rotation: targetRotation,
          duration: config.spinConfig.duration,
          ease: "power3.out",
          svgOrigin: "0 0",
          onUpdate: () => {
            rotationRef.current = gsap.getProperty(wheelRef.current!, "rotation") as number;
          },
          onComplete: () => {
            setIsSpinning(false);
            rotationRef.current = targetRotation;
            
            console.log('[FortuneWheel Drag] Winner:', segment.label, '(Index:', selectedIndex, ')');
            
            const result: SpinResult = {
              segment,
              rotation: targetRotation,
              duration: config.spinConfig.duration
            };
            onSpinComplete?.(result);
          }
        });
      }
    };

    // Touch move handler
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !wheelRef.current) return;
      e.preventDefault(); // Prevent scrolling
      
      const touch = e.touches[0];
      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * (180 / Math.PI) + 90;
      const newRotation = angle - lastAngleRef.current;
      
      // Calculate time-based velocity
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;
      
      if (deltaTime > 0) {
        const deltaRotation = newRotation - rotationRef.current;
        velocityRef.current = deltaRotation / deltaTime * 16.67; // Normalize to ~60fps
        
        // Keep history of last few angles for smoother velocity calculation
        angleHistoryRef.current.push({angle: newRotation, time: currentTime});
        if (angleHistoryRef.current.length > 5) {
          angleHistoryRef.current.shift();
        }
        
        lastTimeRef.current = currentTime;
      }
      
      rotationRef.current = newRotation;
      gsap.set(wheelRef.current, { rotation: newRotation, svgOrigin: "0 0" });
    };

    // Touch end handler
    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Calculate average velocity from history for smoother results
      let avgVelocity = velocityRef.current;
      if (angleHistoryRef.current.length > 2) {
        const recent = angleHistoryRef.current[angleHistoryRef.current.length - 1];
        const older = angleHistoryRef.current[0];
        const totalDelta = recent.angle - older.angle;
        const totalTime = recent.time - older.time;
        if (totalTime > 0) {
          avgVelocity = totalDelta / totalTime * 16.67;
        }
      }
      
      // Lower threshold for easier spinning
      if (Math.abs(avgVelocity) > 2) {
        // Reset to 0 for consistent behavior
        gsap.set(wheelRef.current!, { rotation: 0 });
        rotationRef.current = 0;
        
        // Select winner and calculate rotation
        const { segment, selectedIndex, targetRotation } = selectRandomSegment();
        
        setIsSpinning(true);
        
        gsap.to(wheelRef.current!, {
          rotation: targetRotation,
          duration: config.spinConfig.duration,
          ease: "power3.out",
          svgOrigin: "0 0",
          onUpdate: () => {
            rotationRef.current = gsap.getProperty(wheelRef.current!, "rotation") as number;
          },
          onComplete: () => {
            setIsSpinning(false);
            rotationRef.current = targetRotation;
            
            console.log('[FortuneWheel Touch] Winner:', segment.label, '(Index:', selectedIndex, ')');
            
            const result: SpinResult = {
              segment,
              rotation: targetRotation,
              duration: config.spinConfig.duration
            };
            onSpinComplete?.(result);
          }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, config.spinConfig, selectRandomSegment, onSpinComplete]);

  // Store spin function in a ref to avoid recreating it
  const spinRef = useRef(spin);
  spinRef.current = spin;

  // Call onSpinReady when component mounts (only once)
  useEffect(() => {
    if (onSpinReady) {
      // Create a stable function that calls the current spin
      const stableSpin = () => spinRef.current();
      onSpinReady(stableSpin);
    }
  }, [onSpinReady]);

  // Auto-spin functionality
  useEffect(() => {
    if (autoSpin && !isSpinning) {
      const timer = setTimeout(() => {
        spin();
      }, autoSpinDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoSpin, autoSpinDelay]); // Don't include spin or isSpinning to avoid re-triggering

  return (
    <div className="relative inline-block">
      <WheelContainer
        dimensions={config.dimensions}
        style={config.style}
        className={className}
      >
        <svg
          width={config.dimensions.diameter}
          height={config.dimensions.diameter}
          style={{ display: "block" }}
        >
          <g
            transform={`translate(${config.dimensions.diameter / 2}, ${
              config.dimensions.diameter / 2
            })`}
          >
            <g
              ref={wheelRef}
              style={{
                cursor:
                  config.spinConfig.allowDrag && !isSpinning
                    ? isDragging ? "grabbing" : "grab"
                    : "default",
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {config.segments.map((segment, index) => (
                <Segment
                  key={segment.id}
                  segment={segment}
                  dimensions={config.dimensions}
                  index={index}
                  totalSegments={config.segments.length}
                />
              ))}

              <PegRing
                dimensions={config.dimensions}
                segmentCount={config.segments.length}
                pegColor={config.pegConfig?.color}
                pegStyle={config.pegConfig?.style}
              />
            </g>
            
            <CenterCircle
              config={config.centerCircle}
              dimensions={config.dimensions}
              onSpinClick={spin}
              isSpinning={isSpinning}
            />
          </g>
        </svg>
      </WheelContainer>

      {!hidePointer && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <svg
            width={config.pointer?.size || 45}
            height={(config.pointer?.size || 45) * 2}
            style={{
              display: "block",
              overflow: "visible",
            }}
          >
            <g
              ref={pointerRef}
              transform={`translate(${(config.pointer?.size || 45) / 2}, ${
                (config.pointer?.size || 45) * 1.5
              })`}
            >
              <Pointer config={config.pointer} isSpinning={isSpinning} />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};