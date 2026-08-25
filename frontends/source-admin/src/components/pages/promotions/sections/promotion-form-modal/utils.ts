import type { PromotionFormValues } from "@/lib/admin/schemas/content/promotion-form-schema";
import { STATUS_OPTIONS, TYPE_OPTIONS } from "@/components/pages/promotions/config/filters";
import { defaultGradients } from "@/lib/theme-colors";

export const toDateInput = (iso: string) => iso.slice(0, 10);
export const toIso = (date: string) => `${date}T00:00:00Z`;
export const formTypeOptions = TYPE_OPTIONS.filter((o) => o.value !== "all");
export const formStatusOptions = STATUS_OPTIONS.filter((o) => o.value !== "all");
export const DEFAULT_GRADIENT: [string, string] = defaultGradients.promotion;

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
const dateInput = (date: Date) => date.toISOString().slice(0, 10);

export const createDefaults = (): PromotionFormValues => ({
  code: "",
  title: "",
  description: "",
  type: "Percentage",
  rewardValue: 0,
  minSpend: 0,
  limit: 100,
  channel: "",
  status: "Draft",
  startsAt: dateInput(new Date()),
  endsAt: dateInput(addDays(new Date(), 30)),
});
