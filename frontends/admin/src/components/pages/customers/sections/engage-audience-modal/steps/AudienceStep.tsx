"use client";

import { X } from "lucide-react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { customerTierLabel } from "@/components/pages/customers/utils";

type AudienceStepProps = {
  customers: DetailedCustomer[];
  onRemove: (id: string) => void;
};

export function AudienceStep({ customers, onRemove }: AudienceStepProps) {
  const t = useConsoleText();

  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
        <p className="text-body font-medium text-foreground">
          {t("console.engage.audience.empty-title")}
        </p>
        <p className="mt-2 text-caption text-muted-foreground">
          {t("console.engage.audience.empty-hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <p className="text-caption font-semibold text-muted-foreground">
          {t("console.engage.audience.reach")}
        </p>
        <p className="mt-2 text-heading font-semibold text-foreground">
          {t("console.engage.audience.reach-count").replace("{count}", String(customers.length))}
        </p>
        <p className="mt-2 text-caption text-muted-foreground-lighter">
          {t("console.engage.audience.reach-hint")}
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
                  {
                    id: gradientId,
                    start: customer.gradient[0],
                    end: customer.gradient[1],
                  },
                ]}
              />
              <Avatar src={customer.avatarUrl} data-admin-gradient={gradientId}>
                {customer.avatar}
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-foreground">{customer.name}</p>
                <p className="mt-2 truncate text-caption text-muted-foreground">{customer.email}</p>
              </div>
              {customer.tier && (
                <Badge variant="soft" color="neutral" shape="circle" size="sm">
                  {customerTierLabel(customer.tier)}
                </Badge>
              )}
              <IconButton
                type="button"
                variant="ghost"
                shape="circle"
                size="sm"
                onClick={() => onRemove(customer.id)}
                aria-label={t("console.engage.audience.remove").replace("{name}", customer.name)}
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
