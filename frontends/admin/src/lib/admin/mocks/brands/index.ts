import { initialBrands, initialBrandDetailsBySlug } from "@/lib/admin/brands/initial";
import { readStoredBrands, readStoredBrandDetails } from "@/lib/admin/brands/store";
import type { Brand } from "../types";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";

export type { BrandContent } from "./data";
export { brandLogoPath, brandThumbnailPath } from "../../brands/initial";
export { buildBrandPreviewProducts } from "./preview-products";

export const brands: Brand[] = initialBrands;
export const brandDetailsBySlug: Record<
  string,
  Partial<BrandFormValues>
> = initialBrandDetailsBySlug;

if (typeof window !== "undefined") {
  const storedBrands = [...readStoredBrands()];
  brands.length = 0;
  brands.push(...storedBrands);

  const storedDetails = readStoredBrandDetails();
  // Clear keys and re-populate details in-place
  for (const key of Object.keys(brandDetailsBySlug)) {
    delete brandDetailsBySlug[key];
  }
  Object.assign(brandDetailsBySlug, storedDetails);
}
