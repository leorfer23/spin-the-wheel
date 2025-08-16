export type ProductType =
  | "wheel"
  | "jackpot"
  | "lottery"
  | "scratch-card"
  | "slot-machine";

export interface ProductMeta {
  id: ProductType;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  businessOutcome?: string;
}
