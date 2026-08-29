import type { CurrencyCode, WeightUnit } from "@/lib/admin/types/settings";
import { inviteableRoles } from "@/lib/admin/schemas/content/invite-member-schema";
import { t } from "@/lib/admin/console-texts";

export const TEAM_ROLE_OPTIONS: { value: string; label: string }[] = inviteableRoles.map(
  (role) => ({
    value: role,
    label: role,
  }),
);

export const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: "USD", label: t("console.settings.option.currency-usd") },
  { value: "EUR", label: t("console.settings.option.currency-eur") },
  { value: "GBP", label: t("console.settings.option.currency-gbp") },
  { value: "VND", label: t("console.settings.option.currency-vnd") },
];

export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  {
    value: "America/Los_Angeles",
    label: t("console.settings.option.timezone-los-angeles"),
  },
  { value: "America/New_York", label: t("console.settings.option.timezone-new-york") },
  { value: "Europe/London", label: t("console.settings.option.timezone-london") },
  { value: "Europe/Paris", label: t("console.settings.option.timezone-paris") },
  {
    value: "Asia/Ho_Chi_Minh",
    label: t("console.settings.option.timezone-ho-chi-minh"),
  },
  { value: "Asia/Tokyo", label: t("console.settings.option.timezone-tokyo") },
];

export const WEIGHT_UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: "kg", label: t("console.settings.option.weight-kg") },
  { value: "lb", label: t("console.settings.option.weight-lb") },
];

export const SESSION_TIMEOUT_OPTIONS: { value: string; label: string }[] = [
  { value: "15", label: t("console.settings.option.timeout-15") },
  { value: "30", label: t("console.settings.option.timeout-30") },
  { value: "60", label: t("console.settings.option.timeout-60") },
  { value: "240", label: t("console.settings.option.timeout-240") },
  { value: "480", label: t("console.settings.option.timeout-480") },
];
