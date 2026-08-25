"use client";

import { Sparkles, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface AddBrandHeaderProps {
  isSubmitting: boolean;
  onAutoFill: () => void;
  onPreview: () => void;
}

export function AddBrandHeader({ isSubmitting, onAutoFill, onPreview }: AddBrandHeaderProps) {
  return (
    <PageHeader
      title="Add brand"
      description="Register a new luxury cosmetics brand. Complete basic metadata, visual assets, financial indicators, and SEO configurations."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Brands", href: "/admin/brands" },
        { label: "Add brand" },
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
            {isSubmitting ? "Saving..." : "Save brand"}
          </Button>
        </>
      }
    />
  );
}
