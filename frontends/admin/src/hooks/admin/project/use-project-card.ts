"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { projectBuildout, projectCard } from "@/lib/admin/services";

/** Карточка проекта на дашборде: идентификатор, название, описание, тематика. */
export function useProjectCardQuery() {
  return useQuery({
    queryKey: adminQueryKeys.project.card(),
    queryFn: projectCard.get,
  });
}

export function useSaveProjectCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name?: string; description?: string | null }) =>
      projectCard.save(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.project.all,
      });
      toast.success(t("console.project.saved"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Состояние сборки проекта. Пока сборка идёт — опрос состояния: отдельного
 * канала уведомлений у консоли нет.
 */
export function useProjectBuildoutQuery(enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.project.buildout(),
    queryFn: projectBuildout.get,
    enabled,
    refetchInterval: (query) =>
      query.state.data?.status === "process" ? 3000 : false,
  });
}

export function useStartProjectBuildoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { topic: string; overwrite?: boolean }) =>
      projectBuildout.start(input.topic, input.overwrite ?? false),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.project.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
