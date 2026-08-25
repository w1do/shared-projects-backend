import * as z from "zod";

export const promotionFormSchema = z
  .object({
    code: z
      .string()
      .min(3, { message: "Code must be at least 3 characters." })
      .regex(/^[A-Z0-9]+$/, { message: "Use uppercase letters and numbers only." }),
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.string().optional(),
    type: z.enum([
      "Percentage",
      "Fixed Amount",
      "Free Shipping",
      "Tiered Reward",
      "Gift With Purchase",
    ]),
    rewardValue: z.coerce.number().min(0, { message: "Reward must be 0 or more." }),
    minSpend: z.coerce.number().min(0, { message: "Minimum spend must be 0 or more." }),
    limit: z.coerce.number().min(1, { message: "Redemption cap must be at least 1." }),
    channel: z.string().min(1, { message: "Channel is required." }),
    status: z.enum(["Active", "Scheduled", "Paused", "Expired", "Draft"]),
    startsAt: z.string().min(1, { message: "Start date is required." }),
    endsAt: z.string().min(1, { message: "End date is required." }),
  })
  .refine((data) => new Date(data.endsAt) >= new Date(data.startsAt), {
    message: "End date must be after the start date.",
    path: ["endsAt"],
  });

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;
