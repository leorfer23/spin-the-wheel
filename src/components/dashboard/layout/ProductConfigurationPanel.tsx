import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCT_REGISTRY } from "@/products/registry";
import type { ProductType } from "@/types/product";

interface ProductConfigurationPanelProps {
  product: ProductType;
  mode?: "edit" | "report";
}

export const ProductConfigurationPanel: React.FC<
  ProductConfigurationPanelProps
> = ({ product, mode = "edit" }) => {
  const adapter = PRODUCT_REGISTRY[product];

  // Call hooks in a stable, unconditional order to satisfy Rules of Hooks
  const canRender = adapter?.useCanRenderConfig
    ? adapter.useCanRenderConfig()
    : false;
  const configProps = adapter?.useConfigProps
    ? adapter.useConfigProps()
    : undefined;
  const reportProps = adapter?.useReportProps
    ? adapter.useReportProps()
    : undefined;
  const Config = adapter?.ConfigComponent as any;
  const Report = adapter?.ReportComponent as any;

  const renderContent = () => {
    if (!adapter) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">
            {mode === "report" ? "Reportes próximamente" : "Configuración próximamente"}
          </p>
        </div>
      );
    }

    if (!canRender) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">
            Seleccioná un elemento para {mode === "report" ? "ver reportes" : "configurar"}
          </p>
        </div>
      );
    }

    if (mode === "report" && Report) {
      return <Report {...reportProps} />;
    }

    if (mode === "edit" && Config) {
      return <Config {...configProps} />;
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">
          {mode === "report" ? "Reportes no disponibles" : "Configuración no disponible"}
        </p>
      </div>
    );
  };

  // Keep minimal structure to match current panel container
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${product}-${mode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
