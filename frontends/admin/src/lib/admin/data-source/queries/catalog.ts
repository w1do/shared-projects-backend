import { mockCategories } from "@/lib/admin/mocks/taxonomy/categories";
import { findStoredCategory, readStoredCategories } from "@/lib/admin/categories/store";
import * as platformContent from "../platform/content";
import { categoryToApiCategory } from "../platform/mappers";
import { flattenCategories, mapCategory } from "../mappers";
import { fromSource } from "./shared";

/** categories → content-service: дерево категорий проекта (nested set). */
export async function getAdminCategories() {
  return fromSource(async () => {
    const tree = await platformContent.listCategories();
    const categories = tree.map((node, index) => categoryToApiCategory(node, index));
    return flattenCategories(categories).map(mapCategory);
  }, readStoredCategories);
}

export async function getAdminCategoryById(id: string) {
  return fromSource(
    async () => {
      const tree = await platformContent.listCategories();
      const flat = flattenCategories(tree.map((node, index) => categoryToApiCategory(node, index)));
      const found = flat.find((category) => category.id === id);
      return found ? mapCategory(found) : null;
    },
    findStoredCategory(id) ??
      mockCategories.find((category) => category.id.toLowerCase() === id.toLowerCase()) ??
      null,
  );
}
