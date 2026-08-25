import { Skeleton } from "@/components/ui/data-display/skeleton";
import { FormSectionChrome } from "./FormSectionChrome";

/** Mirrors GeneralInfoSection: heading + name/sku/short + rich description. */
export function GeneralInfoSectionSkeleton() {
  return (
    <FormSectionChrome>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </FormSectionChrome>
  );
}

/** Mirrors MediaSection: heading + multi-image uploader area. */
export function MediaSectionSkeleton() {
  return (
    <FormSectionChrome>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    </FormSectionChrome>
  );
}

/** Mirrors PricingSection: heading + 3 price fields + weight + inventory switch. */
export function PricingSectionSkeleton() {
  return (
    <FormSectionChrome>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="border-t border-border/40" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="border-t border-border/40" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <Skeleton className="h-6 w-12 shrink-0 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </FormSectionChrome>
  );
}

/** Mirrors CollectionsSection: small heading + multi-select control. */
export function CollectionsSectionSkeleton() {
  return (
    <FormSectionChrome>
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-64 max-w-full" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </FormSectionChrome>
  );
}

/** Mirrors ContentBlocksSection empty state: heading + dashed empty panel. */
export function ContentBlocksSectionSkeleton() {
  return (
    <FormSectionChrome>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex flex-col gap-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-8 w-28 shrink-0 rounded-full" />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/60 p-12">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
    </FormSectionChrome>
  );
}

/** Mirrors VariantLinksSection: heading + 3 mode option cards. */
export function VariantLinksSectionSkeleton() {
  return (
    <FormSectionChrome>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-xl border border-border/40 bg-muted/40 p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-4 rounded-sm" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </FormSectionChrome>
  );
}
