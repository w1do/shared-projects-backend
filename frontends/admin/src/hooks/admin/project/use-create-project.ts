"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getBootstrap } from "@/lib/admin/data-source/platform/auth";
import { setProjectKey } from "@/lib/admin/data-source/session";
import { projects } from "@/lib/admin/services";

/**
 * Создание проекта и переход в него.
 *
 * После успеха консоль делает новый проект текущим: ключ уходит в сессию,
 * кэш запросов сбрасывается (данные прежнего проекта к новому не относятся),
 * а bootstrap перечитывается — тем же путём, каким происходит смена проекта.
 */
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const project = await projects.create(name);

      setProjectKey(project.key);
      queryClient.clear();
      await getBootstrap(project.key);

      return project;
    },
  });
}
