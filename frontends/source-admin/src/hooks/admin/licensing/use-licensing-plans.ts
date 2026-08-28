"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import {
  licensingPlans,
  type UpsertLicensingPlanFeatureInput,
  type UpsertLicensingPlanInput,
} from "@/lib/admin/services/licensing";

/** Планы поставки: курсорная пагинация как infinite query. */
export function useLicensingPlans() {
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.licensing.plans(),
    queryFn: ({ pageParam }) => licensingPlans.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

/** Просмотр плана: базовые фичи и переопределения организаций. */
export function useLicensingPlanQuery(id: number | null) {
  return useQuery({
    queryKey: adminQueryKeys.licensing.plan(id ?? 0),
    queryFn: () => licensingPlans.get(id as number),
    enabled: id !== null,
  });
}

function useInvalidatePlans() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.licensing.all });
}

export function useCreateLicensingPlanMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: (input: UpsertLicensingPlanInput) =>
      licensingPlans.create(input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.plans.toast.created"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.plans.toast.save-failed"),
      );
    },
  });
}

export function useUpdateLicensingPlanMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpsertLicensingPlanInput;
    }) => licensingPlans.update(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.plans.toast.updated"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.plans.toast.save-failed"),
      );
    },
  });
}

export function useDeleteLicensingPlanMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: (id: number) => licensingPlans.remove(id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.plans.toast.deleted"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.plans.toast.delete-failed"),
      );
    },
  });
}

export function useAddLicensingPlanFeatureMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: ({
      planId,
      input,
    }: {
      planId: number;
      input: UpsertLicensingPlanFeatureInput;
    }) => licensingPlans.addFeature(planId, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.plans.features.toast.added"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.plans.features.toast.failed"),
      );
    },
  });
}

export function useUpdateLicensingPlanFeatureMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: ({
      planId,
      featureId,
      input,
    }: {
      planId: number;
      featureId: number;
      input: UpsertLicensingPlanFeatureInput;
    }) => licensingPlans.updateFeature(planId, featureId, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.plans.features.toast.updated"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.plans.features.toast.failed"),
      );
    },
  });
}

export function useDeleteLicensingPlanFeatureMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: ({
      planId,
      featureId,
    }: {
      planId: number;
      featureId: number;
    }) => licensingPlans.removeFeature(planId, featureId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.licensing.plans.features.toast.deleted"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("console.licensing.plans.features.toast.failed"),
      );
    },
  });
}
