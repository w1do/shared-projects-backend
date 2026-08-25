"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { toast } from "sonner";

export function InventoryHeader() {
  const handleExport = () => {
    toast.success("Inventory CSV report exported successfully.");
  };

  return (
    <PageHeader
      title="Inventory"
      description="Monitor real-time stock levels, warning thresholds, incoming orders, and shelf locations."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Catalog", href: "/admin/products" },
        { label: "Inventory" },
      ]}
      actions={
        <Button
          variant="outlined"
          shape="circle"
          size="lg"
          onClick={handleExport}
          startIcon={<Download className="size-4" />}
          className="text-sm"
        >
          Export CSV
        </Button>
      }
    />
  );
}
