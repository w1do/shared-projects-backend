"use client";

import { ArrowLeft, Check, Loader2, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { useSidebar } from "@/components/ui/navigation/sidebar";

export type FormStickyHeaderProps = {
  isSticky: boolean;
  title: string;
  backHref: string;
  backLabel?: string;
  submitLabel: string;
  submitLabelShort?: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  /** Brands/categories use check; blogs/products omit. */
  submitIcon?: "check" | "none";
  onAutoFill?: () => void;
  autoFillLabel?: string;
  autoFillDisabled?: boolean;
  onPreview?: () => void;
  previewLabel?: string;
  extraActions?: React.ReactNode;
  disableBackWhileSubmitting?: boolean;
};

export function FormStickyHeader({
  isSticky,
  title,
  backHref,
  backLabel = "Back",
  submitLabel,
  submitLabelShort,
  submittingLabel = "Saving…",
  isSubmitting = false,
  submitIcon = "none",
  onAutoFill,
  autoFillLabel = "Auto-fill",
  autoFillDisabled,
  onPreview,
  previewLabel = "Preview",
  extraActions,
  disableBackWhileSubmitting = false,
}: FormStickyHeaderProps) {
  const { state, isMobile } = useSidebar();
  const short = submitLabelShort ?? submitLabel;

  const leftOffset = isMobile
    ? "0px"
    : state === "collapsed"
      ? "var(--sidebar-width-icon)"
      : "var(--sidebar-width)";

  return (
    <div
      style={{ left: leftOffset }}
      className={`fixed top-16 right-0 z-30 border-b border-border/40 bg-background/95 px-4 py-2 backdrop-blur-md transition-all duration-300 md:px-24 flex items-center justify-between shadow-subtle ${
        isSticky
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        <IconButton
          component="Link"
          href={backHref}
          variant="outlined"
          colors="surface"
          size="sm"
          shape="circle"
          title={backLabel}
          disabled={disableBackWhileSubmitting && isSubmitting}
        >
          <ArrowLeft size={16} />
        </IconButton>
        <span className="max-w-40 truncate font-openrunde text-sm font-medium leading-none text-foreground">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {onAutoFill && (
          <Button
            type="button"
            variant="outlined"
            colors="primary"
            shape="circle"
            size="sm"
            onClick={onAutoFill}
            disabled={autoFillDisabled || isSubmitting}
            startIcon={<Sparkles />}
          >
            <span className="hidden md:inline">{autoFillLabel}</span>
            <span className="inline md:hidden">Fill</span>
          </Button>
        )}

        {onPreview && (
          <Button
            type="button"
            variant="outlined"
            colors="surface"
            shape="circle"
            size="sm"
            onClick={onPreview}
            disabled={isSubmitting}
            startIcon={<Eye />}
          >
            <span className="hidden md:inline">{previewLabel}</span>
          </Button>
        )}

        {extraActions}

        <Button
          type="submit"
          variant="contained"
          shape="circle"
          size="sm"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : submitIcon === "check" ? (
              <Check />
            ) : undefined
          }
        >
          {isSubmitting ? (
            submittingLabel
          ) : (
            <>
              <span className="hidden sm:inline">{submitLabel}</span>
              <span className="inline sm:hidden">{short}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
