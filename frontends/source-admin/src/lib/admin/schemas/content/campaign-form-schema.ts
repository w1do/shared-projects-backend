import { z } from "zod";

export const campaignFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["Active", "Scheduled", "Completed", "Draft"]),
  channel: z.string().min(2, "Channel must be at least 2 characters"),
  budget: z.number().min(0, "Budget must be positive"),
  startsAt: z.string().min(1, "Start Date is required"),
  endsAt: z.string().min(1, "End Date is required"),
  promotionIds: z.array(z.string()).min(1, "At least one promotion must be linked"),
  collectionIds: z.array(z.string()).min(1, "At least one collection must be linked"),
  banner: z.string().min(1, "Banner image is required"),
  thumbnail: z.string().min(1, "Thumbnail image is required"),
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export const defaultCampaignFormValues: CampaignFormValues = {
  name: "",
  description: "",
  status: "Draft",
  channel: "",
  budget: 0,
  startsAt: "",
  endsAt: "",
  promotionIds: [],
  collectionIds: [],
  banner: "",
  thumbnail: "",
};

export const sampleCampaignFormValues: CampaignFormValues = {
  name: "Summer Aromatherapy Edit",
  description:
    "Mindfulness and aromatherapeutic lifestyle launch incorporating sensory candles and oils.",
  status: "Draft",
  channel: "Email + Push Notification",
  budget: 7500,
  startsAt: "2026-07-10",
  endsAt: "2026-07-25",
  promotionIds: ["promo-bloomgift"],
  collectionIds: ["col-aromatherapy-wellness"],
  banner:
    "https://images.unsplash.com/photo-1593986815100-7d0772982da4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=450",
  thumbnail:
    "https://images.unsplash.com/photo-1593986815100-7d0772982da4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=300&h=300",
};
export type { Campaign } from "@/lib/admin/mocks/types";
