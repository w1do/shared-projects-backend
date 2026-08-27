"use client";

import { Mail, Phone, User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  customerSkinConcernLabel,
  customerSkinTypeLabel,
} from "@/components/pages/customers/utils";

interface CustomerContactCardProps {
  customer: DetailedCustomer;
}

export function ContactSection({ customer }: CustomerContactCardProps) {
  const t = useConsoleText();
  const skinTypeSystemColorMap: Record<
    DetailedCustomer["skinProfile"]["skinType"],
    "error" | "primary" | "success" | "warning" | "neutral"
  > = {
    Sensitive: "error",
    Dry: "primary",
    Oily: "success",
    Combination: "warning",
    Normal: "neutral",
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Contact Information */}
      <div className="rounded-2xl border border-border/60 p-4 flex flex-col gap-4">
        <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <User className="size-4 text-muted-foreground-lighter" />
          <span>{t("console.customers.detail.contact")}</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-caption">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground-lighter" />
            <span className="text-muted-foreground">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-muted-foreground-lighter" />
            <span className="text-muted-foreground">{customer.phone}</span>
          </div>
        </div>
      </div>

      {/* Skin & Beauty Profile */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col gap-4">
        <span className="text-caption font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span>{t("console.customers.detail.skin-profile")}</span>
        </span>
        <div className="flex flex-col gap-4 text-caption">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground-lighter font-medium">
              {t("console.customers.detail.skin-type")}
            </span>
            <Badge
              variant="soft"
              shape="circle"
              size="sm"
              color={skinTypeSystemColorMap[customer.skinProfile.skinType]}
              className="font-normal border-transparent"
            >
              {customerSkinTypeLabel(customer.skinProfile.skinType)}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground-lighter font-medium">
              {t("console.customers.detail.concerns")}
            </span>
            <div className="flex flex-wrap gap-2">
              {customer.skinProfile.skinConcerns.map((concern, idx) => (
                <Badge key={idx} variant="contained" shape="circle" size="sm" color="surface">
                  {customerSkinConcernLabel(concern)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
