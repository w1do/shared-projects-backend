"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface ProductFormHeaderProps {
  title: string;
  submitLabel: string;
  savingLabel: string;
  isSubmitting: boolean;
  onAutoFill?: () => void;
}

export function ProductFormHeader({
  title,
  submitLabel,
  savingLabel,
  isSubmitting,
  onAutoFill,
}: ProductFormHeaderProps) {
  return (
    <PageHeader
      title={title}
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Products", href: "/admin/products" },
        { label: title },
      ]}
      actions={
        <>
          {onAutoFill && (
            <Button
              type="button"
              variant="outlined"
              colors="primary"
              shape="circle"
              size="sm"
              onClick={onAutoFill}
              startIcon={<Sparkles />}
            >
              Auto-fill
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            shape="circle"
            size="sm"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <Loader2 className="animate-spin" /> : undefined}
          >
            {isSubmitting ? savingLabel : submitLabel}
          </Button>
        </>
      }
    />
  );
}
