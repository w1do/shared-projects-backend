import { adminApiGet, adminApiSend } from "../api-client";
import {
  PAY_BASE,
  paymentProviderPath,
  paymentProvidersPath,
} from "./pay-paths";

const base = PAY_BASE;

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

export type PlatformPaymentProviderStatus = "active" | "archived";

/** Строка списка настроек провайдеров: метаданные без значений credentials. */
export type PlatformPaymentProviderListItem = {
  provider: string;
  group: string;
  label: string | null;
  name: string | null;
  status: PlatformPaymentProviderStatus;
  return_url: string | null;
  fail_url: string | null;
  has_credentials: boolean;
};

/** Полные настройки провайдера — только под правом pay.providers.manage. */
export type PlatformPaymentProvider = {
  provider: string;
  group: string;
  label: string | null;
  name: string | null;
  credentials: Record<string, unknown>;
  properties: Record<string, unknown>;
  return_url: string | null;
  fail_url: string | null;
  status: PlatformPaymentProviderStatus;
};

/** Upsert настроек: непереданное поле сервер не трогает. */
export type UpdatePaymentProviderInput = {
  credentials?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  return_url?: string | null;
  fail_url?: string | null;
  status?: PlatformPaymentProviderStatus;
};

export function getPaymentProviders() {
  return adminApiGet<PlatformPaymentProviderListItem[]>(paymentProvidersPath());
}

export function getPaymentProvider(provider: string) {
  return adminApiGet<PlatformPaymentProvider>(paymentProviderPath(provider));
}

/**
 * Настройки провайдера другого проекта — источник для «Скопировать с
 * проекта»: путь строится с явным ключом, минуя подстановку из cookie.
 * Право на проект-источник проверяет штатный AuthorizeOperator (Д9).
 */
export function getPaymentProviderFromProject(projectKey: string, provider: string) {
  return adminApiGet<PlatformPaymentProvider>(
    paymentProviderPath(provider, projectKey),
  );
}

export function updatePaymentProvider(
  provider: string,
  input: UpdatePaymentProviderInput,
) {
  return adminApiSend<PlatformPaymentProvider>(paymentProviderPath(provider), {
    method: "PUT",
    body: input,
  });
}
