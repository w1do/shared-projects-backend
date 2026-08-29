/** Чтение курсорной страницы licensing-API: конверт платформы + meta-курсоры. */

import { t } from "@/lib/admin/console-texts";
import { AdminApiError, resolvePath, toEnvelope } from "../api-client";
import { apiBaseUrl, getAuthToken } from "../session";

/** Курсорная страница платформы: элементы + курсоры, без total. */
export type LicensingCursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
};

/** GET курсорной страницы: конверт платформы + meta-курсоры. */
export async function getCursorPage<T>(
  path: string,
): Promise<LicensingCursorPage<T>> {
  const url = `${apiBaseUrl()}${resolvePath(path)}`;
  const token = getAuthToken();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError(t("console.api.unreachable"), "network", 0);
  }

  let meta:
    | { next_cursor?: string | null; prev_cursor?: string | null }
    | undefined;
  try {
    meta = ((await response.clone().json()) as { meta?: typeof meta })?.meta;
  } catch {
    meta = undefined;
  }

  const envelope = await toEnvelope<T[]>(response);
  return {
    items: envelope.data ?? [],
    nextCursor: meta?.next_cursor ?? null,
    prevCursor: meta?.prev_cursor ?? null,
  };
}
