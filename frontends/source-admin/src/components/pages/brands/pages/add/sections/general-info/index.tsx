"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { RichTextEditor } from "@/components/ui/inputs/rich-text-editor";
import { CountryAutocomplete } from "@/components/ui/inputs/country-autocomplete";
import { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";

const popularCountries = [
  "South Korea",
  "France",
  "Japan",
  "United States",
  "Italy",
  "Switzerland",
  "United Kingdom",
  "Germany",
  "Australia",
  "Spain",
];

export function GeneralInfoSection() {
  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext<BrandFormValues>();

  const brandName = watch("name");

  const handleGenerateDescription = () => {
    if (!brandName) return;
    const generated = `${brandName} is an ultra-premium luxury cosmetics maison dedicated to absolute skin perfection and timeless elegance. Combining advanced cellular science with rare botanicals, the brand crafts haute-performance skincare and couture cosmetics for the discerning modern aesthete.`;
    setValue("description", generated, { shouldValidate: true });
  };

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium text-foreground leading-tight">Brand Details</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Basic identity information of the luxury cosmetics brand
        </p>
      </div>

      <Input
        {...register("name")}
        label="Brand Name"
        placeholder="e.g. Sulwhasoo, HERA, Chanel"
        error={errors.name?.message}
      />

      <Controller
        control={control}
        name="origin"
        render={({ field }) => (
          <CountryAutocomplete
            value={field.value}
            onChange={field.onChange}
            countries={popularCountries}
            label="Origin Country"
            placeholder="Select or type country (e.g. South Korea, France, Japan)"
            error={errors.origin?.message}
          />
        )}
      />

      <RichTextEditor
        content={watch("description") || ""}
        onChange={(html) => setValue("description", html, { shouldValidate: true })}
        label="Brand Description"
        placeholder="Describe the brand identity, luxury philosophy, core value proposition, and key product lines..."
        error={errors.description?.message}
        labelRight={
          <Button
            type="button"
            variant="text"
            onClick={handleGenerateDescription}
            disabled={!brandName}
            startIcon={<Sparkles />}
          >
            Generate description
          </Button>
        }
      />
    </Card>
  );
}
