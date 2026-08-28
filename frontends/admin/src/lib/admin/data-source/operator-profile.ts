/**
 * Маппинг профиля bootstrap/login платформы → профиль оператора вёрстки.
 * Отдельный модуль без runtime-импортов — проверяется node-тестом.
 */

import type { OperatorProfile } from "./session";

export type PlatformAdminProfile = {
  id: number;
  name: string;
  email: string;
  locale: string;
  is_super_admin: boolean;
};

/** Профиль платформы → форма, которую ждёт вёрстка. */
export function toOperatorProfile(
  admin: PlatformAdminProfile,
): OperatorProfile {
  return {
    id: String(admin.id),
    email: admin.email,
    name: admin.name,
    // Панель платформы не различает manager/staff — права проверяются на бекенде.
    role: admin.is_super_admin ? "admin" : "manager",
    position: admin.is_super_admin ? "Super admin" : "Operator",
    phone: "",
    status: "active",
    lastLogin: new Date().toISOString(),
    locale: admin.locale || "ru",
  };
}
