export type { PermissionGroup } from "../data-source/platform/team-access";

/** Оператор проекта в разделе «Команда». */
export interface TeamUser {
  id: string;
  email: string;
  name: string;
  /** Имя роли проекта: системной (`owner`, `editor`, `billing`…) или кастомной. */
  role: string;
  position: string;
  phone: string;
  avatar?: string;
  status: "active" | "inactive";
  lastLogin?: string;
}

/** Роль проекта на вкладке «Роли». */
export interface ProjectRole {
  id: string;
  name: string;
  system: boolean;
  permissions: string[];
}

/** Вариант выбора роли участнику. */
export interface RoleOption {
  value: string;
  label: string;
}
