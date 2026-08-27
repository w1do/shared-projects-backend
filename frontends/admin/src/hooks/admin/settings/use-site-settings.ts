"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import {
  getSiteSettings,
  putSiteSettings,
  type PlatformSiteSettings,
} from "@/lib/admin/data-source/platform/auth";

/** Настройки сайта проекта: язык и валюты по умолчанию (auth-service). */
export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.settings.site(),
    queryFn: getSiteSettings,
  });
}

export function useUpdateSiteSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: PlatformSiteSettings) => putSiteSettings(settings),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.settings.site() }),
  });
}
