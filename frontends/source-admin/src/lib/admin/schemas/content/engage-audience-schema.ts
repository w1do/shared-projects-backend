import * as z from "zod";

import { t } from "@/lib/admin/console-texts";

export const engageIntentOptions = ["campaign", "promotion", "coupon", "loyalty"] as const;

export type EngageIntent = (typeof engageIntentOptions)[number];

export const engageAudienceSchema = z
  .object({
    intent: z.enum(engageIntentOptions),
    campaignId: z.string().optional().default(""),
    promotionId: z.string().optional().default(""),
    loyaltyTier: z.enum(["Bronze", "Silver", "Gold", "Platinum"]).optional(),
    channel: z.string().min(1, { message: t("console.engage.validation.channel") }),
    subject: z
      .string()
      .min(1, { message: t("console.engage.validation.subject") })
      .max(120),
    message: z.string().max(500).optional().default(""),
    scheduleAt: z.string().optional().default(""),
  })
  .superRefine((values, ctx) => {
    if (values.intent === "campaign" && !values.campaignId) {
      ctx.addIssue({
        code: "custom",
        path: ["campaignId"],
        message: t("console.engage.validation.campaign"),
      });
    }
    if ((values.intent === "promotion" || values.intent === "coupon") && !values.promotionId) {
      ctx.addIssue({
        code: "custom",
        path: ["promotionId"],
        message: t("console.engage.validation.promotion"),
      });
    }
    if (values.intent === "loyalty" && !values.loyaltyTier) {
      ctx.addIssue({
        code: "custom",
        path: ["loyaltyTier"],
        message: t("console.engage.validation.loyalty"),
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
