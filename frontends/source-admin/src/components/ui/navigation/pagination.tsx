import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/inputs/button";
import { IconButton, type IconButtonProps } from "@/components/ui/inputs/icon-button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1.5", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Omit<IconButtonProps, "isActive"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "sm",
  variant,
  color = "primary",
  shape,
  ...props
}: PaginationLinkProps) => {
  const activeVariant = variant || (isActive ? "contained" : "ghost");

  return (
    <IconButton
      aria-current={isActive ? "page" : undefined}
      variant={activeVariant}
      color={color}
      size={size}
      shape={shape}
      className={className}
      asChild
    >
      <a {...props} />
    </IconButton>
  );
};
PaginationLink.displayName = "PaginationLink";

type PaginationNavProps = {
  color?: "primary" | "secondary" | "surface" | "warning" | "info" | "error" | "success";
  variant?: "contained" | "outlined" | "soft" | "ghost" | "text";
  shape?: "rounded" | "rectangle" | "circle";
  size?: "sm" | "md" | "lg";
} & React.ComponentProps<"a">;

const PaginationPrevious = ({
  className,
  color = "primary",
  variant = "ghost",
  shape = "circle",
  size = "sm",
  ...props
}: PaginationNavProps) => (
  <IconButton
    aria-label="Go to previous page"
    color={color}
    variant={variant}
    shape={shape}
    size={size}
    className={className}
    asChild
  >
    <a {...props}>
      <ChevronLeft size={16} />
    </a>
  </IconButton>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  color = "primary",
  variant = "ghost",
  shape = "circle",
  size = "sm",
  ...props
}: PaginationNavProps) => (
  <IconButton
    aria-label="Go to next page"
    color={color}
    variant={variant}
    shape={shape}
    size={size}
    className={className}
    asChild
  >
    <a {...props}>
      <ChevronRight size={16} />
    </a>
  </IconButton>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  size = "sm",
  ...props
}: { size?: "sm" | "md" | "lg" } & React.ComponentProps<"span">) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center text-muted-foreground-lighter select-none shrink-0",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <MoreHorizontal size={14} />
      <span className="sr-only">More pages</span>
    </span>
  );
};
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
