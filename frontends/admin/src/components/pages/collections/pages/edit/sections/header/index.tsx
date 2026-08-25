"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface EditCollectionHeaderProps {
  collectionName: string;
  isSubmitting: boolean;
}

export function EditCollectionHeader({ collectionName, isSubmitting }: EditCollectionHeaderProps) {
  return (
    <PageHeader
      title={`Edit collection: ${collectionName}`}
      description="Update this collection's cover, story, merchandising metrics, and curated products."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Catalog", href: "/admin/products" },
        { label: "Collections", href: "/admin/collections" },
        { label: `Edit ${collectionName || "collection"}` },
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
