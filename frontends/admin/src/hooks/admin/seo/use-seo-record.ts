"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import {
  saveSeo,
  type SeoMeta,
  type SeoSubjectType,
} from "@/lib/admin/services";

/** Правка SEO-записи из каталога: сохранение и показ отказа платформы. */
export function useSaveSeoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      id,
      meta,
    }: {
      type: SeoSubjectType;
      id: number;
      meta: SeoMeta;
    }) => saveSeo(type, id, meta),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.seo.all });
      toast.success(t("console.seo.toast.saved"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.seo.toast.save-failed")),
  });
}
