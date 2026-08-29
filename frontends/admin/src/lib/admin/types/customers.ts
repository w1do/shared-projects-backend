/** Типы раздела «Клиенты»: пользователи проекта из auth-service. */
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

export interface CustomerActivity {
  title: string;
  timestamp: string;
  description: string;
}

/** Уровень лояльности вёрстки. Платформа лояльность не ведёт. */
export type CustomerTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface DetailedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  avatarUrl?: string;
  gradient: [string, string];
  /** Платформа уровни лояльности не ведёт — поле остаётся пустым. */
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
  activities: CustomerActivity[];
}
