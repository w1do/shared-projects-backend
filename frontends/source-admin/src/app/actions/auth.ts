"use server";

import { cookies } from "next/headers";

const INTERNAL_API_BASE_URL =
  process.env.ADMIN_INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? "";

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Отзываем токен оператора в auth-service; недоступность сервиса не должна мешать выходу.
  if (token && token !== "mock-token") {
    try {
      await fetch(`${INTERNAL_API_BASE_URL}/api/admin/v1/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
    } catch {
      // игнорируем: сессия всё равно чистится ниже
    }
  }

  cookieStore.delete("auth_token");
  cookieStore.delete("auth_role");
  cookieStore.delete("project_key");
}
