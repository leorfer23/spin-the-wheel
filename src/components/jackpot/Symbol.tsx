import type { JackpotSymbol } from '@/components/dashboard/products/jackpot/types';

interface SymbolProps {
  symbol: JackpotSymbol;
  size?: number;
  className?: string;
}

export const Symbol = ({ 
  symbol, 
  size = 80,
  className = '' 
}: SymbolProps) => {
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.6,
      }}
    >
      <span className="select-none">{symbol.icon}</span>
    </div>
  );
};