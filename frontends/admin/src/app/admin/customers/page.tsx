import CustomersPage from "@/components/pages/customers";
import { t } from "@/lib/admin/console-texts";

export const metadata = {
  title: `${t("console.nav.customers")} | Ætheria Admin`,
  description: t("console.meta.customers-description"),
};

/**
 * Client-driven customers list (same pattern as products/brands):
 * no SSR seed so useCustomersQuery isPending can drive the full-page skeleton.
 */
export default function AdminCustomersPage() {
  return <CustomersPage />;
}
