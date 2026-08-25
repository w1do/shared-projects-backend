"use client";

import { useState, useEffect, useMemo } from "react";
import type { ProductVariantOption, ProductVariantItem } from "@/lib/admin/mocks/variants";
import { getProductMeta } from "@/components/pages/variants/sections/utils/VariantsUtils";

interface UseStorefrontPreviewProps {
  options: ProductVariantOption[];
  items: ProductVariantItem[];
  productName: string;
}

export function useStorefrontPreview({ options, items, productName }: UseStorefrontPreviewProps) {
  // Store selected value for each option dimension
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  // Sync selected values when options change
  useEffect(() => {
    setSelectedValues((prev) => {
      const initial: Record<string, string> = {};
      let changed = false;
      options.forEach((opt) => {
        const currentValue = prev[opt.name];
        if (currentValue && opt.values.includes(currentValue)) {
          initial[opt.name] = currentValue;
        } else {
          initial[opt.name] = opt.values[0] || "";
          changed = true;
        }
      });
      if (Object.keys(initial).length !== Object.keys(prev).length) {
        changed = true;
      }
      return changed ? initial : prev;
    });
  }, [options]);

  // Filter options to only show values that have at least one linked/active combination
  const filteredOptions = useMemo(() => {
    return options
      .map((opt) => {
        const activeValues = opt.values.filter((val) => {
          return items.some((item) => !item.isUnlinked && item.options[opt.name] === val);
        });
        return {
          ...opt,
          values: activeValues,
        };
      })
      .filter((opt) => opt.values.length > 0);
  }, [options, items]);

  // Find the generated variant item matching the active selections combination
  const activeVariant = useMemo(() => {
    if (options.length === 0 || items.length === 0) return null;

    const hasAllSelections = options.every((opt) => !!selectedValues[opt.name]);
    if (!hasAllSelections) return null;

    const found = items.find((item) => {
      return (
        !item.isUnlinked &&
        options.every((opt) => item.options[opt.name] === selectedValues[opt.name])
      );
    });

    if (found?.status === "Disabled") return null;

    return found || null;
  }, [items, options, selectedValues]);

  // Helper to check if a specific value is available in combination with OTHER currently selected values
  const isOptionValueAvailable = (optionName: string, value: string) => {
    if (options.length <= 1) {
      return items.some(
        (item) =>
          item.options[optionName] === value && item.status !== "Disabled" && !item.isUnlinked,
      );
    }

    return items.some((item) => {
      if (item.status === "Disabled" || item.isUnlinked) return false;
      if (item.options[optionName] !== value) return false;
      return options.every((opt) => {
        if (opt.name === optionName) return true;
        const currentSelected = selectedValues[opt.name];
        return !currentSelected || item.options[opt.name] === currentSelected;
      });
    });
  };

  // Helper to calculate price difference compared to active selection
  const getPriceDifferenceLabel = (optionName: string, value: string) => {
    if (!activeVariant) return "";

    // Find what variant would be selected if we only changed this option to 'value'
    const simulatedSelections = { ...selectedValues, [optionName]: value };
    const simulatedVariant = items.find((item) => {
      return (
        !item.isUnlinked &&
        options.every((opt) => item.options[opt.name] === simulatedSelections[opt.name])
      );
    });

    if (!simulatedVariant || simulatedVariant.status === "Disabled") return "";

    const diff = simulatedVariant.price - activeVariant.price;
    if (diff > 0) {
      return ` (+ $${diff})`;
    } else if (diff < 0) {
      return ` (- $${Math.abs(diff)})`;
    }
    return "";
  };

  const handleSelectValue = (optionName: string, value: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Rich metadata details mocked dynamically based on the product catalog
  const productMeta = useMemo(() => {
    return getProductMeta(productName);
  }, [productName]);

  return {
    selectedValues,
    activeVariant,
    isOptionValueAvailable,
    getPriceDifferenceLabel,
    handleSelectValue,
    productMeta,
    filteredOptions,
  };
}
