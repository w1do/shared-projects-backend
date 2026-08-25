import type { ProductVariantOption, ProductVariantConfig } from "@/lib/admin/mocks/variants";

export interface ProductMeta {
  category: string;
  description: string;
  rating: number;
  reviewsCount: string;
  compareMultiplier: number;
}

export function getProductMeta(productName: string): ProductMeta {
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("bichup") || nameLower.includes("essence")) {
    return {
      category: "Hydration Focus",
      description: "Layered humectant hydration for deep cellular recovery",
      rating: 4.9,
      reviewsCount: "3,075",
      compareMultiplier: 1.25,
    };
  }
  if (nameLower.includes("lipstick") || nameLower.includes("matte")) {
    return {
      category: "Velvet Finish",
      description: "Rich pigment matte liquid formula with long-lasting hydration",
      rating: 4.8,
      reviewsCount: "1,824",
      compareMultiplier: 1.2,
    };
  }
  return {
    category: "Satin Coverage",
    description: "Weightless long-wear liquid foundation with a radiant natural glow",
    rating: 4.7,
    reviewsCount: "942",
    compareMultiplier: 1.3,
  };
}

export function generateOptionCombinations(
  options: ProductVariantOption[],
): Record<string, string>[] {
  if (options.length === 0) return [];
  const activeOptions = options.filter((o) => o.values.length > 0);
  if (activeOptions.length === 0) return [];

  const helper = (index: number): Record<string, string>[] => {
    if (index === activeOptions.length) return [{}];
    const opt = activeOptions[index]!;
    const results: Record<string, string>[] = [];
    const subResults = helper(index + 1);

    opt.values.forEach((val) => {
      subResults.forEach((sub) => {
        results.push({ [opt.name]: val, ...sub });
      });
    });
    return results;
  };

  return helper(0);
}

export function computeVariantGroupsStats(configs: ProductVariantConfig[]) {
  return configs.map((c) => ({
    id: c.productId,
    name: c.productName,
    type: (c.options[0]?.name.toLowerCase().includes("color") ||
    c.options[0]?.name.toLowerCase().includes("shade")
      ? "shade"
      : "size") as "shade" | "size",
    optionsName: c.options[0]?.name || "Option",
    status: "active" as const,
    members: c.items.map((it) => ({
      productId: it.id,
      productName: `${c.productName} · ${Object.values(it.options).join(" · ")}`,
      sku: it.sku,
      price: it.price,
      stock: it.stock,
      image: it.image,
      optionValue: Object.values(it.options).join(" · "),
    })),
    updatedAt: "Just now",
  }));
}
