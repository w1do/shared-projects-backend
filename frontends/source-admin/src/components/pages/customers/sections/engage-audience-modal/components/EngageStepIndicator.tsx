"use client";

import { cn } from "@/lib/utils";
import { engageModalSteps, type EngageModalStep } from "../types";

type EngageStepIndicatorProps = {
  step: EngageModalStep;
};

export function EngageStepIndicator({ step }: EngageStepIndicatorProps) {
  const activeIndex = engageModalSteps.find((item) => item.id === step)?.index ?? 1;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {engageModalSteps.map((item, index) => {
        const isActive = item.id === step;
        const isDone = item.index < activeIndex;
        return (
          <div key={item.id} className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-4 py-2 text-caption font-semibold",
                isActive && "bg-primary text-primary-foreground",
                isDone && "bg-accent text-brand-accent",
                !isActive && !isDone && "bg-muted text-muted-foreground",
              )}
            >
              {item.index} · {item.label}
            </span>
            {index < engageModalSteps.length - 1 ? (
              <span className="h-1 w-4 rounded-full bg-border sm:w-8" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
