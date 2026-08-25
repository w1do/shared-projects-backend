import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import type { Category } from "@/lib/admin/mocks/types";
import { initialCategories } from "@/lib/admin/mocks/taxonomy/categories-data";
import { createCategoryFromForm, mergeCategoryWithFormValues } from "@/lib/admin/categories/form";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const categoryListStorageKey = storageKey("categories");
const categorySeedVersionKey = storageKey("categories-seed-version");
const currentCategorySeedVersion = "4";

const categoryStore = createVersionedLocalStore<Category>({
  storageKey: categoryListStorageKey,
  seedVersionKey: categorySeedVersionKey,
  seedVersion: currentCategorySeedVersion,
  seed: initialCategories,
});

export function readStoredCategories(): Category[] {
  return categoryStore.read();
}

export function saveStoredCategories(categories: Category[]) {
  categoryStore.save(categories);
}

export function createStoredCategory(values: CategoryFormValues): Category {
  const categories = readStoredCategories();
  const category = createCategoryFromForm(
    values,
    categories.map((item) => item.id),
  );

  saveStoredCategories([category, ...categories]);

  return category;
}

export function deleteStoredCategory(id: string): Category[] {
  const nextCategories = readStoredCategories().filter(
    (category) => category.id.toLowerCase() !== id.toLowerCase(),
  );
  saveStoredCategories(nextCategories);

  return nextCategories;
}

export function findStoredCategory(id: string): Category | null {
  return (
    readStoredCategories().find((category) => category.id.toLowerCase() === id.toLowerCase()) ??
    null
  );
}

export function updateStoredCategory(id: string, values: CategoryFormValues): Category | null {
  const categories = readStoredCategories();
  const target = categories.find((category) => category.id.toLowerCase() === id.toLowerCase());

  if (!target) {
    return null;
  }

  const nextCategory = mergeCategoryWithFormValues(target, values);
  saveStoredCategories(
    categories.map((category) => (category.id === target.id ? nextCategory : category)),
  );

  return nextCategory;
}
