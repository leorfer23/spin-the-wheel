import { useEffect, useRef, useState, useCallback } from 'react';
import { Symbol } from './Symbol';
import type { JackpotSymbol, ReelConfig } from '@/components/dashboard/products/jackpot/types';

interface ReelProps {
  config: ReelConfig;
  symbols: JackpotSymbol[];
  spinning: boolean;
  onStop?: (symbolIds: string[]) => void;
  stopDelay?: number;
}

export const Reel = ({
  config,
  symbols,
  spinning,
  onStop,
  stopDelay = 1000
}: ReelProps) => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displaySymbols, setDisplaySymbols] = useState<JackpotSymbol[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const SYMBOL_HEIGHT = 80;
  const SPIN_SPEED = 30;
  const DECELERATION = 0.95;

  // Build extended reel strip for seamless looping
  const buildReelStrip = useCallback(() => {
    const strip: JackpotSymbol[] = [];
    const totalSymbols = config.symbols.length;
    
    // Create 3x the symbols for smooth looping
    for (let i = 0; i < totalSymbols * 3; i++) {
      const symbolId = config.symbols[i % totalSymbols];
      const symbol = symbols.find(s => s.id === symbolId);
      if (symbol) strip.push(symbol);
    }
    
    return strip;
  }, [config.symbols, symbols]);

  // Initialize reel strip
  useEffect(() => {
    setDisplaySymbols(buildReelStrip());
  }, [buildReelStrip]);

  // Get weighted random stop position
  const getWeightedStopIndex = useCallback(() => {
    const weights = Object.values(config.weights);
    const totalWeight = weights.reduce((a: number, b: number) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < config.symbols.length; i++) {
      const symbolId = config.symbols[i];
      random -= config.weights[symbolId] || 0;
      if (random <= 0) return i;
    }
    
    return Math.floor(Math.random() * config.symbols.length);
  }, [config]);

  // Animation loop
  const animate = useCallback(() => {
    if (!isSpinning) return;
    
    // Update position
    positionRef.current += velocityRef.current;
    
    // Wrap around for seamless looping
    const stripHeight = config.symbols.length * SYMBOL_HEIGHT;
    if (positionRef.current > stripHeight) {
      positionRef.current -= stripHeight;
    }
    
    setCurrentPosition(positionRef.current);
    
    // Apply deceleration when stopping
    if (velocityRef.current < SPIN_SPEED * 0.1) {
      // Snap to final position
      const targetIndex = getWeightedStopIndex();
      const targetPosition = targetIndex * SYMBOL_HEIGHT;
      
      if (Math.abs(positionRef.current - targetPosition) < 2) {
        setIsSpinning(false);
        setCurrentPosition(targetPosition);
        
        // Report visible symbols
        if (onStop) {
          const visibleSymbolIds: string[] = [];
          for (let i = 0; i < config.visibleWindow; i++) {
            const idx = (targetIndex + i) % config.symbols.length;
            visibleSymbolIds.push(config.symbols[idx]);
          }
          onStop(visibleSymbolIds);
        }
        return;
      }
      
      // Smooth approach to target
      positionRef.current += (targetPosition - positionRef.current) * 0.1;
    } else {
      velocityRef.current *= DECELERATION;
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, config, getWeightedStopIndex, onStop]);

  // Start/stop spinning
  useEffect(() => {
    if (spinning && !isSpinning) {
      setIsSpinning(true);
      velocityRef.current = SPIN_SPEED;
      
      // Schedule stop
      setTimeout(() => {
        velocityRef.current = SPIN_SPEED * 0.05;
      }, stopDelay);
    }
  }, [spinning, stopDelay]);

  // Run animation
  useEffect(() => {
    if (isSpinning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, animate]);

  return (
    <div 
      className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800"
      style={{ 
        width: SYMBOL_HEIGHT, 
        height: SYMBOL_HEIGHT * config.visibleWindow,
        borderRadius: '8px'
      }}
    >
      <div 
        className="absolute transition-transform"
        style={{
          transform: `translateY(-${currentPosition}px)`,
          transition: isSpinning ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {displaySymbols.map((symbol, idx) => (
          <Symbol
            key={`${symbol.id}-${idx}`}
            symbol={symbol}
            size={SYMBOL_HEIGHT}
            className="border-b border-gray-700"
          />
        ))}
      </div>
      
      {/* Win line indicator */}
      <div 
        className="absolute pointer-events-none"
        style={{
          top: SYMBOL_HEIGHT,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
          opacity: 0.8
        }}
      />
    </div>
  );
};