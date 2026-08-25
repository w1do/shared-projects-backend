import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import {
  markAllStoredNotificationsRead,
  markStoredNotificationRead,
  readStoredNotifications,
} from "@/lib/admin/notifications/store";
import { adminMutations, getAdminNotifications } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";

export async function listNotifications(): Promise<AdminNotification[]> {
  if (!shouldUseAdminApi()) {
    return readStoredNotifications();
  }
  return getAdminNotifications();
}

export async function markNotificationRead(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.markNotificationRead(id);
    return;
  }
  markStoredNotificationRead(id);
}

export async function markAllNotificationsRead(): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.markAllNotificationsRead();
    return;
  }
  markAllStoredNotificationsRead();
}
