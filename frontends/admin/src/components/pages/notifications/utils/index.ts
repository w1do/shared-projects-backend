import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import type { TypeFilter } from "../config/filters";

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Bucket label for grouping the feed by recency. */
function groupLabel(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays < 1) return "Today";
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return "Earlier this week";
  return "Older";
}

export interface NotificationGroup {
  label: string;
  items: AdminNotification[];
}

export interface FilterParams {
  typeFilter: TypeFilter;
  unreadOnly: boolean;
}

/** Filter then group notifications into recency buckets, newest first. */
export function groupNotifications(
  notifications: AdminNotification[],
  { typeFilter, unreadOnly }: FilterParams,
): NotificationGroup[] {
  const filtered = notifications.filter((n) => {
    const matchesType = typeFilter === "all" || n.type === typeFilter;
    const matchesRead = !unreadOnly || !n.read;
    return matchesType && matchesRead;
  });

  const order = ["Today", "Yesterday", "Earlier this week", "Older"];
  const buckets = new Map<string, AdminNotification[]>();
  for (const item of filtered) {
    const label = groupLabel(item.createdAt);
    const list = buckets.get(label) ?? [];
    list.push(item);
    buckets.set(label, list);
  }

  return order
    .filter((label) => buckets.has(label))
    .map((label) => ({
      label,
      items: (buckets.get(label) ?? []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    }));
}
