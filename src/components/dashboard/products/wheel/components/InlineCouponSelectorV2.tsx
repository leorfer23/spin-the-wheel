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
  ChevronDown,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTiendaNubeIntegration } from '@/hooks/useTiendaNubeCoupons';
import { useTiendaNubeCouponsContext } from '@/contexts/TiendaNubeCouponsContext';
import type { TiendaNubeCoupon } from '@/types/tiendanube.types';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface InlineCouponSelectorProps {
  value: string;
  onValueChange: (value: string, coupon?: TiendaNubeCoupon) => void;
  placeholder?: string;
  className?: string;
}

export const InlineCouponSelectorV2: React.FC<InlineCouponSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Código del premio o cupón",
  className = ''
}) => {
  const { selectedStoreId } = useStore();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [selectedCoupon, setSelectedCoupon] = useState<TiendaNubeCoupon | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check integration status
  const { isConnected, isChecking, needsReauth } = useTiendaNubeIntegration(selectedStoreId || undefined);

  // Handle re-authorization
  const handleReauthorize = async () => {
    if (!selectedStoreId || !user) {
      toast.error('No se pudo identificar la tienda o el usuario');
      return;
    }

    try {
      const response = await fetch('/api/integrations/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'tiendanube',
          storeId: selectedStoreId,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to initiate OAuth');

      const { authUrl } = await response.json();
      toast.info('Redirigiendo a TiendaNube para autorización...');
      window.location.href = authUrl;
    } catch (err) {
      toast.error('Error al iniciar re-autorización');
    }
  };

  // Use the shared coupons context
  const {
    coupons,
    isLoading,
    isCreating,
    createCoupon,
    generateUniqueCode
  } = useTiendaNubeCouponsContext();

  // Filter coupons based on search
  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Check if we should show create option
  const showCreateOption = searchValue.trim() && 
    !filteredCoupons.some(c => c.code.toLowerCase() === searchValue.toLowerCase()) &&
    searchValue.length >= 3 &&
    isConnected;

  // Handle clicks outside
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

  // Position dropdown - update on scroll and hide when out of view
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        
        // Find the scrollable container (the segments section container)
        let scrollContainer = inputRef.current.parentElement;
        while (scrollContainer && !scrollContainer.classList.contains('overflow-y-auto')) {
          scrollContainer = scrollContainer.parentElement;
        }
        
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          
          // Check if input is visible within container
          const isInputVisible = 
            rect.top >= containerRect.top && 
            rect.bottom <= containerRect.bottom;
          
          // Hide dropdown if input is not fully visible
          if (!isInputVisible) {
            setIsOpen(false);
            return;
          }
        }
        
        const dropdownHeight = 300;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        let top = rect.bottom;
        
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          top = rect.top - dropdownHeight;
        }
        
        setDropdownPosition({
          top,
          left: rect.left,
          width: rect.width
        });
      }
    };

    updatePosition();

    if (isOpen) {
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
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
        return 'Envío gratis';
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
    if (!searchValue.trim() || isCreating) return;
    
    const couponCode = searchValue.toUpperCase();
    
    createCoupon({
      code: couponCode,
      type: 'percentage',
      value: '10',
      valid: true
    }).then((newCoupon) => {
      if (newCoupon) {
        handleSelectCoupon(newCoupon);
      }
    });
  };

  const handleGenerateUnique = async () => {
    const code = await generateUniqueCode('SPIN');
    if (code) {
      setSearchValue(code);
      onValueChange(code);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onValueChange(newValue);
    setSelectedCoupon(null);
    if (!isOpen && newValue && isConnected) {
      setIsOpen(true);
    }
  };

  const handleClearCoupon = () => {
    setSelectedCoupon(null);
    setSearchValue('');
    onValueChange('');
    setIsOpen(false);
  };

  // Show re-auth message if needed
  if (needsReauth && selectedStoreId) {
    return (
      <div className="space-y-2">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Reconexión requerida
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Necesitas reconectar tu tienda TiendaNube para usar cupones.
              </p>
              <button
                onClick={handleReauthorize}
                className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Reconectar
              </button>
            </div>
          </div>
        </div>
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

  // Show loading state while checking connection
  if (isChecking && selectedStoreId) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg ${className}`}
          disabled
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // Show simple input if no integration or no store selected
  if (!isConnected || !selectedStoreId) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg ${className}`}
      />
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
          onFocus={() => setIsOpen(true)}
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
              type="button"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            type="button"
          >
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
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
                  {/* Generate unique code button */}
                  {!searchValue && (
                    <button
                      onClick={handleGenerateUnique}
                      className="w-full p-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100"
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <Ticket className="w-3 h-3 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Generar código único</p>
                          <p className="text-xs text-gray-500">Crear un código automático</p>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Create new coupon option */}
                  {showCreateOption && (
                    <button
                      onClick={handleCreateCoupon}
                      disabled={isCreating}
                      className="w-full p-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
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
                  
                  {/* Existing coupons list */}
                  {filteredCoupons.length === 0 && !showCreateOption ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">
                        {searchValue ? 'No se encontraron cupones' : 'No hay cupones disponibles'}
                      </p>
                      {!searchValue && (
                        <button
                          onClick={handleGenerateUnique}
                          className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                          type="button"
                        >
                          Generar código único
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <button
                        key={coupon.id}
                        onClick={() => handleSelectCoupon(coupon)}
                        className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                          selectedCoupon?.id === coupon.id ? 'bg-purple-50' : ''
                        }`}
                        type="button"
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
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{formatCouponValue(coupon)}</span>
                                {coupon.max_uses && (
                                  <span className="text-xs text-gray-400">
                                    • {coupon.uses || 0}/{coupon.max_uses} usos
                                  </span>
                                )}
                              </div>
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