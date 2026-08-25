"use client";

import { useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import { Select } from "@/components/ui/inputs/select";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import { useNotificationsPage } from "@/hooks/admin/notifications";
import { NotificationsFeed } from "./sections/notifications-feed";
import { TYPE_OPTIONS, type TypeFilter } from "./config/filters";
import { NotificationsLoadingState } from "./loading/NotificationsLoadingState";
import { cn } from "@/lib/utils";

/** Notifications page — list/mark-read via useNotificationsPage (TanStack Query). */
export default function NotificationsPage({
  initialNotifications,
}: {
  initialNotifications?: AdminNotification[];
} = {}) {
  const {
    groups,
    unreadCount,
    typeFilter,
    setTypeFilter,
    unreadOnly,
    setUnreadOnly,
    markRead,
    markAllRead,
    isPending,
  } = useNotificationsPage(initialNotifications !== undefined ? { initialNotifications } : {});

  const [isMockLoading, setIsMockLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMockLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = isPending || isMockLoading;

  const headerDescription =
    unreadCount > 0
      ? `You have ${unreadCount} new notifications. Stay on top of orders, inventory, customers, and system events.`
      : "Stay on top of orders, inventory, customers, and system events as they happen.";

  return (
    <div className="relative min-h-screen w-full">
      {/* Skeleton Loading Layer (On top, blocks interactions when active) */}
      <div
        className={cn(
          "transition-opacity duration-500 absolute inset-x-0 top-0 z-50 bg-background pointer-events-none",
          showSkeleton ? "opacity-100" : "opacity-0 invisible",
        )}
      >
        <NotificationsLoadingState />
      </div>

      {/* Actual Content Layer (Pre-rendered in the background so everything is ready) */}
      <div
        className={cn(
          "transition-opacity duration-500",
          showSkeleton ? "opacity-0 pointer-events-none invisible" : "opacity-100",
        )}
      >
        <div className="flex flex-col gap-10">
          <PageHeader
            title="Notifications"
            description={headerDescription}
            breadcrumbItems={[
              { label: "Admin", href: "/admin" },
              { label: "Workspace", href: "/admin/notifications" },
              { label: "Notifications" },
            ]}
            actions={
              <Button
                type="button"
                variant="outlined"
                shape="circle"
                size="lg"
                startIcon={<CheckCheck />}
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="text-xs"
              >
                Mark all as read
              </Button>
            }
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ButtonGroup
              options={[
                { label: "All", value: "all" },
                { label: "Unread", value: "unread" },
              ]}
              value={unreadOnly ? "unread" : "all"}
              onChange={(value) => setUnreadOnly(value === "unread")}
              size="small"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              options={TYPE_OPTIONS}
              placeholder="All Types"
              className="w-40"
            />
          </div>

          <NotificationsFeed groups={groups} onMarkRead={markRead} />
        </div>
      </div>
    </div>
  );
}
