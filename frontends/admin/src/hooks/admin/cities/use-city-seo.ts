"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { cities } from "@/lib/admin/services";
import type { PlatformSeo } from "@/lib/admin/data-source/platform/types";

/** SEO города текущего проекта; пустой блок платформа отдаёт как `null`. */
export function useCitySeoQuery(cityId: number | null) {
  return useQuery({
    queryKey: adminQueryKeys.cities.seo(cityId ?? 0),
    queryFn: () => cities.seo(cityId as number),
    enabled: cityId !== null,
  });
}

export function useSaveCitySeoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, meta }: { id: number; meta: PlatformSeo }) =>
      cities.saveSeo(id, meta),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.cities.all,
      });
      toast.success(t("console.cities.seo.saved"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.cities.seo.save-failed")),
  });
}
