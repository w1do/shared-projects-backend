/**
 * Чистая логика редактора JSON-полей «ключ → значение» (Д10): источник
 * истины — JS-объект; строки пар и сырой JSON — два представления одного
 * значения. Без зависимостей — работает и в node-тестах.
 */

export type KeyValuePair = { key: string; value: string };

export type ParsedJsonObject =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: "invalid-json" | "not-an-object" };

/** Значение пары строкой: скаляры — как есть, вложенные структуры — JSON-строкой. */
export function pairValueToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";

  return JSON.stringify(value);
}

/**
 * Строка пары → значение: числа/булевы/JSON-структуры распознаются,
 * всё остальное остаётся строкой (строку «2» можно записать как "\"2\"").
 */
export function stringToPairValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") return "";

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return raw;
  }
}

export function objectToPairs(value: Record<string, unknown>): KeyValuePair[] {
  return Object.entries(value).map(([key, entry]) => ({
    key,
    value: pairValueToString(entry),
  }));
}

/** Пары → объект: пустые ключи пропускаются, дубликат ключа — побеждает последний. */
export function pairsToObject(pairs: KeyValuePair[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const pair of pairs) {
    const key = pair.key.trim();
    if (key === "") continue;
    result[key] = stringToPairValue(pair.value);
  }

  return result;
}

/** Разбор сырого JSON: принимается только объект «ключ → значение». */
export function parseJsonObject(text: string): ParsedJsonObject {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, error: "invalid-json" };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "not-an-object" };
  }

  return { ok: true, value: parsed as Record<string, unknown> };
}

export function formatJsonObject(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}
