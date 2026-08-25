"use client";

import { useState } from "react";
import type { ProductVariantOption } from "@/lib/admin/mocks/variants";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { ListPlus } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { toast } from "sonner";
import { DimensionCard } from "./components/DimensionCard";

interface VariantOptionsEditorProps {
  options: ProductVariantOption[];
  onOptionsChange: (newOptions: ProductVariantOption[]) => void;
}

export function VariantOptionsEditor({ options, onOptionsChange }: VariantOptionsEditorProps) {
  const [newOptionName, setNewOptionName] = useState("");
  const [newValues, setNewValues] = useState<Record<string, string>>({}); // optionName -> text value input
  const [activeInputOptName, setActiveInputOptName] = useState<string | null>(null);

  const handleAddOption = () => {
    if (!newOptionName.trim()) {
      toast.error("Option name cannot be empty");
      return;
    }

    const cleanName = newOptionName.trim();
    if (options.some((o) => o.name.toLowerCase() === cleanName.toLowerCase())) {
      toast.error("An option with this name already exists");
      return;
    }

    const updated = [...options, { name: cleanName, values: [] }];
    onOptionsChange(updated);
    setNewOptionName("");
    toast.success(`Added option dimension: ${cleanName}`);
  };

  const handleRemoveOption = (name: string) => {
    const updated = options.filter((o) => o.name !== name);
    onOptionsChange(updated);
    toast.success(`Removed option dimension: ${name}`);
  };

  const handleAddValue = (optionName: string) => {
    const inputValue = newValues[optionName]?.trim() || "";
    if (!inputValue) return;

    const targetOption = options.find((o) => o.name === optionName);
    if (!targetOption) return;

    if (targetOption.values.includes(inputValue)) {
      toast.error("Value already exists for this option");
      return;
    }

    const updated = options.map((o) => {
      if (o.name === optionName) {
        return { ...o, values: [...o.values, inputValue] };
      }
      return o;
    });

    onOptionsChange(updated);
    setNewValues((prev) => ({ ...prev, [optionName]: "" }));
    toast.success(`Added value "${inputValue}" to ${optionName}`);
  };

  const handleRemoveValue = (optionName: string, valueToRemove: string) => {
    const updated = options.map((o) => {
      if (o.name === optionName) {
        return { ...o, values: o.values.filter((v) => v !== valueToRemove) };
      }
      return o;
    });
    onOptionsChange(updated);
  };

  return (
    <Card variant="form-section">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-heading font-medium text-foreground leading-tight">
            Variant Dimensions
          </h2>
          <p className="text-xs text-muted-foreground-lighter">
            Define attributes (e.g. Size, Skin Type) to generate variant items.
          </p>
        </div>
      </div>

      {/* List of existing options */}
      <div className="space-y-4">
        {options.length > 0 ? (
          options.map((opt) => (
            <DimensionCard
              key={opt.name}
              opt={opt}
              activeInputOptName={activeInputOptName}
              newValues={newValues}
              setNewValues={setNewValues}
              setActiveInputOptName={setActiveInputOptName}
              handleRemoveOption={handleRemoveOption}
              handleRemoveValue={handleRemoveValue}
              handleAddValue={handleAddValue}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-2xl border border-dashed border-border/60 text-center gap-2">
            <span className="text-xs font-semibold text-foreground">No dimensions defined yet</span>
            <p className="text-caption text-muted-foreground-lighter max-w-xs leading-normal">
              Add dimensions like "Volume", "Shade", or "Size" below to structure your product
              variations.
            </p>
          </div>
        )}
      </div>

      {/* Add New Option field */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
        <Label
          htmlFor="variant-create-dimension"
          className="text-xs font-medium text-muted-foreground block"
        >
          Create New Dimension
        </Label>
        <div className="flex gap-2 items-center">
          <Input
            id="variant-create-dimension"
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddOption();
              }
            }}
            placeholder="e.g. Scent, Shade, Finish"
          />
          <Button
            type="button"
            variant="contained"
            size="md"
            onClick={handleAddOption}
            startIcon={<ListPlus size={14} />}
            className="shrink-0"
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
