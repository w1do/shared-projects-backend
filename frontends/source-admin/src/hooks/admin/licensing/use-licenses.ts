"use client";

import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import {
  licensingLicenses,
  type IssueLicenseInput,
  type LicenseStatusFilter,
  type OfflineActivationInput,
  type RenewLicenseInput,
} from "@/lib/admin/services/licensing";

export type LicenseListFilters = {
  organizationId?: number;
  status?: LicenseStatusFilter;
};

/**
 * Лицензии проекта: фильтры по организации и статусу + курсорная пагинация
 * как infinite query. Смена фильтра меняет ключ — страницы начинаются заново.
 */
export function useLicenses() {
  const [filters, setFilters] = useState<LicenseListFilters>({});

  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.licensing.licenses(filters),
    queryFn: ({ pageParam }) =>
      licensingLicenses.list({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    filters,
    setFilters,
  };
}

function useInvalidateLicenses() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.licensing.all });
}

/** Выпуск: полный ключ есть только в ответе — вызывающий показывает модал. */
export function useIssueLicenseMutation() {
  const invalidate = useInvalidateLicenses();

  return useMutation({
    mutationFn: (input: IssueLicenseInput) => licensingLicenses.issue(input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.licenses.toast.issued"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.licenses.toast.issue-failed"),
      );
    },
  });
}

export function useRenewLicenseMutation() {
  const invalidate = useInvalidateLicenses();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RenewLicenseInput }) =>
      licensingLicenses.renew(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.licenses.toast.renewed"));
    },
    // Дата не позже текущего окна — доменная ошибка с текстом-контрактом.
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.licenses.toast.renew-failed"),
      );
    },
  });
}

/** Однократный показ ключа авто-выпущенной лицензии (повтор — доменная 422). */
export function useRevealLicenseKeyMutation() {
  const invalidate = useInvalidateLicenses();

  return useMutation({
    mutationFn: (id: string) => licensingLicenses.revealKey(id),
    onSuccess: () => void invalidate(),
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.licenses.toast.reveal-failed"),
      );
    },
  });
}

/** Офлайн-активация: токен из ответа вызывающий кладёт в файл клиенту. */
export function useOfflineActivationMutation() {
  const invalidate = useInvalidateLicenses();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: OfflineActivationInput;
    }) => licensingLicenses.offlineActivate(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.licenses.toast.offline-issued"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.licenses.toast.offline-failed"),
      );
    },
  });
}

export function useRevokeLicenseMutation() {
  const invalidate = useInvalidateLicenses();

  return useMutation({
    mutationFn: (id: string) => licensingLicenses.revoke(id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.licenses.toast.revoked"));
    },
    // Повторный отзыв — доменная ошибка с текстом-контрактом: показываем как есть.
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.licenses.toast.revoke-failed"),
      );
    },
  });
}

/** Установки лицензии; фильтр Д11 — `app_version` ниже заданной. */
export function useLicenseInstallationsQuery(
  licenseId: string | null,
  appVersionBelow?: string,
) {
  return useQuery({
    queryKey: adminQueryKeys.licensing.installations(
      licenseId ?? "",
      appVersionBelow,
    ),
    queryFn: () =>
      licensingLicenses.installations(licenseId ?? "", appVersionBelow),
    enabled: licenseId !== null,
  });
}

export function useRevokeInstallationMutation() {
  const invalidate = useInvalidateLicenses();

  return useMutation({
    mutationFn: (installationId: number) =>
      licensingLicenses.revokeInstallation(installationId),
    onSuccess: () => {
      void invalidate();
      toast.success(
        t("console.licensing.licenses.toast.installation-revoked"),
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t("console.licensing.licenses.toast.installation-revoke-failed"),
      );
    },
  });
}

/** Публичный ключ подписи проекта — только под правом manage. */
export function useLicensingSigningKeyQuery(enabled: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.licensing.signingKey(),
    queryFn: () => licensingLicenses.signingKey(),
    enabled,
  });
}
