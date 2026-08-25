"use client";

import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { toast } from "sonner";
import type { ProductFull } from "@/lib/admin/mock";
import { exportProductsToPDF } from "@/lib/admin/products/pdf/export";

interface ProductsHeaderProps {
  products: ProductFull[];
}

export function ProductsHeader({ products }: ProductsHeaderProps) {
  const handleExport = () => {
    toast.success("Generating product catalog PDF report...");
    exportProductsToPDF(products);
  };

  return (
    <PageHeader
      title="Products"
      description="Curate the catalog across every house brand. Track pricing, stock health, and what is ready to sell."
      breadcrumbItems={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
      actions={
        <>
          <Button variant="outlined" shape="circle" startIcon={<Download />} onClick={handleExport}>
            Export
          </Button>
          <Button
            variant="contained"
            shape="circle"
            startIcon={<Plus />}
            component={Link}
            href="/admin/products/add"
          >
            Add product
          </Button>
        </>
      }
    />
  );
}
