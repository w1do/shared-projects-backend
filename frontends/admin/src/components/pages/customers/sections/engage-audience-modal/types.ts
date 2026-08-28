import type { EngageIntent } from "@/lib/admin/schemas/content/engage-audience-schema";
import { t } from "@/lib/admin/console-texts";

export type EngageModalStep = "audience" | "intent" | "configure" | "review";

export const engageModalSteps: Array<{
  id: EngageModalStep;
  label: string;
  index: number;
}> = [
  { id: "audience", label: t("console.engage.step.audience"), index: 1 },
  { id: "intent", label: t("console.engage.step.intent"), index: 2 },
  { id: "configure", label: t("console.engage.step.configure"), index: 3 },
  { id: "review", label: t("console.engage.step.review"), index: 4 },
];

export function engageStepDescription(step: EngageModalStep): string {
  if (step === "audience") {
    return t("console.engage.step-hint.audience");
  }
  if (step === "intent") {
    return t("console.engage.step-hint.intent");
  }
  if (step === "configure") {
    return t("console.engage.step-hint.configure");
  }
  return t("console.engage.step-hint.review");
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
    title: t("console.engage.intent.campaign.title"),
    description: t("console.engage.intent.campaign.description"),
    badge: t("console.engage.intent.campaign.badge"),
  },
  {
    id: "promotion",
    title: t("console.engage.intent.promotion.title"),
    description: t("console.engage.intent.promotion.description"),
    badge: t("console.engage.intent.promotion.badge"),
  },
  {
    id: "coupon",
    title: t("console.engage.intent.coupon.title"),
    description: t("console.engage.intent.coupon.description"),
    badge: t("console.engage.intent.coupon.badge"),
  },
  {
    id: "loyalty",
    title: t("console.engage.intent.loyalty.title"),
    description: t("console.engage.intent.loyalty.description"),
    badge: t("console.engage.intent.loyalty.badge"),
  },
];

export const engageChannelOptions = [
  { value: "Email", label: t("console.engage.channel.email") },
  { value: "SMS", label: t("console.engage.channel.sms") },
  { value: "Push", label: t("console.engage.channel.push") },
  { value: "In-app", label: t("console.engage.channel.in-app") },
];

/** Подпись канала доставки по сохранённому значению формы. */
export function engageChannelLabel(value: string): string {
  return engageChannelOptions.find((option) => option.value === value)?.label ?? value;
}

export const loyaltyTierOptions = [
  { value: "Bronze", label: t("console.customers.tier.bronze") },
  { value: "Silver", label: t("console.customers.tier.silver") },
  { value: "Gold", label: t("console.customers.tier.gold") },
  { value: "Platinum", label: t("console.customers.tier.platinum") },
];
