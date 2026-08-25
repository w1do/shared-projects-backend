"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface BlogFormHeaderProps {
  title: string;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  onAutoFill?: () => void;
}

export function BlogFormHeader({
  title,
  submitLabel,
  submittingLabel,
  isSubmitting,
  onAutoFill,
}: BlogFormHeaderProps) {
  return (
    <PageHeader
      title={title}
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Workspace", href: "/admin/blogs" },
        { label: "Blogs", href: "/admin/blogs" },
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
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </>
      }
    />
  );
}
