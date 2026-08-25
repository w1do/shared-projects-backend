import type { Promotion } from "@/lib/admin/mocks/promotions";
import {
  createStoredPromotion,
  deleteStoredPromotion,
  readStoredPromotions,
  updateStoredPromotion,
  updateStoredPromotionStatus,
} from "@/lib/admin/promotions/store";
import { adminMutations, getAdminPromotions } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

type PromotionBody = {
  code: string;
  title: string;
  type: string;
  rewardValue: number;
  minSpend: number;
  limit: number;
  used?: number;
  status: string;
  startsAt: string;
  endsAt: string;
};

/**
 * Canonical promotions list loader for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listPromotions(): Promise<Promotion[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredPromotions();
  }
  return getAdminPromotions();
}

export async function createPromotion(body: PromotionBody | Promotion): Promise<Promotion> {
  if (shouldUseAdminApi()) {
    await adminMutations.createPromotion(body as PromotionBody);
    // API may not return full entity; keep caller payload shape for cache.
    return body as Promotion;
  }
  return createStoredPromotion(body as Promotion);
}

export async function updatePromotion(
  id: string,
  body: PromotionBody | Promotion,
): Promise<Promotion | null> {
  if (shouldUseAdminApi()) {
    await adminMutations.updatePromotion(id, body as PromotionBody);
    return body as Promotion;
  }
  return updateStoredPromotion(id, body as Promotion);
}

export async function updatePromotionStatus(
  id: string,
  status: Promotion["status"] | string,
): Promise<Promotion | null> {
  if (shouldUseAdminApi()) {
    await adminMutations.updatePromotionStatus(id, status);
    return null;
  }
  return updateStoredPromotionStatus(id, status as Promotion["status"]);
}

export async function deletePromotion(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.deletePromotion(id);
    return;
  }
  deleteStoredPromotion(id);
}
