import { NotificationsHeaderSkeleton } from "./header/NotificationsHeaderSkeleton";
import { NotificationsFeedSkeleton } from "./panel/NotificationsFeedSkeleton";
import { NotificationsToolbarSkeleton } from "./panel/NotificationsToolbarSkeleton";

/**
 * Full-page notifications skeleton that mirrors NotificationsPage layout nesting
 * (header → filters → grouped feed). Shown while useNotificationsPage is pending.
 */
export function NotificationsLoadingState() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-live="polite">
      <NotificationsHeaderSkeleton />
      <NotificationsToolbarSkeleton />
      <NotificationsFeedSkeleton />
    </div>
  );
}
