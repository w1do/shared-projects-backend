/**
 * HTTP-клиент панели против API платформы.
 *
 * Адаптер контракта живёт здесь, а не в компонентах:
 *  - Bearer-токен оператора берётся из сессии (второго логина по username/password нет);
 *  - базовый URL — origin панели: панель и API отдаются одним gateway;
 *  - конверт платформы `{data}` / `{error:{code,message,details,trace_id}}`
 *    приводится к ожидаемому вёрсткой `{success,data,error{code,message}}`;
 *  - курсорные ответы платформы приводятся к странице `{items,page,size,totalItems,totalPages}`;
 *  - `{project}` в путях подставляется из текущего проекта оператора.
 */

import { t } from "../console-texts";
import { messageFor } from "./api-messages";
import {
  apiBaseUrl,
  clearClientSession,
  getAuthToken,
  getProjectKey,
} from "./session";

export type ApiPage<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

/** Конверт, который ожидает вёрстка. */
export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
};

/** Ответ платформы: данные + необязательная мета курсорной пагинации. */
type PlatformResponse<T> = {
  data?: T;
  meta?: {
    per_page?: number;
    next_cursor?: string | null;
    prev_cursor?: string | null;
  };
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    trace_id?: string;
  };
};

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

/** Плейсхолдер `{project}` в пути → ключ текущего проекта. */
export function resolvePath(path: string) {
  if (!path.includes("{project}")) return path;

  const project = getProjectKey();
  if (!project) {
    throw new AdminApiError(
      t("console.api.project-missing"),
      "project_missing",
      400,
    );
  }
  return path.replace("{project}", encodeURIComponent(project));
}

/**
 * Ответ платформы → конверт вёрстки.
 * 401 завершает сессию и уводит на страницу входа.
 */
export async function toEnvelope<T>(
  response: Response,
): Promise<ApiEnvelope<T>> {
  let payload: PlatformResponse<T> | undefined;
  try {
    payload =
      response.status === 204
        ? undefined
        : ((await response.json()) as PlatformResponse<T>);
  } catch {
    payload = undefined;
  }

  if (response.status === 401) {
    clearClientSession();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new AdminApiError(
      t("console.api.session-expired"),
      "unauthenticated",
      401,
    );
  }

  if (!response.ok) {
    throw new AdminApiError(
      messageFor(response.status, payload?.error?.message),
      payload?.error?.code ?? `http_${response.status}`,
      response.status,
    );
  }

  return { success: true, data: (payload?.data ?? null) as T };
}

/** Курсорный ответ платформы → страница в форме, ожидаемой вёрсткой. */
export function toPage<T>(
  items: T[],
  meta?: PlatformResponse<T>["meta"],
): ApiPage<T> {
  const size = meta?.per_page ?? items.length;
  // Курсорная пагинация не знает общего числа записей: страница всегда первая,
  // а общее число — то, что реально получено.
  return {
    items,
    page: 1,
    size: size || items.length,
    totalItems: items.length,
    totalPages: items.length === 0 ? 0 : 1,
  };
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAuthToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request<T>(
  path: string,
  init: { method: string; body?: unknown; auth?: boolean },
): Promise<T> {
  const url = `${apiBaseUrl()}${resolvePath(path)}`;
  const headers =
    init.auth === false
      ? { Accept: "application/json" }
      : authHeaders(
          init.body === undefined
            ? undefined
            : { "Content-Type": "application/json" },
        );

  let response: Response;
  try {
    response = await fetch(url, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError(t("console.api.unreachable"), "network", 0);
  }

  const envelope = await toEnvelope<T>(response);
  return envelope.data;
}

export async function adminApiGet<T>(
  path: string,
  options?: { auth?: boolean },
) {
  return request<T>(path, { method: "GET", auth: options?.auth });
}

/** GET списка с курсорной пагинацией → страница вёрстки. */
export async function adminApiGetPage<T>(path: string): Promise<ApiPage<T>> {
  const url = `${apiBaseUrl()}${resolvePath(path)}`;

  let response: Response;
  try {
    response = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  } catch {
    throw new AdminApiError(t("console.api.unreachable"), "network", 0);
  }

  let payload: PlatformResponse<T[]> | undefined;
  const cloned = response.clone();
  try {
    payload = (await cloned.json()) as PlatformResponse<T[]>;
  } catch {
    payload = undefined;
  }

  const envelope = await toEnvelope<T[]>(response);
  return toPage<T>(envelope.data ?? [], payload?.meta);
}

export async function adminApiSend<T>(
  path: string,
  init: { method: "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown },
) {
  return request<T>(path, { method: init.method, body: init.body });
}
