import { useState, useCallback, useRef, useEffect } from 'react';
import { selectWinningSegment } from '@/utils/wheelUtils';

export interface WheelSegment {
  id: string;
  label: string;
  weight: number;
  color: string;
  inventory?: number;
  enabled?: boolean;
  prizeType?: string;
  prizeValue?: string;
}

export interface PhysicsConfig {
  spinDuration: number;
  friction: number;
  minSpinTime: number;
  maxSpinTime: number;
  minVelocity?: number;
  maxVelocity?: number;
  soundEnabled?: boolean;
}

export interface UseWheelSpinReturn {
  spin: (initialVelocity?: number) => void;
  clickSpin: () => void;
  startDrag: (x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => number;
  triggerPointerBounce: () => void;
  isSpinning: boolean;
  winningSegment: WheelSegment | null;
  spinDuration: number;
  currentVelocity: number;
  rotation: number;
  pointerBounce: boolean;
}

export const useWheelSpin = (
  segments: WheelSegment[],
  physicsConfig: PhysicsConfig,
  onSpinComplete?: (segment: WheelSegment | null) => void,
  playSound?: (sound: string) => void,
  logSelection?: (data: any) => void,
  decrementInventory?: (segmentId: string) => void
): UseWheelSpinReturn => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningSegment, setWinningSegment] = useState<WheelSegment | null>(null);
  const [spinDuration, setSpinDuration] = useState(0);
  const [currentVelocity, setCurrentVelocity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [pointerBounce, setPointerBounce] = useState(false);
  
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastDragRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const getWinningSegment = useCallback(() => {
    return selectWinningSegment(segments);
  }, [segments]);

  const animate = useCallback(() => {
    const timestamp = performance.now();
    
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    
    // Update velocity with friction
    setCurrentVelocity(prev => {
      const newVelocity = prev * physicsConfig.friction;
      
      // Update rotation based on velocity
      setRotation(rot => rot + newVelocity);
      
      // Continue animating if velocity is significant
      if (newVelocity > 0.1 && elapsed < spinDuration) {
        animationRef.current = requestAnimationFrame(animate);
        return newVelocity;
      } else {
        // Spin complete
        setIsSpinning(false);
        
        // Trigger completion callbacks
        setTimeout(() => {
          if (physicsConfig.soundEnabled && playSound) {
            playSound('win');
          }
          
          if (onSpinComplete) {
            onSpinComplete(winningSegment);
          }
          
          if (logSelection && winningSegment) {
            logSelection({
              segment: winningSegment,
              timestamp: new Date(),
              spinDuration: elapsed
            });
          }
          
          if (decrementInventory && winningSegment) {
            decrementInventory(winningSegment.id);
          }
        }, 0);
        
        return 0;
      }
    });
  }, [spinDuration, physicsConfig, playSound, onSpinComplete, winningSegment, logSelection, decrementInventory]);

  const spin = useCallback((initialVelocity?: number) => {
    if (isSpinning || segments.length === 0) return;
    
    const segment = getWinningSegment();
    if (!segment) return;
    
    setWinningSegment(segment);
    setIsSpinning(true);
    
    // Calculate spin duration
    const duration = physicsConfig.minSpinTime + 
      Math.random() * (physicsConfig.maxSpinTime - physicsConfig.minSpinTime);
    setSpinDuration(duration);
    
    // Set initial velocity
    const velocity = initialVelocity || 
      (physicsConfig.minVelocity || 5) + 
      Math.random() * ((physicsConfig.maxVelocity || 20) - (physicsConfig.minVelocity || 5));
    setCurrentVelocity(velocity);
    
    // Reset animation state
    startTimeRef.current = 0;
    
    if (physicsConfig.soundEnabled && playSound) {
      playSound('spin-start');
    }
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, segments, getWinningSegment, physicsConfig, playSound, animate]);

  const clickSpin = useCallback(() => {
    spin();
  }, [spin]);

  const startDrag = useCallback((x: number, y: number) => {
    dragStartRef.current = { x, y, time: Date.now() };
    lastDragRef.current = { x, y, time: Date.now() };
  }, []);

  const updateDrag = useCallback((x: number, y: number) => {
    if (!dragStartRef.current) return;
    lastDragRef.current = { x, y, time: Date.now() };
  }, []);

  const endDrag = useCallback(() => {
    if (!dragStartRef.current || !lastDragRef.current) return 0;
    
    const deltaX = lastDragRef.current.x - dragStartRef.current.x;
    const deltaTime = lastDragRef.current.time - dragStartRef.current.time;
    
    if (deltaTime === 0) return 0;
    
    const velocity = Math.abs(deltaX / deltaTime) * 10; // Scale factor for velocity
    
    dragStartRef.current = null;
    lastDragRef.current = null;
    
    spin(velocity);
    return velocity;
  }, [spin]);

  const triggerPointerBounce = useCallback(() => {
    setPointerBounce(true);
    setTimeout(() => setPointerBounce(false), 200);
  }, []);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    spin,
    clickSpin,
    startDrag,
    updateDrag,
    endDrag,
    triggerPointerBounce,
    isSpinning,
    winningSegment,
    spinDuration,
    currentVelocity,
    rotation,
    pointerBounce
  };
};