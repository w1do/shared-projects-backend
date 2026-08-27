import type { StoreSettings, TeamMember } from "@/lib/admin/mocks/settings";
import { readStoredStoreSettings } from "@/lib/admin/settings/store";
import * as platformAuth from "../platform/auth";
import { fromSource } from "./shared";

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
 * (pay/settings, site-settings); разделы без аналога в платформе
 * (уведомления/безопасность) остаются на демо-значениях вёрстки —
 * см. docs/admin-console.md.
 */
export async function getAdminStoreSettings() {
  return fromSource(async () => {
    const base = readStoredStoreSettings();
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
      ...base,
      general: { ...base.general, storeName: project.name },
      team,
    } satisfies StoreSettings;
  }, readStoredStoreSettings);
}
