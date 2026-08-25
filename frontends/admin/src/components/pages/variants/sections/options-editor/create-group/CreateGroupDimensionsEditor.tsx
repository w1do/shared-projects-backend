"use client";

import { useState } from "react";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Button } from "@/components/ui/inputs/button";
import { ListPlus } from "lucide-react";
import { toast } from "sonner";
import type { ProductVariantOption } from "@/lib/admin/mocks/variants";
import { DimensionCard } from "../components/DimensionCard";

interface CreateGroupDimensionsEditorProps {
  options: ProductVariantOption[];
  onChangeOptions: (options: ProductVariantOption[]) => void;
}

export function CreateGroupDimensionsEditor({
  options,
  onChangeOptions,
}: CreateGroupDimensionsEditorProps) {
  const [newDimName, setNewDimName] = useState("");
  const [newValues, setNewValues] = useState<Record<string, string>>({}); // optionName -> input value
  const [activeInputOptName, setActiveInputOptName] = useState<string | null>(null);

  const handleAddOption = () => {
    const clean = newDimName.trim();
    if (!clean) {
      toast.error("Option name cannot be empty");
      return;
    }
    if (options.some((o) => o.name.toLowerCase() === clean.toLowerCase())) {
      toast.error("An option with this name already exists");
      return;
    }

    onChangeOptions([...options, { name: clean, values: [] }]);
    setNewDimName("");
    toast.success(`Added option dimension: ${clean}`);
  };

  const handleRemoveOption = (name: string) => {
    onChangeOptions(options.filter((o) => o.name !== name));
    toast.success(`Removed option dimension: ${name}`);
  };

  const handleAddValue = (optName: string) => {
    const val = newValues[optName]?.trim() || "";
    if (!val) return;
    const target = options.find((o) => o.name === optName);
    if (!target) return;
    if (target.values.includes(val)) {
      toast.error("Value already exists for this option");
      return;
    }

    const updated = options.map((o) => {
      if (o.name === optName) {
        return { ...o, values: [...o.values, val] };
      }
      return o;
    });
    onChangeOptions(updated);
    setNewValues((prev) => ({ ...prev, [optName]: "" }));
    toast.success(`Added value "${val}" to ${optName}`);
  };

  const handleRemoveValue = (optName: string, valToRemove: string) => {
    const updated = options.map((o) => {
      if (o.name === optName) {
        return { ...o, values: o.values.filter((v) => v !== valToRemove) };
      }
      return o;
    });
    onChangeOptions(updated);
  };

  return (
    <Card variant="form-section">
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
      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <Label
          htmlFor="create-group-dimension"
          className="text-xs font-medium text-muted-foreground block"
        >
          Create New Dimension
        </Label>
        <div className="flex gap-2 items-center">
          <Input
            id="create-group-dimension"
            value={newDimName}
            onChange={(e) => setNewDimName(e.target.value)}
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
            shape="circle"
            size="md"
            onClick={handleAddOption}
            startIcon={<ListPlus size={14} />}
            className="shrink-0 font-semibold"
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
