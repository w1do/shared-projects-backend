export type ApiDashboardStats = {
  revenue: number | string;
  orders: number;
  averageOrderValue: number | string;
  customers: number;
  pendingOrders: number;
};

export type ApiRevenuePoint = { label: string; revenue: number | string; orders: number };

export type ApiBestSeller = {
  productId: string;
  productName: string;
  sku: string;
  unitsSold: number;
  revenue: number | string;
};

export type ApiCustomer = {
  id: string;
  code: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  skinType?: string | null;
  skinConcerns?: string[];
  totalOrders: number;
  totalSpent: number | string;
  joinedAt?: string;
  createdAt?: string;
  /** Активен / заблокирован. Платформа ведёт это флагом `blocked`. */
  status?: "Active" | "Inactive";
};

export type ApiOrderSummary = {
  id: string;
  code: string;
  customer: { id: string; name: string; email: string; tier: string };
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "REFUNDED" | "CANCELLED";
  paymentMethod: string;
  total: number | string;
  placedAt?: string;
};

export type ApiOrder = ApiOrderSummary & {
  subtotal: number | string;
  tax: number | string;
  shippingFee: number | string;
  discount: number | string;
  items?: Array<{
    id: string;
    sku: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number | string;
    lineTotal: number | string;
  }>;
  timeline?: Array<{ title: string; description: string; eventTime: string; done?: boolean }>;
};

export type ApiPromotion = {
  id: string;
  code: string;
  title: string;
  type: string;
  rewardValue: number | string;
  minSpend: number | string;
  usageLimit: number;
  used: number;
  status: string;
  startsAt: string;
  endsAt: string;
};
