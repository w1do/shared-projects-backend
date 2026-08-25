import { Order } from "./types";
import customersData from "./customers/data.json";

const getCustomerAvatar = (name: string) => {
  const found = customersData.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return found?.avatarUrl;
};

export const recentOrders: Order[] = [
  {
    id: "AET-10482",
    customer: {
      name: "Mai Tran",
      initials: "MT",
      avatarUrl: getCustomerAvatar("Mai Tran"),
    },
    items: "WHOO Bichup Essence + Ohui Ampoule",
    itemCount: 2,
    status: "Paid",
    total: 412,
    placedAt: "12 min ago",
  },
  {
    id: "AET-10481",
    customer: {
      name: "Soo-jin Park",
      initials: "SP",
      avatarUrl: getCustomerAvatar("Soo-jin Park"),
    },
    items: "CNP Propolis Energy Ampule",
    itemCount: 1,
    status: "Shipped",
    total: 42,
    placedAt: "38 min ago",
  },
  {
    id: "AET-10480",
    customer: {
      name: "Hana Kobayashi",
      initials: "HK",
      avatarUrl: getCustomerAvatar("Hana Kobayashi"),
    },
    items: "AHC Toner ×2, Daycell Cream",
    itemCount: 3,
    status: "Processing",
    total: 120,
    placedAt: "1 h ago",
  },
  {
    id: "AET-10479",
    customer: {
      name: "Elena Rossi",
      initials: "ER",
      avatarUrl: getCustomerAvatar("Elena Rossi"),
    },
    items: "Ætheria Glow Gift Set",
    itemCount: 1,
    status: "Paid",
    total: 168,
    placedAt: "2 h ago",
  },
  {
    id: "AET-10478",
    customer: {
      name: "Noa Levi",
      initials: "NL",
      avatarUrl: getCustomerAvatar("Noa Levi"),
    },
    items: "Ohui Geniture Ampoule ×2",
    itemCount: 2,
    status: "Pending",
    total: 368,
    placedAt: "3 h ago",
  },
];

export const revenueSeries = [
  { week: "W1", revenue: 38420, prev: 32100, orders: 244, ordersPrev: 210, aov: 157, aovPrev: 152 },
  { week: "W2", revenue: 42180, prev: 35400, orders: 268, ordersPrev: 228, aov: 157, aovPrev: 155 },
  { week: "W3", revenue: 40120, prev: 36800, orders: 250, ordersPrev: 236, aov: 160, aovPrev: 155 },
  { week: "W4", revenue: 46890, prev: 38200, orders: 293, ordersPrev: 246, aov: 160, aovPrev: 155 },
  { week: "W5", revenue: 51240, prev: 41100, orders: 324, ordersPrev: 265, aov: 158, aovPrev: 155 },
  { week: "W6", revenue: 49870, prev: 42600, orders: 312, ordersPrev: 272, aov: 159, aovPrev: 156 },
  { week: "W7", revenue: 55320, prev: 44800, orders: 345, ordersPrev: 287, aov: 160, aovPrev: 156 },
  { week: "W8", revenue: 58940, prev: 46900, orders: 368, ordersPrev: 300, aov: 160, aovPrev: 156 },
  { week: "W9", revenue: 62180, prev: 48200, orders: 388, ordersPrev: 308, aov: 160, aovPrev: 156 },
  {
    week: "W10",
    revenue: 67420,
    prev: 50100,
    orders: 421,
    ordersPrev: 321,
    aov: 160,
    aovPrev: 156,
  },
  {
    week: "W11",
    revenue: 71890,
    prev: 52400,
    orders: 449,
    ordersPrev: 335,
    aov: 160,
    aovPrev: 156,
  },
  {
    week: "W12",
    revenue: 78340,
    prev: 54800,
    orders: 489,
    ordersPrev: 349,
    aov: 160,
    aovPrev: 157,
  },
];

export const kpis = [
  {
    label: "Revenue",
    value: "$648,520",
    delta: 12.4,
    accent: true,
    spark: [30, 34, 32, 38, 42, 40, 46, 48, 52, 55, 58, 62],
  },
  {
    label: "Orders",
    value: "4,128",
    delta: 8.2,
    accent: false,
    spark: [20, 24, 22, 26, 28, 27, 30, 32, 31, 34, 36, 38],
  },
  {
    label: "Average Order Value",
    value: "$157.10",
    delta: 3.6,
    accent: false,
    spark: [40, 42, 41, 44, 43, 45, 46, 47, 48, 49, 50, 52],
  },
  {
    label: "Returning Customers",
    value: "38.4%",
    delta: 5.1,
    accent: false,
    spark: [22, 24, 23, 26, 28, 27, 30, 31, 33, 34, 36, 38],
  },
];
