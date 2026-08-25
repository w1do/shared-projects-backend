"use client";

import { useFormContext, Controller } from "react-hook-form";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { ProductFull } from "@/lib/admin/mocks/types";
import { useProductsQuery } from "@/hooks/admin/products";
import { Card } from "@/components/ui/data-display/card";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";

interface ProductsSectionProps {
  products?: ProductFull[];
}

export function ProductsSection({ products }: ProductsSectionProps) {
  const { data: queryProducts = [] } = useProductsQuery();
  const catalog = products ?? queryProducts;
  const { control } = useFormContext<CollectionFormValues>();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }, [catalog, query]);

  const gradients = catalog
    .filter((p) => !p.image)
    .map((p) => ({ id: `picker-${p.id}`, start: p.gradient[0], end: p.gradient[1] }));

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">
          Products in Collection
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          Curate which catalog products belong to this edit. Selection drives the product count.
        </p>
      </div>

      <Controller
        control={control}
        name="products"
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col gap-4">
            <AdminDynamicStyles gradients={gradients} />

            <div className="flex items-center justify-between gap-4">
              <div className="max-w-sm w-full">
                <Input
                  placeholder="Search products to add..."
                  startIcon={<Search />}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <span className="shrink-0 text-caption font-medium text-muted-foreground">
                {field.value?.length || 0} selected
              </span>
            </div>

            <div className="grid h-64 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-border/50 bg-muted/20 p-2 sm:grid-cols-2">
              {filtered.map((product) => {
                const selected = field.value?.includes(product.id);
                const toggle = (id: string) => {
                  const current = field.value || [];
                  field.onChange(
                    current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
                  );
                };

                return (
                  <Button
                    key={product.id}
                    asChild
                    type="button"
                    onClick={() => toggle(product.id)}
                    variant={selected ? "soft" : "contained"}
                    color={selected ? "primary" : "surface"}
                    size="auto"
                    className={`group justify-start pr-4 border cursor-pointer ${
                      selected ? "border-primary" : "border-transparent"
                    }`}
                    data-state={selected ? "selected" : "unselected"}
                  >
                    <div>
                      <Avatar
                        src={product.image}
                        alt={product.name}
                        shape="rounded"
                        fallbackClassName="admin-gradient-swatch"
                        data-admin-gradient={`picker-${product.id}`}
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-xs font-semibold">{product.name}</span>
                        <span className="truncate text-caption opacity-70">
                          {product.brand} • {formatCurrency(product.price)}
                        </span>
                      </span>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto pointer-events-none"
                      >
                        <Checkbox
                          checked={selected}
                          shape="circle"
                          size="medium"
                          className="group-active:data-[state=checked]:bg-background group-active:data-[state=checked]:text-foreground group-active:data-[state=checked]:border-background group-focus:data-[state=checked]:bg-background group-focus:data-[state=checked]:text-foreground group-focus:data-[state=checked]:border-background group-focus-visible:data-[state=checked]:bg-background group-focus-visible:data-[state=checked]:text-foreground group-focus-visible:data-[state=checked]:border-background"
                        />
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
            {error && (
              <p className="ui-form-help-text font-medium text-destructive">{error.message}</p>
            )}
          </div>
        )}
      />
    </Card>
  );
}
