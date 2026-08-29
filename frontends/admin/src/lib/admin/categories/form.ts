import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import type { Category } from "@/lib/admin/types/catalog";
import { slugify } from "@/lib/admin/shared/slugify";
import { defaultGradients } from "@/lib/theme-colors";

export const defaultCategoryFormValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  status: "Active",
  iconName: "Droplet",
  thumbnail: "/categories/thumbnails/cleansers-toners.webp",
  coverGradientStart: defaultGradients.cover[0],
  coverGradientEnd: defaultGradients.cover[1],
  displayOrder: 1,
  parentId: "",
  nameTranslations: {},
};

export function slugifyCategoryName(name: string) {
  return slugify(name);
}

/** Категория платформы → значения формы редактирования. */
export function createCategoryFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    status: category.status,
    iconName: category.iconName || defaultCategoryFormValues.iconName,
    thumbnail: category.thumbnail,
    coverGradientStart: category.coverGradient[0],
    coverGradientEnd: category.coverGradient[1],
    displayOrder: category.displayOrder,
    parentId: category.parentId ?? "",
    nameTranslations: category.nameTranslations ?? {},
  };
}
