import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import type { Category } from "@/lib/admin/mocks/types";
import {
  createStoredCategory,
  deleteStoredCategory,
  findStoredCategory,
  readStoredCategories,
  updateStoredCategory,
} from "@/lib/admin/categories/store";
import {
  adminMutations,
  getAdminCategories,
  getAdminCategoryById,
} from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mapCategory } from "@/lib/admin/data-source/mappers/catalog";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/** Client rehydrate after SSR seed (mock reads local store; API keeps server list). */
export function rehydrateCategories(serverList: Category[] = []): Category[] {
  if (shouldUseAdminApi() || typeof window === "undefined") return serverList;
  return readStoredCategories();
}

/**
 * Canonical category list loader for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listCategories(): Promise<Category[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredCategories();
  }
  return getAdminCategories();
}

/** Canonical category detail loader for TanStack Query. */
export async function getCategoryById(id: string): Promise<Category | null> {
  if (!shouldUseAdminApi()) {
    // Case-insensitive match — route params and stored ids can differ in casing.
    return findStoredCategory(id);
  }
  return getAdminCategoryById(id);
}

/** Имя: строка (локаль по умолчанию) или набор по локалям, если заданы переводы. */
function toName(values: CategoryFormValues): string | Record<string, string> {
  const extra = Object.fromEntries(
    Object.entries(values.nameTranslations ?? {}).filter(([, value]) => value.trim() !== ""),
  );
  if (Object.keys(extra).length === 0) return values.name;

  return { [values.defaultLocale ?? "ru"]: values.name, ...extra };
}

function toApiCategoryBody(values: CategoryFormValues) {
  return {
    name: toName(values),
    slug: values.slug,
    displayOrder: values.displayOrder,
    status: values.status,
  };
}

/** Пустая строка в форме означает «корневая категория». */
function toParentId(values: CategoryFormValues): string | null {
  return values.parentId ? values.parentId : null;
}

export async function createCategory(values: CategoryFormValues): Promise<Category> {
  if (shouldUseAdminApi()) {
    return mapCategory(
      await adminMutations.createCategory({
        ...toApiCategoryBody(values),
        parentId: toParentId(values),
      }),
    );
  }
  return createStoredCategory(values);
}

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<Category | null> {
  if (shouldUseAdminApi()) {
    // Родитель не отправляется вместе с переименованием: смена родителя —
    // отдельная операция перемещения (moveCategory), иначе поддерево уедет в корень.
    return mapCategory(await adminMutations.updateCategory(id, toApiCategoryBody(values)));
  }
  return updateStoredCategory(id, values);
}

/**
 * Перемещение категории к другому родителю (`null` — в корень).
 *
 * Выполняется операцией перемещения nested set, а не сохранением категории:
 * поддерево следует за узлом одной операцией платформы.
 */
export async function moveCategory(
  id: string,
  parentId: string | null,
  position?: number,
): Promise<void> {
  if (!shouldUseAdminApi()) return;
  await adminMutations.moveCategory(id, parentId, position);
}

/** Deletes a category. UI should optimistically remove then rollback on throw. */
export async function deleteCategory(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.deleteCategory(id);
    return;
  }
  deleteStoredCategory(id);
}
