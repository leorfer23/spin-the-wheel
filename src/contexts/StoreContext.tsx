import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StoreService } from '../services/storeService';
import { useAuth } from './AuthContext';
import { useWheelStore } from '../stores/wheelStore';

interface StoreContextType {
  selectedStoreId: string | null;
  setSelectedStoreId: (storeId: string | null) => void;
  stores: any[];
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedStoreId, setSelectedStoreIdState] = useState<string | null>(null);
  const resetWheelSelection = useWheelStore(state => state.resetWheelSelection);
  
  // Wrap setSelectedStoreId to reset wheel selection when store changes
  const setSelectedStoreId = (storeId: string | null) => {
    if (storeId !== selectedStoreId) {
      resetWheelSelection();
    }
    setSelectedStoreIdState(storeId);
  };

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["userStores"],
    queryFn: async () => {
      const response = await StoreService.getUserStores();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: !!user,
  });

  // Auto-select first store only once when stores load
  // Using stores.length as dependency to trigger only when stores actually change
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      // Stores are already sorted by wheel count in the service
      // Select the first one (which has the most wheels)
      setSelectedStoreId(stores[0].id);
    }
  }, [stores.length]); // Only depend on length, not selectedStoreId to avoid loops

  return (
    <StoreContext.Provider value={{ selectedStoreId, setSelectedStoreId, stores, isLoading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};