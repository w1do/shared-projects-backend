import * as z from "zod";

import { t } from "@/lib/admin/console-texts";

export const blogContentBlockSchema = z.object({
  type: z.enum(["heading", "paragraph", "quote", "image"]),
  content: z
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
  authorName: z
    .string()
    .min(2, { message: t("console.blogs.validation.author-name-required") }),
  authorRole: z
    .string()
    .min(2, { message: t("console.blogs.validation.author-role-required") }),
  authorAvatar: z.string().optional(),
  readingTimeMin: z.coerce
    .number()
    .min(1, { message: t("console.blogs.validation.reading-time-min") }),
  banner: z.string().optional(),
  thumbnail: z.string().optional(),
  layoutStyle: z.enum(["minimalist", "editorial", "botanical"]),
  contentBlocks: z
    .array(blogContentBlockSchema)
    .min(1, { message: t("console.blogs.validation.blocks-min") }),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
