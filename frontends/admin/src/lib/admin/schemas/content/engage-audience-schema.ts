import * as z from "zod";

export const engageIntentOptions = ["campaign", "promotion", "coupon", "loyalty"] as const;

export type EngageIntent = (typeof engageIntentOptions)[number];

export const engageAudienceSchema = z
  .object({
    intent: z.enum(engageIntentOptions),
    campaignId: z.string().optional().default(""),
    promotionId: z.string().optional().default(""),
    loyaltyTier: z.enum(["Bronze", "Silver", "Gold", "Platinum"]).optional(),
    channel: z.string().min(1, { message: "Choose a delivery channel." }),
    subject: z.string().min(1, { message: "Add a subject line." }).max(120),
    message: z.string().max(500).optional().default(""),
    scheduleAt: z.string().optional().default(""),
  })
  .superRefine((values, ctx) => {
    if (values.intent === "campaign" && !values.campaignId) {
      ctx.addIssue({
        code: "custom",
        path: ["campaignId"],
        message: "Select a campaign to send.",
      });
    }
    if ((values.intent === "promotion" || values.intent === "coupon") && !values.promotionId) {
      ctx.addIssue({
        code: "custom",
        path: ["promotionId"],
        message: "Select a promotion or coupon code.",
      });
    }
    if (values.intent === "loyalty" && !values.loyaltyTier) {
      ctx.addIssue({
        code: "custom",
        path: ["loyaltyTier"],
        message: "Choose the loyalty tier to invite into.",
      });
    }
  });

export type EngageAudienceFormValues = z.infer<typeof engageAudienceSchema>;

export const defaultEngageAudienceFormValues: EngageAudienceFormValues = {
  intent: "campaign",
  campaignId: "",
  promotionId: "",
  loyaltyTier: undefined,
  channel: "Email",
  subject: "",
  message: "",
  scheduleAt: "",
};
