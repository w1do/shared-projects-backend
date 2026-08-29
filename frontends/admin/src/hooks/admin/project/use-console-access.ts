"use client";

import { useQuery } from "@tanstack/react-query";
import { getBootstrap } from "@/lib/admin/data-source/platform/auth";
import {
  canGeneratePosts,
  canManageInstructs,
  canManageMedia,
  canManageProject,
  canManageTopics,
  canRunResearch,
} from "@/lib/admin/data-source/platform/research-access";
import { getProjectKey } from "@/lib/admin/data-source/session";
import { adminQueryKeys } from "@/lib/admin/query/keys";

export type ConsoleAccess = {
  canManageProject: boolean;
  canRunResearch: boolean;
  canManageTopics: boolean;
  canManageInstructs: boolean;
  canGeneratePosts: boolean;
  canManageMedia: boolean;
  /** Признак супер-админа платформы: он заводит новые проекты. */
  isSuperAdmin: boolean;
};

/** Права оператора для разделов проекта, ресёрча и инструкций — из bootstrap. */
export function useConsoleAccessQuery() {
  return useQuery({
    queryKey: adminQueryKeys.project.access(),
    queryFn: async (): Promise<ConsoleAccess> => {
      const bootstrap = await getBootstrap(getProjectKey());
      const permissions = bootstrap.permissions;

      return {
        canManageProject: canManageProject(permissions),
        canRunResearch: canRunResearch(permissions),
        canManageTopics: canManageTopics(permissions),
        canManageInstructs: canManageInstructs(permissions),
        canGeneratePosts: canGeneratePosts(permissions),
        canManageMedia: canManageMedia(permissions),
        isSuperAdmin: bootstrap.user?.is_super_admin === true,
      };
    },
  });
}
