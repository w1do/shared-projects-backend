"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ArrowRight } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay/popover";
import { type AdminNotification } from "@/lib/admin/mocks/notifications";
import { relativeTime } from "@/components/pages/notifications/utils";
import { typeConfig } from "@/components/pages/notifications/config/filters";
import { useNotificationsQuery } from "@/hooks/admin/notifications";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/hooks/admin/notifications";
import { StatusDot } from "@/components/ui/feedback/status-dot";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { cn } from "@/lib/utils";

const RECENT_COUNT = 5;

function CompactRow({
  notification,
  onSelect,
}: {
  notification: AdminNotification;
  onSelect: (id: string, href?: string) => void;
}) {
  const { icon: Icon, tone } = typeConfig[notification.type];

  return (
    <Button
      type="button"
      variant="ghost"
      color="primary"
      size="auto"
      fullWidth
      onClick={() => onSelect(notification.id, notification.href)}
      className={cn(
        "items-start justify-start gap-2 whitespace-normal text-left font-normal active:scale-100",
        !notification.read && "bg-primary/5",
      )}
    >
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-caption font-semibold text-foreground">
            {notification.title}
          </span>
          <span className="shrink-0 text-caption text-muted-foreground-lighter">
            {relativeTime(notification.createdAt)}
          </span>
        </div>
        <span className="truncate text-caption text-muted-foreground">
          {notification.description}
        </span>
      </div>
      {!notification.read && <StatusDot color="primary" size="md" className="mt-2" />}
    </Button>
  );
}

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotificationsQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recent = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, RECENT_COUNT);

  const markRead = (id: string, href?: string) => {
    setOpen(false);
    // Defer mutation + navigation to avoid layout thrash during popover exit.
    setTimeout(() => {
      markReadMutation.mutate(id);
      if (href) {
        router.push(href);
      }
    }, 200);
  };

  const markAllRead = () => markAllMutation.mutate();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton variant="ghost" shape="circle" className="relative" aria-label="Notifications">
          <Bell />
          {unreadCount > 0 && <StatusDot color="error" ping className="absolute right-2 top-2" />}
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border/60 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="contained" color="primary" shape="circle" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="text" color="primary" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 p-2">
          {recent.map((notification) => (
            <CompactRow key={notification.id} notification={notification} onSelect={markRead} />
          ))}
        </div>

        <Button
          component="Link"
          href="/admin/notifications"
          variant="ghost"
          shape="rectangle"
          className="h-auto w-full gap-2 border-t p-4 active:scale-100"
          endIcon={<ArrowRight className="size-4" />}
          onClick={() => setOpen(false)}
        >
          View all notifications
        </Button>
      </PopoverContent>
    </Popover>
  );
}
