"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import {
  getPaymentsSettings,
  updatePaymentsSettings,
} from "@/lib/admin/data-source/platform/pay";

/** Активный платёжный провайдер проекта (pay-service). */
export function usePaymentsSettingsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.settings.payments(),
    queryFn: getPaymentsSettings,
  });
}

export function useUpdatePaymentsSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: string) => updatePaymentsSettings(provider),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.settings.payments() }),
  });
}
