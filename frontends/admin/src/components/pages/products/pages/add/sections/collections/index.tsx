"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Tag } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Autocomplete } from "@/components/ui/inputs/autocomplete";
import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function CollectionsSection({ collectionOptions = [] }: { collectionOptions?: string[] }) {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const collections = watch("collections") || [];

  const autocompleteOptions = React.useMemo(() => {
    return collectionOptions.map((opt) => ({
      label: opt,
      value: opt,
    }));
  }, [collectionOptions]);

  const handleChange = (newValues: string | string[]) => {
    if (Array.isArray(newValues)) {
      setValue("collections", newValues, { shouldValidate: true });
    }
  };

  return (
    <Card variant="form-section">
      <div className="flex items-center gap-2">
        <Tag size={14} className="text-muted-foreground-lighter" />
        <h3 className="text-sm font-semibold text-foreground leading-tight">Collections</h3>
      </div>
      <p className="text-xs text-muted-foreground-lighter -mt-2">
        Optional. Group this product into marketing collections.
      </p>

      <Autocomplete
        value={collections}
        onChange={handleChange}
        options={autocompleteOptions}
        multiple
        placeholder="Select collections..."
        searchPlaceholder="Search collections..."
        variant="outlined"
        color="surface"
        size="md"
        shape="rounded"
      />
    </Card>
  );
}
