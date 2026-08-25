import { z } from "zod";

export const variantGroupOptionSchema = z.object({
  name: z.string().min(1, "Dimension name is required"),
  values: z.array(z.string()),
});

export const variantGroupSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  options: z.array(variantGroupOptionSchema).default([]),
});

export type VariantGroupFormValues = z.infer<typeof variantGroupSchema>;
