import type { DetailedCustomer } from "@/lib/admin/mocks/customers";

export interface CustomerFilterSortParams {
  searchTerm: string;
  tierFilter: DetailedCustomer["tier"] | "all";
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
