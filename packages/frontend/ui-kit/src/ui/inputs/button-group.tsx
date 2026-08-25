"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";

export interface ButtonGroupOption<T extends string = string> {
  label: React.ReactNode;
  value: T;
}

export interface ButtonGroupProps<T extends string = string> {
  options: readonly T[] | T[] | ButtonGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isIconButton?: boolean;
  variant?: "contained" | "outlined" | "soft" | "ghost" | "text" | "default";
  color?: "primary" | "secondary" | "surface" | "warning" | "info" | "error" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "small" | "medium" | "large";
  shape?: "rounded" | "rectangle" | "circle";
  className?: string;
  disablePadding?: boolean;
}

export function ButtonGroup<T extends string = string>({
  options,
  value,
  onChange,
  isIconButton = false,
  variant = "contained",
  color = "surface",
  size = "md",
  shape = "circle",
  className,
  disablePadding = false,
}: ButtonGroupProps<T>) {
  // Normalize options into [{ label, value }] format
  const normalizedOptions = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { label: opt, value: opt as T };
      }
      return opt as ButtonGroupOption<T>;
    });
  }, [options]);

  // Backward compatibility mappings
  const finalVariant = variant === "default" ? "contained" : variant;
  const finalSize =
    {
      small: "sm" as const,
      medium: "md" as const,
      large: "lg" as const,
      xs: "xs" as const,
      sm: "sm" as const,
      md: "md" as const,
      lg: "lg" as const,
    }[size] || "md";

  // Container styling based on layout variants (following grid 8px)
  const containerPadding = disablePadding
    ? "p-0 gap-0"
    : {
        xs: "p-1 gap-1",
        sm: "p-1 gap-1",
        md: "p-1 gap-2",
        lg: "p-2 gap-2",
      }[finalSize];

  const containerShape = {
    rounded: "rounded-lg",
    rectangle: "rounded-none",
    circle: "rounded-full",
  }[shape];

  const containerVariantClasses = {
    contained: "bg-muted",
    outlined: "border border-border/60 bg-muted shadow-subtle",
    soft: "bg-muted/40",
    ghost: "bg-transparent border-transparent",
    text: "bg-transparent border-transparent shadow-none",
  }[finalVariant];

  // Resolve sub-component dynamically
  const Comp = isIconButton ? IconButton : Button;

  return (
    <div
      className={cn(
        "inline-flex items-center transition-all duration-200 select-none",
        containerVariantClasses,
        containerPadding,
        containerShape,
        className,
      )}
    >
      {normalizedOptions.map((opt) => {
        const isActive = opt.value === value;

        if (isIconButton) {
          const itemSize =
            finalSize === "xs"
              ? "sm"
              : finalSize === "lg"
                ? "lg"
                : finalSize === "sm"
                  ? "sm"
                  : "md";
          return (
            <IconButton
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              variant={isActive ? "contained" : "ghost"}
              color={isActive ? "surface" : "primary"}
              size={itemSize}
              shape={shape}
              className={cn(
                "transition-all duration-200 ease-out active:scale-[0.98]",
                isActive && "shadow-subtle-3 scale-[1.02]",
              )}
            >
              {opt.label}
            </IconButton>
          );
        }

        return (
          <Button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            variant={isActive ? "contained" : "ghost"}
            color={isActive ? "surface" : "primary"}
            size={finalSize}
            shape={shape}
            className={cn(
              "transition-all duration-200 ease-out active:scale-[0.98]",
              isActive && "shadow-subtle-3 scale-[1.02]",
            )}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

// Add alias for maximum compatibility with user calls
export { ButtonGroup as GroupButton };
