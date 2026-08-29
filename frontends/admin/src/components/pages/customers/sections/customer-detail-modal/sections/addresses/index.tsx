"use client";

import { MapPin } from "lucide-react";
import type { DetailedCustomer } from "@/lib/admin/types/customers";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CustomerAddressesCardProps {
  customer: DetailedCustomer;
}

export function AddressesSection({ customer }: CustomerAddressesCardProps) {
  const t = useConsoleText();

  return (
    <div className="rounded-2xl border border-border/60 p-4 flex flex-col gap-4">
      <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <MapPin className="size-4 text-muted-foreground-lighter" />
        <span>{t("console.customers.detail.addresses")}</span>
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-caption">
        {/* Shipping */}
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground-lighter font-medium">
            {t("console.customers.detail.shipping-address")}
          </span>
          <div className="p-4 bg-muted rounded-xl border border-border/40 text-muted-foreground leading-relaxed">
            {customer.addresses.shipping.street}
            <br />
            {customer.addresses.shipping.city}
            <br />
            {customer.addresses.shipping.country} - {customer.addresses.shipping.zip}
          </div>
        </div>
        {/* Billing */}
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground-lighter font-medium">
            {t("console.customers.detail.billing-address")}
          </span>
          <div className="p-4 bg-muted rounded-xl border border-border/40 text-muted-foreground leading-relaxed">
            {customer.addresses.billing.street}
            <br />
            {customer.addresses.billing.city}
            <br />
            {customer.addresses.billing.country} - {customer.addresses.billing.zip}
          </div>
        </div>
      </div>
    </div>
  );
}
