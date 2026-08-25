export type DetailedOrderItem = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  gradient: [string, string];
};

export type OrderTimelineEvent = {
  title: string;
  timestamp: string;
  description: string;
  done: boolean;
};

export type DetailedOrder = {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    initials: string;
    avatarUrl?: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    billingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  items: DetailedOrderItem[];
  status: "Paid" | "Processing" | "Shipped" | "Refunded" | "Pending";
  paymentMethod: "Credit Card" | "PayPal" | "Apple Pay" | "Bank Transfer";
  shippingMethod: "Standard Shipping" | "Express Shipping" | "Same-day Delivery";
  trackingNumber: string | null;
  placedAt: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  timeline: OrderTimelineEvent[];
};
