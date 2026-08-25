export type ApiStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type ApiBrand = {
  id: string;
  name: string;
  slug: string;
  monogram?: string | null;
  logoUrl?: string | null;
  story?: string | null;
  productCount?: number;
  revenue?: number | string;
  share?: number | string;
  trend?: number[];
  delta?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiCategory = {
  id: string;
  name: string;
  nameTranslations?: Record<string, string>;
  slug: string;
  parentId?: string | null;
  displayOrder: number;
  status: ApiStatus;
  productCount?: number;
  revenue?: number | string;
  growthYoY?: number | string;
  createdAt?: string;
  updatedAt?: string;
  children?: ApiCategory[];
};

export type ApiCollection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: ApiStatus;
  featured?: boolean;
  productCount?: number;
  revenue?: number | string;
  views?: number;
  growthYoY?: number | string;
  viewTrend?: number[];
  products?: ApiProductSummary[];
  createdAt?: string;
  updatedAt?: string;
};

export type ApiProductSummary = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  status: ApiStatus;
  imageUrl?: string | null;
  unitsSold: number;
  revenue?: number | string;
};

export type ApiProduct = ApiProductSummary & {
  brand?: { id: string; name: string; slug: string; monogram?: string | null };
  category?: { id: string; name: string; slug: string };
  gradientStart?: string | null;
  gradientEnd?: string | null;
  variants?: ApiVariant[];
  createdAt?: string;
  updatedAt?: string;
};

export type ApiVariant = {
  id: string;
  productId: string;
  sku: string;
  price: number | string;
  stockQuantity: number;
  attributes?: Record<string, string>;
  inventory?: ApiInventoryItem;
};

export type ApiInventoryItem = {
  id: string;
  variantId: string;
  sku: string;
  productId: string;
  productName: string;
  price?: number | string;
  revenue?: number | string;
  onHand: number;
  incoming: number;
  threshold: number;
  location?: string | null;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
};
