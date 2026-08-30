import { t, type ConsoleTextKey } from "./console-texts.ts";

/**
 * Подписи ролей и групп каталога прав. Незнакомый ключ показывается как есть:
 * кастомную роль оператор назвал сам, а группу мог принести новый сервис.
 */
function label(key: string, fallback: string): string {
  const text = t(key as ConsoleTextKey);

  return text === key ? fallback : text;
}

/** Подпись роли: системная переводится реестром, кастомная — своим именем. */
export function roleLabel(role: string): string {
  return label(`console.team.role.${role}`, role);
}

/** Заголовок группы каталога прав: «Оплата · Тарифные планы». */
export function permissionGroupLabel(service: string, group: string): string {
  const serviceText = label(`console.team.roles.service.${service}`, service);
  const groupText = label(`console.team.roles.group.${group}`, group);

  return `${serviceText} · ${groupText}`;
}
