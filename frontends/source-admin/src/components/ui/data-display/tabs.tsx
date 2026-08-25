import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Context to share layout/style variants down to List and Trigger
const TabsContext = React.createContext<{
  variant?: "contained" | "outlined" | "underline" | "ghost";
  color?: "primary" | "secondary" | "surface";
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "rounded" | "circle" | "rectangle";
}>({
  variant: "contained",
  color: "surface",
  size: "md",
  shape: "rounded",
});

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: "contained" | "outlined" | "underline" | "ghost";
  color?: "primary" | "secondary" | "surface";
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "rounded" | "circle" | "rectangle";
}

const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ className, variant, color, size, shape, ...props }, ref) => {
    const contextValue = React.useMemo(() => {
      return {
        variant: variant ?? "contained",
        color: color ?? "surface",
        size: size ?? "md",
        shape: shape ?? "rounded",
      };
    }, [variant, color, size, shape]);

    return (
      <TabsContext.Provider value={contextValue}>
        <TabsPrimitive.Root ref={ref} className={className} {...props} />
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = TabsPrimitive.Root.displayName;

const tabsListVariants = cva(
  "inline-flex items-center justify-center text-muted-foreground transition-all",
  {
    variants: {
      variant: {
        contained: "bg-muted/45 border border-border/20 p-1",
        outlined: "border border-border bg-transparent p-1",
        underline:
          "w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border/60 bg-transparent p-0 scrollbar-none",
        ghost: "bg-transparent p-0",
      },
      shape: {
        rounded: "rounded-(--radius-lg)",
        circle: "rounded-full",
        rectangle: "rounded-none",
      },
      size: {
        xs: "h-8",
        sm: "h-9",
        md: "h-10",
        lg: "h-12",
        auto: "h-auto",
      },
    },
    defaultVariants: {
      variant: "contained",
      shape: "rounded",
      size: "md",
    },
  },
);

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "contained" | "outlined" | "underline" | "ghost";
  shape?: "rounded" | "circle" | "rectangle";
  size?: "xs" | "sm" | "md" | "lg" | "auto";
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, shape, size, ...props }, ref) => {
    const context = React.useContext(TabsContext);

    const finalVariant = variant ?? context.variant ?? "contained";
    const finalShape = shape ?? context.shape ?? "rounded";
    const finalSize = size ?? (finalVariant === "underline" ? "auto" : context.size) ?? "md";

    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          tabsListVariants({
            variant: finalVariant,
            shape: finalShape,
            size: finalSize,
          }),
          className,
        )}
        {...props}
      />
    );
  },
);
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        contained: "text-muted-foreground hover:text-foreground data-[state=active]:shadow-sm",
        outlined:
          "border border-border/60 bg-background text-muted-foreground data-[state=active]:shadow-none",
        underline:
          "border-b-2 border-transparent text-muted-foreground-lighter shadow-none hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
        ghost: "text-muted-foreground hover:text-foreground bg-transparent",
      },
      color: {
        primary: "",
        secondary: "",
        surface: "",
      },
      size: {
        xs: "px-3 py-1 text-xs",
        sm: "px-4 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-2.5 text-base",
      },
      shape: {
        rounded: "rounded-(--radius-lg)",
        circle: "rounded-full",
        rectangle: "rounded-none",
      },
    },
    compoundVariants: [
      // contained + primary
      {
        variant: "contained",
        color: "primary",
        className: "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
      },
      // contained + secondary
      {
        variant: "contained",
        color: "secondary",
        className:
          "data-[state=active]:bg-brand-accent data-[state=active]:text-primary-foreground",
      },
      // contained + surface
      {
        variant: "contained",
        color: "surface",
        className: "data-[state=active]:bg-background data-[state=active]:text-foreground",
      },
      // outlined + secondary
      {
        variant: "outlined",
        color: "secondary",
        className:
          "data-[state=active]:border-brand-accent/20 data-[state=active]:bg-accent data-[state=active]:text-brand-accent",
      },
      // underline + primary
      {
        variant: "underline",
        color: "primary",
        className:
          "data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold",
      },
      // underline + secondary
      {
        variant: "underline",
        color: "secondary",
        className:
          "data-[state=active]:border-brand-accent data-[state=active]:text-foreground data-[state=active]:font-semibold",
      },
    ],
    defaultVariants: {
      variant: "contained",
      color: "surface",
      size: "md",
      shape: "rounded",
    },
  },
);

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  variant?: "contained" | "outlined" | "underline" | "ghost";
  color?: "primary" | "secondary" | "surface";
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "rounded" | "circle" | "rectangle";
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, color, size, shape, ...props }, ref) => {
  const context = React.useContext(TabsContext);

  const finalVariant = variant ?? context.variant ?? "contained";
  const finalColor = color ?? context.color ?? "surface";
  const finalSize = size ?? context.size ?? "md";
  const finalShape = shape ?? context.shape ?? "rounded";

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabsTriggerVariants({
          variant: finalVariant,
          color: finalColor,
          size: finalSize,
          shape: finalShape,
        }),
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
