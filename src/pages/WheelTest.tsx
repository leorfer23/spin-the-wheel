import React, { useState, useRef } from 'react';
import { FortuneWheel } from '@/components/wheel/FortuneWheel';
import type { WheelConfig, SpinResult } from '@/types/wheel.types';

const WheelTest: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [actualWinner, setActualWinner] = useState<SpinResult | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    intended: string;
    actual: string;
    match: boolean;
    timestamp: string;
  }>>([]);
  const [autoTestRunning, setAutoTestRunning] = useState(false);
  const [segmentCount, setSegmentCount] = useState(6);
  const spinCountRef = useRef(0);

  const generateSegments = (count: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#FFD93D', '#6BCB77', '#8B78E6'
    ];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `segment-${i}`,
      label: `Segment ${i}`,
      value: `prize-${i}`,
      color: colors[i % colors.length],
      weight: 1, // Equal weight for testing
    }));
  };

  const [config, setConfig] = useState<WheelConfig>({
    segments: generateSegments(segmentCount),
    dimensions: {
      diameter: 400,
      innerRadius: 40,
      pegRingWidth: 30,
      pegSize: 10,
      pegCount: 12,
    },
    style: {
      borderColor: '#333',
      borderWidth: 8,
      shadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    },
    spinConfig: {
      duration: 2,
      minRotations: 3,
      maxRotations: 5,
      easing: 'ease-out',
      allowDrag: false,
    },
    centerCircle: {
      text: 'TEST',
      backgroundColor: '#333',
      textColor: '#fff',
      fontSize: 20,
    },
    pointer: {
      color: '#FF0000',
      size: 45,
    }
  });

  const handleSpinComplete = (result: SpinResult) => {
    setActualWinner(result);
    
    // Log the test result
    const intended = selectedSegment !== null ? `Segment ${selectedSegment}` : 'Random';
    const actual = result.segment.label;
    const match = intended === actual || selectedSegment === null;
    
    const newResult = {
      intended,
      actual,
      match,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setTestResults(prev => [newResult, ...prev].slice(0, 10));
    
    // Continue auto-test if running
    if (autoTestRunning && spinCountRef.current < 10) {
      spinCountRef.current++;
      setTimeout(() => {
        const nextSegment = Math.floor(Math.random() * config.segments.length);
        setSelectedSegment(nextSegment);
        // Trigger spin programmatically here if we had a ref to the spin function
      }, 1000);
    } else if (autoTestRunning) {
      setAutoTestRunning(false);
      spinCountRef.current = 0;
    }
  };

  const handleSegmentCountChange = (count: number) => {
    setSegmentCount(count);
    setConfig(prev => ({
      ...prev,
      segments: generateSegments(count)
    }));
    setTestResults([]);
  };

  const runAutoTest = () => {
    setAutoTestRunning(true);
    setTestResults([]);
    spinCountRef.current = 0;
    // Start with first segment
    setSelectedSegment(0);
  };

  const calculateSuccessRate = () => {
    if (testResults.length === 0) return 0;
    const matches = testResults.filter(r => r.match).length;
    return ((matches / testResults.length) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wheel Rotation Test Suite</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Wheel and Controls */}
          <div className="space-y-6">
            {/* Wheel Container */}
            <div className="bg-white rounded-lg shadow-lg p-8 flex justify-center items-center">
              <FortuneWheel 
                config={config} 
                onSpinComplete={handleSpinComplete}
              />
            </div>

            {/* Control Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              
              <div className="space-y-4">
                {/* Segment Count */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Segments: {segmentCount}
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    value={segmentCount}
                    onChange={(e) => handleSegmentCountChange(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Manual Segment Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Segment (for testing)
                  </label>
                  <select 
                    value={selectedSegment ?? -1}
                    onChange={(e) => setSelectedSegment(e.target.value === '-1' ? null : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="-1">Random (Normal Mode)</option>
                    {config.segments.map((_, i) => (
                      <option key={i} value={i}>Segment {i}</option>
                    ))}
                  </select>
                </div>

                {/* Test Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={runAutoTest}
                    disabled={autoTestRunning}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {autoTestRunning ? 'Running...' : 'Run Auto Test (10 spins)'}
                  </button>
                  <button
                    onClick={() => setTestResults([])}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            </div>

            {/* Current Result */}
            {actualWinner && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Last Spin Result</h2>
                <div className="space-y-2">
                  <p><strong>Winner:</strong> {actualWinner.segment.label}</p>
                  <p><strong>Rotation:</strong> {actualWinner.rotation.toFixed(1)}°</p>
                  <p><strong>Normalized:</strong> {(actualWinner.rotation % 360).toFixed(1)}°</p>
                  <p><strong>Duration:</strong> {actualWinner.duration}s</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Test Results */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{testResults.length}</p>
                  <p className="text-sm text-gray-600">Total Tests</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">
                    {testResults.filter(r => r.match).length}
                  </p>
                  <p className="text-sm text-gray-600">Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500">
                    {calculateSuccessRate()}%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
            </div>

            {/* Test History */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test History</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500">No tests run yet</p>
                ) : (
                  testResults.map((result, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-md ${
                        result.match ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      } border`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">Intended:</span> {result.intended}
                          <span className="mx-2">→</span>
                          <span className="font-medium">Actual:</span> {result.actual}
                        </div>
                        <div className="flex items-center gap-2">
                          {result.match ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
              <div className="space-y-2 text-sm font-mono">
                <p>Segments: {config.segments.length}</p>
                <p>Segment Angle: {(360 / config.segments.length).toFixed(2)}°</p>
                <p>Duration: {config.spinConfig.duration}s</p>
                <p>Min Rotations: {config.spinConfig.minRotations}</p>
                <p>Max Rotations: {config.spinConfig.maxRotations}</p>
                <p>Easing: {config.spinConfig.easing}</p>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Rotation Formula</h3>
              <code className="text-xs block bg-white p-3 rounded">
                targetRotation = (rotations * 360) - (selectedIndex * segmentAngle) + randomOffset
              </code>
              <p className="text-sm mt-3 text-gray-700">
                This formula ensures the selected segment aligns with the pointer at the top (12 o'clock position).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelTest;