import type { Metadata } from "next";

import PromotionsPage from "@/components/pages/promotions";

export const metadata: Metadata = {
  title: "Promotions | Ætheria Admin",
  description: "Run discount programs, coupon codes, and tier rewards across the catalog.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Client-driven promotions list (same pattern as catalog list pages):
 * no SSR seed so usePromotionsQuery isPending can drive the full-page skeleton.
 * `?new=true` still opens the create modal after data resolves.
 */
export default async function PromotionsPageRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const isNew = resolvedSearchParams?.new === "true";
  return <PromotionsPage autoOpenCreate={isNew} />;
}
