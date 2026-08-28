import type { StoreSettings } from "./types";

export * from "./types";

/**
 * Default store configuration surfaced in the admin settings workspace —
 * general profile, notifications, team, and security.
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
