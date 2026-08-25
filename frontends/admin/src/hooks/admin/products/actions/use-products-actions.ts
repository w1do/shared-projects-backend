"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProductFull } from "@/lib/admin/mock";
import {
  matchesQuery,
  type StatusFilter,
  type SortField,
  sortProducts,
} from "@/lib/admin/products-helpers";
import { useDataTable } from "@/hooks/use-data-table";
import {
  useArchiveProductMutation,
  useArchiveProductsMutation,
  useDeleteProductMutation,
  useDeleteProductsMutation,
} from "../mutations/use-product-mutations";

type DeleteIntent = { type: "single"; product: ProductFull } | { type: "bulk"; ids: string[] };

/**
 * Catalog list interactions: filter/sort/pagination UI state plus archive/delete CRUD
 * via TanStack mutations. Lives under hooks/admin — components only consume this API.
 */
export function useProductsActions(products: ProductFull[]) {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [previewProduct, setPreviewProduct] = React.useState<ProductFull | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [deleteIntent, setDeleteIntent] = React.useState<DeleteIntent | null>(null);

  const archiveProductMutation = useArchiveProductMutation();
  const archiveProductsMutation = useArchiveProductsMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const deleteProductsMutation = useDeleteProductsMutation();

  const dataTable = useDataTable<ProductFull, StatusFilter, SortField>({
    data: products,
    itemsPerPage: 8,
    initialSort: { field: "revenue", order: "desc" },
    filterFn: (p, q, s) => matchesQuery(p, q) && (s === "All" || p.status === s),
    sortFn: sortProducts,
  });

  const isBusy =
    archiveProductMutation.isPending ||
    archiveProductsMutation.isPending ||
    deleteProductMutation.isPending ||
    deleteProductsMutation.isPending;

  const handlePreview = React.useCallback((product: ProductFull) => {
    setPreviewProduct(product);
    setIsPreviewOpen(true);
  }, []);

  const handleEdit = React.useCallback(
    (product: ProductFull) => {
      router.push(`/admin/products/${product.id}/edit`);
    },
    [router],
  );

  const handleClosePreview = React.useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const handleArchive = React.useCallback(
    (product: ProductFull) => {
      if (product.status === "Archived") {
        toast.info("Product is already archived.");
        return;
      }

      archiveProductMutation.mutate(product.id, {
        onSuccess: () => toast.success(`"${product.name}" archived.`),
        onError: () => toast.error("Could not archive product."),
      });
    },
    [archiveProductMutation],
  );

  /** Opens the destructive-delete confirmation for a single product. */
  const handleDelete = React.useCallback((product: ProductFull) => {
    setDeleteIntent({ type: "single", product });
  }, []);

  const handleBulkArchive = React.useCallback(() => {
    const ids = Array.from(dataTable.selectedIds);
    if (ids.length === 0) return;

    archiveProductsMutation.mutate(ids, {
      onSuccess: () => {
        dataTable.clearSelection();
        toast.success(`${ids.length} product${ids.length > 1 ? "s" : ""} archived.`);
      },
      onError: () => toast.error("Could not archive selected products."),
    });
  }, [archiveProductsMutation, dataTable]);

  /** Opens the destructive-delete confirmation for the current selection. */
  const handleBulkDelete = React.useCallback(() => {
    const ids = Array.from(dataTable.selectedIds);
    if (ids.length === 0) return;
    setDeleteIntent({ type: "bulk", ids });
  }, [dataTable.selectedIds]);

  const cancelDelete = React.useCallback(() => {
    if (deleteProductMutation.isPending || deleteProductsMutation.isPending) return;
    setDeleteIntent(null);
  }, [deleteProductMutation.isPending, deleteProductsMutation.isPending]);

  const confirmDelete = React.useCallback(() => {
    if (!deleteIntent) return;

    if (deleteIntent.type === "single") {
      const { product } = deleteIntent;
      deleteProductMutation.mutate(product.id, {
        onSuccess: () => {
          setDeleteIntent(null);
          toast.success(`"${product.name}" deleted.`);
        },
        onError: () => toast.error("Could not delete product."),
      });
      return;
    }

    const { ids } = deleteIntent;
    deleteProductsMutation.mutate(ids, {
      onSuccess: () => {
        dataTable.clearSelection();
        setDeleteIntent(null);
        toast.success(`${ids.length} product${ids.length > 1 ? "s" : ""} deleted.`);
      },
      onError: () => toast.error("Could not delete selected products."),
    });
  }, [dataTable, deleteIntent, deleteProductMutation, deleteProductsMutation]);

  return {
    viewMode,
    setViewMode,
    previewProduct,
    isPreviewOpen,
    handlePreview,
    handleEdit,
    handleClosePreview,
    handleArchive,
    handleDelete,
    handleBulkArchive,
    handleBulkDelete,
    deleteIntent,
    cancelDelete,
    confirmDelete,
    isBusy,
    dataTable,
  };
}
