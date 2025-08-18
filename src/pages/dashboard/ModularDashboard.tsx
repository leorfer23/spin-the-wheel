import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/layout/DashboardLayout";
import { ProductSelector } from "../../components/dashboard/layout/ProductSelector";
import type { ProductType } from "@/types/product";
import { ProductConfigurationPanel } from "../../components/dashboard/layout/ProductConfigurationPanel";
import { WheelProduct } from "../../components/dashboard/products/wheel/WheelProduct";
import { JackpotProduct } from "../../components/dashboard/products/jackpot/JackpotProduct";
import { IntegrationNotification } from "../../components/dashboard/IntegrationNotification";
import { useWheelStore } from "../../stores/wheelStore";
import { useJackpotStore } from "../../stores/jackpotStore";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export const ModularDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product: productParam, wheelId, jackpotId } = useParams();

  const validProducts: ProductType[] = useMemo(
    () => ["wheel", "jackpot", "lottery", "scratch-card", "slot-machine"],
    []
  );

  const [selectedProduct, setSelectedProduct] = useState<ProductType>("wheel");

  // Check for OAuth flow recovery
  useEffect(() => {
    const checkOAuthRecovery = async () => {
      const params = new URLSearchParams(location.search);
      const isOAuthCallback = params.get('integration_success') === 'true' || 
                             params.get('integration_error') !== null;
      
      if (isOAuthCallback) {
        // Check if we have stored OAuth user info
        const storedUserId = localStorage.getItem('oauth_user_id');
        const initiatedAt = localStorage.getItem('oauth_initiated_at');
        
        if (storedUserId && initiatedAt) {
          // Check if OAuth was initiated recently (within last 10 minutes)
          const timeDiff = Date.now() - parseInt(initiatedAt);
          if (timeDiff < 10 * 60 * 1000) { // 10 minutes
            // Verify current session matches stored user
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session || session.user.id !== storedUserId) {
              console.log('Session mismatch after OAuth, attempting recovery...');
              // Try to refresh the session
              const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
              
              if (!refreshedSession) {
                console.error('Could not recover session after OAuth');
                // Clear OAuth storage and redirect to login
                localStorage.removeItem('oauth_user_id');
                localStorage.removeItem('oauth_initiated_at');
                navigate(`/login${location.search}`);
                return;
              }
            }
          }
          
          // Clear OAuth storage after successful recovery
          localStorage.removeItem('oauth_user_id');
          localStorage.removeItem('oauth_initiated_at');
        }
      }
    };
    
    checkOAuthRecovery();
  }, [location.search, navigate]);

  // Keep selected product in sync with URL params
  useEffect(() => {
    if (wheelId) {
      if (selectedProduct !== "wheel") setSelectedProduct("wheel");
      return;
    }
    if (jackpotId) {
      if (selectedProduct !== "jackpot") setSelectedProduct("jackpot");
      return;
    }
    if (productParam && validProducts.includes(productParam as ProductType)) {
      const next = productParam as ProductType;
      if (next !== selectedProduct) setSelectedProduct(next);
    }
  }, [productParam, wheelId, jackpotId]);

  // Get wheel state from Zustand store
  const { wheelMode, selectedWheelId, setWheelMode } = useWheelStore();
  const { selectedJackpotId } = useJackpotStore();

  const renderProduct = () => {
    switch (selectedProduct) {
      case "wheel":
        return <WheelProduct onModeChange={setWheelMode} mode={wheelMode} />;
      case "jackpot":
        return <JackpotProduct mode={wheelMode} />;
      case "lottery":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Sorteo de la Suerte
            </h2>
            <p className="text-gray-600">¡Próximamente! 🎰</p>
          </div>
        );
      case "scratch-card":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Tarjetas Rasca y Gana
            </h2>
            <p className="text-gray-600">¡Próximamente! 🎟️</p>
          </div>
        );
      case "slot-machine":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Máquina Tragamonedas
            </h2>
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
      <div className="onboarding-welcome" />
      <DashboardLayout
        leftContent={
          <ProductSelector
            selectedProduct={selectedProduct}
            onProductChange={(p) => {
              setSelectedProduct(p);
              navigate(`/dashboard/${p}`);
            }}
          >
            {renderProduct()}
          </ProductSelector>
        }
        rightContent={
          <ProductConfigurationPanel
            key={`${selectedProduct}-${
              selectedWheelId || selectedJackpotId || "none"
            }`}
            product={selectedProduct}
            mode={wheelMode}
          />
        }
      />
      <div className="onboarding-complete" />
    </>
  );
};
