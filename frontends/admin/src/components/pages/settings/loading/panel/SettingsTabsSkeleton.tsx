import { Skeleton } from "@/components/ui/data-display/skeleton";

const SKELETON_TABS_WIDTHS = ["w-12", "w-16", "w-14", "w-12", "w-20", "w-14"];

export function SettingsTabsSkeleton() {
  return (
    <div className="flex border-b border-border/60 gap-6 overflow-x-auto scrollbar-none">
      {SKELETON_TABS_WIDTHS.map((width, idx) => (
        <div key={idx} className="flex items-center gap-2 px-1 py-4 border-b-2 border-transparent">
          <Skeleton className="size-4 shrink-0 rounded" />
          <Skeleton className={`h-4 ${width}`} />
        </div>
      ))}
    </div>
  );
}
