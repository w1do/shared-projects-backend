"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

export interface ProgressProps extends React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> {
  size?: "sm" | "default" | "lg";
  colors?: "default" | "primary" | "destructive";
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, size = "default", colors = "default", ...props }, ref) => {
    const progressId = React.useId().replace(/:/g, "");
    const progressValue = Math.min(100, Math.max(0, value || 0));
    const progressOffset = 100 - progressValue;

    // Map size to corresponding height classes
    const sizeClasses = {
      sm: "h-1",
      default: "h-2",
      lg: "h-1",
    };

    // Map colors according to the Steep system
    const rootColors = {
      default: "bg-muted",
      primary: "bg-primary/20",
      destructive: "bg-muted",
    };

    const indicatorColors = {
      default: "bg-primary",
      primary: "bg-primary",
      destructive: "bg-destructive",
    };

    return (
      <ProgressPrimitive.Root
        ref={ref}
        data-ui-progress={progressId}
        className={cn(
          "relative w-full overflow-hidden rounded-full transition-all",
          sizeClasses[size],
          rootColors[colors],
          className,
        )}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `[data-ui-progress="${progressId}"] { --ui-progress-offset: ${progressOffset}%; }`,
          }}
        />
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all -translate-x-(--ui-progress-offset)",
            indicatorColors[colors],
          )}
        />
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
