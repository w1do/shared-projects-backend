import CategoriesPage from "@/components/pages/categories";

export const metadata = {
  title: "Categories · Ætheria Admin",
  description:
    "Manage cosmetic product catalog taxonomy, hierarchies, and category sales performance.",
};

/**
 * Client-driven categories list (same pattern as products/dashboard):
 * no SSR seed so useCategoriesQuery isPending can drive the full-page skeleton.
 */
export default function AdminCategoriesPage() {
  return <CategoriesPage />;
}
