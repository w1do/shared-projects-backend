import * as z from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  description: z.string().optional(),
  status: z.enum(["Active", "Draft", "Archived"]),
  iconName: z.string().min(1, { message: "Please select an icon." }),
  thumbnail: z.string().min(1, { message: "Thumbnail image is required." }),
  coverGradientStart: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
    message: "Must be a valid hex color code.",
  }),
  coverGradientEnd: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
    message: "Must be a valid hex color code.",
  }),
  displayOrder: z.coerce.number().min(1, { message: "Display order must be at least 1." }),
  revenue: z.coerce.number().min(0, { message: "Revenue must be a positive number." }),
  growthYoY: z.coerce.number({ invalid_type_error: "Growth YoY must be a valid number." }),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
