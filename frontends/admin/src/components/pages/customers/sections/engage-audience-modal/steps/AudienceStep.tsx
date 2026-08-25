"use client";

import { X } from "lucide-react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";

type AudienceStepProps = {
  customers: DetailedCustomer[];
  onRemove: (id: string) => void;
};

export function AudienceStep({ customers, onRemove }: AudienceStepProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
        <p className="text-body font-medium text-foreground">No customers selected</p>
        <p className="mt-2 text-caption text-muted-foreground">
          Close this dialog and select customers from the directory first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <p className="text-caption font-semibold text-muted-foreground">Estimated reach</p>
        <p className="mt-2 text-heading font-semibold text-foreground">
          {customers.length} customer{customers.length === 1 ? "" : "s"}
        </p>
        <p className="mt-2 text-caption text-muted-foreground-lighter">
          Remove anyone who should not receive this outreach before continuing.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {customers.map((customer) => {
          const gradientId = `engage-audience-${customer.id}`;
          return (
            <div
              key={customer.id}
              className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4"
            >
              <AdminDynamicStyles
                gradients={[
                  { id: gradientId, start: customer.gradient[0], end: customer.gradient[1] },
                ]}
              />
              <Avatar src={customer.avatarUrl} data-admin-gradient={gradientId}>
                {customer.avatar}
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-foreground">{customer.name}</p>
                <p className="mt-2 truncate text-caption text-muted-foreground">{customer.email}</p>
              </div>
              <Badge variant="soft" color="neutral" shape="circle" size="sm">
                {customer.tier}
              </Badge>
              <IconButton
                type="button"
                variant="ghost"
                shape="circle"
                size="sm"
                onClick={() => onRemove(customer.id)}
                aria-label={`Remove ${customer.name}`}
              >
                <X className="size-4" />
              </IconButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
