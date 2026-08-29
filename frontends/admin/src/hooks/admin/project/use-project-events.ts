"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectKey } from "@/lib/admin/data-source/session";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { projects, type ProjectEvent } from "@/lib/admin/services";

/**
 * Последние события текущего проекта: ключ включает проект, поэтому смена
 * проекта перечитывает журнал, а не показывает чужие события.
 *
 * Отказ журнала уже погашен слоем данных — панель получает пустой список и
 * остаётся без числа, а не показывает ошибку.
 */
export function useProjectEventsQuery() {
  const project = getProjectKey() ?? "";

  return useQuery<ProjectEvent[]>({
    queryKey: adminQueryKeys.projectEvents.list(project),
    queryFn: () => projects.events(),
    enabled: project !== "",
  });
}
