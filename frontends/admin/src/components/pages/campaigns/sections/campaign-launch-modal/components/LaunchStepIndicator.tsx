"use client";

import { Badge } from "@/components/ui/data-display/badge";
import { launchModalSteps, type LaunchModalStep } from "../types";

type LaunchStepIndicatorProps = {
  step: LaunchModalStep;
};

export function LaunchStepIndicator({ step }: LaunchStepIndicatorProps) {
  const activeIndex = launchModalSteps.find((item) => item.id === step)?.index ?? 1;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {launchModalSteps.map((item, index) => {
        const isActive = item.id === step;
        const isDone = item.index < activeIndex;

        const badgeProps = isActive
          ? ({ variant: "contained", color: "primary" } as const)
          : isDone
            ? ({ variant: "soft", color: "secondary" } as const)
            : ({ variant: "soft", color: "neutral" } as const);

        return (
          <div key={item.id} className="flex items-center gap-2">
            <Badge {...badgeProps} shape="circle" size="lg">
              {item.index} · {item.label}
            </Badge>
            {index < launchModalSteps.length - 1 ? (
              <span className="h-1 w-4 rounded-full bg-border sm:w-8" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
