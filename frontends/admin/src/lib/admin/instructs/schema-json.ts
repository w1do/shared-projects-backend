/**
 * Разбор схемы ответа модели из поля формы.
 *
 * Проверка до отправки: некорректный JSON не уходит на сервер, а сообщение
 * показывается оператору у поля. Чистая функция без зависимостей —
 * покрывается node-тестом.
 */
export type SchemaParseResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

export function parseSchemaJson(raw: string): SchemaParseResult {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return { ok: false, error: "empty" };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "invalid",
    };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "not-an-object" };
  }

  return { ok: true, value: parsed as Record<string, unknown> };
}

/** Схема в поле формы: отформатированный JSON, пустая — заготовка объекта. */
export function formatSchemaJson(
  schema: Record<string, unknown> | undefined,
): string {
  if (!schema || Object.keys(schema).length === 0) {
    return JSON.stringify(
      { type: "object", properties: {}, required: [] },
      null,
      2,
    );
  }

  return JSON.stringify(schema, null, 2);
}
