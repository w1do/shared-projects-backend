"use client";

import { Separator } from "@/components/ui/data-display/separator";

interface FinancialBreakdownProps {
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
}

export function FinancialBreakdown({
  subtotal,
  shippingFee,
  tax,
  discount,
  total,
}: FinancialBreakdownProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-4">
      <span className="text-caption font-semibold uppercase tracking-wider text-primary">
        Financial Breakdown
      </span>
      <div className="flex flex-col gap-2 text-caption">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Shipping Fee</span>
          <span>${shippingFee.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Tax (VAT)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-primary font-medium">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span className="font-sans uppercase tracking-wider">Grand Total</span>
          <span className="text-sm font-semibold">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
