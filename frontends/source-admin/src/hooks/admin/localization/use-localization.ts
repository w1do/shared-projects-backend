"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjectKey } from "@/lib/admin/data-source/session";
import { getBootstrap, updateProject } from "@/lib/admin/data-source/platform/auth";
import * as localization from "@/lib/admin/data-source/platform/localization";

const LOCALES_KEY = ["admin", "localization", "locales"] as const;
const TRANSLATIONS_KEY = ["admin", "localization", "translations"] as const;

/** Локали текущего проекта из bootstrap; первая — локаль по умолчанию. */
export function useProjectLocalesQuery() {
  return useQuery({
    queryKey: LOCALES_KEY,
    queryFn: async (): Promise<string[]> => {
      const bootstrap = await getBootstrap(getProjectKey());
      const current = bootstrap.projects.find(
        (project) => project.key === bootstrap.current_project,
      );

      return current?.locales ?? [];
    },
  });
}

export function useSaveProjectLocalesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locales: string[]) => updateProject({ locales }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: LOCALES_KEY }),
  });
}

export function useTranslationsQuery() {
  return useQuery({
    queryKey: TRANSLATIONS_KEY,
    queryFn: localization.listTranslations,
  });
}

export function useUpsertTranslationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      key,
      values,
    }: {
      id: number | null;
      key: string;
      values: Record<string, string>;
    }) =>
      id === null
        ? localization.createTranslation(key, values)
        : localization.updateTranslation(id, key, values),
    onSettled: () => queryClient.invalidateQueries({ queryKey: TRANSLATIONS_KEY }),
  });
}

export function useDeleteTranslationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => localization.deleteTranslation(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: TRANSLATIONS_KEY }),
  });
}

export function useTranslateMissingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => localization.translateMissing(),
    // автоперевод фоновый: словарь перечитается по завершении — обновим по кнопке/refetch
    onSettled: () => queryClient.invalidateQueries({ queryKey: TRANSLATIONS_KEY }),
  });
}
