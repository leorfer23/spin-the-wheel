import React, { useState, useMemo } from 'react';
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
  Search
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTiendaNubeIntegration } from '@/hooks/useTiendaNubeCoupons';
import { useTiendaNubeCouponsContext } from '@/contexts/TiendaNubeCouponsContext';
import type { TiendaNubeCoupon } from '@/types/tiendanube.types';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';

interface SimpleCouponSelectorProps {
  value: string;
  onValueChange: (value: string, coupon?: TiendaNubeCoupon) => void;
  placeholder?: string;
  className?: string;
}

export const SimpleCouponSelector: React.FC<SimpleCouponSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Código del premio o cupón",
  className = ''
}) => {
  const { selectedStoreId } = useStore();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Check integration status
  const { isConnected } = useTiendaNubeIntegration(selectedStoreId || undefined);
  
  // Use the shared coupons context
  const {
    coupons,
    isLoading,
    isCreating,
    createCoupon
  } = useTiendaNubeCouponsContext();

  // Filter coupons based on search
  const filteredCoupons = useMemo(() => {
    if (!searchValue) return coupons;
    return coupons.filter(coupon =>
      coupon.code.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [coupons, searchValue]);

  // Check if we should show create option
  const showCreateOption = searchValue.trim() && 
    !filteredCoupons.some(c => c.code.toLowerCase() === searchValue.toLowerCase()) &&
    searchValue.length >= 3 &&
    isConnected;

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
    onValueChange(coupon.code, coupon);
    setOpen(false);
    setSearchValue('');
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


  const handleClearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
  };

  // Find selected coupon
  const selectedCoupon = coupons.find(c => c.code === value);

  // Show simple input if no integration
  if (!isConnected || !selectedStoreId) {
    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={cn("w-full", className)}
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-white/60 backdrop-blur-sm border-0 hover:bg-white/80",
            "focus:outline-none focus:ring-4 focus:ring-purple-500/20",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            {value ? (
              <>
                {value === 'SIN_PREMIO' ? (
                  <>
                    <div className="p-1 bg-gray-100 rounded">
                      <X className="w-3 h-3 text-gray-600" />
                    </div>
                    <span className="truncate">Sin Premio</span>
                  </>
                ) : (
                  <>
                    {selectedCoupon && (
                      <div className="p-1 bg-purple-100 rounded">
                        {getCouponIcon(selectedCoupon.type)}
                      </div>
                    )}
                    <span className="truncate">{value}</span>
                    {selectedCoupon && (
                      <span className="text-xs text-muted-foreground">
                        {formatCouponValue(selectedCoupon)}
                      </span>
                    )}
                  </>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {value && (
              <X
                className="h-3 w-3 text-gray-500 hover:text-gray-700"
                onClick={handleClearValue}
              />
            )}
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar o crear cupón..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8 h-9"
              autoFocus
            />
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-purple-600" />
              <p className="text-sm text-muted-foreground mt-2">Cargando cupones...</p>
            </div>
          ) : (
            <>
              {/* No Prize option - visible when no search or searching for "sin premio" */}
              {(!searchValue || 'sin premio'.includes(searchValue.toLowerCase()) || 'SIN_PREMIO'.toLowerCase().includes(searchValue.toLowerCase())) && (
                <button
                  onClick={() => {
                    onValueChange('SIN_PREMIO');
                    setOpen(false);
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 border-b"
                >
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <X className="w-3 h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sin Premio</p>
                    <p className="text-xs text-muted-foreground">Segmento sin recompensa</p>
                  </div>
                </button>
              )}


              {/* Create new coupon option */}
              {showCreateOption && (
                <button
                  onClick={handleCreateCoupon}
                  disabled={isCreating}
                  className="w-full p-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    {isCreating ? (
                      <Loader2 className="w-3 h-3 text-purple-600 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isCreating ? 'Creando...' : `Crear cupón "${searchValue.toUpperCase()}"`}
                    </p>
                    <p className="text-xs text-muted-foreground">10% de descuento</p>
                  </div>
                </button>
              )}
              
              {/* Existing coupons list */}
              {filteredCoupons.length === 0 && !showCreateOption ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchValue ? 'No se encontraron cupones' : 'No hay cupones disponibles'}
                  </p>
                </div>
              ) : (
                filteredCoupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    onClick={() => handleSelectCoupon(coupon)}
                    className={cn(
                      "w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between",
                      value === coupon.code && "bg-purple-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        value === coupon.code ? "bg-purple-200" : "bg-gray-100"
                      )}>
                        {getCouponIcon(coupon.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{coupon.code}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatCouponValue(coupon)}
                          </span>
                          {coupon.max_uses && (
                            <span className="text-xs text-muted-foreground">
                              • {coupon.uses || 0}/{coupon.max_uses} usos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {value === coupon.code && (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};