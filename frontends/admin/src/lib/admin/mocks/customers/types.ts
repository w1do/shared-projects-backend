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

export interface DetailedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  avatarUrl?: string;
  gradient: [string, string];
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
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
