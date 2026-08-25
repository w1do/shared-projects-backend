"use client";

import { Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface EditBrandHeaderProps {
  brandName: string;
  isSubmitting: boolean;
  onPreview: () => void;
}

export function EditBrandHeader({ brandName, isSubmitting, onPreview }: EditBrandHeaderProps) {
  return (
    <PageHeader
      title={`Edit brand: ${brandName}`}
      description="Modify the brand identity, visual assets, financial KPIs, and storefront search settings."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Brands", href: "/admin/brands" },
        { label: `Edit ${brandName || "brand"}` },
      ]}
      actions={
        <>
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            startIcon={<Eye />}
            onClick={onPreview}
            disabled={isSubmitting}
          >
            Preview
          </Button>

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
