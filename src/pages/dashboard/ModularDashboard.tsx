import React, { useState, useRef } from 'react';
import { DashboardLayout } from '../../components/dashboard/layout/DashboardLayout';
import { ProductSelector } from '../../components/dashboard/layout/ProductSelector';
import type { ProductType } from '../../components/dashboard/layout/ProductSelector';
import { ConfigurationPanel } from '../../components/dashboard/layout/ConfigurationPanel';
import type { ConfigSection } from '../../components/dashboard/layout/ConfigurationPanel';
import { WheelProduct } from '../../components/dashboard/products/wheel/WheelProduct';

export const ModularDashboard: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('wheel');
  const [hasWheelSelected, setHasWheelSelected] = useState(false);
  const configRenderRef = useRef<(section: ConfigSection) => React.ReactNode>(() => null);

  const handleConfigRender = (renderFn: (section: ConfigSection) => React.ReactNode) => {
    configRenderRef.current = renderFn;
  };

  const renderProduct = () => {
    switch (selectedProduct) {
      case 'wheel':
        return <WheelProduct onConfigRender={handleConfigRender} onWheelSelectionChange={setHasWheelSelected} />;
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
          <ConfigurationPanel>
            {(activeSection) => configRenderRef.current(activeSection)}
          </ConfigurationPanel>
        ) : selectedProduct !== 'wheel' ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Configuración próximamente</p>
          </div>
        ) : null
      }
    />
  );
};