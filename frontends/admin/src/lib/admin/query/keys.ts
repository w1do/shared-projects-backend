/**
 * Central TanStack Query key factory for admin data.
 * Keep keys hierarchical so list/detail invalidation stays predictable.
 */
export const adminQueryKeys = {
  all: ["admin"] as const,
  products: {
    all: ["admin", "products"] as const,
    lists: () => ["admin", "products", "list"] as const,
    list: () => ["admin", "products", "list"] as const,
    details: () => ["admin", "products", "detail"] as const,
    detail: (id: string) => ["admin", "products", "detail", id] as const,
  },
  brands: {
    all: ["admin", "brands"] as const,
    list: () => ["admin", "brands", "list"] as const,
    details: () => ["admin", "brands", "detail"] as const,
    detail: (id: string) => ["admin", "brands", "detail", id] as const,
  },
  categories: {
    all: ["admin", "categories"] as const,
    list: () => ["admin", "categories", "list"] as const,
    details: () => ["admin", "categories", "detail"] as const,
    detail: (id: string) => ["admin", "categories", "detail", id] as const,
  },
  collections: {
    all: ["admin", "collections"] as const,
    list: () => ["admin", "collections", "list"] as const,
    details: () => ["admin", "collections", "detail"] as const,
    detail: (id: string) => ["admin", "collections", "detail", id] as const,
  },
  inventory: {
    all: ["admin", "inventory"] as const,
    lists: () => ["admin", "inventory", "list"] as const,
    list: () => ["admin", "inventory", "list"] as const,
  },
  campaigns: {
    all: ["admin", "campaigns"] as const,
    list: () => ["admin", "campaigns", "list"] as const,
    details: () => ["admin", "campaigns", "detail"] as const,
    detail: (id: string) => ["admin", "campaigns", "detail", id] as const,
  },
  variants: {
    all: ["admin", "variants"] as const,
    list: () => ["admin", "variants", "list"] as const,
  },
  promotions: {
    all: ["admin", "promotions"] as const,
    list: () => ["admin", "promotions", "list"] as const,
  },
  orders: {
    all: ["admin", "orders"] as const,
    list: () => ["admin", "orders", "list"] as const,
  },
  customers: {
    all: ["admin", "customers"] as const,
    list: () => ["admin", "customers", "list"] as const,
  },
  articles: {
    all: ["admin", "articles"] as const,
    list: () => ["admin", "articles", "list"] as const,
    detail: (slug: string) => ["admin", "articles", "detail", slug] as const,
  },
  notifications: {
    all: ["admin", "notifications"] as const,
    list: () => ["admin", "notifications", "list"] as const,
  },
  support: {
    all: ["admin", "support"] as const,
    list: () => ["admin", "support", "list"] as const,
  },
  settings: {
    all: ["admin", "settings"] as const,
    store: () => ["admin", "settings", "store"] as const,
    payments: () => ["admin", "settings", "payments"] as const,
    paymentProviders: () => ["admin", "settings", "payment-providers"] as const,
    paymentProvider: (provider: string) =>
      ["admin", "settings", "payment-providers", provider] as const,
    projects: () => ["admin", "settings", "projects"] as const,
    site: () => ["admin", "settings", "site"] as const,
  },
  dashboard: {
    all: ["admin", "dashboard"] as const,
    data: () => ["admin", "dashboard", "data"] as const,
  },
  licensing: {
    all: ["admin", "licensing"] as const,
    organizations: (cursor?: string) =>
      ["admin", "licensing", "organizations", cursor ?? ""] as const,
    plans: (cursor?: string) => ["admin", "licensing", "plans", cursor ?? ""] as const,
    plan: (id: number) => ["admin", "licensing", "plan", id] as const,
    licenses: (filters?: { organizationId?: number; status?: string; cursor?: string }) =>
      [
        "admin",
        "licensing",
        "licenses",
        filters?.organizationId ?? "",
        filters?.status ?? "",
        filters?.cursor ?? "",
      ] as const,
    installations: (licenseId: string, appVersionBelow?: string) =>
      [
        "admin",
        "licensing",
        "installations",
        licenseId,
        appVersionBelow ?? "",
      ] as const,
    releases: (cursor?: string) =>
      ["admin", "licensing", "releases", cursor ?? ""] as const,
    signingKey: () => ["admin", "licensing", "signing-key"] as const,
    access: () => ["admin", "licensing", "access"] as const,
  },
  content: {
    all: ["admin", "content"] as const,
    pages: () => ["admin", "content", "pages"] as const,
    page: (id: string) => ["admin", "content", "pages", id] as const,
    landing: () => ["admin", "content", "landing"] as const,
  },
} as const;
