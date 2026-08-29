"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import {
  research,
  researchTopics,
  type StartResearchBody,
} from "@/lib/admin/services";

/** Идущее исследование опрашивается: этап меняется без действий оператора. */
const RUNNING_POLL_MS = 3000;

export function useResearchListQuery(status?: string) {
  return useQuery({
    queryKey: adminQueryKeys.research.list(status),
    queryFn: () => research.list(status),
    refetchInterval: (query) =>
      (query.state.data ?? []).some((item) => item.status === "process")
        ? RUNNING_POLL_MS
        : false,
  });
}

export function useResearchQuery(id: number) {
  return useQuery({
    queryKey: adminQueryKeys.research.detail(id),
    queryFn: () => research.get(id),
    enabled: Number.isFinite(id) && id > 0,
    refetchInterval: (query) =>
      query.state.data?.status === "process" ? RUNNING_POLL_MS : false,
  });
}

function useInvalidateResearch() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.research.all });
}

export function useStartResearchMutation() {
  const invalidate = useInvalidateResearch();

  return useMutation({
    mutationFn: (body: StartResearchBody) => research.start(body),
    onSuccess: () => void invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCancelResearchMutation() {
  const invalidate = useInvalidateResearch();

  return useMutation({
    mutationFn: (id: number) => research.cancel(id),
    onSuccess: () => void invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useResearchTopicsQuery(researchId: number) {
  return useQuery({
    queryKey: adminQueryKeys.research.topics(researchId),
    queryFn: () => researchTopics.listByResearch(researchId),
    enabled: Number.isFinite(researchId) && researchId > 0,
  });
}

export function useTopicsQuery(status?: string) {
  return useQuery({
    queryKey: adminQueryKeys.research.allTopics(status),
    queryFn: () => researchTopics.list(status),
  });
}

export function useExtractTopicsMutation() {
  const invalidate = useInvalidateResearch();

  return useMutation({
    mutationFn: (input: { researchId: number; maxCount?: number }) =>
      researchTopics.extract(input.researchId, input.maxCount),
    onSuccess: () => void invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRejectTopicMutation() {
  const invalidate = useInvalidateResearch();

  return useMutation({
    mutationFn: (topicId: number) => researchTopics.reject(topicId),
    onSuccess: () => void invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useGeneratePostMutation() {
  const invalidate = useInvalidateResearch();

  return useMutation({
    mutationFn: (topicId: number) => researchTopics.generatePost(topicId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.research.write-post"));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
