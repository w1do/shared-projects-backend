"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { getBootstrap } from "@/lib/admin/data-source/platform/auth";
import {
  getPaymentProvider,
  getPaymentProviderFromProject,
  getPaymentProviders,
  updatePaymentProvider,
  type UpdatePaymentProviderInput,
} from "@/lib/admin/data-source/platform/pay";
import { getProjectKey } from "@/lib/admin/data-source/session";

/** Список настроек провайдеров проекта — без значений credentials. */
export function usePaymentProvidersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.settings.paymentProviders(),
    queryFn: getPaymentProviders,
  });
}

/** Полные настройки провайдера (credentials/properties) — право pay.providers.manage. */
export function usePaymentProviderQuery(provider: string, enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.settings.paymentProvider(provider),
    queryFn: () => getPaymentProvider(provider),
    enabled,
  });
}

export function useUpdatePaymentProviderMutation(provider: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePaymentProviderInput) =>
      updatePaymentProvider(provider, input),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.settings.paymentProviders(),
      });
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.settings.paymentProvider(provider),
      });
    },
  });
}

/**
 * «Скопировать с проекта» (Д9): GET настроек провайдера проекта-источника.
 * Значения только подставляются в форму — сохранение остаётся явным.
 */
export function useCopyPaymentProviderMutation(provider: string) {
  return useMutation({
    mutationFn: (projectKey: string) =>
      getPaymentProviderFromProject(projectKey, provider),
  });
}

/** Проекты оператора из bootstrap — выбор источника для копирования. */
export function useProjectListQuery() {
  return useQuery({
    queryKey: adminQueryKeys.settings.projects(),
    queryFn: async () => {
      const bootstrap = await getBootstrap(getProjectKey());

      return {
        projects: bootstrap.projects,
        current: bootstrap.current_project,
      };
    },
  });
}
