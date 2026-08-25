import { Skeleton } from "@/components/ui/data-display/skeleton";
import { FormSectionChrome } from "./FormSectionChrome";

/** Mirrors ThumbnailSection: title + square uploader. */
export function ThumbnailSectionSkeleton() {
  return (
    <FormSectionChrome>
      <Skeleton className="h-4 w-36" />
      <Skeleton className="aspect-square w-full rounded-xl" />
    </FormSectionChrome>
  );
}

/** Mirrors StatusSection: single status select. */
export function StatusSectionSkeleton() {
  return (
    <FormSectionChrome>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </FormSectionChrome>
  );
}

/** Mirrors SidebarSettings: organization heading + brand/category selects. */
export function SidebarSettingsSkeleton() {
  return (
    <FormSectionChrome>
      <Skeleton className="h-4 w-28" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </FormSectionChrome>
  );
}
