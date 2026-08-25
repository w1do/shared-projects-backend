"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { useCustomersQuery } from "./use-customers-query";

type Options = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products/brands pattern.
   */
  initialCustomers?: DetailedCustomer[];
};

/**
 * Customers list page data boundary: Query list + modal/export handlers.
 * Keeps TanStack Query wiring out of components/pages.
 */
export function useCustomersPage(options: Options = {}) {
  const { initialCustomers } = options;
  const hasSeed = initialCustomers !== undefined;

  const { data, isPending } = useCustomersQuery({
    initialData: hasSeed ? initialCustomers : undefined,
  });
  const customers = data ?? initialCustomers ?? [];

  const [selectedCustomer, setSelectedCustomer] = useState<DetailedCustomer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCustomer = (customer: DetailedCustomer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const exportCustomers = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: "Preparing customer logs and generating CSV...",
      success: () => "Customer directory CSV exported successfully.",
      error: "Failed to generate export file.",
    });
  };

  return {
    customers,
    /** No cached data yet — show full-page CustomersLoadingState. */
    isPending: hasSeed ? false : isPending,
    selectedCustomer,
    isModalOpen,
    openCustomer,
    closeModal,
    exportCustomers,
  };
}
