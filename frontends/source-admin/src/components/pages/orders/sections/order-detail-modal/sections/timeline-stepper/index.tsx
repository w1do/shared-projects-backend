"use client";

import { Check } from "lucide-react";
import type { OrderTimelineEvent } from "@/lib/admin/mocks/orders";

interface TimelineStepperProps {
  timeline: OrderTimelineEvent[];
}

export function TimelineStepper({ timeline }: TimelineStepperProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <p className="mt-4 pl-2 text-caption text-muted-foreground-lighter">
        No activity has been recorded yet.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col pl-2">
      {timeline.map((step, idx) => (
        <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Vertical Line Connector */}
          {idx < timeline.length - 1 && (
            <div
              className={`absolute top-6 admin-timeline-connector ${
                step.done && timeline[idx + 1].done
                  ? "bg-primary"
                  : "admin-timeline-connector-pending"
              }`}
            />
          )}

          {/* Bullet circle indicator */}
          <div
            className={`relative z-10 flex size-6 items-center justify-center rounded-full border ${
              step.done
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-border text-muted-foreground-lighter"
            }`}
          >
            {step.done ? (
              <Check className="size-4" strokeWidth={3} />
            ) : (
              <span className="size-2 rounded-full bg-muted-foreground-lighter/50" />
            )}
          </div>

          {/* Step Description */}
          <div className="flex flex-col gap-2 text-caption">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${step.done ? "text-foreground" : "text-muted-foreground-lighter"}`}
              >
                {step.title}
              </span>
              <span className="font-mono text-muted-foreground-lighter">{step.timestamp}</span>
            </div>
            <span className="max-w-xs leading-relaxed text-muted-foreground">
              {step.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
