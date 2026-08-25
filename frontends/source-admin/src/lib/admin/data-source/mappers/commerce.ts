import type { Promotion } from "@/lib/admin/mocks/promotions";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import type { ProductFull } from "@/lib/admin/mocks/types";
import type {
  ApiBestSeller,
  ApiCustomer,
  ApiDashboardStats,
  ApiOrder,
  ApiOrderSummary,
  ApiPromotion,
  ApiRevenuePoint,
} from "../api-types";
import { semanticColors } from "@/lib/theme-colors";
import { initials, money, orderStatusMap, titleCase } from "./shared";
import { findCustomerByEmailOrName } from "@/lib/admin/mocks/customers";

export function mapDashboard(stats: ApiDashboardStats, revenue: ApiRevenuePoint[]) {
  return {
    kpis: [
      {
        label: "Revenue",
        value: `$${money(stats.revenue).toLocaleString()}`,
        delta: 0,
        accent: true,
        spark: revenue.map((p) => money(p.revenue)),
      },
      {
        label: "Orders",
        value: stats.orders.toLocaleString(),
        delta: 0,
        accent: false,
        spark: revenue.map((p) => p.orders),
      },
      {
        label: "Average Order Value",
        value: `$${money(stats.averageOrderValue).toLocaleString()}`,
        delta: 0,
        accent: false,
        spark: revenue.map((p) => money(p.revenue) / Math.max(1, p.orders)),
      },
      {
        label: "Customers",
        value: stats.customers.toLocaleString(),
        delta: 0,
        accent: false,
        spark: revenue.map((_, index) => index + 1),
      },
    ],
    revenueSeries: revenue.map((point) => {
      const rev = money(point.revenue);
      const ords = point.orders;
      const aov = ords > 0 ? rev / ords : 0;
      return {
        week: point.label,
        revenue: rev,
        prev: 0,
        orders: ords,
        ordersPrev: 0,
        aov: aov,
        aovPrev: 0,
      };
    }),
  };
}

export function mapBestSeller(item: ApiBestSeller): ProductFull {
  return {
    id: item.productId,
    name: item.productName,
    brand: "Aetheria",
    category: "Catalog",
    sku: item.sku,
    price: 0,
    unitsSold: item.unitsSold,
    revenue: money(item.revenue),
    gradient: [semanticColors.accent, semanticColors.brandAccentHover],
    status: "Active",
    stock: 0,
    stockStatus: "In Stock",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    variants: 0,
  };
}

export function mapOrder(order: ApiOrder | ApiOrderSummary): DetailedOrder {
  const status = orderStatusMap[order.status];
  const placedAt = order.placedAt ?? new Date().toISOString();
  return {
    id: order.code,
    apiId: order.id,
    customer: {
      name: order.customer?.name ?? "Guest Customer",
      email: order.customer?.email ?? "guest@aetheria.local",
      phone: "",
      initials: initials(order.customer?.name ?? "Guest Customer"),
      avatarUrl: findCustomerByEmailOrName(order.customer?.email)?.avatarUrl,
      shippingAddress: { street: "", city: "", state: "", postalCode: "", country: "" },
      billingAddress: { street: "", city: "", state: "", postalCode: "", country: "" },
    },
    items:
      "items" in order && order.items
        ? order.items.map((item) => ({
            id: item.id,
            name: item.productName,
            brand: "Aetheria",
            sku: item.sku,
            price: money(item.unitPrice),
            quantity: item.quantity,
            gradient: [semanticColors.accent, semanticColors.brandAccentHover],
          }))
        : [],
    status,
    paymentMethod: titleCase(order.paymentMethod) as DetailedOrder["paymentMethod"],
    shippingMethod: "Standard Shipping",
    trackingNumber: null,
    placedAt,
    subtotal: "subtotal" in order ? money(order.subtotal) : money(order.total),
    shippingFee: "shippingFee" in order ? money(order.shippingFee) : 0,
    tax: "tax" in order ? money(order.tax) : 0,
    discount: "discount" in order ? money(order.discount) : 0,
    total: money(order.total),
    timeline:
      "timeline" in order && order.timeline
        ? order.timeline.map((event) => ({
            title: event.title,
            timestamp: event.eventTime,
            description: event.description,
            done: event.done ?? true,
          }))
        : [{ title: status, timestamp: placedAt, description: `Order is ${status}`, done: true }],
  } as DetailedOrder;
}

export function mapCustomer(customer: ApiCustomer): DetailedCustomer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: "",
    avatar: initials(customer.name),
    avatarUrl: customer.avatarUrl || findCustomerByEmailOrName(customer.email)?.avatarUrl,
    gradient: [semanticColors.accent, semanticColors.brandAccentHover],
    tier: titleCase(customer.tier) as DetailedCustomer["tier"],
    status: "Active",
    skinProfile: {
      skinType: titleCase(customer.skinType) as DetailedCustomer["skinProfile"]["skinType"],
      skinConcerns: customer.skinConcerns ?? [],
    },
    totalSpent: money(customer.totalSpent),
    totalOrders: customer.totalOrders,
    joinedAt: customer.joinedAt ?? customer.createdAt ?? new Date().toISOString(),
    addresses: {
      shipping: { street: "", city: "", country: "", zip: "" },
      billing: { street: "", city: "", country: "", zip: "" },
    },
    recentOrders: [],
    activities: [],
  };
}

export function mapPromotion(promotion: ApiPromotion): Promotion {
  return {
    id: promotion.id,
    code: promotion.code,
    title: promotion.title,
    description: "",
    type: titleCase(promotion.type) as Promotion["type"],
    rewardValue: money(promotion.rewardValue),
    minSpend: money(promotion.minSpend),
    channel: "Storefront",
    status: titleCase(promotion.status) as Promotion["status"],
    used: promotion.used,
    limit: promotion.usageLimit,
    revenue: 0,
    startsAt: promotion.startsAt,
    endsAt: promotion.endsAt,
    gradient: [semanticColors.accent, semanticColors.brandAccentHover],
  };
}
