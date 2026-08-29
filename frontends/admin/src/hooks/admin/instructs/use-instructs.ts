"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { instructs, type UpsertInstructBody } from "@/lib/admin/services";

export function useInstructsQuery(category?: string) {
  return useQuery({
    queryKey: adminQueryKeys.instructs.list(category),
    queryFn: () => instructs.list(category),
  });
}

export function useInstructCategoriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.instructs.categories(),
    queryFn: () => instructs.categories(),
  });
}

function useInvalidateInstructs() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.instructs.all });
}

export function useSaveInstructMutation() {
  const invalidate = useInvalidateInstructs();

  return useMutation({
    mutationFn: (input: { id?: number; body: UpsertInstructBody }) =>
      input.id
        ? instructs.update(input.id, input.body)
        : instructs.create(input.body),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.project.saved"));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteInstructMutation() {
  const invalidate = useInvalidateInstructs();

  return useMutation({
    mutationFn: (id: number) => instructs.remove(id),
    onSuccess: () => void invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });
}
