"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { useConsoleText } from "@/lib/admin/use-console-text";

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
  const t = useConsoleText();
  return (
    <PageHeader
      title={title}
      breadcrumbItems={[
        { label: t("console.common.breadcrumb-admin"), href: "/admin" },
        { label: t("console.nav.group.workspace"), href: "/admin/blogs" },
        { label: t("console.nav.blogs"), href: "/admin/blogs" },
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
              {t("console.blogs.autofill")}
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
