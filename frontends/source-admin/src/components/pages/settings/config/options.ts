import { inviteableRoles } from "@/lib/admin/schemas/content/invite-member-schema";
import { t } from "@/lib/admin/console-texts";

export const TEAM_ROLE_OPTIONS: { value: string; label: string }[] = inviteableRoles.map(
  (role) => ({
    value: role,
    label: role,
  }),
);

export const SESSION_TIMEOUT_OPTIONS: { value: string; label: string }[] = [
  { value: "15", label: t("console.settings.option.timeout-15") },
  { value: "30", label: t("console.settings.option.timeout-30") },
  { value: "60", label: t("console.settings.option.timeout-60") },
  { value: "240", label: t("console.settings.option.timeout-240") },
  { value: "480", label: t("console.settings.option.timeout-480") },
];
