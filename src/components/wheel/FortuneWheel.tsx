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
}

export const FortuneWheel: React.FC<FortuneWheelProps> = ({
  config,
  onSpinComplete,
  className = "",
  hidePointer = false,
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

  const selectRandomSegment = useCallback((currentRotation: number) => {
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
    const segmentCenter = selectedIndex * segmentAngle;
    const randomOffset = config.segments.length > 0 ? (Math.random() - 0.5) * segmentAngle * 0.8 : 0;
    const targetAngle = segmentCenter + randomOffset;
    
    const rotations = config.spinConfig.minRotations + 
      Math.random() * (config.spinConfig.maxRotations - config.spinConfig.minRotations);
    const targetRotation = currentRotation + rotations * 360 - targetAngle;

    return { segment: config.segments[selectedIndex], targetRotation };
  }, [config.segments, config.spinConfig]);

  const spin = useCallback(() => {
    if (isSpinning || !wheelRef.current) return;

    setIsSpinning(true);
    const currentRotation = rotationRef.current;
    const { segment, targetRotation } = selectRandomSegment(currentRotation);

    // Create spin timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setIsSpinning(false);
        rotationRef.current = targetRotation % 360;
        
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
        // Apply inertia spin with more sensitive momentum calculation
        const momentum = avgVelocity * 30; // Increased from 20 to 30 for more responsive spinning
        const currentRotation = rotationRef.current;
        const { segment, targetRotation } = selectRandomSegment(currentRotation + momentum);
        
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
            rotationRef.current = targetRotation % 360;
            
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
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, config.spinConfig, selectRandomSegment, onSpinComplete]);

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