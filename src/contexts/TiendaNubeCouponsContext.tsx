import { createContext, useContext, type ReactNode } from 'react';
import { useTiendaNubeCoupons } from '@/hooks/useTiendaNubeCoupons';
import type { TiendaNubeCoupon, CreateCouponPayload } from '@/types/tiendanube.types';

interface TiendaNubeCouponsContextValue {
  coupons: TiendaNubeCoupon[];
  isLoading: boolean;
  isCreating: boolean;
  createCoupon: (data: CreateCouponPayload) => Promise<TiendaNubeCoupon | undefined>;
  generateUniqueCode: (baseCode: string) => Promise<string | null>;
  refetch: () => void;
}

const TiendaNubeCouponsContext = createContext<TiendaNubeCouponsContextValue | null>(null);

interface TiendaNubeCouponsProviderProps {
  children: ReactNode;
  storeId: string | null;
  isConnected: boolean;
  onReauthRequired?: () => void;
}

export function TiendaNubeCouponsProvider({
  children,
  storeId,
  isConnected,
  onReauthRequired
}: TiendaNubeCouponsProviderProps) {
  const {
    coupons,
    isLoading,
    isCreating,
    createCouponAsync,
    generateUniqueCode,
    refetch
  } = useTiendaNubeCoupons({
    storeId: storeId || undefined,
    filters: {
      valid: true,
      sort_by: 'created-at-descending',
      per_page: 50
    },
    enabled: isConnected && !!storeId,
    onReauthRequired
  });

  return (
    <TiendaNubeCouponsContext.Provider
      value={{
        coupons: coupons || [],
        isLoading,
        isCreating,
        createCoupon: async (data: CreateCouponPayload) => {
          return await createCouponAsync(data);
        },
        generateUniqueCode: async (baseCode: string) => generateUniqueCode(baseCode),
        refetch
      }}
    >
      {children}
    </TiendaNubeCouponsContext.Provider>
  );
}

export function useTiendaNubeCouponsContext() {
  const context = useContext(TiendaNubeCouponsContext);
  if (!context) {
    throw new Error('useTiendaNubeCouponsContext must be used within TiendaNubeCouponsProvider');
  }
  return context;
}