import type {
  CategoryFormValues,
  MockCategoryFormValues,
} from "@/lib/admin/schemas/catalog/category-form-schema";
import type { Category } from "@/lib/admin/mocks/types";
import { slugify } from "@/lib/admin/shared/slugify";
import { defaultGradients } from "@/lib/theme-colors";

/**
 * Форма живого режима денежных полей не имеет — значения по умолчанию несут
 * нули торговых метрик только ради модели демо-каталога (мок-режим).
 */
export const defaultCategoryFormValues: MockCategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  status: "Active",
  iconName: "Droplet",
  thumbnail: "/categories/thumbnails/cleansers-toners.webp",
  coverGradientStart: defaultGradients.cover[0],
  coverGradientEnd: defaultGradients.cover[1],
  displayOrder: 1,
  revenue: 0,
  growthYoY: 0,
  parentId: "",
  nameTranslations: {},
};

export const sampleCategoryFormValues: MockCategoryFormValues = {
  name: "Night Repair Rituals",
  slug: "night-repair-rituals",
  description:
    "Overnight treatment systems that restore the skin barrier while you sleep, blending peptides, retinaldehyde, and botanical ceramides for visible morning renewal.",
  status: "Active",
  iconName: "Sparkles",
  thumbnail: "/categories/thumbnails/serums-treatments.webp",
  coverGradientStart: defaultGradients.cover[0],
  coverGradientEnd: defaultGradients.cover[1],
  displayOrder: 8,
  revenue: 128400,
  growthYoY: 21.6,
};

export function slugifyCategoryName(name: string) {
  return slugify(name);
}

export function createCategoryId(name: string, existingIds: string[] = []) {
  const baseId = slugifyCategoryName(name) || "category";

  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  let suffix = 2;
  let nextId = `${baseId}-${suffix}`;

  while (existingIds.includes(nextId)) {
    suffix += 1;
    nextId = `${baseId}-${suffix}`;
  }

  return nextId;
}

/** Живая форма метрик не передаёт — демо-каталог хранит нули. */
function moneyOf(values: CategoryFormValues | MockCategoryFormValues) {
  return "revenue" in values
    ? { revenue: values.revenue, growthYoY: values.growthYoY }
    : { revenue: 0, growthYoY: 0 };
}

export function createCategoryFromForm(
  values: CategoryFormValues | MockCategoryFormValues,
  existingIds: string[] = [],
): Category {
  const name = values.name.trim();

  return {
    id: createCategoryId(name, existingIds),
    name,
    slug: values.slug.trim() || slugifyCategoryName(name),
    description: values.description?.trim() || undefined,
    productCount: 0,
    status: values.status,
    coverGradient: [values.coverGradientStart, values.coverGradientEnd],
    thumbnail: values.thumbnail,
    iconName: values.iconName,
    ...moneyOf(values),
    displayOrder: values.displayOrder,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export function createCategoryFormValues(category: Category): MockCategoryFormValues {
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
    revenue: category.revenue,
    growthYoY: category.growthYoY,
    parentId: category.parentId ?? "",
    nameTranslations: category.nameTranslations ?? {},
  };
}

export function mergeCategoryWithFormValues(
  category: Category,
  values: CategoryFormValues | MockCategoryFormValues,
): Category {
  const name = values.name.trim();
  // Без денежных полей в форме прежние метрики категории сохраняются как есть.
  const money =
    "revenue" in values
      ? { revenue: values.revenue, growthYoY: values.growthYoY }
      : { revenue: category.revenue, growthYoY: category.growthYoY };

  return {
    ...category,
    name,
    slug: values.slug.trim() || slugifyCategoryName(name),
    description: values.description?.trim() || undefined,
    status: values.status,
    coverGradient: [values.coverGradientStart, values.coverGradientEnd],
    thumbnail: values.thumbnail,
    iconName: values.iconName,
    ...money,
    displayOrder: values.displayOrder,
  };
}
