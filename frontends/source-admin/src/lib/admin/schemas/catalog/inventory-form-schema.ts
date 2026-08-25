import * as z from "zod";

export const inventoryFormSchema = z.object({
  stock: z.coerce
    .number()
    .int({ message: "Stock must be an integer." })
    .min(0, { message: "Stock cannot be negative." }),
  incoming: z.coerce
    .number()
    .int({ message: "Incoming stock must be an integer." })
    .min(0, { message: "Incoming stock cannot be negative." }),
  threshold: z.coerce
    .number()
    .int({ message: "Alert threshold must be an integer." })
    .min(1, { message: "Alert threshold must be at least 1." }),
  location: z
    .string()
    .min(2, { message: "Location is required (at least 2 chars)." })
    .max(50, { message: "Location must be at most 50 characters." }),
  reason: z
    .string()
    .min(3, { message: "Please specify an adjustment reason (at least 3 chars)." })
    .max(200, { message: "Reason must be at most 200 characters." }),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
