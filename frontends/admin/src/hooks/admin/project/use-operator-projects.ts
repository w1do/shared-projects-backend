"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBootstrap } from "@/lib/admin/data-source/platform/auth";
import { getProjectKey, setProjectKey } from "@/lib/admin/data-source/session";
import { adminQueryKeys } from "@/lib/admin/query/keys";

export type OperatorProject = {
  key: string;
  name: string;
  current: boolean;
};

/**
 * Проекты оператора: список приходит в bootstrap, второго запроса не нужно.
 * Проекты, участником которых оператор не является, платформа туда не кладёт.
 */
export function useOperatorProjectsQuery() {
  const current = getProjectKey() ?? "";

  return useQuery<OperatorProject[]>({
    queryKey: adminQueryKeys.project.list(current),
    queryFn: async () => {
      const bootstrap = await getBootstrap(current || undefined);
      const currentKey = bootstrap.current_project ?? current;

      return (bootstrap.projects ?? []).map((project) => ({
        key: project.key,
        name: project.name,
        current: project.key === currentKey,
      }));
    },
  });
}

/**
 * Переход в другой проект — тот же путь, каким консоль уже меняет проект:
 * ключ в сессию, сброс кэша запросов и перечитывание bootstrap. Данные
 * прежнего проекта после этого в разделах не остаются.
 */
export function useSwitchProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const previous = getProjectKey();

      setProjectKey(key);
      queryClient.clear();

      try {
        await getBootstrap(key);
      } catch (error) {
        // Платформа отказала — текущий проект остаётся прежним
        if (previous) setProjectKey(previous);
        throw error;
      }

      return key;
    },
  });
}
