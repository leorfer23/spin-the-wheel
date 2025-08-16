import React from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import type { ProductType } from "@/types/product";
import { PRODUCT_CATALOG } from "@/products/registry";

interface ProductSelectorProps {
  selectedProduct: ProductType;
  onProductChange: (product: ProductType) => void;
  children: React.ReactNode;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProduct,
  onProductChange,
  children,
}) => {
  return (
    <TooltipProvider>
      <div className="flex h-full w-full overflow-hidden">
        {/* Product Tabs - Far left */}
        <div className="w-20 py-6 flex flex-col items-center gap-4 flex-shrink-0 bg-gray-50">
          {PRODUCT_CATALOG.map((product) => {
            const button = (
              <button
                key={product.id}
                onClick={() => product.available && onProductChange(product.id)}
                disabled={!product.available}
                className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  selectedProduct === product.id
                    ? "bg-purple-600 shadow-lg scale-110"
                    : product.available
                    ? "bg-gray-100 hover:bg-purple-100"
                    : "bg-gray-50 opacity-50 cursor-not-allowed"
                }`}
              >
                <span
                  className={`text-2xl ${
                    selectedProduct === product.id ? "scale-110" : ""
                  }`}
                >
                  {product.icon}
                </span>
                {!product.available && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">🔒</span>
                  </div>
                )}
              </button>
            );

            return product.businessOutcome ? (
              <Tooltip key={product.id} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-semibold mb-1">{product.name}</p>
                  <p className="text-xs">{product.businessOutcome}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              button
            );
          })}
        </div>

        {/* Product Content Area */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            key={selectedProduct}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};
