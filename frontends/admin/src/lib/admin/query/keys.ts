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
    site: () => ["admin", "settings", "site"] as const,
  },
  dashboard: {
    all: ["admin", "dashboard"] as const,
    data: () => ["admin", "dashboard", "data"] as const,
  },
  content: {
    all: ["admin", "content"] as const,
    pages: () => ["admin", "content", "pages"] as const,
    page: (id: string) => ["admin", "content", "pages", id] as const,
    landing: () => ["admin", "content", "landing"] as const,
  },
} as const;
