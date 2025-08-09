import React, { useState, useEffect, useRef } from 'react';

export type Symbol = {
  id: string;
  emoji: string;
  name: string;
  discount: string;
  color: string;
};

export const SYMBOLS: Symbol[] = [
  { id: 'gift', emoji: '🎁', name: 'Free Shipping', discount: 'FREE SHIPPING', color: '#10b981' },
  { id: 'percent10', emoji: '10%', name: '10% Off', discount: '10% OFF', color: '#3b82f6' },
  { id: 'percent15', emoji: '15%', name: '15% Off', discount: '15% OFF', color: '#8b5cf6' },
  { id: 'percent20', emoji: '20%', name: '20% Off', discount: '20% OFF', color: '#ec4899' },
  { id: 'dollar5', emoji: '$5', name: '$5 Off', discount: '$5 OFF', color: '#06b6d4' },
  { id: 'surprise', emoji: '✨', name: 'Mystery Deal', discount: 'SURPRISE', color: '#f59e0b' },
];

interface ReelProps {
  spinning: boolean;
  onStop: (symbol: Symbol) => void;
  stopDelay: number;
  reelIndex: number;
}

export const Reel: React.FC<ReelProps> = ({ spinning, onStop, stopDelay, reelIndex }) => {
  const [position, setPosition] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const reelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const velocityRef = useRef(0);

  const SYMBOL_HEIGHT = 100;
  const VISIBLE_SYMBOLS = 3;
  const TOTAL_SYMBOLS = 9;

  useEffect(() => {
    const extendedSymbols: Symbol[] = [];
    for (let i = 0; i < TOTAL_SYMBOLS; i++) {
      extendedSymbols.push(SYMBOLS[i % SYMBOLS.length]);
    }
    setSymbols(extendedSymbols);
  }, []);

  useEffect(() => {
    if (spinning && !isSpinning) {
      startSpin();
    } else if (!spinning && isSpinning) {
      setTimeout(() => stopSpin(), stopDelay);
    }
  }, [spinning]);

  const startSpin = () => {
    setIsSpinning(true);
    velocityRef.current = 20;
    animate();
  };

  const animate = () => {
    if (!velocityRef.current || velocityRef.current < 0.1) return;

    setPosition(prev => {
      const newPos = prev + velocityRef.current;
      if (newPos >= SYMBOL_HEIGHT * symbols.length) {
        return newPos % (SYMBOL_HEIGHT * symbols.length);
      }
      return newPos;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopSpin = () => {
    const targetSymbolIndex = Math.floor(Math.random() * SYMBOLS.length);
    const targetPosition = targetSymbolIndex * SYMBOL_HEIGHT + SYMBOL_HEIGHT;
    
    const decelerate = () => {
      velocityRef.current *= 0.88;
      
      if (velocityRef.current < 0.5) {
        velocityRef.current = 0;
        setIsSpinning(false);
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        // Snap to final position
        setPosition(targetPosition);
        const finalSymbol = SYMBOLS[targetSymbolIndex];
        onStop(finalSymbol);
      } else {
        setPosition(prev => {
          const newPos = prev + velocityRef.current;
          if (newPos >= SYMBOL_HEIGHT * symbols.length) {
            return newPos % (SYMBOL_HEIGHT * symbols.length);
          }
          return newPos;
        });
        animationRef.current = requestAnimationFrame(decelerate);
      }
    };
    
    decelerate();
  };

  return (
    <div className="reel-container">
      <div className="reel-window">
        <div 
          ref={reelRef}
          className="reel-strip"
          style={{
            transform: `translateY(-${position}px)`,
            filter: isSpinning && velocityRef.current > 10 ? 'blur(1px)' : 'none',
            transition: !isSpinning && velocityRef.current === 0 ? 'transform 0.3s ease-out' : 'none'
          }}
        >
          {symbols.concat(symbols).map((symbol, index) => (
            <div key={index} className="symbol">
              <span className="symbol-emoji">{symbol.emoji}</span>
            </div>
          ))}
        </div>
        <div className="reel-shadows" />
      </div>
    </div>
  );
};