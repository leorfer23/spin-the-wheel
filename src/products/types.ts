import type { ProductType } from "@/types/product";
import type { ComponentType } from "react";

export interface ProductAdapter {
  id: ProductType;
  ConfigComponent: ComponentType<any>;
  ReportComponent?: ComponentType<any>;
  useConfigProps: () => Record<string, unknown>;
  useReportProps?: () => Record<string, unknown>;
  useCanRenderConfig: () => boolean;
}

export type ProductRegistry = Record<ProductType, ProductAdapter | undefined>;
