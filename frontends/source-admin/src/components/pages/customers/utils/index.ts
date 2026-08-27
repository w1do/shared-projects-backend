import type { CustomerTier, DetailedCustomer } from "@/lib/admin/mocks/customers";
import { t, type ConsoleTextKey } from "@/lib/admin/console-texts";

const tierTextKeys: Record<CustomerTier, ConsoleTextKey> = {
  Bronze: "console.customers.tier.bronze",
  Silver: "console.customers.tier.silver",
  Gold: "console.customers.tier.gold",
  Platinum: "console.customers.tier.platinum",
};

const skinTypeTextKeys: Record<DetailedCustomer["skinProfile"]["skinType"], ConsoleTextKey> = {
  Dry: "console.customers.skin-type.dry",
  Oily: "console.customers.skin-type.oily",
  Sensitive: "console.customers.skin-type.sensitive",
  Combination: "console.customers.skin-type.combination",
  Normal: "console.customers.skin-type.normal",
};

const skinConcernTextKeys: Record<string, ConsoleTextKey> = {
  Acne: "console.customers.concern.acne",
  Aging: "console.customers.concern.aging",
  Hydration: "console.customers.concern.hydration",
  Redness: "console.customers.concern.redness",
  Brightening: "console.customers.concern.brightening",
};

/** Подпись уровня лояльности из реестра текстов консоли. */
export function customerTierLabel(tier: CustomerTier): string {
  return t(tierTextKeys[tier]);
}

/** Подпись типа кожи из реестра текстов консоли. */
export function customerSkinTypeLabel(
  skinType: DetailedCustomer["skinProfile"]["skinType"],
): string {
  return t(skinTypeTextKeys[skinType]);
}

/** Подпись запроса из профиля: незнакомое значение остаётся как есть. */
export function customerSkinConcernLabel(concern: string): string {
  const key = skinConcernTextKeys[concern];
  return key ? t(key) : concern;
}

export interface CustomerFilterSortParams {
  searchTerm: string;
  tierFilter: CustomerTier | "all";
  skinTypeFilter: "all" | DetailedCustomer["skinProfile"]["skinType"];
  skinConcernFilter: "all" | string;
  sortBy: "joined-desc" | "joined-asc" | "spent-desc" | "spent-asc" | "orders-desc" | "orders-asc";
}

export function filterAndSortCustomers(
  customers: DetailedCustomer[],
  params: CustomerFilterSortParams,
): DetailedCustomer[] {
  const { searchTerm, tierFilter, skinTypeFilter, skinConcernFilter, sortBy } = params;

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skinProfile.skinConcerns.some((concern) =>
        concern.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesTier = tierFilter === "all" || c.tier === tierFilter;
    const matchesSkinType = skinTypeFilter === "all" || c.skinProfile.skinType === skinTypeFilter;
    const matchesConcern =
      skinConcernFilter === "all" || c.skinProfile.skinConcerns.includes(skinConcernFilter);

    return matchesSearch && matchesTier && matchesSkinType && matchesConcern;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === "joined-desc")
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    if (sortBy === "joined-asc")
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    if (sortBy === "spent-desc") return b.totalSpent - a.totalSpent;
    if (sortBy === "spent-asc") return a.totalSpent - b.totalSpent;
    if (sortBy === "orders-desc") return b.totalOrders - a.totalOrders;
    if (sortBy === "orders-asc") return a.totalOrders - b.totalOrders;
    return 0;
  });
}
