export interface TiendaNubeCoupon {
  id?: number;
  code: string;
  type: 'percentage' | 'absolute' | 'shipping';
  valid: boolean;
  start_date?: string;
  end_date?: string;
  deleted_at?: string | null;
  max_uses?: number;
  value: string;
  includes_shipping?: boolean;
  first_consumer_purchase?: boolean;
  min_price?: string;
  categories?: TiendaNubeCategory[];
  products?: TiendaNubeProduct[];
  combines_with_other_discounts?: boolean;
  uses?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TiendaNubeCategory {
  id: number;
  name: LocalizedString;
  handle?: LocalizedString;
  parent?: number | null;
}

export interface TiendaNubeProduct {
  id: number;
  name: LocalizedString;
  handle?: LocalizedString;
  variants?: TiendaNubeVariant[];
}

export interface TiendaNubeVariant {
  id: number;
  product_id: number;
  price: string;
  promotional_price?: string;
  stock?: number;
  sku?: string;
}

export interface LocalizedString {
  es?: string;
  pt?: string;
  en?: string;
}

export interface CouponFilters {
  q?: string;
  min_start_date?: string;
  min_end_date?: string;
  max_start_date?: string;
  max_end_date?: string;
  valid?: boolean;
  status?: 'activated' | 'deactivated';
  limitation_type?: 'quantity' | 'cart_value' | 'categories';
  term_type?: 'unlimited' | 'limited';
  discount_type?: 'percentage' | 'absolute' | 'shipping';
  includes_shipping?: boolean;
  sort_by?: 'created-at-ascending' | 'created-at-descending' | 'alpha-ascending' | 'alpha-descending' | 'uses-ascending' | 'uses-descending';
  created_at_min?: string;
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
  page?: number;
  per_page?: number;
  fields?: string;
}

export interface CreateCouponPayload {
  code: string;
  type: 'percentage' | 'absolute' | 'shipping';
  value: string;
  valid?: boolean;
  start_date?: string;
  end_date?: string;
  max_uses?: number;
  includes_shipping?: boolean;
  first_consumer_purchase?: boolean;
  min_price?: string;
  categories?: number[];
  products?: number[];
  combines_with_other_discounts?: boolean;
}