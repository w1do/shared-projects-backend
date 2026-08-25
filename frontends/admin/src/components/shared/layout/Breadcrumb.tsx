import * as React from "react";
import Link from "next/link";
import {
  Breadcrumb as BaseBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation/breadcrumb";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItemType[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <BaseBreadcrumb>
      <BreadcrumbList className="text-xs uppercase tracking-widest font-medium">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={item.label}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-brand-accent font-semibold">
                    {item.label}
                  </BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink
                    asChild
                    className="text-muted-foreground-lighter hover:text-foreground"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground-lighter">{item.label}</span>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="text-muted-foreground-lighter/40 [&>svg]:size-4" />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BaseBreadcrumb>
  );
}
