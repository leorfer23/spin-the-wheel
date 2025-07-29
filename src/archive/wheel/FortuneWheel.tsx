import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { WheelConfig, SpinResult } from "../../types/wheel.types";
import { WheelContainer } from "./WheelContainer";
import { Segment } from "./Segment";
import { PegRing } from "./PegRing";
import { Pointer } from "./Pointer";
import { CenterCircle } from "./CenterCircle";
import { useWheelSpin } from "../../hooks/useWheelSpin";

/**
 * Props for the FortuneWheel component
 */
interface FortuneWheelProps {
  /** Complete wheel configuration object */
  config: WheelConfig;
  /** Callback fired when spin animation completes with the result */
  onSpinComplete?: (result: SpinResult) => void;
  /** Additional CSS classes for the wheel container */
  className?: string;
  /** Whether to hide the pointer indicator */
  hidePointer?: boolean;
}

/**
 * FortuneWheel is the main component that renders an interactive spinning wheel.
 * Features include:
 * - Configurable segments with weighted probability
 * - Drag-to-spin and click-to-spin functionality
 * - Smooth animations with realistic physics
 * - Customizable appearance and behavior
 * - Modular architecture with separate components for each part
 */
export const FortuneWheel: React.FC<FortuneWheelProps> = ({
  config,
  onSpinComplete,
  className = "",
  hidePointer = false,
}) => {
  const wheelRef = useRef<SVGGElement>(null);
  const dragStartAngle = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const [dragRotation, setDragRotation] = useState(0);

  const { isSpinning, currentRotation, spin } = useWheelSpin({
    segments: config.segments,
    spinConfig: config.spinConfig,
    onSpinComplete,
  });

  /**
   * Calculates the angle from the wheel center to a point
   */
  const getAngleFromPoint = (clientX: number, clientY: number): number => {
    if (!wheelRef.current) return 0;

    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    return angle * (180 / Math.PI) + 90;
  };

  /**
   * Handles the start of a drag interaction
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!config.spinConfig.allowDrag || isSpinning) return;

    isDragging.current = true;
    dragStartAngle.current =
      getAngleFromPoint(e.clientX, e.clientY) - dragRotation;
  };

  /**
   * Updates wheel rotation during drag
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const currentAngle = getAngleFromPoint(e.clientX, e.clientY);
    const newRotation = currentAngle - dragStartAngle.current;
    setDragRotation(newRotation);
  };

  /**
   * Handles the end of drag interaction and triggers spin if velocity is sufficient
   */
  const handleMouseUp = () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    const velocity = Math.abs(dragRotation % 360);

    if (velocity > 30) {
      spin();
    }
  };

  useEffect(() => {
    if (config.spinConfig.allowDrag) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragRotation, config.spinConfig.allowDrag]);

  const totalRotation = isSpinning ? currentRotation : dragRotation;

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
            <motion.g
              ref={wheelRef}
              animate={{ rotate: totalRotation }}
              transition={{ type: "tween", duration: 0 }}
              style={{
                cursor:
                  config.spinConfig.allowDrag && !isSpinning
                    ? "grab"
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
              />
            </motion.g>
            
            <CenterCircle
              config={config.centerCircle}
              dimensions={config.dimensions}
              onSpinClick={spin}
              isSpinning={isSpinning}
            />
          </g>
        </svg>
      </WheelContainer>

      {/* Pointer positioned outside wheel for proper visibility */}
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
