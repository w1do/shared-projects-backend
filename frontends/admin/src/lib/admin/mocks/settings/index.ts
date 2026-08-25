import type { StoreSettings } from "./types";

export * from "./types";

/**
 * Default store configuration surfaced in the admin settings workspace —
 * general profile, payments, shipping, taxes, notifications, team, and security.
 */
export const mockStoreSettings: StoreSettings = {
  general: {
    storeName: "Ætheria Beauty Studio",
    supportEmail: "care@aetheria.studio",
    phone: "+1 (415) 555-0142",
    description:
      "Multi-brand clean beauty marketplace pairing dermatology-grade actives with editorial skincare rituals.",
    currency: "USD",
    timezone: "America/Los_Angeles",
    weightUnit: "kg",
    storefrontUrl: "https://aetheria.studio",
  },
  payments: [
    {
      id: "stripe",
      name: "Stripe",
      description: "Cards, Apple Pay, and Google Pay with instant payouts.",
      enabled: true,
      mode: "live",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Wallet checkout and Pay in 4 installments.",
      enabled: true,
      mode: "live",
    },
    {
      id: "klarna",
      name: "Klarna",
      description: "Buy now, pay later across eligible markets.",
      enabled: false,
      mode: "test",
    },
    {
      id: "cod",
      name: "Cash on delivery",
      description: "Collect payment at the doorstep for local orders.",
      enabled: false,
      mode: "live",
    },
  ],
  shipping: [
    {
      id: "domestic",
      name: "Domestic standard",
      regions: "United States",
      rate: 6,
      freeThreshold: 60,
      enabled: true,
    },
    {
      id: "express",
      name: "Express overnight",
      regions: "United States",
      rate: 18,
      freeThreshold: null,
      enabled: true,
    },
    {
      id: "europe",
      name: "Europe tracked",
      regions: "EU · United Kingdom",
      rate: 14,
      freeThreshold: 120,
      enabled: true,
    },
    {
      id: "apac",
      name: "Asia Pacific",
      regions: "Japan · Singapore · Australia",
      rate: 22,
      freeThreshold: null,
      enabled: false,
    },
  ],
  taxes: {
    pricesIncludeTax: false,
    autoCalculate: true,
    defaultRate: 8.5,
    taxId: "US-93-2841576",
    regions: [
      { id: "ca", name: "California", rate: 8.5 },
      { id: "ny", name: "New York", rate: 8.875 },
      { id: "eu", name: "European Union", rate: 20 },
      { id: "uk", name: "United Kingdom", rate: 20 },
    ],
  },
  notifications: [
    {
      id: "orders",
      label: "New orders",
      description: "Alert the team the moment a customer checks out.",
      email: true,
      push: true,
    },
    {
      id: "low-stock",
      label: "Low stock",
      description: "Warn when a variant drops below its reorder point.",
      email: true,
      push: false,
    },
    {
      id: "reviews",
      label: "Product reviews",
      description: "Notify when shoppers leave a new product review.",
      email: false,
      push: true,
    },
    {
      id: "payouts",
      label: "Payouts",
      description: "Confirm when funds settle into your bank account.",
      email: true,
      push: false,
    },
    {
      id: "digest",
      label: "Weekly digest",
      description: "A Monday summary of revenue, orders, and growth.",
      email: true,
      push: false,
    },
  ],
  team: [
    {
      id: "u-01",
      name: "Mai Tran",
      email: "mai@aetheria.studio",
      role: "Owner",
      status: "active",
    },
    {
      id: "u-02",
      name: "Marcus Chen",
      email: "marcus@aetheria.studio",
      role: "Admin",
      status: "active",
    },
    {
      id: "u-03",
      name: "Sofia Rossi",
      email: "sofia@aetheria.studio",
      role: "Manager",
      status: "active",
    },
    {
      id: "u-04",
      name: "Liam Park",
      email: "liam@aetheria.studio",
      role: "Staff",
      status: "invited",
    },
  ],
  security: {
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: 30,
  },
};
