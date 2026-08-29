"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DetailedCustomer } from "@/lib/admin/types/customers";
import { deleteCustomer, setCustomerBlocked } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { t } from "@/lib/admin/console-texts";
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

  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<DetailedCustomer | null>(null);

  const refreshList = () =>
    queryClient.invalidateQueries({
      queryKey: adminQueryKeys.customers.list(),
    });

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      setCustomerBlocked(id, blocked),
    onSuccess: (_result, { blocked }) => {
      void refreshList();
      toast.success(
        blocked ? t("console.customers.toast.blocked") : t("console.customers.toast.unblocked"),
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      void refreshList();
      toast.success(t("console.customers.toast.deleted"));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  /** Блокировка/разблокировка пользователя проекта (auth-service). */
  const toggleCustomerBlocked = (customer: DetailedCustomer) => {
    blockMutation.mutate({
      id: customer.id,
      blocked: customer.status === "Active",
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const exportCustomers = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: t("console.customers.toast.export-loading"),
      success: () => t("console.customers.toast.export-success"),
      error: t("console.customers.toast.export-failed"),
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
    toggleCustomerBlocked,
    isBlockPending: blockMutation.isPending,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
  };
}
