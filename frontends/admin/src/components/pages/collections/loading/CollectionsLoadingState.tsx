import { CollectionsHeaderSkeleton } from "./header/CollectionsHeaderSkeleton";
import { CollectionsPanelSkeleton } from "./panel/CollectionsPanelSkeleton";
import { CollectionsStatsSkeleton } from "./stats/CollectionsStatsSkeleton";

/**
 * Full-page collections skeleton that mirrors CollectionsPage layout nesting.
 * Shown while useCollectionsPage / useCollectionsQuery is pending (mock delay or API latency).
 */
export function CollectionsLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <CollectionsHeaderSkeleton />
      <CollectionsStatsSkeleton />
      <CollectionsPanelSkeleton />
    </div>
  );
}
