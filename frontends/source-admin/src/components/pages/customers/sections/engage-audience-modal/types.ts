import type { EngageIntent } from "@/lib/admin/schemas/content/engage-audience-schema";

export type EngageModalStep = "audience" | "intent" | "configure" | "review";

export const engageModalSteps: Array<{ id: EngageModalStep; label: string; index: number }> = [
  { id: "audience", label: "Audience", index: 1 },
  { id: "intent", label: "Intent", index: 2 },
  { id: "configure", label: "Configure", index: 3 },
  { id: "review", label: "Review", index: 4 },
];

export function engageStepDescription(step: EngageModalStep): string {
  if (step === "audience") {
    return "Confirm who receives this outreach. Remove anyone who should not be included.";
  }
  if (step === "intent") {
    return "Choose what to send — campaign email, promotion, coupon code, or loyalty invite.";
  }
  if (step === "configure") {
    return "Pick the asset and craft the delivery details for this audience.";
  }
  return "Review audience, intent, and copy, then send now or schedule.";
}

export type IntentOption = {
  id: EngageIntent;
  title: string;
  description: string;
  badge: string;
};

export const intentOptions: IntentOption[] = [
  {
    id: "campaign",
    title: "Send campaign email",
    description: "Queue a store campaign to this hand-picked audience.",
    badge: "Recommended",
  },
  {
    id: "promotion",
    title: "Send promotion",
    description: "Share an active offer program with selected customers.",
    badge: "Offer",
  },
  {
    id: "coupon",
    title: "Send discount code",
    description: "Email a coupon code from your promotion catalog.",
    badge: "Coupon",
  },
  {
    id: "loyalty",
    title: "Invite to loyalty",
    description: "Invite customers into a membership tier with a welcome note.",
    badge: "Loyalty",
  },
];

export const engageChannelOptions = [
  { value: "Email", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "Push", label: "Push notification" },
  { value: "In-app", label: "In-app message" },
];

export const loyaltyTierOptions = [
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
];
