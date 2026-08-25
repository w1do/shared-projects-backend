import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> {
  size?: "small" | "medium";
  shape?: "rounded" | "circle" | "rectangle";
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, size = "small", shape = "rounded", ...props }, ref) => {
    const sizeClasses = size === "medium" ? "h-5 w-5" : "h-4 w-4";
    const iconSize = size === "medium" ? 12 : 10;

    const shapeClasses =
      shape === "circle"
        ? "rounded-full"
        : shape === "rectangle"
          ? "rounded-none"
          : "rounded-(--radius-lg)";

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "grid place-content-center peer shrink-0 border border-border/70 bg-background shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
          sizeClasses,
          shapeClasses,
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn("grid place-content-center text-current")}>
          <Check size={iconSize} strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
