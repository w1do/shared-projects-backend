import { adminApiGet, adminApiSend } from "../api-client";

const base = "/api/admin/v1/projects/{project}/pay";

/** Настройки платежей проекта: активный платёжный провайдер. */
export type PlatformPaymentsSettings = { provider: string };

export function getPaymentsSettings() {
  return adminApiGet<PlatformPaymentsSettings>(`${base}/settings`);
}

export function updatePaymentsSettings(provider: string) {
  return adminApiSend<PlatformPaymentsSettings>(`${base}/settings`, {
    method: "PUT",
    body: { provider },
  });
}
