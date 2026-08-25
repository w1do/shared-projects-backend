import type { QueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "./keys";

/**
 * Invalidate product catalog caches after product or inventory mutations.
 * Covers product list/detail and inventory list so stock stays in sync.
 */
export async function invalidateProductCatalog(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.inventory.all }),
  ]);
}
