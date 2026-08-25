import type { CurrencyCode, WeightUnit } from "@/lib/admin/mocks/settings";
import { inviteableRoles } from "@/lib/admin/schemas/content/invite-member-schema";

export const TEAM_ROLE_OPTIONS: { value: string; label: string }[] = inviteableRoles.map(
  (role) => ({
    value: role,
    label: role,
  }),
);

export const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "VND", label: "VND — Vietnamese Dong" },
];

export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "America/Los_Angeles", label: "Pacific Time — Los Angeles" },
  { value: "America/New_York", label: "Eastern Time — New York" },
  { value: "Europe/London", label: "GMT — London" },
  { value: "Europe/Paris", label: "CET — Paris" },
  { value: "Asia/Ho_Chi_Minh", label: "ICT — Ho Chi Minh City" },
  { value: "Asia/Tokyo", label: "JST — Tokyo" },
];

export const WEIGHT_UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" },
];

export const SESSION_TIMEOUT_OPTIONS: { value: string; label: string }[] = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "240", label: "4 hours" },
  { value: "480", label: "8 hours" },
];
