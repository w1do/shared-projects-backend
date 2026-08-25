// Транспорт api-client: единый fetch с токеном оператора и конвертом ошибок платформы.
export interface ApiError {
  code: string;
  message: string;
  details: Record<string, string[]>;
  trace_id: string;
}

let bearerToken: string | null = null;

export function setToken(token: string | null): void {
  bearerToken = token;
}

export async function apiFetch(path: string, init: { method?: string; body?: unknown } = {}): Promise<unknown> {
  const response = await fetch(path, {
    method: init.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const payload = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw (payload?.error ?? { code: 'unknown', message: `HTTP ${response.status}` }) as ApiError;
  }

  return payload;
}
