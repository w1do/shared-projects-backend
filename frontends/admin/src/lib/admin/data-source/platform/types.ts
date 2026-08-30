/** Типы ответов платформы (DTO сервисов). Приводятся к типам вёрстки в `mappers.ts`. */

export type PlatformSeo = {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  canonical?: string | null;
  robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_card?: string | null;
  json_ld?: Record<string, unknown> | null;
};

/** Изображение материала: платформа отдаёт свою ссылку, а не внешний адрес. */
export type PlatformPostImage = {
  id: number;
  url: string;
  alt?: string | null;
};

/** Блок содержимого поста платформы. */
export type PlatformPostBlock = {
  id: string;
  title: string;
  markdown: string;
};

export type PlatformPost = {
  id: number;
  title: string;
  slug: string;
  body?: string | null;
  locale: string;
  translation_group?: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_at?: string | null;
  published_at?: string | null;
  is_index: boolean;
  /** Закреплённый пост проекта: он в проекте один. */
  is_featured: boolean;
  categories?: number[];
  seo?: PlatformSeo | null;
  blocks?: PlatformPostBlock[];
  cover?: PlatformPostImage | null;
  banner?: PlatformPostImage | null;
};

export type PlatformMedia = {
  id: number;
  path: string;
  /** Ссылка платформы: клиент не знает адреса хранилища проекта. */
  url: string;
  mime: string;
  size: number;
  alt?: string | null;
  variants?: Record<string, string> | null;
};

/** Позиция выдачи подбора изображений: ссылка, превью, размеры и источник. */
export type PlatformImageResult = {
  link: string;
  thumbnail?: string | null;
  width?: number | null;
  height?: number | null;
  source?: string | null;
};

export type PlatformRevision = {
  id: number;
  number: number;
  title?: string | null;
  created_at?: string | null;
  author_id?: string | null;
};

export type PlatformCategory = {
  id: number;
  name: string;
  /** Полный набор имени по локалям (режим api). */
  name_translations?: Record<string, string>;
  slug: string;
  parent_id: number | null;
  is_index: boolean;
  seo?: PlatformSeo | null;
  children?: PlatformCategory[];
};

export type PlatformProject = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  topic?: string | null;
  locales: string[];
  archived_at?: string | null;
};

/** Запись журнала действий проекта. */
export type PlatformAuditEntry = {
  id: number;
  actor_type: string;
  actor_id?: string | null;
  action: string;
  subject?: string | null;
  changes?: Record<string, unknown> | null;
  created_at?: string | null;
};

export type PlatformProjectUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  status?: string | null;
  blocked_at?: string | null;
  created_at?: string | null;
  last_login_at?: string | null;
};

export type PlatformMember = {
  id: string;
  admin_id?: string | number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
  last_login_at?: string | null;
};

export type PlatformRole = {
  id: number | string;
  name: string;
  permissions?: string[];
};

export type PlatformApiKey = {
  id: string;
  name: string;
  prefix?: string | null;
  token?: string | null;
  scopes?: string[];
  created_at?: string | null;
  last_used_at?: string | null;
};

export type PlatformService = {
  key: string;
  enabled: boolean;
  version?: string | null;
};

export type PlatformOverviewRow = {
  date: string;
  name: string;
  events: number | string;
  sessions: number | string;
  subjects: number | string;
};

export type PlatformTopPageRow = {
  path: string;
  hits: number | string;
  sessions: number | string;
};

export type PlatformRevenueRow = {
  date: string;
  currency: string;
  revenue_minor: number | string;
  payments: number | string;
};

export type PlatformBootstrap = {
  user: {
    id: number;
    name: string;
    email: string;
    locale: string;
    is_super_admin: boolean;
  };
  projects: PlatformProject[];
  current_project: string | null;
  services: Array<{ key: string; version: string; enabled: boolean }>;
  permissions: string[];
  /** Версия словаря переводов проекта — инвалидация кэша текстов консоли. */
  translations_version: string;
  server_time: string;
};
