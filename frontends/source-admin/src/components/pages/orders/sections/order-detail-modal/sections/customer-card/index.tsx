"use client";

import { Copy, Phone, CreditCard, Truck, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/data-display/avatar";
import { IconButton } from "@/components/ui/inputs/icon-button";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";

interface CustomerCardProps {
  customer: DetailedOrder["customer"];
  paymentMethod: DetailedOrder["paymentMethod"];
}

export function CustomerCard({ customer, paymentMethod }: CustomerCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar
          src={customer.avatarUrl}
          className="size-8 border border-border/80"
          fallbackClassName="bg-primary/10 text-primary font-medium text-xs"
        >
          {customer.initials}
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-foreground truncate">{customer.name}</span>
          <span
            className="text-caption text-muted-foreground truncate hover:underline cursor-pointer"
            onClick={() => copyToClipboard(customer.email, "Email")}
          >
            {customer.email}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-2 text-caption">
          <span className="flex items-center gap-2 text-muted-foreground-lighter font-medium">
            <Phone className="size-4" />
            Phone
          </span>
          <span className="text-muted-foreground font-semibold">{customer.phone}</span>
        </div>
        <div className="flex flex-col gap-2 text-caption">
          <span className="flex items-center gap-2 text-muted-foreground-lighter font-medium">
            <CreditCard className="size-4" />
            Payment Method
          </span>
          <span className="text-muted-foreground font-semibold">{paymentMethod}</span>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-muted/30 p-4 rounded-xl border border-border/40">
        <div className="flex flex-col gap-2 text-caption">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground-lighter font-medium">
              <Truck className="size-4" />
              Shipping Address
            </span>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              shape="circle"
              aria-label="Copy shipping address"
              onClick={() =>
                copyToClipboard(
                  `${customer.shippingAddress.street}, ${customer.shippingAddress.city}`,
                  "Address",
                )
              }
            >
              <Copy className="size-4" />
            </IconButton>
          </div>
          <span className="text-muted-foreground leading-relaxed">
            {customer.shippingAddress.street}
            <br />
            {customer.shippingAddress.city}, {customer.shippingAddress.state}{" "}
            {customer.shippingAddress.postalCode}
            <br />
            {customer.shippingAddress.country}
          </span>
        </div>
        <div className="flex flex-col gap-2 text-caption">
          <span className="flex items-center gap-2 text-muted-foreground-lighter font-medium">
            <ReceiptText className="size-4" />
            Billing Address
          </span>
          <span className="text-muted-foreground leading-relaxed">
            {customer.billingAddress.street}
            <br />
            {customer.billingAddress.city}, {customer.billingAddress.state}{" "}
            {customer.billingAddress.postalCode}
            <br />
            {customer.billingAddress.country}
          </span>
        </div>
      </div>
    </div>
  );
}
