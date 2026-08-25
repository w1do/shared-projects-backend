"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface VariantGroupsHeaderProps {
  onCreateClick: () => void;
}

export function VariantGroupsHeader({ onCreateClick }: VariantGroupsHeaderProps) {
  return (
    <PageHeader
      title="Variant Links"
      description="Group standalone products into switchers on the storefront (e.g. shade picker, size selector) to guide customer purchase journeys."
      breadcrumbItems={[{ label: "Admin", href: "/admin" }, { label: "Variant Links" }]}
      actions={
        <Button variant="contained" shape="circle" startIcon={<Plus />} onClick={onCreateClick}>
          Create Variant Group
        </Button>
      }
    />
  );
}
