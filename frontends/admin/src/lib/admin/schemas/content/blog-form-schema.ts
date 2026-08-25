import * as z from "zod";

export const blogContentBlockSchema = z.object({
  type: z.enum(["heading", "paragraph", "quote", "image"]),
  content: z.string().min(1, { message: "Block content is required." }),
});

export const blogFormSchema = z.object({
  title: z.string().min(4, { message: "Title must be at least 4 characters." }),
  // Подзаголовок хранится как SEO-описание и в платформе необязателен:
  // требование «минимум 4 символа» блокировало сохранение постов без описания.
  subtitle: z
    .string()
    .trim()
    .refine((value) => value === "" || value.length >= 4, {
      message: "Subtitle must be at least 4 characters.",
    }),
  category: z.string().min(1, { message: "Please pick a category." }),
  /** Категории проекта (режим api): идентификаторы из дерева. */
  categoryIds: z.array(z.string()).optional().default([]),
  tags: z.string().optional(),
  authorName: z.string().min(2, { message: "Author name is required." }),
  authorRole: z.string().min(2, { message: "Author role is required." }),
  authorAvatar: z.string().optional(),
  readingTimeMin: z.coerce.number().min(1, { message: "Reading time must be at least 1 minute." }),
  banner: z.string().optional(),
  thumbnail: z.string().optional(),
  layoutStyle: z.enum(["minimalist", "editorial", "botanical"]),
  contentBlocks: z
    .array(blogContentBlockSchema)
    .min(1, { message: "Add at least one content block." }),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
