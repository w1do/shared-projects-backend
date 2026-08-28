import * as z from "zod";

// Относительный импорт с расширением — схему проверяет node-тест.
import { t } from "../../console-texts.ts";

/**
 * Схема формы категории живого режима: платформа не имеет торговых метрик,
 * поэтому денежных полей здесь нет.
 */
export const categoryFormSchema = z.object({
  name: z.string().min(2, { message: t("console.categories.validation.name-min") }),
  slug: z
    .string()
    .min(2, { message: t("console.categories.validation.slug-min") })
    .regex(/^[a-z0-9-]+$/, {
      message: t("console.categories.validation.slug-format"),
    }),
  description: z.string().optional(),
  /** Родитель в дереве категорий; пустая строка — корневая категория. */
  parentId: z.string().optional(),
  /**
   * Имя по не-дефолтным локалям проекта (режим api). Поле локали монтируется
   * со значением undefined и может остаться пустым — «нет перевода» допустимо:
   * пустые значения вычищаются здесь, а не валят форму невидимой ошибкой.
   */
  nameTranslations: z
    .record(z.string(), z.string().optional())
    .transform((record) =>
      Object.fromEntries(
        Object.entries(record).filter(
          (entry): entry is [string, string] =>
            typeof entry[1] === "string" && entry[1].trim() !== "",
        ),
      ),
    )
    .optional(),
  /** Локаль проекта по умолчанию — для сборки набора имени. */
  defaultLocale: z.string().optional(),
  status: z.enum(["Active", "Draft", "Archived"]),
  iconName: z.string().min(1, { message: t("console.categories.validation.icon-required") }),
  thumbnail: z.string().min(1, { message: t("console.categories.validation.thumbnail-required") }),
  coverGradientStart: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
    message: t("console.categories.validation.hex-color"),
  }),
  coverGradientEnd: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
    message: t("console.categories.validation.hex-color"),
  }),
  displayOrder: z.coerce
    .number()
    .min(1, { message: t("console.categories.validation.display-order-min") }),
});

/**
 * Мок-режим шаблона: демо-каталог хранит торговые метрики, поэтому его схема —
 * базовая плюс денежные поля. Живой режим этой схемой не пользуется.
 */
export const mockCategoryFormSchema = categoryFormSchema.extend({
  revenue: z.coerce.number().min(0, { message: t("console.categories.validation.revenue-min") }),
  growthYoY: z.coerce.number({
    invalid_type_error: t("console.categories.validation.growth-number"),
  }),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type MockCategoryFormValues = z.infer<typeof mockCategoryFormSchema>;
