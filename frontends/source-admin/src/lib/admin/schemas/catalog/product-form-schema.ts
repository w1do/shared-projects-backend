import { z } from "zod";

export const contentBlockSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Block title is required"),
  slug: z.string(),
  displayType: z.enum([
    "text",
    "rich_text",
    "list",
    "table",
    "faq_accordion",
    "cards",
    "key_value",
  ]),
  content: z.any(),
  isVisible: z.boolean(),
  position: z.number(),
});

export const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  shortDescription: z.string().optional().default(""),
  description: z.string().default(""),
  brand: z.string().min(1, "Please select a brand"),
  category: z.string().min(1, "Please select a category"),
  status: z.enum(["Active", "Draft", "Archived"]),
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: "Base price is required" })
      .min(0.01, "Base price must be greater than 0"),
  ),
  compareAtPrice: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional(),
  ),
  costPrice: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional(),
  ),
  discount: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().max(100).optional(),
  ),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  trackQuantity: z.boolean(),
  stock: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional(),
  ),
  weight: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional(),
  ),
  images: z.array(z.string()).min(1, "At least one product image is required"),
  thumbnail: z.string().optional(),
  collections: z.array(z.string()),
  contentBlocks: z.array(contentBlockSchema),
  variantRelation: z
    .object({
      mode: z.enum(["none", "member", "leader"]),
      existingGroupId: z.string().optional(),
      mappedOptions: z.record(z.string()).optional(),
      newGroupName: z.string().optional(),
      dimensions: z.array(z.string()).optional(),
      leaderOptions: z.record(z.string()).optional(),
      options: z
        .array(
          z.object({
            name: z.string(),
            values: z.array(z.string()),
          }),
        )
        .optional(),
    })
    .optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ContentBlockValues = z.infer<typeof contentBlockSchema>;

export const displayTypeOptions = [
  { value: "text", label: "Plain Text" },
  { value: "rich_text", label: "Rich Text" },
  { value: "list", label: "List" },
  { value: "table", label: "Table" },
  { value: "faq_accordion", label: "FAQ / Accordion" },
  { value: "cards", label: "Cards" },
  { value: "key_value", label: "Key-Value Pairs" },
] as const;
