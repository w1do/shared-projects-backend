import type { StoreSettings, TeamMember } from "@/lib/admin/types/settings";
import * as platformAuth from "../platform/auth";

/** Роль платформы → подпись роли в разделе настроек. */
function toTeamRole(roles: string[]): TeamMember["role"] {
  if (roles[0]?.toLowerCase() === "owner") return "Owner";

  return { admin: "Admin", manager: "Manager", staff: "Staff" }[
    platformAuth.toConsoleRole(roles)
  ] as TeamMember["role"];
}

/**
 * settings → auth-service: данные проекта и его операторы.
 * Платежи и язык по умолчанию — отдельные self-fetching секции
 * (pay/settings, site-settings).
 */
export async function getAdminStoreSettings(): Promise<StoreSettings> {
  const [project, members] = await Promise.all([
    platformAuth.getProject(),
    platformAuth.listMembers(),
  ]);

  const team: TeamMember[] = members.map((member) => ({
    id: String(member.id),
    name: member.name,
    email: member.email,
    role: toTeamRole(member.roles),
    status: "active",
  }));

  return {
    general: {
      storeName: project.name,
      supportEmail: "",
      phone: "",
      description: project.description ?? "",
      currency: "USD",
      timezone: "",
      weightUnit: "kg",
    },
    team,
  };
}
