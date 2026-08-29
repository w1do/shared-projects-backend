/**
 * События журнала действий проекта для верхней панели.
 *
 * Панель показывает их числом на кнопке и списком в окне проекта. Журнал —
 * не то, что оператор запрашивал сам, поэтому его недоступность и отсутствие
 * права никогда не становятся ошибкой на экране: остаётся пустой список.
 *
 * Модуль намеренно без зависимостей от вёрстки и путей — это чистая логика,
 * покрытая node-тестами.
 */

export type PlatformAuditEntryLike = {
  id: number;
  actor_type?: string;
  actor_id?: string | null;
  action?: string;
  subject?: string | null;
  created_at?: string | null;
};

export type ProjectEvent = {
  id: string;
  /** Действие как его записала платформа: `project.created`, `post.published`. */
  action: string;
  subject: string | null;
  actor: string | null;
  createdAt: string | null;
};

/** Сколько последних событий показывает панель. */
export const PROJECT_EVENTS_LIMIT = 10;

export function mapProjectEvent(entry: PlatformAuditEntryLike): ProjectEvent {
  const subject = (entry.subject ?? "").trim();
  const actor = (entry.actor_id ?? "").trim();

  return {
    id: String(entry.id),
    action: (entry.action ?? "").trim(),
    subject: subject === "" ? null : subject,
    actor: actor === "" ? null : actor,
    createdAt: entry.created_at ?? null,
  };
}

/**
 * Ответ журнала → события панели: свежие первыми, не больше предела.
 * Ответ не-массивом трактуется как пустой журнал.
 */
export function mapProjectEvents(
  entries: unknown,
  limit: number = PROJECT_EVENTS_LIMIT,
): ProjectEvent[] {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter(
      (entry): entry is PlatformAuditEntryLike =>
        Boolean(entry) && typeof entry === "object",
    )
    .map(mapProjectEvent)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, Math.max(limit, 0));
}
