import React, { useState, useCallback } from 'react';
import { Reel, Symbol } from './Reel';
import './jackpot.css';

export const JackpotMachine: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<(Symbol | null)[]>([null, null, null]);
  const [prize, setPrize] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const checkWin = (symbols: Symbol[]) => {
    if (symbols[0].id === symbols[1].id && symbols[1].id === symbols[2].id) {
      setPrize(`🎉 Jackpot! ${symbols[0].discount} on your next order!`);
      return true;
    }
    
    if (symbols[0].id === symbols[1].id || symbols[1].id === symbols[2].id || symbols[0].id === symbols[2].id) {
      const matchingSymbol = symbols[0].id === symbols[1].id ? symbols[0] : 
                            symbols[1].id === symbols[2].id ? symbols[1] : symbols[0];
      setPrize(`✨ You won ${matchingSymbol.discount}!`);
      return true;
    }

    const randomPrize = symbols[Math.floor(Math.random() * 3)];
    setPrize(`🎁 Special offer: ${randomPrize.discount}!`);
    return true;
  };

  const handleSpin = () => {
    if (spinning || hasPlayed) return;
    
    setSpinning(true);
    setPrize(null);
    setResults([null, null, null]);
  };

  const handleReelStop = useCallback((index: number, symbol: Symbol) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = symbol;
      
      if (newResults.every(r => r !== null)) {
        checkWin(newResults as Symbol[]);
        setSpinning(false);
        setHasPlayed(true);
        setTimeout(() => setShowEmailForm(true), 1500);
      }
      
      return newResults;
    });
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Coupon sent to ${email}!`);
      setShowEmailForm(false);
    }
  };

  return (
    <div className="jackpot-wrapper">
      <div className="jackpot-machine">
        <div className="machine-card">
          <div className="machine-header">
            <h2 className="machine-title">Spin for a Deal! 🎰</h2>
            <p className="machine-subtitle">Try your luck for exclusive discounts</p>
          </div>

          <div className="reels-container">
            <div className="reels-window">
              <Reel 
                spinning={spinning} 
                onStop={(symbol) => handleReelStop(0, symbol)}
                stopDelay={500}
                reelIndex={0}
              />
              <Reel 
                spinning={spinning} 
                onStop={(symbol) => handleReelStop(1, symbol)}
                stopDelay={1000}
                reelIndex={1}
              />
              <Reel 
                spinning={spinning} 
                onStop={(symbol) => handleReelStop(2, symbol)}
                stopDelay={1500}
                reelIndex={2}
              />
            </div>
            <div className="win-line" />
          </div>

          {prize && (
            <div className="prize-display">
              <div className="prize-text">{prize}</div>
            </div>
          )}

          {!hasPlayed && (
            <button 
              className={`spin-button ${spinning ? 'spinning' : ''}`}
              onClick={handleSpin}
              disabled={spinning}
            >
              {spinning ? 'Revealing...' : 'Tap to Reveal Your Deal'}
            </button>
          )}

          {showEmailForm && (
            <form onSubmit={handleEmailSubmit} className="email-form">
              <input
                type="email"
                placeholder="Enter your email to claim"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
                required
              />
              <button type="submit" className="claim-button">
                Claim Discount
              </button>
            </form>
          )}

          {hasPlayed && !showEmailForm && (
            <div className="completion-message">
              <p>Check your email for your discount code!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};