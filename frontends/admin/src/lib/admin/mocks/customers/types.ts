export interface CustomerAddress {
  street: string;
  city: string;
  country: string;
  zip: string;
}

export interface CustomerSkinProfile {
  skinType: "Dry" | "Oily" | "Sensitive" | "Combination" | "Normal";
  skinConcerns: string[];
}

export interface CustomerRecentOrder {
  id: string;
  placedAt: string;
  total: number;
  status: "Paid" | "Processing" | "Shipped" | "Refunded" | "Pending";
  paymentMethod: string;
}

export interface CustomerActivity {
  title: string;
  timestamp: string;
  description: string;
}

/** Уровень лояльности демо-шаблона. Платформа лояльность не ведёт. */
export type CustomerTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface DetailedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  avatarUrl?: string;
  gradient: [string, string];
  /** Отсутствует в живом режиме: платформа не ведёт уровни лояльности. */
  tier?: CustomerTier;
  status: "Active" | "Inactive";
  skinProfile: CustomerSkinProfile;
  totalSpent: number;
  totalOrders: number;
  joinedAt: string;
  addresses: {
    shipping: CustomerAddress;
    billing: CustomerAddress;
  };
  recentOrders: CustomerRecentOrder[];
  activities: CustomerActivity[];
}
