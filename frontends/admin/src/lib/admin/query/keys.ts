/**
 * Central TanStack Query key factory for admin data.
 * Keep keys hierarchical so list/detail invalidation stays predictable.
 */
export const adminQueryKeys = {
  all: ["admin"] as const,
  categories: {
    all: ["admin", "categories"] as const,
    list: () => ["admin", "categories", "list"] as const,
    details: () => ["admin", "categories", "detail"] as const,
    detail: (id: string) => ["admin", "categories", "detail", id] as const,
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
  tasks: {
    all: ["admin", "tasks"] as const,
    list: (filter?: { kind?: string; subjectType?: string; subjectId?: string }) =>
      [
        "admin",
        "tasks",
        "list",
        filter?.kind ?? "",
        filter?.subjectType ?? "",
        filter?.subjectId ?? "",
      ] as const,
  },
  seo: {
    all: ["admin", "seo"] as const,
    catalog: (filters?: { type?: string; sort?: string; direction?: string }) =>
      [
        "admin",
        "seo",
        "catalog",
        filters?.type ?? "",
        filters?.sort ?? "",
        filters?.direction ?? "",
      ] as const,
  },
  cities: {
    all: ["admin", "cities"] as const,
    list: (filters?: {
      search?: string;
      regionId?: number;
      enabled?: boolean;
      sort?: string;
      direction?: string;
    }) =>
      [
        "admin",
        "cities",
        "list",
        filters?.search ?? "",
        filters?.regionId ?? "",
        filters?.enabled ?? "",
        filters?.sort ?? "",
        filters?.direction ?? "",
      ] as const,
    regions: () => ["admin", "cities", "regions"] as const,
    seo: (id: number) => ["admin", "cities", "seo", id] as const,
  },
  pay: {
    all: ["admin", "pay"] as const,
    access: () => ["admin", "pay", "access"] as const,
    payments: (filters?: { status?: string }) =>
      ["admin", "pay", "payments", filters?.status ?? ""] as const,
    subscriptions: (filters?: { subjectType?: string }) =>
      ["admin", "pay", "subscriptions", filters?.subjectType ?? ""] as const,
    plans: () => ["admin", "pay", "plans"] as const,
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
  project: {
    all: ["admin", "project"] as const,
    card: () => ["admin", "project", "card"] as const,
    buildout: () => ["admin", "project", "buildout"] as const,
    access: () => ["admin", "project", "access"] as const,
    list: (project: string) => ["admin", "project", "list", project] as const,
  },
  research: {
    all: ["admin", "research"] as const,
    list: (status?: string) => ["admin", "research", "list", status ?? ""] as const,
    detail: (id: number) => ["admin", "research", "detail", id] as const,
    topics: (researchId: number) => ["admin", "research", "topics", researchId] as const,
    allTopics: (status?: string) => ["admin", "research", "topics", "all", status ?? ""] as const,
  },
  projectEvents: {
    all: ["admin", "project-events"] as const,
    list: (project: string) => ["admin", "project-events", project] as const,
  },
  instructs: {
    all: ["admin", "instructs"] as const,
    list: (category?: string) => ["admin", "instructs", "list", category ?? ""] as const,
    categories: () => ["admin", "instructs", "categories"] as const,
    schemaPresets: () => ["admin", "instructs", "schema-presets"] as const,
  },
  content: {
    all: ["admin", "content"] as const,
    pages: () => ["admin", "content", "pages"] as const,
    page: (id: string) => ["admin", "content", "pages", id] as const,
    landing: () => ["admin", "content", "landing"] as const,
  },
} as const;
