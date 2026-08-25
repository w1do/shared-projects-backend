"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import { relativeTime } from "@/components/pages/notifications/utils";
import { typeConfig } from "@/components/pages/notifications/config/filters";

interface NotificationItemProps {
  notification: AdminNotification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const { icon: Icon, tone } = typeConfig[notification.type];

  return (
    <div
      onClick={() => !notification.read && onMarkRead(notification.id)}
      className={`flex gap-4 rounded-2xl border p-4 transition-colors ${
        notification.read
          ? "border-transparent hover:bg-muted/40"
          : "border-border/60 bg-primary/5 hover:bg-primary/10 cursor-pointer"
      }`}
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon className="size-4" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs font-semibold text-foreground">{notification.title}</span>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-caption text-muted-foreground-lighter">
              {relativeTime(notification.createdAt)}
            </span>
            {!notification.read && <span className="size-2 rounded-full bg-primary" />}
          </div>
        </div>
        <p className="text-caption text-muted-foreground">{notification.description}</p>
        {notification.href && (
          <Link
            href={notification.href}
            onClick={() => onMarkRead(notification.id)}
            className="mt-2 flex w-fit items-center gap-2 text-caption font-semibold text-primary hover:underline"
          >
            {notification.actionLabel ?? "View"}
            <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
