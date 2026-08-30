"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { t, tf } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { cities, type CityFilters } from "@/lib/admin/services";

/** Города проекта: поиск, отбор, сортировка и курсорная пагинация. */
export function useCitiesQuery(filters: Omit<CityFilters, "cursor">) {
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.cities.list(filters),
    queryFn: ({ pageParam }) => cities.list({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

/** Регионы справочника — для отбора городов. */
export function useCityRegionsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.cities.regions(),
    queryFn: cities.regions,
  });
}

/** Переключатель включённости в строке: применяется сразу, без шага сохранения. */
export function useSetCityEnabledMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      cities.setEnabled(id, enabled),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.cities.all }),
    onError: (error: Error) =>
      toast.error(error.message || t("console.cities.toggle.failed")),
  });
}

/** Массовые действия над составом: включить все и вернуться к стартовому набору. */
export function useCityBulkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: "enable-all" | "reset") =>
      action === "enable-all" ? cities.enableAll() : cities.reset(),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.cities.all,
      });
      toast.success(tf("console.cities.bulk.done", { count: result.enabled }));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.cities.bulk.failed")),
  });
}
