import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        contained: "shadow-sm",
        outlined: "border bg-transparent",
        soft: "",
        ghost: "bg-transparent",
        text: "bg-transparent shadow-none",
      },
      color: {
        primary: "",
        secondary: "",
        surface: "",
        warning: "",
        info: "",
        error: "",
        success: "",
      },
      size: {
        xs: "h-6 px-2 text-xs gap-1",
        sm: "h-8 px-4 text-xs gap-1",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2",
        icon: "h-10 w-10",
        auto: "h-auto p-2 gap-4",
      },
      shape: {
        rounded: "rounded-lg",
        rectangle: "rounded-none",
        circle: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "contained",
      color: "primary",
      size: "md",
      shape: "rounded",
    },
    compoundVariants: [
      // ===== PRIMARY =====
      {
        variant: "contained",
        color: "primary",
        className:
          "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
      },
      {
        variant: "outlined",
        color: "primary",
        className:
          "border-primary/30 hover:border-primary text-primary hover:bg-primary/5 active:bg-primary/10 focus-visible:ring-primary",
      },
      {
        variant: "soft",
        color: "primary",
        className:
          "bg-primary/10 text-primary font-semibold hover:bg-primary/20 active:bg-primary active:text-primary-foreground focus-visible:ring-primary",
      },
      {
        variant: "ghost",
        color: "primary",
        className:
          "text-primary hover:bg-primary/5 active:bg-primary/10 focus-visible:ring-primary",
      },
      {
        variant: "text",
        color: "primary",
        className: "text-primary hover:underline focus-visible:ring-primary",
      },

      // ===== SECONDARY =====
      {
        variant: "contained",
        color: "secondary",
        className:
          "bg-brand-accent text-primary-foreground hover:bg-brand-accent-hover focus-visible:ring-ring",
      },
      {
        variant: "outlined",
        color: "secondary",
        className:
          "border-brand-accent/30 hover:border-brand-accent text-brand-accent hover:bg-accent/20 focus-visible:ring-ring",
      },
      {
        variant: "soft",
        color: "secondary",
        className:
          "bg-accent text-brand-accent font-semibold hover:bg-accent/80 focus-visible:ring-ring",
      },
      {
        variant: "ghost",
        color: "secondary",
        className: "text-brand-accent hover:bg-accent/20 focus-visible:ring-ring",
      },
      {
        variant: "text",
        color: "secondary",
        className: "text-brand-accent hover:underline focus-visible:ring-ring",
      },

      // ===== SURFACE =====
      {
        variant: "contained",
        color: "surface",
        className:
          "bg-background text-foreground border border-border shadow-sm hover:bg-background/60 hover:border-border-hover active:bg-background/40 focus-visible:ring-border",
      },
      {
        variant: "outlined",
        color: "surface",
        className:
          "border-border hover:border-border-hover text-foreground hover:bg-foreground/5 focus-visible:ring-border",
      },
      {
        variant: "soft",
        color: "surface",
        className:
          "bg-muted/40 text-muted-foreground font-semibold hover:bg-muted/60 focus-visible:ring-border",
      },
      {
        variant: "ghost",
        color: "surface",
        className:
          "text-primary-foreground hover:bg-primary-foreground/10 focus-visible:ring-border",
      },
      {
        variant: "text",
        color: "surface",
        className: "text-foreground hover:underline focus-visible:ring-border",
      },

      // ===== ERROR =====
      {
        variant: "contained",
        color: "error",
        className:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
      },
      {
        variant: "outlined",
        color: "error",
        className:
          "border-destructive/30 hover:border-destructive text-destructive hover:bg-destructive/10 focus-visible:ring-destructive",
      },
      {
        variant: "soft",
        color: "error",
        className:
          "bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20 focus-visible:ring-destructive",
      },
      {
        variant: "ghost",
        color: "error",
        className: "text-destructive hover:bg-destructive/10 focus-visible:ring-destructive",
      },
      {
        variant: "text",
        color: "error",
        className: "text-destructive hover:underline focus-visible:ring-destructive",
      },

      // ===== SUCCESS =====
      {
        variant: "contained",
        color: "success",
        className:
          "bg-success text-primary-foreground hover:bg-success/90 focus-visible:ring-success",
      },
      {
        variant: "outlined",
        color: "success",
        className:
          "border-success/30 hover:border-success text-success hover:bg-success-bg focus-visible:ring-success",
      },
      {
        variant: "soft",
        color: "success",
        className:
          "bg-success-bg text-success font-semibold hover:bg-success/10 focus-visible:ring-success",
      },
      {
        variant: "ghost",
        color: "success",
        className: "text-success hover:bg-success-bg focus-visible:ring-success",
      },
      {
        variant: "text",
        color: "success",
        className: "text-success hover:underline focus-visible:ring-success",
      },

      // ===== WARNING =====
      {
        variant: "contained",
        color: "warning",
        className:
          "bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning",
      },
      {
        variant: "outlined",
        color: "warning",
        className:
          "border-warning/30 hover:border-warning text-warning hover:bg-warning/10 focus-visible:ring-warning",
      },
      {
        variant: "soft",
        color: "warning",
        className:
          "bg-warning/10 text-warning-dark font-semibold hover:bg-warning/20 focus-visible:ring-warning",
      },
      {
        variant: "ghost",
        color: "warning",
        className: "text-warning hover:bg-warning/10 focus-visible:ring-warning",
      },
      {
        variant: "text",
        color: "warning",
        className: "text-warning hover:underline focus-visible:ring-warning",
      },

      // ===== INFO =====
      {
        variant: "contained",
        color: "info",
        className: "bg-info text-primary-foreground hover:bg-info/90 focus-visible:ring-info",
      },
      {
        variant: "outlined",
        color: "info",
        className:
          "border-info/30 hover:border-info text-info hover:bg-info-bg focus-visible:ring-info",
      },
      {
        variant: "soft",
        color: "info",
        className: "bg-info-bg text-info font-semibold hover:bg-info/10 focus-visible:ring-info",
      },
      {
        variant: "ghost",
        color: "info",
        className: "text-info hover:bg-info/10 focus-visible:ring-info",
      },
      {
        variant: "text",
        color: "info",
        className: "text-info hover:underline focus-visible:ring-info",
      },
    ],
  },
);

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    Omit<VariantProps<typeof buttonVariants>, "variant" | "shape" | "color" | "size"> {
  asChild?: boolean;
  variant?: "contained" | "outlined" | "soft" | "ghost" | "text";
  color?: "primary" | "secondary" | "surface" | "warning" | "info" | "error" | "success";
  colors?: "primary" | "secondary" | "surface" | "warning" | "info" | "error" | "success"; // legacy colors prop support
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "auto";
  shape?: "rounded" | "rectangle" | "circle";
  component?: "Link" | "a" | "button" | React.ElementType;
  href?: string;
  target?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isLoading?: boolean;
  isSuccess?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      color,
      colors,
      size,
      shape,
      fullWidth,
      asChild = false,
      component,
      href,
      target,
      startIcon,
      endIcon,
      isLoading,
      isSuccess,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const finalVariant = variant || "contained";
    const finalColor = color || colors || "primary";
    const finalShape = shape || "rounded";
    const finalSize = size || "md";

    let Comp: React.ElementType = asChild ? Slot : "button";
    if (!asChild && component) {
      Comp = component === "Link" ? Link : component;
    }

    const additionalProps: { href?: string; target?: string } = {};
    if (href) additionalProps.href = href;
    if (target) additionalProps.target = target;

    const isDisabled = disabled || isLoading || isSuccess;

    let iconToRender = startIcon;
    if (isSuccess) {
      iconToRender = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    } else if (isLoading) {
      iconToRender = (
        <div className="size-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      );
    }

    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({
              variant: finalVariant as VariantProps<typeof buttonVariants>["variant"],
              color: finalColor as VariantProps<typeof buttonVariants>["color"],
              size: finalSize as VariantProps<typeof buttonVariants>["size"],
              shape: finalShape as VariantProps<typeof buttonVariants>["shape"],
              fullWidth,
              className,
            }),
          )}
          ref={ref}
          {...additionalProps}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant: finalVariant as VariantProps<typeof buttonVariants>["variant"],
            color: finalColor as VariantProps<typeof buttonVariants>["color"],
            size: finalSize as VariantProps<typeof buttonVariants>["size"],
            shape: finalShape as VariantProps<typeof buttonVariants>["shape"],
            fullWidth,
            className,
          }),
          isLoading && "cursor-wait opacity-70",
        )}
        ref={ref}
        disabled={isDisabled}
        {...additionalProps}
        {...props}
      >
        {iconToRender}
        {children}
        {endIcon}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
