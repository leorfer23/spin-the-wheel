import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tiendaNubeApi } from '@/services/integrations/tiendanube/tiendaNubeApiService';
import type { 
  TiendaNubeCoupon, 
  CreateCouponPayload,
  CouponFilters 
} from '@/types/tiendanube.types';

interface UseTiendaNubeCouponsOptions {
  storeId?: string;
  filters?: CouponFilters;
  enabled?: boolean;
  onReauthRequired?: () => void;
}

export function useTiendaNubeCoupons({
  storeId,
  filters,
  enabled = true,
  onReauthRequired
}: UseTiendaNubeCouponsOptions) {
  const queryClient = useQueryClient();
  const [selectedCoupon, setSelectedCoupon] = useState<TiendaNubeCoupon | null>(null);

  // Fetch coupons
  const {
    data: couponsResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tiendanube-coupons', storeId, filters],
    queryFn: async () => {
      if (!storeId) throw new Error('Store ID is required');
      
      const result = await tiendaNubeApi.getCoupons(storeId, filters);
      
      if (!result.success) {
        if (result.needsReauth && onReauthRequired) {
          onReauthRequired();
        }
        throw new Error(result.error || 'Failed to fetch coupons');
      }
      
      return result.data || [];
    },
    enabled: enabled && !!storeId,
    // Add caching to prevent rapid API calls
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch if we have cached data
    retry: (failureCount, error) => {
      // Don't retry on auth errors or rate limits
      if (error?.message?.includes('Authentication failed') || 
          error?.message?.includes('Too Many Requests')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: async (couponData: CreateCouponPayload) => {
      if (!storeId) throw new Error('Store ID is required');
      
      const result = await tiendaNubeApi.createCoupon(storeId, couponData);
      
      if (!result.success) {
        if (result.needsReauth && onReauthRequired) {
          onReauthRequired();
        }
        throw new Error(result.error || 'Failed to create coupon');
      }
      
      return result.data;
    },
    onSuccess: (newCoupon) => {
      queryClient.invalidateQueries({ queryKey: ['tiendanube-coupons', storeId] });
      toast.success(`Cupón "${newCoupon?.code}" creado exitosamente`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el cupón');
    }
  });

  // Update coupon mutation
  const updateCouponMutation = useMutation({
    mutationFn: async ({ 
      couponId, 
      updates 
    }: { 
      couponId: number; 
      updates: Partial<CreateCouponPayload> 
    }) => {
      if (!storeId) throw new Error('Store ID is required');
      
      const result = await tiendaNubeApi.updateCoupon(storeId, couponId, updates);
      
      if (!result.success) {
        if (result.needsReauth && onReauthRequired) {
          onReauthRequired();
        }
        throw new Error(result.error || 'Failed to update coupon');
      }
      
      return result.data;
    },
    onSuccess: (updatedCoupon) => {
      queryClient.invalidateQueries({ queryKey: ['tiendanube-coupons', storeId] });
      toast.success(`Cupón "${updatedCoupon?.code}" actualizado`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el cupón');
    }
  });

  // Delete coupon mutation
  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: number) => {
      if (!storeId) throw new Error('Store ID is required');
      
      const result = await tiendaNubeApi.deleteCoupon(storeId, couponId);
      
      if (!result.success) {
        if (result.needsReauth && onReauthRequired) {
          onReauthRequired();
        }
        throw new Error(result.error || 'Failed to delete coupon');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiendanube-coupons', storeId] });
      toast.success('Cupón eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el cupón');
    }
  });

  // Generate unique coupon code
  const generateUniqueCode = useCallback(async (prefix: string = 'SPIN') => {
    if (!storeId) return null;
    
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const code = tiendaNubeApi.generateCouponCode(prefix);
      const isAvailable = await tiendaNubeApi.isCouponCodeAvailable(storeId, code);
      
      if (isAvailable) {
        return code;
      }
      
      attempts++;
    }
    
    toast.error('No se pudo generar un código único. Intenta con un prefijo diferente.');
    return null;
  }, [storeId]);

  // Check if integration is connected
  const isConnected = useCallback(async () => {
    if (!storeId) return false;
    
    // Try to fetch one coupon to check if integration is working
    const result = await tiendaNubeApi.getCoupons(storeId, { per_page: 1 });
    return result.success;
  }, [storeId]);

  return {
    // Data
    coupons: couponsResult || [],
    selectedCoupon,
    
    // Loading states
    isLoading,
    isCreating: createCouponMutation.isPending,
    isUpdating: updateCouponMutation.isPending,
    isDeleting: deleteCouponMutation.isPending,
    
    // Error states
    error,
    
    // Actions
    createCoupon: createCouponMutation.mutate,
    updateCoupon: updateCouponMutation.mutate,
    deleteCoupon: deleteCouponMutation.mutate,
    setSelectedCoupon,
    refetch,
    generateUniqueCode,
    isConnected,
    
    // Async versions (return promises)
    createCouponAsync: createCouponMutation.mutateAsync,
    updateCouponAsync: updateCouponMutation.mutateAsync,
    deleteCouponAsync: deleteCouponMutation.mutateAsync
  };
}

// Hook for checking TiendaNube integration status
export function useTiendaNubeIntegration(storeId?: string) {
  // Use React Query to cache the integration check
  const {
    data: integrationStatus,
    isLoading: isChecking,
    error,
    refetch
  } = useQuery({
    queryKey: ['tiendanube-integration-status', storeId],
    queryFn: async () => {
      if (!storeId) {
        return { isConnected: false, needsReauth: false };
      }
      
      try {
        const result = await tiendaNubeApi.getCoupons(storeId, { per_page: 1 });
        return {
          isConnected: result.success,
          needsReauth: result.needsReauth || false
        };
      } catch {
        return { isConnected: false, needsReauth: false };
      }
    },
    enabled: !!storeId,
    // Cache for 5 minutes to prevent rapid API calls
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Don't retry on 429 errors
    retry: (failureCount, error) => {
      if (error?.message?.includes('Too Many Requests')) {
        return false;
      }
      return failureCount < 2;
    },
    // Only refetch on window focus if data is stale
    refetchOnWindowFocus: false,
    // Don't refetch on mount if we have cached data
    refetchOnMount: false
  });

  return {
    isConnected: integrationStatus?.isConnected || false,
    isChecking,
    needsReauth: integrationStatus?.needsReauth || false,
    error,
    refetch
  };
}