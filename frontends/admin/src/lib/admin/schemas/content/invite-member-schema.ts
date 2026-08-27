import * as z from "zod";
import type { TeamRole } from "@/lib/admin/mocks/settings";
import { t } from "@/lib/admin/console-texts";

/** Roles that can be assigned via invite (Owner is reserved). */
export const inviteableRoles = ["Admin", "Manager", "Staff"] as const satisfies readonly TeamRole[];

export type InviteableRole = (typeof inviteableRoles)[number];

export const inviteMemberSchema = z.object({
  name: z.string().min(1, { message: t("console.team.validation.name-required") }).max(80),
  email: z
    .string()
    .min(1, { message: t("console.team.validation.email-required") })
    .email({ message: t("console.team.validation.email-format") }),
  role: z.enum(inviteableRoles, { message: t("console.team.validation.role-required") }),
  note: z.string().max(280).optional().default(""),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export const defaultInviteMemberFormValues: InviteMemberFormValues = {
  name: "",
  email: "",
  role: "Staff",
  note: "",
};
