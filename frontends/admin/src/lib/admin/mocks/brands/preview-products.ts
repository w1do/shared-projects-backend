import type { Product } from "@/lib/admin/mocks/types";
import { semanticColors } from "@/lib/theme-colors";

/**
 * Generic high-end beauty products used by the brand preview modal when the
 * selected brand has no catalog products yet. Brand name is injected so the
 * storefront cards feel brand-owned rather than shared placeholders.
 */
export function buildBrandPreviewProducts(brandName: string): Product[] {
  return [
    {
      id: "mock1",
      name: "Cellular Recovery Intensive Serum",
      brand: brandName,
      category: "Serum",
      sku: "MOCK-SERUM",
      price: 135,
      unitsSold: 320,
      revenue: 43200,
      gradient: [semanticColors.accent, semanticColors.info],
      image: "/products/images/radiant-aura-serum.webp",
      stock: 85,
      discount: 15,
    },
    {
      id: "mock2",
      name: "Luminous Dew Velvet Cream",
      brand: brandName,
      category: "Cream",
      sku: "MOCK-CREAM",
      price: 98,
      unitsSold: 450,
      revenue: 44100,
      gradient: [semanticColors.accent, semanticColors.brandAccent],
      image: "/products/images/glacial-water-cream.webp",
      stock: 8,
      discount: 20,
    },
    {
      id: "mock3",
      name: "Supreme Essential Infusion Oil",
      brand: brandName,
      category: "Facial Oil",
      sku: "MOCK-OIL",
      price: 165,
      unitsSold: 180,
      revenue: 29700,
      gradient: [semanticColors.successBg, semanticColors.info],
      image: "/products/images/ritual-night-oil.webp",
      stock: 156,
    },
  ];
}
