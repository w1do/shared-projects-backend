"use client";

import type { ProductVariantOption } from "@/lib/admin/mocks/variants";
import { Button } from "@/components/ui/inputs/button";

interface OptionSelectorsProps {
  options: ProductVariantOption[];
  selectedValues: Record<string, string>;
  isOptionValueAvailable: (optionName: string, value: string) => boolean;
  handleSelectValue: (optionName: string, value: string) => void;
}

export function OptionSelectors({
  options,
  selectedValues,
  isOptionValueAvailable,
  handleSelectValue,
}: OptionSelectorsProps) {
  return (
    <div className="space-y-4">
      {options.map((opt) => {
        const selectedVal = selectedValues[opt.name];
        return (
          <div key={opt.name} className="space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground-lighter font-medium">{opt.name}</span>
              <span className="text-foreground font-semibold">
                {selectedVal || "Choose option..."}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const active = selectedVal === val;
                const available = isOptionValueAvailable(opt.name, val);
                const btnColor = active ? "primary" : "surface";

                return (
                  <Button
                    key={val}
                    size="xs"
                    shape="circle"
                    color={btnColor}
                    disabled={!available && !active}
                    onClick={() => handleSelectValue(opt.name, val)}
                    title={!available ? `${val} is currently unavailable` : undefined}
                  >
                    {val}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
