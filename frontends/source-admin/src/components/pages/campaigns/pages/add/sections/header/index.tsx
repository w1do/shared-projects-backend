"use client";

import React from "react";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";

interface AddCampaignHeaderProps {
  isSubmitting: boolean;
  onAutoFill?: () => void;
  title?: string;
  submitLabel?: string;
}

export function AddCampaignHeader({
  isSubmitting,
  onAutoFill,
  title = "Create Campaign",
  submitLabel = "Launch Campaign",
}: AddCampaignHeaderProps) {
  return (
    <PageHeader
      title={title}
      description="Launch a new marketing campaign to drive seasonal sales, aligning specific discounts and Collections."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Commerce", href: "/admin/orders" },
        { label: "Campaigns", href: "/admin/campaigns" },
        { label: title },
      ]}
      actions={
        <>
          {onAutoFill && (
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
          )}

          <Button
            type="submit"
            variant="contained"
            shape="circle"
            startIcon={<Check />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </>
      }
    />
  );
}
