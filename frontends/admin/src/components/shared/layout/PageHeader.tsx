"use client";

import { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItemType } from "./Breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbItems: BreadcrumbItemType[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbItems, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="mt-4 font-openrunde text-display text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-body-lg text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
