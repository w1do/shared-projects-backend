import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full transition-all duration-300 ease-out focus:outline-none disabled:cursor-not-allowed disabled:border-input/20 disabled:bg-input-disabled disabled:text-muted-foreground-lighter/60 placeholder:text-muted-foreground-lighter",
  {
    variants: {
      variant: {
        contained: "shadow-inner border border-transparent bg-card hover:bg-card focus:bg-card",
        outlined:
          "border-2 border-input/70 bg-card/80 hover:border-border-hover hover:bg-card hover:shadow-inner focus:border-foreground focus:bg-card focus:ring-4 focus:ring-ring/5",
        soft: "border-transparent bg-muted/40 text-foreground focus:bg-card focus:border-input",
        ghost: "bg-transparent border-transparent focus:bg-card/50",
        text: "bg-transparent border-transparent shadow-none",
      },
      color: {
        primary: "focus:border-primary focus:ring-primary/5",
        secondary: "focus:border-brand-accent focus:ring-brand-accent/5",
        surface: "focus:border-foreground focus:ring-ring/5",
        warning: "focus:border-warning focus:ring-warning/5 text-warning-dark",
        info: "focus:border-info focus:ring-info/5 text-info",
        error: "focus:border-destructive focus:ring-destructive/5 text-destructive",
        success: "focus:border-success focus:ring-success/5 text-success",
      },
      size: {
        xs: "h-6 text-xs",
        sm: "h-8 text-xs",
        md: "h-10 text-sm",
        lg: "h-12 text-sm",
      },
      shape: {
        rounded: "rounded-lg",
        rectangle: "rounded-none",
        circle: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "outlined",
      color: "surface",
      size: "md",
      shape: "rounded",
      fullWidth: true,
    },
  },
);

export interface InputProps
  extends
    Omit<React.ComponentProps<"input">, "size" | "color">,
    Omit<VariantProps<typeof inputVariants>, "variant" | "shape" | "color" | "size"> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  shape?: "rounded" | "rectangle" | "circle";
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "contained" | "outlined" | "soft" | "ghost" | "text";
  color?: "primary" | "secondary" | "surface" | "warning" | "info" | "error" | "success";
  mono?: boolean;
  uppercase?: boolean;
  label?: string;
  labelClassName?: string;
  labelRight?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      startIcon,
      endIcon,
      shape = "rounded",
      size = "md",
      variant = "outlined",
      color = "surface",
      mono,
      uppercase,
      label,
      labelClassName,
      labelRight,
      error,
      ...props
    },
    ref,
  ) => {
    // Spacing configuration following the 8px grid rule
    const paddingLeftClass = startIcon
      ? {
          xs: "pl-8", // 32px
          sm: "pl-10", // 40px
          md: "pl-10", // 40px
          lg: "pl-12", // 48px
        }[size]
      : {
          xs: "pl-2", // 8px
          sm: "pl-4", // 16px
          md: "pl-4", // 16px
          lg: "pl-6", // 24px
        }[size];

    const paddingRightClass = endIcon
      ? {
          xs: "pr-8", // 32px
          sm: "pr-10", // 40px
          md: "pr-10", // 40px
          lg: "pr-12", // 48px
        }[size]
      : {
          xs: "pr-2", // 8px
          sm: "pr-4", // 16px
          md: "pr-4", // 16px
          lg: "pr-6", // 24px
        }[size];

    const iconLeftOffset = {
      xs: "left-2", // 8px
      sm: "left-4", // 16px
      md: "left-4", // 16px
      lg: "left-4", // 16px
    }[size];

    const iconRightOffset = {
      xs: "right-2", // 8px
      sm: "right-4", // 16px
      md: "right-4", // 16px
      lg: "right-4", // 16px
    }[size];

    const inputStyle = cn(
      inputVariants({
        variant,
        color,
        size,
        shape,
      }),
      paddingLeftClass,
      paddingRightClass,
      mono && "font-mono text-xs",
      uppercase && "uppercase",
    );

    const renderInput = (
      <input
        type={type}
        className={cn(inputStyle, !startIcon && !endIcon && className)}
        ref={ref}
        {...props}
      />
    );

    const inputContent =
      startIcon || endIcon ? (
        <div className={cn("relative w-full flex items-center group/input", !label && className)}>
          {startIcon && (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground-lighter flex items-center justify-center transition-colors duration-300 size-4 group-hover/input:text-muted-foreground group-focus-within/input:text-foreground [&_svg]:size-4 [&_svg]:shrink-0",
                iconLeftOffset,
              )}
            >
              {startIcon}
            </div>
          )}
          <input type={type} className={inputStyle} ref={ref} {...props} />
          {endIcon && (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground-lighter flex items-center justify-center transition-colors duration-300 size-4 group-hover/input:text-muted-foreground group-focus-within/input:text-foreground [&_svg]:size-4 [&_svg]:shrink-0",
                iconRightOffset,
              )}
            >
              {endIcon}
            </div>
          )}
        </div>
      ) : (
        renderInput
      );

    if (!label && !error) {
      return inputContent;
    }

    return (
      <div className={cn("space-y-2 w-full", className)}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              className={cn("text-xs font-medium text-muted-foreground block", labelClassName)}
            >
              {label}
            </label>
          )}
          {labelRight && labelRight}
        </div>
        {inputContent}
        {error && <p className="ui-form-help-text font-medium text-destructive">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
