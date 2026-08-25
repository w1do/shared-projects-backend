"use client";

import { Skeleton } from "@/components/ui/data-display/skeleton";
import { Separator } from "@/components/ui/data-display/separator";

export function OrderDetailLoadingState() {
  return (
    <div
      className="py-6 grid grid-cols-1 md:grid-cols-12 gap-8"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Left Column */}
      <div className="md:col-span-7 flex flex-col gap-6">
        {/* Purchased Items */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-sm" />
            <Skeleton className="h-4 w-16 rounded-sm" />
          </div>

          <div className="flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="size-10 rounded-lg shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-40 max-w-full rounded-sm" />
                    <Skeleton className="h-2 w-24 rounded-sm" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-4 w-28 rounded-sm" />
                  <Skeleton className="h-4 w-12 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Shipment & Logistics */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-36 rounded-sm" />
          <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/40">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-2 w-12 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Skeleton className="h-2 w-20 rounded-sm" />
              <Skeleton className="h-4 w-32 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Calculations Card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-4">
          <Skeleton className="h-4 w-36 rounded-sm" />
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-2 w-16 rounded-sm" />
              <Skeleton className="h-2 w-12 rounded-sm" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-2 w-20 rounded-sm" />
              <Skeleton className="h-2 w-12 rounded-sm" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-2 w-16 rounded-sm" />
              <Skeleton className="h-2 w-12 rounded-sm" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <Skeleton className="h-4 w-16 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="md:col-span-5 flex flex-col gap-6">
        {/* Customer Profile Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28 rounded-sm" />
              <Skeleton className="h-2 w-36 rounded-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-16 rounded-sm" />
              <Skeleton className="h-4 w-28 rounded-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <Skeleton className="h-4 w-20 rounded-sm" />
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-muted/30 p-4 rounded-xl border border-border/40">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <div className="flex flex-col gap-2 mt-1">
                <Skeleton className="h-2 w-full rounded-sm" />
                <Skeleton className="h-2 w-4/5 rounded-sm" />
                <Skeleton className="h-2 w-2/3 rounded-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <div className="flex flex-col gap-2 mt-1">
                <Skeleton className="h-2 w-full rounded-sm" />
                <Skeleton className="h-2 w-4/5 rounded-sm" />
                <Skeleton className="h-2 w-2/3 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Shipment Timeline Stepper */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24 rounded-sm" />

          <div className="flex flex-col gap-6 pl-2 relative">
            <div className="absolute top-6 admin-timeline-connector admin-timeline-connector-pending" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 relative">
                <Skeleton className="size-6 rounded-full shrink-0 z-10 bg-muted-darker" />
                <div className="flex flex-col gap-2 flex-1 pt-2">
                  <Skeleton className="h-4 w-40 rounded-sm" />
                  <Skeleton className="h-2 w-48 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
