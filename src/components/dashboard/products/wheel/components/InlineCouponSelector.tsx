import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Plus, 
  X,
  Check,
  Loader2,
  Percent,
  DollarSign,
  Truck,
  ChevronDown
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TiendaNubeCouponsService } from '../../../../../services/integrations/tiendanube/couponsService';
import type { TiendaNubeCoupon } from '../../../../../types/tiendanube.types';
import { useStore } from '../../../../../contexts/StoreContext';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { TestIntegrationButton } from './TestIntegrationButton';

interface InlineCouponSelectorProps {
  value: string;
  onValueChange: (value: string, coupon?: TiendaNubeCoupon) => void;
  placeholder?: string;
  className?: string;
}

export const InlineCouponSelector: React.FC<InlineCouponSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Código del premio o cupón",
  className = ''
}) => {
  const { selectedStoreId } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [selectedCoupon, setSelectedCoupon] = useState<TiendaNubeCoupon | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const couponsService = new TiendaNubeCouponsService();
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading, error: fetchError } = useQuery({
    queryKey: ['tiendanube-coupons', selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return [];
      try {
        return await couponsService.getCoupons(selectedStoreId, {
          valid: true,
          sort_by: 'created-at-descending',
          per_page: 50
        });
      } catch (error) {
        console.error('Error fetching coupons:', error);
        // Return empty array instead of throwing to show the UI
        return [];
      }
    },
    enabled: !!selectedStoreId && isOpen,
    retry: 1
  });

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateOption = searchValue.trim() && 
    !filteredCoupons.some(c => c.code.toLowerCase() === searchValue.toLowerCase()) &&
    searchValue.length >= 3;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const dropdownHeight = 300; // Approximate max height of dropdown
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let top = rect.bottom + window.scrollY;
      
      // If not enough space below but more space above, show dropdown above input
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        top = rect.top + window.scrollY - dropdownHeight;
      }
      
      setDropdownPosition({
        top,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  const getCouponIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-3 h-3" />;
      case 'absolute':
        return <DollarSign className="w-3 h-3" />;
      case 'shipping':
        return <Truck className="w-3 h-3" />;
      default:
        return <Ticket className="w-3 h-3" />;
    }
  };

  const formatCouponValue = (coupon: TiendaNubeCoupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}%`;
      case 'absolute':
        return `$${coupon.value}`;
      case 'shipping':
        return 'Envío';
      default:
        return coupon.value;
    }
  };

  const handleSelectCoupon = (coupon: TiendaNubeCoupon) => {
    setSelectedCoupon(coupon);
    setSearchValue(coupon.code);
    onValueChange(coupon.code, coupon);
    setIsOpen(false);
  };

  const handleCreateCoupon = async () => {
    console.log('🎯 [InlineCouponSelector] handleCreateCoupon called:', {
      selectedStoreId,
      searchValue,
      isCreating,
      timestamp: new Date().toISOString()
    });
    
    if (!selectedStoreId || !searchValue.trim() || isCreating) {
      console.log('⚠️ [InlineCouponSelector] Early return due to:', {
        noStoreId: !selectedStoreId,
        emptySearchValue: !searchValue.trim(),
        alreadyCreating: isCreating
      });
      return;
    }
    
    setIsCreating(true);
    const toastId = toast.loading('Creando cupón...');
    
    const couponPayload = {
      code: searchValue.toUpperCase(),
      type: 'percentage' as const,
      value: '10',
      valid: true
    };
    
    console.log('📦 [InlineCouponSelector] Creating coupon with payload:', couponPayload);
    
    try {
      console.log('🔄 [InlineCouponSelector] Calling couponsService.createCoupon...');
      const newCoupon = await couponsService.createCoupon(selectedStoreId, couponPayload);
      
      console.log('✅ [InlineCouponSelector] Coupon created successfully:', newCoupon);
      
      // Invalidate the coupons query to refresh the list
      console.log('🔄 [InlineCouponSelector] Invalidating coupons query...');
      queryClient.invalidateQueries({ queryKey: ['tiendanube-coupons', selectedStoreId] });
      
      toast.success(`Cupón "${newCoupon.code}" creado exitosamente`, { id: toastId });
      handleSelectCoupon(newCoupon);
    } catch (error) {
      console.error('❌ [InlineCouponSelector] Error creating coupon:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        selectedStoreId,
        couponPayload
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al crear el cupón: ${errorMessage}`, { id: toastId });
    } finally {
      console.log('🏁 [InlineCouponSelector] handleCreateCoupon finished');
      setIsCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onValueChange(newValue);
    setSelectedCoupon(null);
    if (!isOpen && newValue) {
      setIsOpen(true);
    }
  };

  const handleClearCoupon = () => {
    setSelectedCoupon(null);
    setSearchValue('');
    onValueChange('');
    setIsOpen(false);
  };

  // Check if there's an integration error  
  const hasIntegrationError = fetchError?.message?.includes('No active Tienda Nube integration');

  // Show test integration button if no integration in dev mode
  if (hasIntegrationError && import.meta.env.DEV && selectedStoreId) {
    return (
      <div className="space-y-2">
        <TestIntegrationButton 
          storeId={selectedStoreId} 
          onIntegrationCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['tiendanube-coupons', selectedStoreId] });
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg ${className}`}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => selectedStoreId && setIsOpen(true)}
          className="w-full px-4 py-2 pr-20 bg-white/60 backdrop-blur-sm border-0 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all"
          placeholder={placeholder}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedCoupon && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-lg">
              {getCouponIcon(selectedCoupon.type)}
              <span className="text-xs font-medium text-purple-700">
                {formatCouponValue(selectedCoupon)}
              </span>
            </div>
          )}
          {searchValue && (
            <button
              onClick={handleClearCoupon}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
          {selectedStoreId && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {isOpen && selectedStoreId && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 9999
            }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                </div>
              ) : (
                <>
                  {showCreateOption && (
                    <button
                      onClick={handleCreateCoupon}
                      disabled={isCreating}
                      className="w-full p-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-purple-100 rounded-lg">
                            {isCreating ? (
                              <Loader2 className="w-3 h-3 text-purple-600 animate-spin" />
                            ) : (
                              <Plus className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {isCreating ? 'Creando...' : `Crear cupón "${searchValue.toUpperCase()}"`}
                            </p>
                            <p className="text-xs text-gray-500">10% de descuento</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  )}
                  
                  {filteredCoupons.length === 0 && !showCreateOption ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">
                        {searchValue ? 'No se encontraron cupones' : 'No hay cupones disponibles'}
                      </p>
                    </div>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <button
                        key={coupon.id}
                        onClick={() => handleSelectCoupon(coupon)}
                        className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                          selectedCoupon?.id === coupon.id ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${
                              selectedCoupon?.id === coupon.id ? 'bg-purple-200' : 'bg-gray-100'
                            }`}>
                              {getCouponIcon(coupon.type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{coupon.code}</p>
                              <p className="text-xs text-gray-500">{formatCouponValue(coupon)}</p>
                            </div>
                          </div>
                          {selectedCoupon?.id === coupon.id && (
                            <Check className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};