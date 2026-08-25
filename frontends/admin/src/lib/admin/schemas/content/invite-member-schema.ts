import * as z from "zod";
import type { TeamRole } from "@/lib/admin/mocks/settings";

/** Roles that can be assigned via invite (Owner is reserved). */
export const inviteableRoles = ["Admin", "Manager", "Staff"] as const satisfies readonly TeamRole[];

export type InviteableRole = (typeof inviteableRoles)[number];

export const inviteMemberSchema = z.object({
  name: z.string().min(1, { message: "Enter the teammate's name." }).max(80),
  email: z
    .string()
    .min(1, { message: "Please enter a work email." })
    .email({ message: "Enter a valid email address." }),
  role: z.enum(inviteableRoles, { message: "Select a role." }),
  note: z.string().max(280).optional().default(""),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export const defaultInviteMemberFormValues: InviteMemberFormValues = {
  name: "",
  email: "",
  role: "Staff",
  note: "",
};
