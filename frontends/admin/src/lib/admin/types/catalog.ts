import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  productCount: z.number(),
  status: z.enum(["Active", "Draft", "Archived"]),
  /** Родитель в дереве категорий; null — корневой узел. */
  parentId: z.string().nullable().optional(),
  /** Имя по локалям проекта. */
  nameTranslations: z.record(z.string(), z.string()).optional(),
  /** Уровень вложенности: 0 — корень. Нужен только для отступа в списке. */
  depth: z.number().optional(),
  coverGradient: z.tuple([z.string(), z.string()]),
  /** Square thumbnail image URL (1:1). */
  thumbnail: z.string(),
  iconName: z.string().optional(),
  revenue: z.number(),
  growthYoY: z.number(),
  displayOrder: z.number(),
  createdAt: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;
