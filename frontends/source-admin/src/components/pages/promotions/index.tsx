"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { usePromotionsPage } from "@/hooks/admin/promotions";

import { PromotionsStats } from "./sections/promotions-stats";
import { PromotionsSpotlight } from "./sections/promotions-spotlight";
import { PromotionsPanel } from "./sections/promotions-panel";
import { PromotionDetailModal } from "./sections/promotion-detail-modal";
import { PromotionFormModal } from "./sections/promotion-form-modal";
import { PromotionsLoadingState } from "./loading";

/**
 * Promotions page — list/create/update/delete via usePromotionsPage (TanStack Query).
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function PromotionsPage({
  initialPromotions,
  autoOpenCreate = false,
}: {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialPromotions?: Promotion[];
  autoOpenCreate?: boolean;
} = {}) {
  const {
    promotions,
    spotlight,
    isPending,
    detailPromotion,
    setDetailPromotion,
    formPromotion,
    isFormOpen,
    setIsFormOpen,
    openCreate,
    viewDetails,
    openEdit,
    submitPromotion,
    toggleStatus,
    removePromotion,
  } = usePromotionsPage(
    initialPromotions !== undefined ? { initialPromotions, autoOpenCreate } : { autoOpenCreate },
  );

  if (isPending) {
    return <PromotionsLoadingState />;
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Promotions"
        description="Run discount programs, coupon codes, and tier rewards across the multi-brand catalog."
        breadcrumbItems={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/orders" },
          { label: "Promotions" },
        ]}
        actions={
          <Button
            variant="contained"
            shape="circle"
            size="sm"
            startIcon={<Plus />}
            onClick={openCreate}
          >
            New Promotion
          </Button>
        }
      />

      <PromotionsStats promotions={promotions} />

      {spotlight && (
        <PromotionsSpotlight promotion={spotlight} onViewDetails={viewDetails} onEdit={openEdit} />
      )}

      <PromotionsPanel
        promotions={promotions}
        onViewDetails={viewDetails}
        onEdit={openEdit}
        onToggleStatus={toggleStatus}
        onDelete={removePromotion}
      />

      <PromotionDetailModal
        promotion={detailPromotion}
        isOpen={!!detailPromotion}
        onClose={() => setDetailPromotion(null)}
        onEdit={openEdit}
        onToggleStatus={toggleStatus}
        onDelete={removePromotion}
      />

      <PromotionFormModal
        promotion={formPromotion}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitPromotion}
      />
    </div>
  );
}
