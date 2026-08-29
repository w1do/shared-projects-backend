"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectServices } from "@/lib/admin/services/content-domain/settings";
import type { PlatformServiceStatus } from "@/lib/admin/data-source/platform/auth-access";
import { getBootstrap } from "@/lib/admin/data-source/platform/auth";
import { getProjectKey } from "@/lib/admin/data-source/session";

const SERVICES_KEY = ["admin", "services", "list"] as const;

export type ProjectServicesData = {
  services: PlatformServiceStatus[];
  /** Право `auth.services.manage`: без него переключатели только показывают состояние. */
  canManage: boolean;
};

/**
 * Переключаемые сервисы проекта и право оператора ими управлять.
 *
 * `bootstrap` запрашивается тем же вызовом, что и в остальной панели: успешный
 * ответ заодно обновляет снимок видимых разделов и тексты консоли.
 */
export function useProjectServicesQuery() {
  return useQuery({
    queryKey: SERVICES_KEY,
    queryFn: async (): Promise<ProjectServicesData> => {
      const [services, bootstrap] = await Promise.all([
        projectServices.list(),
        getBootstrap(getProjectKey()),
      ]);
      const permissions = bootstrap.permissions ?? [];

      return {
        services,
        canManage:
          permissions.includes("*") ||
          permissions.includes("auth.services.manage"),
      };
    },
  });
}

/**
 * Переключение сервиса: optimistic-обновление списка, откат при ошибке.
 *
 * После успешного сохранения bootstrap перечитывается — `getBootstrap` пишет
 * свежий снимок `console_sections`, и сайдбар с быстрыми действиями отражают
 * состав сервисов сразу, без повторного входа.
 */
export function useToggleServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ service, enabled }: { service: string; enabled: boolean }) =>
      projectServices.toggle(service, enabled),
    onMutate: async ({ service, enabled }) => {
      await queryClient.cancelQueries({ queryKey: SERVICES_KEY });
      const previous = queryClient.getQueryData<ProjectServicesData>(SERVICES_KEY);

      queryClient.setQueryData<ProjectServicesData>(SERVICES_KEY, (current) =>
        current === undefined
          ? current
          : {
              ...current,
              services: current.services.map((row) =>
                row.service === service ? { ...row, enabled } : row,
              ),
            },
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(SERVICES_KEY, context.previous);
      }
    },
    onSuccess: async () => {
      await getBootstrap(getProjectKey());
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}
