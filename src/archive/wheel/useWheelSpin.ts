import { useState, useCallback, useRef } from 'react';
import type { WheelSegment, SpinConfig, SpinResult } from '../types/wheel.types';

/**
 * Props for the useWheelSpin hook
 */
interface UseWheelSpinProps {
  /** Array of wheel segments with their properties */
  segments: WheelSegment[];
  /** Configuration for spin behavior */
  spinConfig: SpinConfig;
  /** Callback fired when spin completes */
  onSpinComplete?: (result: SpinResult) => void;
}

/**
 * Custom hook that manages wheel spinning logic including:
 * - Weighted random segment selection
 * - Smooth rotation animations with configurable easing
 * - Spin state management
 * - Animation frame handling
 */
export const useWheelSpin = ({
  segments,
  spinConfig,
  onSpinComplete
}: UseWheelSpinProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);


  /**
   * Selects a random segment based on weight distribution and calculates target rotation
   */
  const selectRandomSegment = useCallback((currentRot: number): { segment: WheelSegment; targetRotation: number } => {
    const totalWeight = segments.reduce((sum, seg) => sum + (seg.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    let selectedIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      random -= (segments[i].weight || 1);
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const segmentAngle = 360 / segments.length;
    // Calculate the center angle of the selected segment
    // Since segments are already offset by -segmentAngle/2 in the visual representation,
    // we need to calculate where the center of the segment actually is
    const segmentCenter = selectedIndex * segmentAngle;
    // Add a small random offset within the segment for variety
    const randomOffset = segments.length > 0 ? (Math.random() - 0.5) * segmentAngle * 0.8 : 0;
    // The angle we want to stop at (from the top, going clockwise)
    const targetAngle = segmentCenter + randomOffset;
    
    const rotations = spinConfig.minRotations + 
      Math.random() * (spinConfig.maxRotations - spinConfig.minRotations);
    // To align with pointer at top, we need to rotate to where the segment will be at top
    // Since pointer is at 0 degrees (top), we rotate so the target angle ends up at 0
    const targetRotation = currentRot + rotations * 360 - targetAngle;

    return { segment: segments[selectedIndex], targetRotation };
  }, [segments, spinConfig]);

  /**
   * Initiates a wheel spin with weighted random selection and smooth animation
   */
  const spin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    const { segment, targetRotation } = selectRandomSegment(currentRotation);
    
    const startTime = Date.now();
    const startRotation = currentRotation;
    const totalRotation = targetRotation - startRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (spinConfig.duration * 1000), 1);
      
      let easedProgress = progress;
      if (spinConfig.easing === 'ease-out') {
        easedProgress = 1 - Math.pow(1 - progress, 3);
      } else if (spinConfig.easing === 'ease-in-out') {
        easedProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      }

      const newRotation = startRotation + totalRotation * easedProgress;
      setCurrentRotation(newRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const result: SpinResult = {
          segment,
          rotation: targetRotation,
          duration: spinConfig.duration
        };
        onSpinComplete?.(result);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, currentRotation, selectRandomSegment, spinConfig, onSpinComplete]);

  /**
   * Cancels the current spin animation
   */
  const stopSpin = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsSpinning(false);
  }, []);

  return {
    isSpinning,
    currentRotation,
    spin,
    stopSpin
  };
};