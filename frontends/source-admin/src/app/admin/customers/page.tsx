import CustomersPage from "@/components/pages/customers";

export const metadata = {
  title: "Customers | Ætheria Admin",
  description:
    "View profiles, dermatology skin concerns, loyalty tiers, and customer lifetime value logs.",
};

/**
 * Client-driven customers list (same pattern as products/brands):
 * no SSR seed so useCustomersQuery isPending can drive the full-page skeleton.
 */
export default function AdminCustomersPage() {
  return <CustomersPage />;
}
