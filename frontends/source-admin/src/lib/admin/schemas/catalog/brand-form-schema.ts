import * as z from "zod";

export const brandFormSchema = z.object({
  name: z.string().min(2, { message: "Brand name must be at least 2 characters." }),
  monogram: z.string().max(3).optional(),
  description: z.string().optional(),
  origin: z.string().optional(),
  revenue: z.coerce.number().min(0).default(0),
  share: z.coerce.number().min(0).max(100).default(0),
  delta: z.coerce.number().default(0),
  status: z.enum(["Active", "Draft", "Archived"]).default("Active"),
  logo: z.array(z.string()).optional(),
  banner: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
