"use client";

import * as React from "react";
import type { ProductVariantItem, ProductVariantOption } from "@/lib/admin/mocks/variants";

interface UseAddVariantProps {
  isOpen: boolean;
  options: ProductVariantOption[];
  existingItems: ProductVariantItem[];
  maxTotalStock: number;
  currentTotalStockUsed: number;
  productId: string;
  baseImage: string;
  onAdd: (newItem: ProductVariantItem) => void;
}

export function useAddVariant({
  isOpen,
  options,
  existingItems,
  maxTotalStock,
  currentTotalStockUsed,
  productId,
  baseImage,
  onAdd,
}: UseAddVariantProps) {
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string>>({});
  const [price, setPrice] = React.useState("45.00");
  const [stock, setStock] = React.useState("0");
  const [status, setStatus] = React.useState<"Active" | "Draft" | "Out of Stock" | "Disabled">(
    "Out of Stock",
  );

  const [priceError, setPriceError] = React.useState("");
  const [stockError, setStockError] = React.useState("");

  const maxAllowedStock = React.useMemo(() => {
    return Math.max(0, maxTotalStock - currentTotalStockUsed);
  }, [maxTotalStock, currentTotalStockUsed]);

  React.useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      options.forEach((opt) => {
        initial[opt.name] = opt.values[0] || "";
      });
      setSelectedValues(initial);
      setPrice("45.00");
      setStock("0");
      setStatus("Out of Stock");
      setPriceError("");
      setStockError("");
    }
  }, [isOpen, options]);

  const isAlreadyAdded = React.useMemo(() => {
    if (options.length === 0) return false;
    return existingItems.some((item) => {
      return options.every((opt) => item.options[opt.name] === selectedValues[opt.name]);
    });
  }, [selectedValues, existingItems, options]);

  const handleStockChange = (val: string) => {
    setStock(val);
    const parsedStock = parseInt(val, 10);
    if (!isNaN(parsedStock)) {
      if (parsedStock === 0) {
        setStatus("Out of Stock");
      } else if (parsedStock > 0 && status === "Out of Stock") {
        setStatus("Active");
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAlreadyAdded) return;

    let hasError = false;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setPriceError("Price must be a valid positive number.");
      hasError = true;
    } else {
      setPriceError("");
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setStockError("Stock must be a non-negative integer.");
      hasError = true;
    } else if (parsedStock > maxAllowedStock) {
      setStockError(
        `Stock cannot exceed remaining warehouse capacity of ${maxAllowedStock} items.`,
      );
      hasError = true;
    } else {
      setStockError("");
    }

    if (hasError) return;

    const valSuffix = Object.values(selectedValues)
      .map((val) =>
        val
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 3)
          .toUpperCase(),
      )
      .join("-");

    const firstSku = existingItems[0]?.sku || "";
    const baseSku = firstSku ? firstSku.split("-")[0] : productId.toUpperCase();
    const generatedSku = `${baseSku}-${valSuffix}`;

    const newItem: ProductVariantItem = {
      id: `${productId}-v-${Date.now()}`,
      options: selectedValues,
      sku: generatedSku,
      price: parsedPrice,
      stock: parsedStock,
      image: baseImage,
      status,
      isUnlinked: false,
    };

    onAdd(newItem);
  };

  return {
    selectedValues,
    setSelectedValues,
    price,
    setPrice,
    stock,
    handleStockChange,
    status,
    setStatus,
    priceError,
    stockError,
    maxAllowedStock,
    isAlreadyAdded,
    handleFormSubmit,
  };
}
