"use client";

import * as React from "react";
import { Badge } from "@/components/ui/data-display/badge";
import { Sparkles, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BrandPreviewHeaderProps {
  name: string;
  monogram: string;
  origin: string;
  status: string;
  logo: string[];
  thumbnail: string;
  banner: string[];
  isFeatured: boolean;
  revenue: number;
  share: number;
  flagEmoji: string;
}

export function BrandPreviewHeader({
  name,
  monogram,
  origin,
  status,
  logo,
  thumbnail,
  banner,
  isFeatured,
  revenue,
  share,
  flagEmoji,
}: BrandPreviewHeaderProps) {
  const thumbnailImage = thumbnail || logo[0];

  return (
    <>
      <div className="relative h-48 w-full bg-gradient-to-tr from-accent via-accent/60 to-muted/30 md:h-64">
        <div className="absolute inset-0 overflow-hidden">
          {banner && banner[0] ? (
            <img
              src={banner[0]}
              alt={`${name} Cover Banner`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <Sparkles className="size-12 text-brand-accent/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/10 to-transparent" />
        </div>

        <div className="absolute left-6 top-4 z-10 flex items-center gap-2">
          <Badge
            variant="soft"
            shape="circle"
            colors={status === "Active" ? "success" : status === "Draft" ? "accent" : "muted"}
          >
            {status}
          </Badge>
          {isFeatured && (
            <Badge
              variant="soft"
              shape="circle"
              colors="accent"
              startIcon={<Star className="fill-current" />}
            >
              Featured
            </Badge>
          )}
        </div>

        <div className="absolute -bottom-12 right-6 z-10 flex items-end gap-4">
          <div className="relative size-48 shrink-0">
            <div className="flex size-full rounded-xl items-center justify-center overflow-hidden bg-background border border-border/40 shadow-subtle-2">
              {thumbnailImage ? (
                <img
                  src={thumbnailImage}
                  alt={`${name} Thumbnail`}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-heading-lg text-brand-accent font-serif font-semibold">
                  {monogram}
                </span>
              )}
            </div>
            {logo && logo[0] && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 flex w-30 aspect-logo items-center justify-center overflow-hidden border border-border bg-background shadow-subtle rounded-lg">
                <img src={logo[0]} alt={`${name} Logo`} className="size-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 border-b border-border/40 bg-background px-6 pb-4 pt-4 md:flex-row md:items-end md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-heading-lg md:text-display text-foreground font-semibold tracking-tight leading-none">
              {name}
            </h2>
          </div>
          {origin && (
            <div className="flex items-center gap-6 mt-2 text-caption text-muted-foreground">
              <span className="text-base">{flagEmoji}</span>
              <span>
                Maison Origin: <strong>{origin}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-caption text-muted-foreground-lighter block">Market Share</span>
            <span className="text-body-lg font-semibold text-foreground font-openrunde">
              {share}%
            </span>
          </div>
          <div className="h-6 w-1 bg-border" />
          <div className="text-right">
            <span className="text-caption text-muted-foreground-lighter block">Total Revenue</span>
            <span className="text-body-lg font-semibold text-foreground font-openrunde">
              {formatCurrency(revenue)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
