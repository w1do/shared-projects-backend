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
  licensingOrganizations,
  type UpsertLicensingOrganizationInput,
} from "@/lib/admin/services/licensing";

/**
 * Организации-покупатели: курсорная пагинация платформы как infinite query —
 * «Показать ещё» дозагружает следующую страницу.
 */
export function useLicensingOrganizations() {
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.licensing.organizations(),
    queryFn: ({ pageParam }) => licensingOrganizations.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

function useInvalidateOrganizations() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: adminQueryKeys.licensing.all,
    });
}

export function useCreateLicensingOrganizationMutation() {
  const invalidate = useInvalidateOrganizations();

  return useMutation({
    mutationFn: (input: UpsertLicensingOrganizationInput) =>
      licensingOrganizations.create(input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.organizations.toast.created"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.organizations.toast.save-failed"),
      );
    },
  });
}

export function useUpdateLicensingOrganizationMutation() {
  const invalidate = useInvalidateOrganizations();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpsertLicensingOrganizationInput;
    }) => licensingOrganizations.update(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.organizations.toast.updated"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.organizations.toast.save-failed"),
      );
    },
  });
}

export function useDeleteLicensingOrganizationMutation() {
  const invalidate = useInvalidateOrganizations();

  return useMutation({
    mutationFn: (id: number) => licensingOrganizations.remove(id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.organizations.toast.deleted"));
    },
    // Доменная ошибка «есть лицензии» приходит текстом конверта — показываем её.
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t("console.licensing.organizations.toast.delete-failed"),
      );
    },
  });
}
