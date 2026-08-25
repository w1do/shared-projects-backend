import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex w-fit items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        contained: "shadow-sm",
        outlined: "border bg-transparent",
        soft: "",
        tonal: "border-none",
        ghost: "bg-transparent",
      },
      color: {
        primary: "",
        secondary: "",
        surface: "",
        warning: "",
        info: "",
        error: "",
        success: "",
        neutral: "",
        overlay: "",
      },
      shape: {
        rounded: "rounded-lg",
        rectangle: "rounded-none",
        circle: "rounded-full",
      },
      size: {
        xs: "h-4 px-1 text-micro uppercase tracking-wider gap-1",
        sm: "h-6 px-2 text-xs gap-1",
        md: "h-6 px-2 text-xs uppercase tracking-wider gap-1",
        lg: "h-8 px-4 text-xs uppercase tracking-wider gap-2",
      },
    },
    compoundVariants: [
      // ===== PRIMARY =====
      {
        variant: "contained",
        color: "primary",
        className: "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent",
      },
      {
        variant: "outlined",
        color: "primary",
        className: "border-primary text-primary hover:bg-primary/5",
      },
      {
        variant: "soft",
        color: "primary",
        className: "bg-primary/10 text-primary hover:bg-primary/15",
      },
      {
        variant: "tonal",
        color: "primary",
        className: "bg-primary/5 text-primary",
      },
      {
        variant: "ghost",
        color: "primary",
        className: "text-primary hover:bg-primary/5",
      },

      // ===== SECONDARY =====
      {
        variant: "contained",
        color: "secondary",
        className:
          "bg-brand-accent text-primary-foreground hover:bg-brand-accent/90 border-transparent",
      },
      {
        variant: "outlined",
        color: "secondary",
        className: "border-accent text-brand-accent hover:bg-accent/10",
      },
      {
        variant: "soft",
        color: "secondary",
        className: "bg-accent/40 text-brand-accent",
      },
      {
        variant: "tonal",
        color: "secondary",
        className: "bg-accent/20 text-brand-accent",
      },
      {
        variant: "ghost",
        color: "secondary",
        className: "text-brand-accent hover:bg-accent/10",
      },

      // ===== SURFACE =====
      {
        variant: "contained",
        color: "surface",
        className: "bg-background text-foreground hover:bg-background/90 border border-border",
      },
      {
        variant: "outlined",
        color: "surface",
        className: "border-border text-foreground hover:bg-muted/10",
      },
      {
        variant: "soft",
        color: "surface",
        className: "bg-muted/40 text-muted-foreground",
      },
      {
        variant: "tonal",
        color: "surface",
        className: "bg-muted/40 text-muted-foreground",
      },
      {
        variant: "ghost",
        color: "surface",
        className: "text-muted-foreground hover:bg-muted/10",
      },

      // ===== WARNING =====
      {
        variant: "contained",
        color: "warning",
        className: "bg-warning text-warning-foreground hover:bg-warning/90 border-transparent",
      },
      {
        variant: "outlined",
        color: "warning",
        className: "border-warning/30 text-warning hover:bg-warning/10",
      },
      {
        variant: "soft",
        color: "warning",
        className: "bg-warning/10 text-warning-dark",
      },
      {
        variant: "tonal",
        color: "warning",
        className: "bg-warning/10 text-warning-dark",
      },
      {
        variant: "ghost",
        color: "warning",
        className: "text-warning hover:bg-warning/5",
      },

      // ===== INFO =====
      {
        variant: "contained",
        color: "info",
        className: "bg-info text-primary-foreground hover:bg-info/90 border-transparent",
      },
      {
        variant: "outlined",
        color: "info",
        className: "border-info/30 text-info hover:bg-info-bg",
      },
      {
        variant: "soft",
        color: "info",
        className: "bg-info-bg text-info",
      },
      {
        variant: "tonal",
        color: "info",
        className: "bg-info-bg text-info",
      },
      {
        variant: "ghost",
        color: "info",
        className: "text-info hover:bg-info/5",
      },

      // ===== ERROR =====
      {
        variant: "contained",
        color: "error",
        className:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-transparent",
      },
      {
        variant: "outlined",
        color: "error",
        className: "border-destructive/30 text-destructive hover:bg-destructive/10",
      },
      {
        variant: "soft",
        color: "error",
        className: "bg-destructive/10 text-destructive",
      },
      {
        variant: "tonal",
        color: "error",
        className: "bg-destructive/10 text-destructive",
      },
      {
        variant: "ghost",
        color: "error",
        className: "text-destructive hover:bg-destructive/5",
      },

      // ===== SUCCESS =====
      {
        variant: "contained",
        color: "success",
        className: "bg-success text-primary-foreground hover:bg-success/90 border-transparent",
      },
      {
        variant: "outlined",
        color: "success",
        className: "border-success/30 text-success hover:bg-success-bg",
      },
      {
        variant: "soft",
        color: "success",
        className: "bg-success-bg text-success",
      },
      {
        variant: "tonal",
        color: "success",
        className: "bg-success-bg text-success",
      },
      {
        variant: "ghost",
        color: "success",
        className: "text-success hover:bg-success/5",
      },

      // ===== NEUTRAL =====
      {
        variant: "contained",
        color: "neutral",
        className: "bg-muted text-muted-foreground hover:bg-muted/90 border-transparent",
      },
      {
        variant: "outlined",
        color: "neutral",
        className: "border-border text-muted-foreground hover:bg-muted/5",
      },
      {
        variant: "soft",
        color: "neutral",
        className: "bg-muted text-muted-foreground border border-border",
      },
      {
        variant: "tonal",
        color: "neutral",
        className: "bg-muted text-muted-foreground",
      },
      {
        variant: "ghost",
        color: "neutral",
        className: "text-muted-foreground hover:bg-muted/5",
      },

      // ===== OVERLAY =====
      {
        variant: "contained",
        color: "overlay",
        className:
          "bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-transparent",
      },
      {
        variant: "outlined",
        color: "overlay",
        className:
          "border-primary-foreground text-primary-foreground hover:bg-primary-foreground/5",
      },
      {
        variant: "soft",
        color: "overlay",
        className:
          "bg-primary-foreground/10 text-primary-foreground/80 hover:bg-primary-foreground/15 border-transparent",
      },
      {
        variant: "tonal",
        color: "overlay",
        className: "bg-primary-foreground/5 text-primary-foreground/80 border-transparent",
      },
      {
        variant: "ghost",
        color: "overlay",
        className: "text-primary-foreground/80 hover:bg-primary-foreground/5",
      },
    ],
    defaultVariants: {
      variant: "contained",
      color: "primary",
      shape: "rounded",
      size: "md",
    },
  },
);
