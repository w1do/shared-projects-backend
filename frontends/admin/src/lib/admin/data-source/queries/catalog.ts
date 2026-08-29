import * as platformContent from "../platform/content";
import { categoryToApiCategory } from "../platform/mappers";
import { flattenCategories, mapCategory } from "../mappers";

/** categories → content-service: дерево категорий проекта (nested set). */
export async function getAdminCategories() {
  const tree = await platformContent.listCategories();
  const categories = tree.map((node, index) => categoryToApiCategory(node, index));
  return flattenCategories(categories).map(mapCategory);
}

export async function getAdminCategoryById(id: string) {
  const categories = await getAdminCategories();
  return categories.find((category) => category.id === id) ?? null;
}
