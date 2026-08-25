import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { badgeVariants } from "./badge-variants";

export interface BadgeProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    Omit<VariantProps<typeof badgeVariants>, "variant" | "shape" | "color" | "size"> {
  variant?: "contained" | "outlined" | "soft" | "tonal" | "ghost" | "default" | (string & {});
  shape?: "rounded" | "rectangle" | "circle" | "default" | "full" | (string & {});
  size?: "xs" | "sm" | "md" | "lg" | "default";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  colors?:
    | "primary"
    | "secondary"
    | "surface"
    | "warning"
    | "info"
    | "error"
    | "success"
    | "neutral"
    | "overlay"
    | (string & {}); // legacy colors prop support
  color?:
    | "primary"
    | "secondary"
    | "surface"
    | "warning"
    | "info"
    | "error"
    | "success"
    | "neutral"
    | "overlay"
    | (string & {});
}

function Badge({
  className,
  variant,
  shape,
  size,
  colors,
  color,
  startIcon,
  endIcon,
  children,
  ...props
}: BadgeProps) {
  // Smart backward compatibility support for old color variants
  let finalVariant = variant as string | undefined;
  let finalColor = (color || colors) as string | undefined;

  // 1. Map legacy variants if they represent colors (e.g. variant="success" -> variant="soft", color="success")
  const legacyColors = ["success", "danger", "accent", "muted", "secondary", "destructive"];
  if (variant && legacyColors.includes(variant as string)) {
    if (!finalColor) {
      if ((variant as string) === "destructive" || (variant as string) === "danger") {
        finalColor = "error";
      } else if ((variant as string) === "secondary") {
        finalColor = "secondary";
      } else if ((variant as string) === "accent") {
        finalColor = "secondary";
      } else if ((variant as string) === "muted") {
        finalColor = "neutral";
      } else {
        finalColor = variant as string;
      }
    }
    finalVariant = "soft";
  }

  // 2. Map legacy variants to new variants
  if (finalVariant === "default" || finalVariant === "solid") {
    finalVariant = "contained";
  } else if (finalVariant === "outline") {
    finalVariant = "outlined";
  }

  // 3. Map legacy colors to new colors
  if (finalColor === "default" || finalColor === "primary") {
    finalColor = "primary";
  } else if (finalColor === "danger" || finalColor === "error") {
    finalColor = "error";
  } else if (finalColor === "accent") {
    finalColor = "secondary";
  } else if (finalColor === "muted") {
    finalColor = "neutral";
  }

  // 4. Map legacy shapes
  let finalShape = shape;
  if (shape === "default") {
    finalShape = "rounded";
  } else if (shape === "full") {
    finalShape = "circle";
  }

  // 5. Fallbacks
  if (!finalVariant) finalVariant = "soft";
  if (!finalColor) finalColor = "primary";
  if (!finalShape) finalShape = "rounded";

  let finalSize = size;
  if (!finalSize || finalSize === "default") {
    finalSize = "md";
  }

  return (
    <div
      className={cn(
        badgeVariants({
          variant: finalVariant as VariantProps<typeof badgeVariants>["variant"],
          color: finalColor as VariantProps<typeof badgeVariants>["color"],
          shape: finalShape as VariantProps<typeof badgeVariants>["shape"],
          size: finalSize as VariantProps<typeof badgeVariants>["size"],
        }),
        className,
      )}
      {...props}
    >
      {startIcon && (
        <span className="inline-flex shrink-0 [&_svg]:size-4 [&_svg]:shrink-0">{startIcon}</span>
      )}
      {children}
      {endIcon && (
        <span className="inline-flex shrink-0 [&_svg]:size-4 [&_svg]:shrink-0">{endIcon}</span>
      )}
    </div>
  );
}

export { Badge, badgeVariants };
