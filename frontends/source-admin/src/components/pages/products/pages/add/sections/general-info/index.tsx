"use client";

import { useFormContext } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { RichTextEditor } from "@/components/ui/inputs/rich-text-editor";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import { executeSkuGeneration } from "@/lib/admin/products-helpers";

export function GeneralInfoSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const handleGenerateSKU = () => {
    executeSkuGeneration({
      name: watch("name"),
      brand: watch("brand"),
      category: watch("category"),
      onSuccess: (sku) => setValue("sku", sku, { shouldValidate: true }),
    });
  };

  const handleGenerateDescription = () => {
    const name = watch("name");
    if (!name) return;

    const generated = `A premium, high-performance beauty product crafted with luxury organic botanicals. Designed for modern self-care rituals, it deeply nourishes and restores a glowing, healthy skin canvas, leaving it radiant, balanced, and refreshed. Perfect for daily enhancement and long-lasting skin comfort.`;

    setValue("description", generated, { shouldValidate: true });
  };

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium text-foreground leading-tight">Product Details</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Basic information about your cosmetics product
        </p>
      </div>

      <Input
        {...register("name")}
        label="Product Name"
        placeholder="e.g. Hydro-Restore Anti-Aging Serum"
        error={errors.name?.message}
      />

      <Input
        {...register("sku")}
        label="Base SKU"
        placeholder="e.g. ATH-HYDR-SRM"
        mono
        uppercase
        error={errors.sku?.message}
        labelRight={
          <Button
            type="button"
            variant="text"
            onClick={handleGenerateSKU}
            disabled={true}
            startIcon={<Sparkles />}
          >
            Generate SKU
          </Button>
        }
      />

      <Input
        {...register("shortDescription")}
        label="Short Description"
        placeholder="Brief tagline shown on product cards"
        error={errors.shortDescription?.message}
      />

      <RichTextEditor
        content={watch("description") || ""}
        onChange={(html) => setValue("description", html, { shouldValidate: true })}
        label="Full Description"
        placeholder="Describe your beauty product benefits, texture, scent, and key results..."
        error={errors.description?.message}
        labelRight={
          <Button
            type="button"
            variant="text"
            onClick={handleGenerateDescription}
            disabled={true}
            startIcon={<Sparkles />}
          >
            Generate with AI
          </Button>
        }
      />
    </Card>
  );
}
