"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { projectCard } from "@/lib/admin/services";
import {
  getSiteSettings,
  putSiteSettings,
  type PlatformSiteSettingsInput,
} from "@/lib/admin/data-source/platform/auth-access";

/** Настройки сайта проекта: вид сайта, часовой пояс, язык и валюты (auth-service). */
export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.settings.site(),
    queryFn: getSiteSettings,
  });
}

export function useUpdateSiteSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: PlatformSiteSettingsInput) =>
      putSiteSettings(settings),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.settings.site(),
      }),
  });
}

/**
 * Сохранение раздела «Основные»: название и описание — поля проекта,
 * остальное — настройки сайта. Порядок фиксирован: сначала проект, затем
 * настройки, чтобы отказ второго шага не оставил проект непереименованным.
 */
export function useSaveGeneralSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      project: { name: string; description: string };
      settings: PlatformSiteSettingsInput;
    }) => {
      await projectCard.save(input.project);
      await putSiteSettings(input.settings);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.settings.site(),
      });
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.project.all,
      });
    },
  });
}
