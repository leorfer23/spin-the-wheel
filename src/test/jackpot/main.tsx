import React from 'react';
import { createRoot } from 'react-dom/client';
import { JackpotMachine } from '@/components/jackpot/JackpotMachine';
import type { JackpotConfig } from '@/components/dashboard/products/jackpot/types';
import {
  DEFAULT_JACKPOT_SYMBOLS,
  DEFAULT_REELS,
  DEFAULT_PAYOUT_RULES,
  DEFAULT_REWARD_TIERS,
  DEFAULT_APPEARANCE,
  DEFAULT_HANDLE,
  DEFAULT_SOUNDS
} from '@/config/jackpotDefaults';

const App = () => {
  const [config] = React.useState<JackpotConfig>({
    id: 'test-jackpot',
    name: 'Test Jackpot',
    symbols: DEFAULT_JACKPOT_SYMBOLS,
    reels: DEFAULT_REELS,
    payouts: DEFAULT_PAYOUT_RULES,
    rewards: DEFAULT_REWARD_TIERS,
    appearance: DEFAULT_APPEARANCE,
    handle: DEFAULT_HANDLE,
    sounds: DEFAULT_SOUNDS
  });

  const handleSpin = (spinId: string) => {
    console.log('Spin started:', spinId);
  };

  const handleResult = (result: any) => {
    console.log('Spin result:', result);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'white' }}>Jackpot Machine Test</h1>
      <JackpotMachine
        config={config}
        onSpin={handleSpin}
        onResult={handleResult}
      />
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}