import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import type { WheelConfig, SpinResult } from "../../types/wheel.types";
import { WheelContainer } from "./WheelContainer";
import { Segment } from "./Segment";
import { PegRing } from "./PegRing";
import { Pointer } from "./Pointer";
import { CenterCircle } from "./CenterCircle";

// Configure GSAP for optimal performance
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

/**
 * FortuneWheel Component
 * 
 * A highly customizable spinning wheel component with physics-based animations.
 * Supports weighted probability selection, drag-to-spin, and click-to-spin functionality.
 * 
 * The wheel uses a mathematical formula to ensure precise landing on selected segments:
 * - Segments are drawn with centers offset by -segmentAngle/2 to align segment 0 at top
 * - Rotation formula: targetRotation = 360 - segmentCenter + (fullRotations * 360) + randomOffset
 * - This ensures the selected segment lands precisely at the pointer (top/0°)
 */
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

  /**
   * Calculate segment geometry constants
   * These values are used throughout the component for positioning calculations
   */
  const getSegmentGeometry = useCallback(() => {
    const segmentAngle = 360 / config.segments.length;
    // Offset by half a segment to center the first segment at top (0°)
    const segmentOffset = -segmentAngle / 2;
    return { segmentAngle, segmentOffset };
  }, [config.segments.length]);

  /**
   * Select a random segment based on weighted probability
   * Returns the selected segment data and the rotation needed to land on it
   */
  const selectWinningSegment = useCallback(() => {
    // Calculate weighted random selection
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

    return {
      segment: config.segments[selectedIndex],
      selectedIndex
    };
  }, [config.segments]);

  /**
   * Calculate the rotation needed to land on a specific segment
   * 
   * Formula explanation:
   * 1. Each segment has a center position: index * segmentAngle + offset + segmentAngle/2
   * 2. To bring a segment to the top (0°), we rotate: 360 - segmentCenter
   * 3. Add full rotations for visual effect: + (rotations * 360)
   * 4. Add small random offset for realism: + randomOffset
   */
  const calculateTargetRotation = useCallback((selectedIndex: number) => {
    const { segmentAngle, segmentOffset } = getSegmentGeometry();
    
    // Calculate where this segment's center is initially positioned
    const segmentCenter = selectedIndex * segmentAngle + segmentOffset + segmentAngle / 2;
    
    // Calculate number of full rotations for visual effect
    const rotations = config.spinConfig.minRotations + 
      Math.random() * (config.spinConfig.maxRotations - config.spinConfig.minRotations);
    
    // Add small random offset within the segment for realism
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.3;
    
    // Calculate final rotation: forward rotation to bring segment to top
    const targetRotation = 360 - segmentCenter + (rotations * 360) + randomOffset;
    
    return targetRotation;
  }, [config.spinConfig, getSegmentGeometry]);

  /**
   * Reset wheel to initial position
   * Used before each spin to ensure consistent behavior
   */
  const resetWheel = useCallback(() => {
    if (!wheelRef.current) return;
    
    gsap.set(wheelRef.current, { 
      rotation: 0,
      transformOrigin: "center center"
    });
    rotationRef.current = 0;
  }, []);

  /**
   * Animate pointer wobble effect
   * Called during spin to simulate physical peg collision
   */
  const animatePointerWobble = useCallback(() => {
    if (!pointerRef.current) return;
    
    const { segmentAngle } = getSegmentGeometry();
    const currentAngle = rotationRef.current % segmentAngle;
    const pegHit = currentAngle < 2 || currentAngle > (segmentAngle - 2);
    
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
  }, [getSegmentGeometry]);

  /**
   * Handle spin completion
   * Triggers callback and optionally resets wheel
   */
  const handleSpinComplete = useCallback((
    segment: WheelConfig['segments'][0], 
    targetRotation: number
  ) => {
    const result: SpinResult = {
      segment,
      rotation: targetRotation,
      duration: config.spinConfig.duration
    };
    
    onSpinComplete?.(result);
    
    // Optionally reset wheel after showing result
    if (config.spinConfig.autoReset !== false) {
      setTimeout(() => {
        if (wheelRef.current) {
          gsap.to(wheelRef.current, {
            rotation: 0,
            duration: 1,
            ease: 'power2.inOut',
            transformOrigin: "center center",
            onComplete: () => {
              rotationRef.current = 0;
            }
          });
        }
      }, 3000);
    }
  }, [config.spinConfig.duration, config.spinConfig.autoReset, onSpinComplete]);

  /**
   * Main spin function
   * Selects a winner, calculates rotation, and animates the wheel
   */
  const spin = useCallback(() => {
    if (isSpinning || !wheelRef.current) return;

    setIsSpinning(true);
    resetWheel();
    
    // Select winner and calculate rotation
    const { segment, selectedIndex } = selectWinningSegment();
    const targetRotation = calculateTargetRotation(selectedIndex);

    // Map easing values to GSAP format
    const easingMap: Record<string, string> = {
      'ease-out': 'power3.out',
      'ease-in-out': 'power3.inOut',
      'linear': 'none'
    };

    // Create spin animation
    gsap.to(wheelRef.current, {
      rotation: targetRotation,
      duration: config.spinConfig.duration,
      ease: easingMap[config.spinConfig.easing] || 'power3.out',
      transformOrigin: "center center",
      onUpdate: () => {
        rotationRef.current = gsap.getProperty(wheelRef.current!, "rotation") as number;
        animatePointerWobble();
      },
      onComplete: () => {
        setIsSpinning(false);
        rotationRef.current = targetRotation;
        handleSpinComplete(segment, targetRotation);
      }
    });
  }, [
    isSpinning, 
    resetWheel, 
    selectWinningSegment, 
    calculateTargetRotation, 
    config.spinConfig, 
    animatePointerWobble, 
    handleSpinComplete
  ]);

  /**
   * Calculate angle from mouse/touch position relative to wheel center
   */
  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return 0;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
  }, []);

  /**
   * Initialize drag operation
   */
  const initDrag = useCallback((clientX: number, clientY: number) => {
    if (!config.spinConfig.allowDrag || isSpinning) return;
    
    setIsDragging(true);
    const angle = getAngleFromEvent(clientX, clientY);
    lastAngleRef.current = angle - rotationRef.current;
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();
    angleHistoryRef.current = [{angle: rotationRef.current, time: Date.now()}];
  }, [config.spinConfig.allowDrag, isSpinning, getAngleFromEvent]);

  /**
   * Handle mouse down event
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    initDrag(e.clientX, e.clientY);
  }, [initDrag]);

  /**
   * Handle touch start event
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    initDrag(touch.clientX, touch.clientY);
  }, [initDrag]);

  /**
   * Process drag movement and calculate velocity
   */
  const processDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !wheelRef.current) return;
    
    const angle = getAngleFromEvent(clientX, clientY);
    const newRotation = angle - lastAngleRef.current;
    
    // Calculate velocity for momentum-based spinning
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTimeRef.current;
    
    if (deltaTime > 0) {
      const deltaRotation = newRotation - rotationRef.current;
      velocityRef.current = deltaRotation / deltaTime * 16.67; // Normalize to 60fps
      
      // Maintain velocity history for smooth calculation
      angleHistoryRef.current.push({angle: newRotation, time: currentTime});
      if (angleHistoryRef.current.length > 5) {
        angleHistoryRef.current.shift();
      }
      
      lastTimeRef.current = currentTime;
    }
    
    rotationRef.current = newRotation;
    gsap.set(wheelRef.current, { rotation: newRotation, transformOrigin: "center center" });
  }, [isDragging, getAngleFromEvent]);

  /**
   * Complete drag operation and potentially trigger spin
   */
  const completeDrag = useCallback(() => {
    if (!isDragging || !wheelRef.current) return;
    
    setIsDragging(false);
    
    // Calculate average velocity from history
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
    
    // Trigger spin if velocity exceeds threshold
    const VELOCITY_THRESHOLD = 2;
    if (Math.abs(avgVelocity) > VELOCITY_THRESHOLD) {
      spin();
    }
  }, [isDragging, spin]);

  // Set up global event listeners for drag functionality
  useEffect(() => {
    if (!config.spinConfig.allowDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      processDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      completeDrag();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      processDragMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      completeDrag();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [config.spinConfig.allowDrag, processDragMove, completeDrag]);

  // Expose spin function to parent component
  useEffect(() => {
    onSpinReady?.(spin);
  }, [spin, onSpinReady]);

  // Handle auto-spin functionality
  useEffect(() => {
    if (autoSpin && !isSpinning) {
      const timer = setTimeout(spin, autoSpinDelay);
      return () => clearTimeout(timer);
    }
  }, [autoSpin, autoSpinDelay, isSpinning, spin]);

  // Calculate dimensions
  const radius = config.dimensions.diameter / 2;
  const viewBox = `${-radius} ${-radius} ${config.dimensions.diameter} ${config.dimensions.diameter}`;

  return (
    <WheelContainer
      dimensions={config.dimensions}
      style={config.style}
      className={className}
    >
      <svg
        width={config.dimensions.diameter}
        height={config.dimensions.diameter}
        viewBox={viewBox}
        style={{ 
          display: 'block', 
          cursor: config.spinConfig.allowDrag || !isSpinning ? 'pointer' : 'default',
          touchAction: config.spinConfig.allowDrag ? 'none' : 'auto',
          userSelect: 'none'
        }}
        onClick={!config.spinConfig.allowDrag && !isSpinning ? spin : undefined}
        onMouseDown={config.spinConfig.allowDrag ? handleMouseDown : undefined}
        onTouchStart={config.spinConfig.allowDrag ? handleTouchStart : undefined}
      >
        {/* Render wheel segments and pegs together so they rotate as one */}
        <g ref={wheelRef} style={{ transformOrigin: 'center center' }}>
          {config.segments.map((segment, index) => (
            <Segment
              key={segment.id}
              segment={segment}
              dimensions={config.dimensions}
              index={index}
              totalSegments={config.segments.length}
            />
          ))}
          
          {/* Decorative peg ring - inside the rotating group */}
          <PegRing
            dimensions={config.dimensions}
            segmentCount={config.segments.length}
            pegColor={config.pegConfig?.color || config.style?.pegColor || config.style?.borderColor}
            pegStyle={config.pegConfig?.style}
          />
        </g>

        {/* Center circle with text/logo - stays static */}
        <CenterCircle
          dimensions={config.dimensions}
          config={config.centerCircle}
          onSpinClick={!config.spinConfig.allowDrag && !isSpinning ? spin : undefined}
        />
      </svg>

      {/* Pointer indicator */}
      {!hidePointer && config.pointer && (
        <div 
          style={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20
          }}
        >
          <svg width="100" height="100" viewBox="-50 -80 100 100">
            <g ref={pointerRef} style={{ transformOrigin: '0 0' }}>
              <Pointer config={config.pointer} isSpinning={isSpinning} />
            </g>
          </svg>
        </div>
      )}
    </WheelContainer>
  );
};