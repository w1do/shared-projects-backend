"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface CollectionsHeaderProps {
  onAddClick: () => void;
}

export function CollectionsHeader({ onAddClick }: CollectionsHeaderProps) {
  return (
    <PageHeader
      title="Collections"
      description="Group products into themed sets — seasonal drops, curated routines, and editorial bundles. Pricing and discounts live in Promotions."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Catalog", href: "/admin/products" },
        { label: "Collections" },
      ]}
      actions={
        <Button
          variant="contained"
          shape="circle"
          size="lg"
          onClick={onAddClick}
          startIcon={<Plus />}
        >
          Create Collection
        </Button>
      }
    />
  );
}
