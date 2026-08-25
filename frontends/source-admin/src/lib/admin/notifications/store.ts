/**
 * Versioned localStorage store for admin notifications (mock backend).
 */
import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import { mockNotifications } from "@/lib/admin/mocks/notifications";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const seed: AdminNotification[] = [...mockNotifications];
const store = createVersionedLocalStore<AdminNotification>({
  storageKey: storageKey("notifications"),
  seedVersionKey: storageKey("notifications-seed-version"),
  seedVersion: "1",
  seed,
});

export function readStoredNotifications(): AdminNotification[] {
  return store.read();
}

export function saveStoredNotifications(items: AdminNotification[]) {
  store.save(items);
}

export function markStoredNotificationRead(id: string) {
  saveStoredNotifications(
    readStoredNotifications().map((n) => (n.id === id ? { ...n, read: true } : n)),
  );
}

export function markAllStoredNotificationsRead() {
  saveStoredNotifications(readStoredNotifications().map((n) => ({ ...n, read: true })));
}
