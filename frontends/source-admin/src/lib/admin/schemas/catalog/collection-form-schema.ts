import * as z from "zod";

export const collectionFormSchema = z.object({
  name: z.string().min(2, { message: "Collection name must be at least 2 characters." }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters." }),
  description: z
    .string()
    .max(200, { message: "Description must be at most 200 characters." })
    .optional(),
  status: z.enum(["Active", "Draft", "Archived"]),
  banner: z.string().min(1, { message: "Banner image is required." }),
  thumbnail: z.string().min(1, { message: "Thumbnail image is required." }),
  featured: z.boolean(),
  products: z.array(z.string()),
  revenue: z.coerce.number().min(0, { message: "Revenue must be a positive number." }),
  views: z.coerce.number().min(0, { message: "Views must be a positive number." }),
  growthYoY: z.coerce.number({ invalid_type_error: "Growth must be a valid number." }),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
