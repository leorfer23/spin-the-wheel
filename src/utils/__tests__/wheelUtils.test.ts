import { describe, it, expect } from 'vitest';
import { selectWinningSegment, getSegmentAngle, calculateFinalRotation } from '../wheelUtils';

describe('wheelUtils', () => {
  describe('selectWinningSegment', () => {
    const segments = [
      { id: '1', label: 'Prize 1', weight: 10, color: '#FF0000' },
      { id: '2', label: 'Prize 2', weight: 20, color: '#00FF00' },
      { id: '3', label: 'Prize 3', weight: 30, color: '#0000FF' },
      { id: '4', label: 'Prize 4', weight: 40, color: '#FFFF00' }
    ];

    it('should return null for empty segments', () => {
      expect(selectWinningSegment([])).toBeNull();
    });

    it('should return the only segment when there is one', () => {
      const single = [segments[0]];
      expect(selectWinningSegment(single)).toBe(single[0]);
    });

    it('should select segments based on weight distribution', () => {
      // Test with fixed random values
      expect(selectWinningSegment(segments, 0)).toBe(segments[0]); // First 10%
      expect(selectWinningSegment(segments, 0.15)).toBe(segments[1]); // Next 20%
      expect(selectWinningSegment(segments, 0.35)).toBe(segments[2]); // Next 30%
      expect(selectWinningSegment(segments, 0.65)).toBe(segments[3]); // Last 40%
      expect(selectWinningSegment(segments, 0.99)).toBe(segments[3]); // Still last
    });

    it('should filter out disabled segments', () => {
      const segmentsWithDisabled = [
        { ...segments[0], enabled: false },
        { ...segments[1], enabled: true },
        { ...segments[2], enabled: true },
        { ...segments[3], enabled: false }
      ];
      
      const result = selectWinningSegment(segmentsWithDisabled, 0.5);
      expect(result).toBeTruthy();
      expect(result?.enabled).not.toBe(false);
    });

    it('should filter out segments with no inventory', () => {
      const segmentsWithInventory = [
        { ...segments[0], inventory: 0 },
        { ...segments[1], inventory: 5 },
        { ...segments[2], inventory: 0 },
        { ...segments[3], inventory: 10 }
      ];
      
      const result = selectWinningSegment(segmentsWithInventory, 0.5);
      expect(result).toBeTruthy();
      expect(result?.inventory).toBeGreaterThan(0);
    });
  });

  describe('getSegmentAngle', () => {
    it('should calculate correct angles for different segment counts', () => {
      // 4 segments: each 90 degrees
      expect(getSegmentAngle(0, 4)).toBe(45); // Center of first segment
      expect(getSegmentAngle(1, 4)).toBe(135); // Center of second segment
      expect(getSegmentAngle(2, 4)).toBe(225); // Center of third segment
      expect(getSegmentAngle(3, 4)).toBe(315); // Center of fourth segment

      // 6 segments: each 60 degrees
      expect(getSegmentAngle(0, 6)).toBe(30); // Center of first segment
      expect(getSegmentAngle(1, 6)).toBe(90); // Center of second segment
      expect(getSegmentAngle(2, 6)).toBe(150); // Center of third segment
    });
  });

  describe('calculateFinalRotation', () => {
    it('should calculate rotation with extra spins', () => {
      const segmentIndex = 2;
      const totalSegments = 6;
      const currentRotation = 0;
      const extraSpins = 3;
      
      const result = calculateFinalRotation(segmentIndex, totalSegments, currentRotation, extraSpins);
      
      // Should be: 3 full rotations (1080°) + angle to segment 2 (150°) = 1230°
      expect(result).toBe(1230);
    });

    it('should add to current rotation', () => {
      const segmentIndex = 1;
      const totalSegments = 4;
      const currentRotation = 180;
      const extraSpins = 2;
      
      const result = calculateFinalRotation(segmentIndex, totalSegments, currentRotation, extraSpins);
      
      // Should be: current (180°) + 2 full rotations (720°) + angle to segment 1 (135°) = 1035°
      expect(result).toBe(1035);
    });
  });
});