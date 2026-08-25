"use client";

import Link from "next/link";
import { GitFork } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";

interface VariantLinksSectionProps {
  productId?: string;
}

export function VariantLinksSection({ productId }: VariantLinksSectionProps) {
  if (!productId) {
    return (
      <Card variant="form-section" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 border-b border-border/40 pb-4">
          <h2 className="text-heading font-semibold text-foreground leading-tight">
            Product Variants
          </h2>
          <p className="text-xs text-muted-foreground-lighter">
            Configure product options and variant items.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-muted/30 border border-border/40 text-center flex flex-col gap-2 items-center justify-center">
          <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground-lighter mb-1">
            <GitFork size={18} />
          </div>
          <span className="text-xs font-semibold text-foreground">
            Variants can be configured after creation
          </span>
          <p className="text-caption text-muted-foreground-lighter max-w-sm leading-normal">
            Save this product first as a standalone item, then you will be able to manage variant
            options, prices, and stock.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="form-section" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-border/40 pb-4">
        <h2 className="text-heading font-semibold text-foreground leading-tight">
          Product Variants
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          Configure dimensions, pricing, and stock levels for all variant items.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-muted/30 border border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-4 items-start max-w-xl">
          <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center text-primary shrink-0 mt-1">
            <GitFork size={18} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-foreground">Manage Variant Catalog</span>
            <p className="text-caption text-muted-foreground-lighter leading-normal">
              This product supports multiple option dimensions (like volume, finish, or skin type).
              Go to the Variants manager to modify SKUs, prices, stock levels, or status.
            </p>
          </div>
        </div>

        <Link
          href={`/admin/variants?product=${productId}`}
          passHref
          className="shrink-0 self-start sm:self-center"
        >
          <Button type="button" colors="primary" className="font-semibold">
            Configure Variants
          </Button>
        </Link>
      </div>
    </Card>
  );
}
