"use client";

import { BellOff } from "lucide-react";
import type { NotificationGroup } from "@/components/pages/notifications/utils";
import { NotificationItem } from "../notification-item";

interface NotificationsFeedProps {
  groups: NotificationGroup[];
  onMarkRead: (id: string) => void;
}

export function NotificationsFeed({ groups, onMarkRead }: NotificationsFeedProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/60 bg-card p-16 text-center shadow-subtle-3">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <BellOff className="size-6 text-primary" />
        </div>
        <div>
          <p className="font-openrunde text-heading-sm text-foreground">You're all caught up</p>
          <p className="mt-2 text-caption text-muted-foreground">
            No notifications match the current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-4">
          <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground-lighter">
            {group.label}
          </span>
          <div className="flex flex-col gap-2 rounded-3xl border border-border/60 bg-card p-2 shadow-subtle-3">
            {group.items.map((item) => (
              <NotificationItem key={item.id} notification={item} onMarkRead={onMarkRead} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
