import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import type { Category } from "@/lib/admin/types/catalog";
import {
  adminMutations,
  getAdminCategories,
  getAdminCategoryById,
} from "@/lib/admin/data-source/admin-data";
import { mapCategory } from "@/lib/admin/data-source/mappers/catalog";

/** Список категорий проекта для TanStack Query. */
export async function listCategories(): Promise<Category[]> {
  return getAdminCategories();
}

/** Категория по идентификатору для TanStack Query. */
export async function getCategoryById(id: string): Promise<Category | null> {
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
  return mapCategory(
    await adminMutations.createCategory({
      ...toApiCategoryBody(values),
      parentId: toParentId(values),
    }),
  );
}

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<Category | null> {
  // Родитель не отправляется вместе с переименованием: смена родителя —
  // отдельная операция перемещения (moveCategory), иначе поддерево уедет в корень.
  return mapCategory(await adminMutations.updateCategory(id, toApiCategoryBody(values)));
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
  await adminMutations.moveCategory(id, parentId, position);
}

/** Удаление категории. UI убирает её оптимистично и откатывает при ошибке. */
export async function deleteCategory(id: string): Promise<void> {
  await adminMutations.deleteCategory(id);
}

/**
 * Удаление набора категорий одним запросом.
 *
 * Платформа выполняет его одной транзакцией: частично применённого удаления
 * не остаётся, а дерево пересчитывается один раз, а не на каждом узле.
 */
export async function deleteCategories(ids: string[]): Promise<void> {
  await adminMutations.bulkDeleteCategories(ids);
}

/** Удаление всех категорий проекта одним запросом. */
export async function purgeCategories(): Promise<void> {
  await adminMutations.purgeCategories();
}
