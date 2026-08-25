import { Skeleton } from "@/components/ui/data-display/skeleton";

export function SettingsGeneralSkeleton() {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 text-foreground">
      <header className="flex items-start gap-4 border-b border-border/50 p-6">
        {/* Icon Skeleton */}
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex flex-col gap-2 flex-1">
          {/* Title Skeleton */}
          <Skeleton className="h-6 w-32" />
          {/* Description Skeleton */}
          <div className="flex flex-col gap-2 mt-1">
            <Skeleton className="h-4 w-3/4 max-w-md" />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Input: Store name */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Input: Support email */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Input: Phone */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Select: Currency */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Select: Timezone */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Select: Weight unit */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Input: Storefront URL */}
          <div className="sm:col-span-2 flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
        {/* Textarea: Store description */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      <footer className="flex items-center justify-end gap-4 border-t border-border/50 bg-muted/20 px-6 py-4">
        <Skeleton className="h-10 w-32 rounded-full" />
      </footer>
    </section>
  );
}
