"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import {
  licensingReleases,
  type UpsertLicensingReleaseInput,
} from "@/lib/admin/services/licensing";

/** Каталог релизов поставки: курсорная пагинация как infinite query. */
export function useLicensingReleases() {
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.licensing.releases(),
    queryFn: ({ pageParam }) => licensingReleases.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

function useInvalidateReleases() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.licensing.all });
}

export function useCreateReleaseMutation() {
  const invalidate = useInvalidateReleases();

  return useMutation({
    mutationFn: (input: UpsertLicensingReleaseInput) =>
      licensingReleases.create(input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.releases.toast.created"));
    },
    // Дубликат версии — доменная ошибка с текстом-контрактом: показываем как есть.
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.releases.toast.save-failed"),
      );
    },
  });
}

export function useUpdateReleaseMutation() {
  const invalidate = useInvalidateReleases();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpsertLicensingReleaseInput;
    }) => licensingReleases.update(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.releases.toast.updated"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.releases.toast.save-failed"),
      );
    },
  });
}

export function useDeleteReleaseMutation() {
  const invalidate = useInvalidateReleases();

  return useMutation({
    mutationFn: (id: number) => licensingReleases.remove(id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.releases.toast.deleted"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.releases.toast.delete-failed"),
      );
    },
  });
}
