"use client";

import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface AddCollectionHeaderProps {
  isSubmitting: boolean;
  onAutoFill: () => void;
}

export function AddCollectionHeader({ isSubmitting, onAutoFill }: AddCollectionHeaderProps) {
  return (
    <PageHeader
      title="Create collection"
      description="Curate a seasonal drop or editorial edit. Set its cover, story, merchandising metrics, and the products it features."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Catalog", href: "/admin/products" },
        { label: "Collections", href: "/admin/collections" },
        { label: "Create collection" },
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
            {isSubmitting ? "Saving..." : "Save collection"}
          </Button>
        </>
      }
    />
  );
}
