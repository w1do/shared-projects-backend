"use client";

import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface AddCategoryHeaderProps {
  isSubmitting: boolean;
  onAutoFill: () => void;
}

export function AddCategoryHeader({ isSubmitting, onAutoFill }: AddCategoryHeaderProps) {
  return (
    <PageHeader
      title="Add category"
      description="Create a new taxonomy node. Set its hierarchy, visual identity, and merchandising metrics for the storefront catalog."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Catalog", href: "/admin/products" },
        { label: "Categories", href: "/admin/categories" },
        { label: "Add category" },
      ]}
      actions={
        <>
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            startIcon={<Sparkles />}
            onClick={onAutoFill}
            disabled={isSubmitting}
          >
            Auto-fill
          </Button>

          <Button
            type="submit"
            variant="contained"
            shape="circle"
            startIcon={<Check />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save category"}
          </Button>
        </>
      }
    />
  );
}
