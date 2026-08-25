"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type {
  ProductVariantConfig,
  ProductVariantItem,
  ProductVariantOption,
} from "@/lib/admin/mocks/variants";
import {
  computeVariantGroupsStats,
  generateOptionCombinations,
} from "@/components/pages/variants/sections/utils/VariantsUtils";
import { useVariantsQuery } from "@/hooks/admin/variants";
import { useSaveVariantConfigsMutation } from "@/hooks/admin/variants";

export function useVariantsPanel(initialApiConfigs: ProductVariantConfig[] = []) {
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product") || searchParams.get("search");

  const hasSeed = initialApiConfigs.length > 0;
  const { data: queryConfigs = initialApiConfigs } = useVariantsQuery({
    // Seed only when the page already resolved data (or tests pass seed).
    initialData: hasSeed ? initialApiConfigs : undefined,
  });
  const saveMutation = useSaveVariantConfigsMutation();
  const [configs, setConfigs] = useState<ProductVariantConfig[]>(
    hasSeed ? initialApiConfigs : queryConfigs,
  );

  // Keep local editor matrix in sync when Query rehydrates from localStorage.
  useEffect(() => {
    if (queryConfigs.length > 0) {
      setConfigs(queryConfigs);
    }
  }, [queryConfigs]);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    () => (productParam || (initialApiConfigs[0] ?? queryConfigs[0])?.productId) ?? "",
  );

  useEffect(() => {
    if (productParam) {
      setSelectedProductId(productParam);
    }
  }, [productParam]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeConfig = useMemo(() => {
    return configs.find((c) => c.productId === selectedProductId) || configs[0] || null;
  }, [configs, selectedProductId]);

  const statsGroups = useMemo(() => computeVariantGroupsStats(configs), [configs]);

  const handleOptionsChange = (newOptions: ProductVariantOption[]) => {
    if (!activeConfig) return;
    const generatedCombos = generateOptionCombinations(newOptions);

    // Only keep existing items that match the new options. DO NOT auto-generate new ones.
    const updatedItems: ProductVariantItem[] = [];
    generatedCombos.forEach((combo) => {
      const existing = activeConfig.items.find((item) =>
        newOptions.every((opt) => item.options[opt.name] === combo[opt.name]),
      );
      if (existing) {
        updatedItems.push(existing);
      }
    });

    setConfigs(
      configs.map((c) =>
        c.productId === activeConfig.productId
          ? { ...c, options: newOptions, items: updatedItems }
          : c,
      ),
    );
  };

  const handleItemsChange = (newItems: ProductVariantItem[]) => {
    if (!activeConfig) return;

    setConfigs(
      configs.map((c) =>
        c.productId === activeConfig.productId
          ? {
              ...c,
              items: newItems,
            }
          : c,
      ),
    );
  };

  const handleSaveMatrix = () => {
    if (!activeConfig) return;
    saveMutation.mutate(configs, {
      onSuccess: () => {
        toast.success(`Saved variant configurations for ${activeConfig.productName}`, {
          description: `Configured ${activeConfig.options.length} options and ${activeConfig.items.length} variant items.`,
          position: "bottom-center",
        });
      },
      onError: () => toast.error("Could not save variant configurations."),
    });
  };

  const handleCreateGroup = (
    productId: string,
    productName: string,
    initialOptions: ProductVariantOption[],
  ) => {
    const generatedCombos = generateOptionCombinations(initialOptions);
    const generatedItems: ProductVariantItem[] = generatedCombos.map((combo, index) => ({
      id: `${productId}-v-${Date.now()}-${index}`,
      options: combo,
      sku: "",
      price: 45,
      stock: 0,
      image: "",
      status: "Out of Stock" as const,
    }));

    const newConfig: ProductVariantConfig = {
      productId: productId,
      productName: productName,
      productImage: "",
      options: initialOptions,
      items: generatedItems,
    };

    setConfigs((prev) => [...prev, newConfig]);
    setSelectedProductId(productId);
    setIsCreateModalOpen(false);
    toast.success(`Created new variant configuration for "${productName}"`, {
      position: "bottom-center",
    });
  };

  const handleDeleteConfig = (productId: string) => {
    const nextConfigs = configs.filter((c) => c.productId !== productId);
    setConfigs(nextConfigs);
    if (selectedProductId === productId) {
      setSelectedProductId(nextConfigs[0]?.productId ?? "");
    }
    toast.success("Deleted variant configuration. Product is now standalone.", {
      position: "bottom-center",
    });
  };

  return {
    configs,
    selectedProductId,
    activeConfig,
    statsGroups,
    isCreateModalOpen,
    setSelectedProductId,
    setIsCreateModalOpen,
    handleOptionsChange,
    handleItemsChange,
    handleSaveMatrix,
    handleCreateGroup,
    handleDeleteConfig,
  };
}
