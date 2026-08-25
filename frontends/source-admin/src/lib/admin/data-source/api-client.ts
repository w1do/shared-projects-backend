import { adminApiConfig } from "./config";

export type ApiPage<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
};

type AuthTokenResponse = {
  accessToken: string;
};

let tokenPromise: Promise<string> | null = null;

function assertAdminApiCredentials() {
  if (!adminApiConfig.username || !adminApiConfig.password) {
    throw new Error(
      "Admin API credentials are missing. Set NEXT_PUBLIC_ADMIN_API_USERNAME and NEXT_PUBLIC_ADMIN_API_PASSWORD.",
    );
  }
}

async function getAccessToken(forceRefresh = false) {
  assertAdminApiCredentials();

  if (forceRefresh) {
    tokenPromise = null;
  }

  tokenPromise ??= fetch(`${adminApiConfig.baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: adminApiConfig.username,
      password: adminApiConfig.password,
    }),
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Admin API login failed with ${response.status}`);
      }
      return (await response.json()) as ApiEnvelope<AuthTokenResponse>;
    })
    .then((payload) => payload.data.accessToken)
    .catch((error) => {
      tokenPromise = null;
      throw error;
    });

  return tokenPromise;
}

async function parseEnvelope<T>(response: Response, path: string, method: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`Admin API ${method} ${path} failed with ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!payload.success) {
    throw new Error(payload.error?.message ?? `Admin API ${method} ${path} failed`);
  }
  return payload.data;
}

export async function adminApiGet<T>(path: string, options?: { auth?: boolean }) {
  const auth = options?.auth ?? true;
  const headers: HeadersInit = {};

  if (auth) {
    headers.Authorization = `Bearer ${await getAccessToken()}`;
  }

  let response = await fetch(`${adminApiConfig.baseUrl}${path}`, {
    headers,
    cache: "no-store",
  });

  // On expired/invalid token, clear cache and retry login once.
  if (auth && response.status === 401) {
    headers.Authorization = `Bearer ${await getAccessToken(true)}`;
    response = await fetch(`${adminApiConfig.baseUrl}${path}`, {
      headers,
      cache: "no-store",
    });
  }

  return parseEnvelope<T>(response, path, "GET");
}

export async function adminApiSend<T>(
  path: string,
  init: { method: "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown },
) {
  const headers: HeadersInit = {
    Authorization: `Bearer ${await getAccessToken()}`,
    "Content-Type": "application/json",
  };

  let response = await fetch(`${adminApiConfig.baseUrl}${path}`, {
    method: init.method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  if (response.status === 401) {
    headers.Authorization = `Bearer ${await getAccessToken(true)}`;
    response = await fetch(`${adminApiConfig.baseUrl}${path}`, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  }

  return parseEnvelope<T>(response, path, init.method);
}
