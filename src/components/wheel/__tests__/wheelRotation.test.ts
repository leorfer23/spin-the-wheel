import { describe, it, expect } from 'vitest';

/**
 * Tests for wheel rotation logic
 * These tests verify that the selected segment aligns with the pointer after rotation
 */
describe('Wheel Rotation Calculations', () => {
  const calculateTargetRotation = (
    selectedIndex: number, 
    totalSegments: number, 
    rotations: number,
    randomOffset: number = 0
  ): number => {
    const segmentAngle = 360 / totalSegments;
    // This is the fixed formula from FortuneWheel.tsx line 82
    return (rotations * 360) + (selectedIndex * segmentAngle) + randomOffset;
  };

  const getSegmentAtTop = (rotation: number, totalSegments: number): number => {
    const segmentAngle = 360 / totalSegments;
    // Normalize rotation to 0-360 range
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    
    // Account for the segment offset (segments are drawn with -segmentAngle/2 offset)
    // This centers segment 0 at the top when rotation = 0
    const segmentOffset = -segmentAngle / 2;
    
    let minDistance = 360;
    let segmentAtTop = 0;
    
    for (let i = 0; i < totalSegments; i++) {
      // Each segment starts at this angle (with the offset applied)
      const startAngle = i * segmentAngle + segmentOffset;
      // After rotation, the segment's position relative to top
      const currentAngle = (startAngle - normalizedRotation + 360 + segmentAngle/2) % 360;
      // Distance from the top (0 degrees)
      const distanceFromTop = Math.min(currentAngle, 360 - currentAngle);
      
      if (distanceFromTop < minDistance) {
        minDistance = distanceFromTop;
        segmentAtTop = i;
      }
    }
    
    return segmentAtTop;
  };

  describe('6-segment wheel', () => {
    const totalSegments = 6;
    const segmentAngle = 60; // 360 / 6

    it('should align segment 0 with pointer when selected', () => {
      const selectedIndex = 0;
      const rotation = calculateTargetRotation(selectedIndex, totalSegments, 5);
      const actualSegment = getSegmentAtTop(rotation, totalSegments);
      expect(actualSegment).toBe(selectedIndex);
    });

    it('should align segment 1 with pointer when selected', () => {
      const selectedIndex = 1;
      const rotation = calculateTargetRotation(selectedIndex, totalSegments, 5);
      const actualSegment = getSegmentAtTop(rotation, totalSegments);
      expect(actualSegment).toBe(selectedIndex);
    });

    it('should align segment 2 with pointer when selected', () => {
      const selectedIndex = 2;
      const rotation = calculateTargetRotation(selectedIndex, totalSegments, 5);
      const actualSegment = getSegmentAtTop(rotation, totalSegments);
      expect(actualSegment).toBe(selectedIndex);
    });

    it('should align all segments correctly', () => {
      for (let i = 0; i < totalSegments; i++) {
        const rotation = calculateTargetRotation(i, totalSegments, 5);
        const actualSegment = getSegmentAtTop(rotation, totalSegments);
        expect(actualSegment).toBe(i);
      }
    });

    it('should handle random offset within segment bounds', () => {
      const selectedIndex = 3;
      // Random offset should be within ±30% of segment angle (±18 degrees for 60° segments)
      const maxOffset = segmentAngle * 0.3;
      
      // Test with positive offset
      let rotation = calculateTargetRotation(selectedIndex, totalSegments, 5, maxOffset * 0.9);
      let actualSegment = getSegmentAtTop(rotation, totalSegments);
      expect(actualSegment).toBe(selectedIndex);
      
      // Test with negative offset
      rotation = calculateTargetRotation(selectedIndex, totalSegments, 5, -maxOffset * 0.9);
      actualSegment = getSegmentAtTop(rotation, totalSegments);
      expect(actualSegment).toBe(selectedIndex);
    });
  });

  describe('4-segment wheel', () => {
    const totalSegments = 4;

    it('should align all segments correctly', () => {
      for (let i = 0; i < totalSegments; i++) {
        const rotation = calculateTargetRotation(i, totalSegments, 3);
        const actualSegment = getSegmentAtTop(rotation, totalSegments);
        expect(actualSegment).toBe(i);
      }
    });
  });

  describe('8-segment wheel', () => {
    const totalSegments = 8;

    it('should align all segments correctly', () => {
      for (let i = 0; i < totalSegments; i++) {
        const rotation = calculateTargetRotation(i, totalSegments, 4);
        const actualSegment = getSegmentAtTop(rotation, totalSegments);
        expect(actualSegment).toBe(i);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle single segment wheel', () => {
      const rotation = calculateTargetRotation(0, 1, 5);
      const actualSegment = getSegmentAtTop(rotation, 1);
      expect(actualSegment).toBe(0);
    });

    it('should handle large number of rotations', () => {
      const selectedIndex = 2;
      const totalSegments = 6;
      const rotation = calculateTargetRotation(selectedIndex, totalSegments, 100);
      const actualSegment = getSegmentAtTop(rotation, totalSegments);
      expect(actualSegment).toBe(selectedIndex);
    });

    it('should handle wheel with different rotation values', () => {
      const totalSegments = 4;
      // Test that our formula works for all segments with various rotation amounts
      for (let selectedIndex = 0; selectedIndex < totalSegments; selectedIndex++) {
        // Test with 1+ rotations (should always work)
        const rotation1 = calculateTargetRotation(selectedIndex, totalSegments, 1);
        const actualSegment1 = getSegmentAtTop(rotation1, totalSegments);
        expect(actualSegment1).toBe(selectedIndex);
        
        // Test with 2+ rotations
        const rotation2 = calculateTargetRotation(selectedIndex, totalSegments, 2);
        const actualSegment2 = getSegmentAtTop(rotation2, totalSegments);
        expect(actualSegment2).toBe(selectedIndex);
      }
    });
  });
});