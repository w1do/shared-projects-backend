import * as z from "zod";

import { t } from "@/lib/admin/console-texts";

/**
 * Блок содержимого: название и текст в markdown. Идентификатор приходит от
 * платформы и возвращается ей обратно — по нему сайт ссылается на часть поста.
 */
export const blogContentBlockSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(255).optional().default(""),
  markdown: z
    .string()
    .min(1, { message: t("console.blogs.validation.block-content-required") }),
});

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(4, { message: t("console.blogs.validation.title-min") }),
  // Подзаголовок хранится как SEO-описание и в платформе необязателен:
  // требование «минимум 4 символа» блокировало сохранение постов без описания.
  subtitle: z
    .string()
    .trim()
    .refine((value) => value === "" || value.length >= 4, {
      message: t("console.blogs.validation.subtitle-min"),
    }),
  category: z
    .string()
    .min(1, { message: t("console.blogs.validation.category-required") }),
  /** Категории проекта (режим api): идентификаторы из дерева. */
  categoryIds: z.array(z.string()).optional().default([]),
  tags: z.string().optional(),
  readingTimeMin: z.coerce
    .number()
    .min(1, { message: t("console.blogs.validation.reading-time-min") }),
  banner: z.string().optional(),
  thumbnail: z.string().optional(),
  /** Медиа проекта за изображениями поста: платформа хранит ссылку на файл, а не сам файл. */
  coverMediaId: z.number().nullable().optional(),
  bannerMediaId: z.number().nullable().optional(),
  layoutStyle: z.enum(["minimalist", "editorial", "botanical"]),
  /** Закрепление поста сверху раздела: закреплённый пост в проекте один. */
  isFeatured: z.boolean().default(false),
  // Пост без блоков допустим: содержимое можно дописать позже
  contentBlocks: z.array(blogContentBlockSchema).default([]),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
