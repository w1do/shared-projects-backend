"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { useCustomersPage } from "@/hooks/admin/customers";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { CustomersStats } from "@/components/pages/customers/sections/customers-stats";
import { CustomersPanel } from "@/components/pages/customers/sections/customers-panel";
import { CustomerDetailModal } from "@/components/pages/customers/sections/customer-detail-modal";
import { DeleteCustomerDialog } from "@/components/pages/customers/sections/delete-customer-dialog";
import { CustomersLoadingState } from "./loading";

interface CustomersPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialCustomers?: DetailedCustomer[];
}

/**
 * Customers page — directory via useCustomersPage (TanStack Query).
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function CustomersPage({ initialCustomers }: CustomersPageProps = {}) {
  const t = useConsoleText();
  const {
    customers,
    isPending,
    selectedCustomer,
    isModalOpen,
    openCustomer,
    closeModal,
    exportCustomers,
    toggleCustomerBlocked,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
  } = useCustomersPage(initialCustomers !== undefined ? { initialCustomers } : {});

  if (isPending) {
    return <CustomersLoadingState />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("console.customers.title")}
        description={t("console.customers.subtitle")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.nav.group.commerce"), href: "/admin/orders" },
          { label: t("console.customers.title") },
        ]}
        actions={
          <Button
            type="button"
            variant="contained"
            shape="circle"
            size="lg"
            onClick={exportCustomers}
            startIcon={<Download />}
          >
            {t("console.customers.export")}
          </Button>
        }
      />

      <CustomersStats customers={customers} />

      <CustomersPanel
        customers={customers}
        onCustomerClick={openCustomer}
        onToggleBlocked={toggleCustomerBlocked}
        onDeleteCustomer={setDeleteTarget}
      />

      <CustomerDetailModal customer={selectedCustomer} isOpen={isModalOpen} onClose={closeModal} />

      <DeleteCustomerDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        customer={deleteTarget}
      />
    </div>
  );
}
