/**
 * Видимость разделов панели.
 *
 * Один источник истины для меню, быстрых действий и guard'а маршрутов
 * (`src/proxy.ts`): снимок `bootstrap` (включённые для проекта сервисы + права
 * оператора) → набор ключей видимых разделов.
 *
 * Раздел показывается, только если его сервис включён для проекта И у оператора
 * есть объявленное для раздела право. Разделы, которым не соответствует ни один
 * сервис платформы, требования не имеют и скрыты всегда — их страницы,
 * компоненты и демо-данные при этом остаются в проекте нетронутыми.
 */

/** Все ключи разделов вёрстки — совпадают с сегментами маршрутов `app/admin/<key>`. */
export const CONSOLE_SECTION_KEYS = [
  "dashboard",
  "products",
  "variants",
  "brands",
  "categories",
  "collections",
  "inventory",
  "orders",
  "customers",
  "campaigns",
  "promotions",
  "support",
  "blogs",
  "notifications",
  "team",
  "settings",
] as const;

export type ConsoleSectionKey = (typeof CONSOLE_SECTION_KEYS)[number];

export type SectionRequirement = { service: string; permission: string };

/**
 * Карта «раздел вёрстки → требование платформы».
 *
 * Задана явно: маршруты манифестов сервисов (`/content/posts`, `/users`, …) не
 * совпадают с маршрутами вёрстки (`/admin/blogs`, `/admin/customers`, …), и
 * автосопоставление давало бы молчаливые дыры. Чтобы вернуть скрытый раздел,
 * когда в платформе появится сервис, достаточно дописать сюда строку.
 */
export const SECTION_REQUIREMENTS: Partial<Record<ConsoleSectionKey, SectionRequirement>> = {
  dashboard: { service: "analytics", permission: "analytics.reports.view" },
  blogs: { service: "content", permission: "content.posts.view" },
  categories: { service: "content", permission: "content.categories.view" },
  customers: { service: "auth", permission: "auth.users.view" },
  team: { service: "auth", permission: "auth.members.view" },
  settings: { service: "auth", permission: "auth.settings.view" },
};

/**
 * Сервисы-ядро: они не переключаются на проект и потому не приходят в
 * `bootstrap.services[]`. `cms-auth.php` перечисляет переключаемые сервисы как
 * `['content', 'analytics', 'pay']` — `auth` в список намеренно не входит, он
 * есть у любого проекта всегда. Их разделы гейтятся только правом оператора.
 */
const CORE_SERVICES = new Set(["auth"]);

const SECTION_KEY_SET = new Set<string>(CONSOLE_SECTION_KEYS);

/**
 * Ключ раздела по адресу панели: `/admin` → `dashboard`, `/admin/<key>/...` → `<key>`.
 * Адреса вне каталога разделов (например `/admin/unauthorized`) ключа не имеют.
 */
export function sectionKeyOfPath(pathname: string): ConsoleSectionKey | undefined {
  if (pathname === "/admin" || pathname === "/admin/") return "dashboard";
  if (!pathname.startsWith("/admin/")) return undefined;
  const segment = pathname.slice("/admin/".length).split("/")[0];
  return SECTION_KEY_SET.has(segment) ? (segment as ConsoleSectionKey) : undefined;
}

/** Раздел без требования — демонстрационный: в платформе нет его сервиса. */
export function isDemoSection(key: string): boolean {
  return !(key in SECTION_REQUIREMENTS);
}

export type BootstrapAccess = {
  services?: Array<{ key: string; enabled?: boolean }> | null;
  permissions?: string[] | null;
};

/** Ключи разделов, доступных оператору по снимку `bootstrap`. Порядок — каталожный. */
export function visibleSectionKeys(bootstrap: BootstrapAccess): ConsoleSectionKey[] {
  const enabledServices = new Set(
    (bootstrap.services ?? []).filter((service) => service.enabled !== false).map((s) => s.key),
  );
  const permissions = bootstrap.permissions ?? [];
  const hasFullAccess = permissions.includes("*");

  return CONSOLE_SECTION_KEYS.filter((key) => {
    const requirement = SECTION_REQUIREMENTS[key];
    if (!requirement) return false;
    if (!CORE_SERVICES.has(requirement.service) && !enabledServices.has(requirement.service)) {
      return false;
    }
    return hasFullAccess || permissions.includes(requirement.permission);
  });
}

// --- Снимок доступа -------------------------------------------------------
//
// Cookie нужна `proxy.ts` (сервер видит только cookies), localStorage — рендеру
// меню без ожидания сети. Снимок пишется при входе и при каждом успешном
// `bootstrap`; живёт столько же, сколько сессия оператора.

export const CONSOLE_SECTIONS_COOKIE = "console_sections";
export const CONSOLE_SECTIONS_STORAGE_KEY = "console_sections";

// Подписка на смену снимка: сайдбар и быстрые действия перечитывают снимок
// сразу после записи (например, после переключения сервиса из настроек),
// без повторного входа. События ограничены вкладкой — этого достаточно:
// снимок пишется тем же клиентом, который его читает.
const snapshotListeners = new Set<() => void>();
let snapshotRevision = 0;

function notifySnapshotListeners() {
  snapshotRevision += 1;
  for (const listener of snapshotListeners) listener();
}

export function subscribeSectionSnapshot(listener: () => void): () => void {
  snapshotListeners.add(listener);
  return () => {
    snapshotListeners.delete(listener);
  };
}

/** Монотонная версия снимка — снапшот для useSyncExternalStore. */
export function sectionSnapshotRevision() {
  return snapshotRevision;
}

/** Компактный формат cookie: ключи через запятую. */
export function encodeSectionSnapshot(keys: readonly string[]): string {
  return keys.join(",");
}

export function decodeSectionSnapshot(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

export function persistSectionSnapshot(keys: readonly string[], maxAgeSeconds: number) {
  const value = encodeSectionSnapshot(keys);
  if (typeof document !== "undefined") {
    document.cookie = `${CONSOLE_SECTIONS_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSOLE_SECTIONS_STORAGE_KEY, value);
  }
  notifySnapshotListeners();
}

export function clearSectionSnapshot() {
  if (typeof document !== "undefined") {
    document.cookie = `${CONSOLE_SECTIONS_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CONSOLE_SECTIONS_STORAGE_KEY);
  }
  notifySnapshotListeners();
}

/**
 * Снимок для рендера меню. `undefined` — снимка ещё нет (старая сессия или
 * mock-режим): вызывающий сам решает, что показывать.
 */
export function readSectionSnapshot(): string[] | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(CONSOLE_SECTIONS_STORAGE_KEY);
  if (raw == null) return undefined;
  return decodeSectionSnapshot(raw);
}

// --- Селекторы меню -------------------------------------------------------

type SectionItem = { section: string };
type SectionGroup<TItem extends SectionItem> = { items: TItem[] };

/**
 * Видимое меню: те же группы и пункты в исходном порядке, без недоступных
 * пунктов и без опустевших групп. Подписи, иконки и порядок не меняются.
 */
export function selectVisibleSections<
  TItem extends SectionItem,
  TGroup extends SectionGroup<TItem>,
>(groups: readonly TGroup[], visibleKeys: readonly string[]): TGroup[] {
  const visible = new Set(visibleKeys);
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => visible.has(item.section)),
    }))
    .filter((group) => group.items.length > 0);
}

/** Быстрые действия фильтруются тем же набором: действие наследует раздел, куда ведёт. */
export function selectVisibleQuickActions<TAction extends SectionItem>(
  actions: readonly TAction[],
  visibleKeys: readonly string[],
): TAction[] {
  const visible = new Set(visibleKeys);
  return actions.filter((action) => visible.has(action.section));
}
