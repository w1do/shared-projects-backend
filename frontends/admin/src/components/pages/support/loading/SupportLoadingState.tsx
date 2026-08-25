import { SupportHeaderSkeleton } from "./header/SupportHeaderSkeleton";
import { SupportStatsSkeleton } from "./stats/SupportStatsSkeleton";
import { SupportInboxSkeleton } from "./panel/SupportInboxSkeleton";

/**
 * Full-page support skeleton that mirrors SupportPage layout nesting
 * (header → stats → 2-column inbox). Shown while useSupportPage is pending.
 */
export function SupportLoadingState() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-live="polite">
      <SupportHeaderSkeleton />
      <SupportStatsSkeleton />
      <SupportInboxSkeleton />
    </div>
  );
}
