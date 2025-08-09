import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/layout/DashboardLayout';
import { ProductSelector } from '../../components/dashboard/layout/ProductSelector';
import type { ProductType } from '../../components/dashboard/layout/ProductSelector';
import { ConfigurationPanel } from '../../components/dashboard/layout/ConfigurationPanel';
import { WheelProduct } from '../../components/dashboard/products/wheel/WheelProduct';
import { IntegrationNotification } from '../../components/dashboard/IntegrationNotification';
import { useWheelStore } from '../../stores/wheelStore';

export const ModularDashboard: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('wheel');
  
  // Get wheel state from Zustand store
  const { 
    hasWheelSelected, 
    wheelMode, 
    selectedWheelId, 
    selectedWheel,
    setWheelMode 
  } = useWheelStore();

  const renderProduct = () => {
    switch (selectedProduct) {
      case 'wheel':
        return <WheelProduct 
          onModeChange={setWheelMode}
          mode={wheelMode}
        />;
      case 'lottery':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sorteo de la Suerte</h2>
            <p className="text-gray-600">¡Próximamente! 🎰</p>
          </div>
        );
      case 'scratch-card':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tarjetas Rasca y Gana</h2>
            <p className="text-gray-600">¡Próximamente! 🎟️</p>
          </div>
        );
      case 'slot-machine':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Máquina Tragamonedas</h2>
            <p className="text-gray-600">¡Próximamente! 🎲</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <IntegrationNotification />
      <DashboardLayout
        leftContent={
          <ProductSelector
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
          >
            {renderProduct()}
          </ProductSelector>
        }
        rightContent={
          selectedProduct === 'wheel' && hasWheelSelected ? (
            <ConfigurationPanel 
              key={selectedWheelId}
              mode={wheelMode}
              wheelData={selectedWheel}
            />
          ) : selectedProduct !== 'wheel' ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Configuración próximamente</p>
            </div>
          ) : null
        }
      />
    </>
  );
};