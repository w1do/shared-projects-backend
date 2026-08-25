/**
 * Сессия оператора панели.
 *
 * Хранение выбрано таким, каким его ждёт вёрстка:
 *  - cookie `auth_token` — признак сессии для guard'а (`src/proxy.ts`) и Bearer-токен платформы;
 *  - cookie `auth_role`  — роль для RBAC-правил guard'а;
 *  - cookie `project_key` — текущий проект, подставляется в пути `/projects/{key}/...`;
 *  - localStorage `current_user` — профиль для динамических привязок интерфейса (топбар и т.п.).
 */

import { adminApiConfig, shouldUseAdminApi } from "./config";
import {
  type BootstrapAccess,
  clearSectionSnapshot,
  persistSectionSnapshot,
  visibleSectionKeys,
} from "./section-access";
import { type MockUser, authenticateMockUser } from "@/lib/admin/mocks/auth";

export const AUTH_TOKEN_COOKIE = "auth_token";
export const AUTH_ROLE_COOKIE = "auth_role";
export const PROJECT_KEY_COOKIE = "project_key";
export const CURRENT_USER_STORAGE_KEY = "current_user";

export type OperatorRole = MockUser["role"];

export type OperatorProfile = {
  id: string;
  email: string;
  name: string;
  role: OperatorRole;
  position: string;
  phone: string;
  avatar?: string;
  status: "active" | "inactive";
  lastLogin?: string;
};

type PlatformAdminProfile = {
  id: number;
  name: string;
  email: string;
  locale: string;
  is_super_admin: boolean;
};

type PlatformLoginData = {
  token: string;
  admin: PlatformAdminProfile;
};

export class AdminAuthError extends Error {}

/** Базовый URL API: пусто — тот же origin, что и панель (общий gateway). */
export function apiBaseUrl() {
  if (typeof window !== "undefined" && !adminApiConfig.baseUrl) return "";
  return adminApiConfig.baseUrl ?? "";
}

export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAuthToken() {
  return readCookie(AUTH_TOKEN_COOKIE);
}

export function getProjectKey() {
  return readCookie(PROJECT_KEY_COOKIE);
}

export function setProjectKey(key: string) {
  writeCookie(PROJECT_KEY_COOKIE, key, 30 * 24 * 60 * 60);
}

export function getCurrentUser(): OperatorProfile | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as OperatorProfile;
  } catch {
    return undefined;
  }
}

/** Профиль платформы → форма, которую ждёт вёрстка. */
function toOperatorProfile(admin: PlatformAdminProfile): OperatorProfile {
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
  };
}

const DEFAULT_SESSION_MAX_AGE = 24 * 60 * 60;

function sessionMaxAge(rememberMe: boolean) {
  return rememberMe ? 30 * 24 * 60 * 60 : DEFAULT_SESSION_MAX_AGE;
}

function persistSession(profile: OperatorProfile, token: string, rememberMe: boolean) {
  const maxAge = sessionMaxAge(rememberMe);
  writeCookie(AUTH_TOKEN_COOKIE, token, maxAge);
  writeCookie(AUTH_ROLE_COOKIE, profile.role, maxAge);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(profile));
  }
}

/**
 * Снимок видимых разделов: включённые сервисы проекта + права оператора.
 * Вызывается при входе и при каждом успешном `bootstrap` (например при смене проекта).
 */
export function rememberSectionSnapshot(
  bootstrap: BootstrapAccess,
  maxAgeSeconds = DEFAULT_SESSION_MAX_AGE,
) {
  persistSectionSnapshot(visibleSectionKeys(bootstrap), maxAgeSeconds);
}

/** Текущий проект и снимок доступа оператора: bootstrap → cookies. */
async function applyBootstrap(token: string, maxAgeSeconds: number) {
  const response = await fetch(`${apiBaseUrl()}/api/admin/v1/bootstrap`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) return;

  const payload = (await response.json()) as {
    data?: BootstrapAccess & {
      current_project?: string | null;
      projects?: { key: string }[];
    };
  };
  const key = payload.data?.current_project ?? payload.data?.projects?.[0]?.key;
  if (key) setProjectKey(key);
  if (payload.data) rememberSectionSnapshot(payload.data, maxAgeSeconds);
}

async function signInAgainstPlatform(
  email: string,
  password: string,
): Promise<{ profile: OperatorProfile; token: string }> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}/api/admin/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    throw new AdminAuthError("Sign in failed. The platform is unreachable.");
  }

  if (response.status === 401 || response.status === 422) {
    // Существование аккаунта не раскрываем.
    throw new AdminAuthError("Invalid email or password.");
  }
  if (!response.ok) {
    throw new AdminAuthError(`Sign in failed with ${response.status}.`);
  }

  const payload = (await response.json()) as { data?: PlatformLoginData };
  if (!payload.data?.token) {
    throw new AdminAuthError("Sign in failed. Unexpected response from the platform.");
  }

  return {
    profile: toOperatorProfile(payload.data.admin),
    token: payload.data.token,
  };
}

function signInAgainstMocks(email: string, password: string) {
  const user = authenticateMockUser(email);
  if (!user || user.password !== password) {
    throw new AdminAuthError("Invalid email or password.");
  }
  if (user.status === "inactive") {
    throw new AdminAuthError("This account has been deactivated.");
  }

  const { password: _password, ...profile } = user;
  return { profile: profile as OperatorProfile, token: "mock-token" };
}

/**
 * Вход оператора. В режиме `api` — против auth-service, в режиме `mock` — по данным вёрстки.
 * Ошибки приходят как `AdminAuthError` с текстом, пригодным для toast'а.
 */
export async function signInOperator(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<OperatorProfile> {
  const { profile, token } = shouldUseAdminApi()
    ? await signInAgainstPlatform(email, password)
    : signInAgainstMocks(email, password);

  persistSession(profile, token, rememberMe);

  if (shouldUseAdminApi()) {
    try {
      await applyBootstrap(token, sessionMaxAge(rememberMe));
    } catch {
      // Скоуп проекта не критичен для входа — разделы покажут ошибку сами.
      // Снимок остаётся отсутствующим: меню и guard трактуют это как «снимок не готов».
    }
  }

  return profile;
}

/** Полная очистка клиентской части сессии (cookies + профиль). */
export function clearClientSession() {
  clearCookie(AUTH_TOKEN_COOKIE);
  clearCookie(AUTH_ROLE_COOKIE);
  clearCookie(PROJECT_KEY_COOKIE);
  clearSectionSnapshot();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }
}
