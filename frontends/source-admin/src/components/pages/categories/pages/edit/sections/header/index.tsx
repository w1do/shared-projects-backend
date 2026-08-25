"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface EditCategoryHeaderProps {
  categoryName: string;
  isSubmitting: boolean;
}

export function EditCategoryHeader({ categoryName, isSubmitting }: EditCategoryHeaderProps) {
  return (
    <PageHeader
      title={`Edit category: ${categoryName}`}
      description="Update this taxonomy node's hierarchy, visual identity, and merchandising metrics."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Catalog", href: "/admin/products" },
        { label: "Categories", href: "/admin/categories" },
        { label: `Edit ${categoryName || "category"}` },
      ]}
      actions={
        <>
          <Button
            type="submit"
            variant="contained"
            shape="circle"
            startIcon={<Check />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </>
      }
    />
  );
}
