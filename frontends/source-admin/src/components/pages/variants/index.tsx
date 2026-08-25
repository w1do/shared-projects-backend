"use client";

import { VariantsPanel } from "./sections/VariantsPanel";
import { VariantsLoadingState } from "./loading";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { useVariantsPage } from "@/hooks/admin/variants";

interface VariantsPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialConfigs?: ProductVariantConfig[];
}

/**
 * Variants list UI shell. Config/CRUD lives in `@/hooks/admin/variants` and panel hooks.
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function VariantsPage({ initialConfigs }: VariantsPageProps = {}) {
  const { configs, isPending } = useVariantsPage(
    initialConfigs !== undefined ? { initialConfigs } : {},
  );

  if (isPending) {
    return <VariantsLoadingState />;
  }

  return <VariantsPanel initialConfigs={configs} />;
}
