/**
 * Versioned localStorage store for promotions (mock backend).
 */
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { mockPromotions } from "@/lib/admin/mocks/promotions";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const seed: Promotion[] = [...mockPromotions];
const store = createVersionedLocalStore<Promotion>({
  storageKey: storageKey("promotions"),
  seedVersionKey: storageKey("promotions-seed-version"),
  seedVersion: "1",
  seed,
});

export function readStoredPromotions(): Promotion[] {
  return store.read();
}

export function saveStoredPromotions(items: Promotion[]) {
  store.save(items);
}

export function createStoredPromotion(promotion: Promotion): Promotion {
  const next = [promotion, ...readStoredPromotions().filter((p) => p.id !== promotion.id)];
  saveStoredPromotions(next);
  return promotion;
}

export function updateStoredPromotion(id: string, promotion: Promotion): Promotion | null {
  const items = readStoredPromotions();
  if (!items.some((p) => p.id === id)) return null;
  const next = items.map((p) => (p.id === id ? promotion : p));
  saveStoredPromotions(next);
  return promotion;
}

export function updateStoredPromotionStatus(
  id: string,
  status: Promotion["status"],
): Promotion | null {
  const items = readStoredPromotions();
  const target = items.find((p) => p.id === id);
  if (!target) return null;
  const updated = { ...target, status };
  saveStoredPromotions(items.map((p) => (p.id === id ? updated : p)));
  return updated;
}

export function deleteStoredPromotion(id: string) {
  saveStoredPromotions(readStoredPromotions().filter((p) => p.id !== id));
}
