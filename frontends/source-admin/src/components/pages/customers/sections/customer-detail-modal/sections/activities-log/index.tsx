"use client";

import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CustomerActivitiesLogProps {
  customer: DetailedCustomer;
}

export function ActivitiesLogSection({ customer }: CustomerActivitiesLogProps) {
  const t = useConsoleText();

  return (
    <div className="flex flex-col gap-4">
      <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
        {t("console.customers.detail.activity")}
      </span>
      <div className="flex flex-col">
        {customer.activities.map((act, idx) => {
          const isLast = idx === customer.activities.length - 1;
          return (
            <div key={idx} className="flex gap-4">
              {/* Timeline graphic indicator */}
              <div className="flex flex-col items-center">
                {/* Dot size 8px (size-2), margin-top 8px (mt-2) */}
                <div className="size-2 bg-primary rounded-full border border-card mt-2 shrink-0" />
                {/* Vertical line with margin-y 8px (my-2) */}
                {!isLast && <div className="w-2 grow border-r border-border/80 my-2" />}
              </div>

              {/* Content */}
              <div className={`flex flex-col gap-2 pb-8 text-caption ${isLast ? "pb-0" : ""}`}>
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-foreground">{act.title}</span>
                  <span className="text-caption text-muted-foreground-lighter">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{act.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
