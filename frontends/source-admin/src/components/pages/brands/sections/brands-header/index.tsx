"use client";

import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { toast } from "sonner";
import type { Brand } from "@/lib/admin/mocks/types";
import { exportBrandsToPDF } from "@/lib/admin/brands/pdf/export";

interface BrandsHeaderProps {
  brands: Brand[];
}

export function BrandsHeader({ brands }: BrandsHeaderProps) {
  const handleExport = () => {
    toast.success("Generating brand portfolio PDF report...");
    exportBrandsToPDF(brands);
  };

  return (
    <PageHeader
      title="Brands"
      description="Manage your luxury cosmetics brand portfolio, track their market share, financial performance, and campaign trends."
      breadcrumbItems={[{ label: "Admin", href: "/admin" }, { label: "Brands" }]}
      actions={
        <>
          <Button variant="outlined" shape="circle" startIcon={<Download />} onClick={handleExport}>
            Export
          </Button>
          <Button
            component={Link}
            href="/admin/brands/add"
            variant="contained"
            shape="circle"
            startIcon={<Plus />}
          >
            Add brand
          </Button>
        </>
      }
    />
  );
}
