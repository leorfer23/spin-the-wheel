import { useState, useCallback, useRef } from 'react';
import { Reel } from './Reel';
import { Handle } from './Handle';
import confetti from 'canvas-confetti';
import type { 
  JackpotConfig,
  PayoutRule,
  RewardTier 
} from '@/components/dashboard/products/jackpot/types';

interface JackpotMachineProps {
  config: JackpotConfig;
  onSpin?: (spinId: string) => void;
  onResult?: (result: {
    spinId: string;
    symbols: string[];
    reward?: RewardTier;
    pattern?: PayoutRule;
  }) => void;
  disabled?: boolean;
  className?: string;
}

type GameState = 'idle' | 'pulling' | 'spinning' | 'stopping' | 'revealing' | 'complete';

export const JackpotMachine = ({
  config,
  onSpin,
  onResult,
  disabled = false,
  className = ''
}: JackpotMachineProps) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentSpinId, setCurrentSpinId] = useState<string>('');
  const [reelResults, setReelResults] = useState<string[][]>([[], [], []]);
  const [winningReward, setWinningReward] = useState<RewardTier | null>(null);
  const [showWin, setShowWin] = useState(false);
  const reelsStoppedRef = useRef(0);

  // Generate unique spin ID
  const generateSpinId = () => {
    return `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Check for winning patterns
  const checkWinningPattern = useCallback((symbolIds: string[]): { 
    reward?: RewardTier; 
    pattern?: PayoutRule 
  } => {
    // Get middle symbol from each reel (center of visible window)
    const centerSymbols = symbolIds.filter((_, i) => i % 3 === 1);
    
    // Check each payout rule
    for (const rule of config.payouts) {
      const matches = rule.pattern.every((symbolId, idx) => 
        centerSymbols[idx] === symbolId
      );
      
      if (matches) {
        const reward = config.rewards.find(r => r.id === rule.rewardTierId);
        if (reward) {
          return { reward, pattern: rule };
        }
      }
    }
    
    return {};
  }, [config.payouts, config.rewards]);

  // Handle pull action
  const handlePull = useCallback(() => {
    if (gameState !== 'idle' || disabled) return;
    
    const spinId = generateSpinId();
    setCurrentSpinId(spinId);
    setGameState('spinning');
    setWinningReward(null);
    setShowWin(false);
    setReelResults([[], [], []]);
    reelsStoppedRef.current = 0;
    
    if (onSpin) {
      onSpin(spinId);
    }
  }, [gameState, disabled, onSpin]);

  // Handle reel stop
  const handleReelStop = useCallback((reelIndex: number, symbolIds: string[]) => {
    setReelResults(prev => {
      const newResults = [...prev];
      newResults[reelIndex] = symbolIds;
      return newResults;
    });
    
    reelsStoppedRef.current++;
    
    // All reels stopped
    if (reelsStoppedRef.current === 3) {
      setGameState('revealing');
      
      // Check for win
      setTimeout(() => {
        const allSymbols = reelResults.flat();
        allSymbols.push(...symbolIds); // Add last reel's symbols
        
        const { reward, pattern } = checkWinningPattern(allSymbols);
        
        if (reward) {
          setWinningReward(reward);
          setShowWin(true);
          
          // Fire confetti for major wins
          if (reward.id === 'jackpot' || reward.id === 'major') {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
        
        setGameState('complete');
        
        if (onResult) {
          onResult({
            spinId: currentSpinId,
            symbols: allSymbols,
            reward,
            pattern
          });
        }
        
        // Reset to idle after delay
        setTimeout(() => {
          setGameState('idle');
        }, 3000);
      }, 500);
    }
  }, [reelResults, checkWinningPattern, currentSpinId, onResult]);

  const isSpinning = gameState === 'spinning' || gameState === 'stopping';

  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{
        background: config.appearance.background,
        boxShadow: config.appearance.shadow ? '0 20px 40px rgba(0,0,0,0.3)' : 'none',
        borderRadius: '16px',
        padding: '2rem'
      }}
    >
      <div className="flex items-center gap-0">
        {/* Machine frame */}
        <div 
          className="relative p-6 rounded-xl"
          style={{
            backgroundColor: config.appearance.machineFrame.color,
            borderRadius: `${config.appearance.machineFrame.borderRadius}px`,
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-400 tracking-wider">
              🎰 JACKPOT 🎰
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              ¡Prueba tu suerte!
            </p>
          </div>

          {/* Lights marquee */}
          {config.appearance.lights.enabled && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-2 right-2 h-3 flex justify-around">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, #ffd700, #b8941f)`,
                      boxShadow: isSpinning ? '0 0 8px rgba(255,215,0,0.8)' : '0 0 4px rgba(255,215,0,0.3)',
                      animation: `pulse ${1 + (i % 2) * 0.5}s infinite`,
                      opacity: isSpinning ? 1 : 0.5,
                      border: '1px solid #8b7514'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reels container */}
          <div className="flex justify-center gap-2 mb-6">
            {config.reels.map((reelConfig, index) => (
              <Reel
                key={reelConfig.id}
                config={reelConfig}
                symbols={config.symbols}
                spinning={isSpinning}
                stopDelay={500 + (index * 500)}
                onStop={(symbolIds) => handleReelStop(index, symbolIds)}
              />
            ))}
          </div>

          {/* Status indicator */}
          <div className="text-center">
            <div className="text-sm text-gray-400">
              {gameState === 'idle' && 'Listo para jugar'}
              {gameState === 'spinning' && 'Girando...'}
              {gameState === 'revealing' && 'Revelando...'}
              {gameState === 'complete' && (winningReward ? '¡Ganaste!' : 'Inténtalo de nuevo')}
            </div>
          </div>
        </div>

        {/* Handle on the right side */}
        <Handle
          config={config.handle}
          onPull={handlePull}
          disabled={disabled || gameState !== 'idle'}
          machineFrameColor={config.appearance.machineFrame.color}
          className="-ml-6"
        />
      </div>

        {/* Win display */}
        {showWin && winningReward && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 100 }}>
            <div 
              className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 px-8 py-6 rounded-2xl shadow-2xl transform scale-110 animate-bounce"
              style={{
                animation: 'bounce 1s ease-in-out'
              }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {winningReward.name}
                </div>
                <div className="text-lg">
                  {winningReward.description}
                </div>
                {winningReward.couponConfig && (
                  <div className="mt-3 text-2xl font-bold">
                    {winningReward.couponConfig.discount}% OFF
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


      {/* Glow effect */}
      {config.appearance.glow && isSpinning && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.2), transparent)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}
    </div>
  );
};