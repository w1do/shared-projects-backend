import CategoriesPage from "@/components/pages/categories";
import { t } from "@/lib/admin/console-texts";

export const metadata = {
  title: `${t("console.nav.categories")} · Ætheria Admin`,
  description: t("console.meta.categories-description"),
};

/**
 * Client-driven categories list (same pattern as products/dashboard):
 * no SSR seed so useCategoriesQuery isPending can drive the full-page skeleton.
 */
export default function AdminCategoriesPage() {
  return <CategoriesPage />;
}
