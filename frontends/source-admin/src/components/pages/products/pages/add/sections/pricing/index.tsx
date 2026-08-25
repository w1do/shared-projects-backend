"use client";

import { useFormContext } from "react-hook-form";
import { DollarSign, Percent, Weight } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Switch } from "@/components/ui/inputs/switch";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function PricingSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const price = watch("price") || 0;
  const discount = watch("discount") || 0;
  const trackQuantity = watch("trackQuantity") ?? true;

  const finalPrice = price * (1 - discount / 100);

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium text-foreground leading-tight">
          Pricing & Inventory
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          Configure product pricing, discount rates, and stock levels
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Input
          {...register("price", { valueAsNumber: true })}
          label="Price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          startIcon={<DollarSign />}
          error={errors.price?.message}
        />

        <Input
          {...register("discount", { valueAsNumber: true })}
          label="Discount (%)"
          type="number"
          min="0"
          max="100"
          placeholder="0"
          startIcon={<Percent />}
          error={errors.discount?.message}
        />

        <Input
          label="Price after Discount"
          type="number"
          value={price > 0 ? finalPrice.toFixed(2) : "0.00"}
          readOnly
          disabled
          startIcon={<DollarSign />}
        />
      </div>

      <div className="border-t border-border/40 my-1" />

      {/* Weight */}
      <Input
        {...register("weight", { valueAsNumber: true })}
        label="Weight (grams)"
        type="number"
        min="0"
        placeholder="0"
        startIcon={<Weight />}
        error={errors.weight?.message}
      />

      <div className="border-t border-border/40 my-1" />

      {/* Inventory tracking */}
      <div className="flex items-center justify-between">
        <div>
          <Label
            htmlFor="product-track-quantity"
            className="text-xs font-semibold text-foreground block"
          >
            Track Inventory quantity
          </Label>
          <span className="text-xs text-muted-foreground-lighter">
            Automatically track this product item levels in stock
          </span>
        </div>
        <Switch
          id="product-track-quantity"
          checked={trackQuantity}
          onCheckedChange={(checked) =>
            setValue("trackQuantity", checked, { shouldValidate: true })
          }
        />
      </div>

      {trackQuantity && (
        <div className="animate-fade-in">
          <Input
            {...register("stock", { valueAsNumber: true })}
            label="Initial Stock"
            type="number"
            min="0"
            placeholder="0"
            error={errors.stock?.message}
          />
        </div>
      )}
    </Card>
  );
}
