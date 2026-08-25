"use client";

import { Skeleton } from "@/components/ui/data-display/skeleton";
import { Card } from "@/components/ui/data-display/card";

export function TeamLoadingState() {
  return (
    <div className="flex flex-col gap-6 p-6" aria-busy="true" aria-live="polite">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full mt-2 rounded-sm" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full shrink-0" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card
            key={i}
            className="flex items-center gap-4 p-4 bg-card border border-border/40 rounded-3xl relative shadow-subtle"
          >
            {/* Avatar Skeleton (size-20) */}
            <Skeleton className="shrink-0 rounded-2xl size-20" />

            {/* Text and badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32 rounded-sm" />
              </div>
              <Skeleton className="h-4 w-48 rounded-sm mt-1" />
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
