import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/inputs/button";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends Omit<
  ButtonProps,
  "startIcon" | "endIcon" | "size" | "color" | "colors" | "shape"
> {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "surface" | "warning" | "info" | "error" | "success";
  colors?: "primary" | "secondary" | "surface" | "warning" | "info" | "error" | "success";
  shape?: "rounded" | "rectangle" | "circle";
  isActive?: boolean;
  activeColor?: "warning" | "primary" | "amber";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { children, className, size = "md", shape = "circle", isActive, activeColor, ...props },
    ref,
  ) => {
    // Map IconButton size to corresponding square class
    const sizeClasses = {
      sm: "h-8 w-8 p-0",
      md: "h-10 w-10 p-0",
      lg: "h-12 w-12 p-0",
    };

    // Calculate classes based on active state and transition effects
    const activeClasses =
      typeof isActive !== "undefined"
        ? isActive
          ? activeColor === "warning" || activeColor === "amber"
            ? "text-warning scale-105 [&_svg]:fill-warning"
            : "text-foreground scale-105"
          : "text-muted-foreground-lighter hover:text-foreground [&_svg]:fill-none"
        : "";

    return (
      <Button
        ref={ref}
        shape={shape}
        className={cn(
          sizeClasses[size],
          "inline-flex items-center justify-center shrink-0 transition-all duration-150 [&_svg]:size-4 [&_svg]:shrink-0",
          activeClasses,
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton };
