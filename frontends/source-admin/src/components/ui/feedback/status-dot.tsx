import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusDotVariants = cva("relative inline-flex rounded-full shrink-0", {
  variants: {
    color: {
      primary: "bg-primary",
      secondary: "bg-brand-accent",
      surface: "bg-background",
      warning: "bg-warning",
      info: "bg-info",
      error: "bg-destructive",
      success: "bg-success",
      neutral: "bg-muted-foreground-lighter",
      overlay: "bg-primary-foreground",
    },
    size: {
      sm: "size-1.5",
      md: "size-2",
      lg: "size-3",
    },
  },
  defaultVariants: {
    color: "success",
    size: "md",
  },
});

const pingVariants = cva(
  "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
  {
    variants: {
      color: {
        primary: "bg-primary/75",
        secondary: "bg-brand-accent/75",
        surface: "bg-background/75",
        warning: "bg-warning/75",
        info: "bg-info/75",
        error: "bg-destructive/75",
        success: "bg-success/75",
        neutral: "bg-muted-foreground-lighter/75",
        overlay: "bg-primary-foreground/75",
      },
    },
    defaultVariants: {
      color: "success",
    },
  },
);

export interface StatusDotProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof statusDotVariants> {
  ping?: boolean;
}

export function StatusDot({
  className,
  color = "success",
  size = "md",
  ping = false,
  ...props
}: StatusDotProps) {
  if (ping) {
    const sizeClasses = {
      sm: "size-1",
      md: "size-2",
      lg: "size-4",
    };
    const resolvedSize = size || "md";
    return (
      <span
        className={cn("relative flex shrink-0", sizeClasses[resolvedSize], className)}
        {...props}
      >
        <span className={pingVariants({ color })} />
        <span className={statusDotVariants({ color, size })} />
      </span>
    );
  }

  return <span className={cn(statusDotVariants({ color, size }), className)} {...props} />;
}
