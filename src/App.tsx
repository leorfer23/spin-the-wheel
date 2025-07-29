import { useState } from 'react';
import { FortuneWheel } from './components/wheel/FortuneWheel';
import { FloatingInsights } from './components/FloatingInsights';
import { CelebrationPopup } from './components/CelebrationPopup';
import type { WheelConfig, SpinResult } from './types/wheel.types';
import './App.css';

const defaultWheelConfig: WheelConfig = {
  segments: [
    { id: '1', label: '25% DESC', value: '25OFF', color: '#FF6B6B', weight: 2 },
    { id: '2', label: 'Lo siento', value: 'SORRY', color: '#4ECDC4', weight: 5 },
    { id: '3', label: '30% DESC', value: '30OFF', color: '#FF8C42', weight: 1 },
    { id: '4', label: 'Sin suerte', value: 'NOLUCK', color: '#95A99C', weight: 5 },
    { id: '5', label: 'Próxima vez', value: 'NEXTTIME', color: '#FFD93D', textColor: '#333', weight: 5 }
  ],
  dimensions: {
    diameter: 400,
    innerRadius: 40,
    pegRingWidth: 30,
    pegSize: 10,
    pegCount: 10
  },
  style: {
    shadow: '0 15px 40px rgba(0, 0, 0, 0.25)',
    borderColor: '#ffffff',
    borderWidth: 10
  },
  centerCircle: {
    text: 'SPIN',
    backgroundColor: '#ffffff',
    textColor: '#666666',
    fontSize: 16,
    showButton: true
  },
  pointer: {
    color: '#FF1744',
    size: 45,
    style: 'arrow'
  },
  spinConfig: {
    duration: 4,
    easing: 'ease-out',
    minRotations: 3,
    maxRotations: 5,
    allowDrag: true
  }
};

/**
 * Main demo application component showcasing the Fortune Wheel functionality.
 * This component serves as a public demo page for the spin wheel widget.
 */
function App() {
  const [config] = useState<WheelConfig>(defaultWheelConfig);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [spinsCount, setSpinsCount] = useState(0);

  const handleSpinComplete = (result: SpinResult) => {
    setSpinResult(result);
    setSpinsCount(prev => prev + 1);
  };

  const handleEmailCapture = () => {
    console.log('Email capture activated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center p-8">
      <FloatingInsights 
        spinsCount={spinsCount}
        onEmailCapture={handleEmailCapture}
      />

      <div className="max-w-4xl w-full transition-all duration-300">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Demo Rueda de la Fortuna
        </h1>
        
        <div className="flex justify-center mb-8">
          <FortuneWheel
            config={config}
            onSpinComplete={handleSpinComplete}
            hidePointer={!!spinResult}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Características Principales</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Selección de probabilidad ponderada</li>
            <li>✓ Animaciones suaves con física realista</li>
            <li>✓ Funcionalidad de arrastrar para girar y hacer clic para girar</li>
            <li>✓ Segmentos y estilos totalmente personalizables</li>
            <li>✓ Puntero animado con efectos de colisión</li>
          </ul>
        </div>

        <div className="text-center text-gray-600">
          <p className="text-lg">
            <span className="font-medium">Total de Giros:</span> {spinsCount}
          </p>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            ¡Intenta arrastrar la rueda o hacer clic en el botón central para girar!
          </p>
        </div>
      </div>

      <CelebrationPopup
        result={spinResult}
        onClose={() => setSpinResult(null)}
      />
    </div>
  );
}

export default App;
