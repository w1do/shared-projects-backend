"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Plus, Download, Grid, List } from "lucide-react";
import type { ProductFull } from "@/lib/admin/mock";
import { statusFilters, countByStatus, type StatusFilter } from "@/lib/admin/products-helpers";
import { Input } from "@/components/ui/inputs/input";
import { StatusFilters } from "@/components/shared";
import { Button } from "@/components/ui/inputs/button";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import { cn } from "@/lib/utils";

type ProductsToolbarProps = {
  products: ProductFull[];
  query: string;
  onQueryChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (value: "grid" | "list") => void;
};

export function ProductsToolbar({
  products,
  query,
  onQueryChange,
  status,
  onStatusChange,
  viewMode,
  onViewModeChange,
}: ProductsToolbarProps) {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      {
        rootMargin: "-64px 0px 0px 0px",
        threshold: [0],
      },
    );

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-full pointer-events-none" />

      <div
        className={cn(
          "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between transition-all duration-300 ease-out z-10",
          isStuck
            ? "sticky top-16 border-b border-border bg-background/80 backdrop-blur-md py-4 shadow-sm px-4 -mx-4 md:-mx-24 md:px-24"
            : "py-0",
        )}
      >
        <div className="w-full lg:max-w-sm">
          <Input
            placeholder="Search by name, SKU, or brand…"
            startIcon={<Search />}
            shape="circle"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <StatusFilters
            options={statusFilters}
            value={status}
            onChange={onStatusChange}
            counts={(item: StatusFilter) => countByStatus(products, item)}
          />

          <ButtonGroup
            isIconButton
            size="sm"
            variant="outlined"
            shape="circle"
            disablePadding
            options={[
              { label: <Grid size={16} />, value: "grid" },
              { label: <List size={16} />, value: "list" },
            ]}
            value={viewMode}
            onChange={onViewModeChange}
          />

          {isStuck && (
            <div className="flex shrink-0 items-center gap-2 border-l border-border pl-4 animate-fade-in">
              <Button
                variant="contained"
                color="surface"
                size="sm"
                shape="circle"
                startIcon={<Download />}
              >
                Export
              </Button>
              <Button
                variant="contained"
                size="sm"
                shape="circle"
                startIcon={<Plus />}
                component={Link}
                href="/admin/products/add"
              >
                Add product
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
