import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import type { Brand, Category, Collection, ProductFull } from "@/lib/admin/mocks/types";
import { defaultFormValues } from "@/lib/admin/products/autofill-data";
import type { ProductSelectOption } from "@/components/pages/products/pages/add/sections/sidebar-settings";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";

export interface ProductRefData {
  brands?: Brand[];
  categories?: Category[];
  collections?: Collection[];
}

export interface ProductFormOptions {
  brandOptions: ProductSelectOption[];
  categoryOptions: ProductSelectOption[];
  collectionOptions: string[];
}

/**
 * Build the option lists shared by the add and edit product forms. In API mode
 * the option value is the entity id (used by the backend); in mock mode it is
 * the readable name so the existing mock catalog keeps working unchanged.
 */
export function buildProductFormOptions(
  { brands = [], categories = [], collections = [] }: ProductRefData,
  apiMode: boolean,
): ProductFormOptions {
  return {
    brandOptions: brands.map((brand) => ({
      value: apiMode ? brand.id : brand.name,
      label: brand.name,
    })),
    categoryOptions: categories.map((category) => ({
      value: apiMode ? category.id : category.name,
      label: category.name,
    })),
    collectionOptions: collections.map((collection) => collection.name),
  };
}

/**
 * Map an existing product record onto the product form schema so the edit form
 * can prefill every field it owns. Brand/category are resolved through the
 * option lists so the selected value matches whatever the form expects
 * (entity id in API mode, name in mock mode).
 */
export function buildProductFormDefaults(
  product: ProductFull,
  options: ProductFormOptions,
  variantGroups?: ProductVariantConfig[],
): ProductFormValues {
  const brandValue =
    options.brandOptions.find((option) => option.label === product.brand)?.value ?? product.brand;
  const categoryValue =
    options.categoryOptions.find((option) => option.label === product.category)?.value ??
    product.category;
  const images = product.images ?? (product.image ? [product.image] : []);

  const myVariantConfig = variantGroups?.find(
    (g) => g.productId.toLowerCase() === product.id.toLowerCase(),
  );

  let variantRelation: ProductFormValues["variantRelation"] = {
    mode: "none",
    existingGroupId: "",
    mappedOptions: {},
    newGroupName: "",
    dimensions: [],
    leaderOptions: {},
    options: [],
  };

  if (myVariantConfig && myVariantConfig.items.length > 0) {
    const firstItem = myVariantConfig.items[0];
    variantRelation = {
      mode: "leader",
      existingGroupId: "",
      mappedOptions: {},
      newGroupName: `${product.name} Series`,
      dimensions: myVariantConfig.options.map((o) => o.name),
      leaderOptions: firstItem.options,
      options: myVariantConfig.options,
    };
  }

  return {
    ...defaultFormValues,
    name: product.name,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    brand: brandValue,
    category: categoryValue,
    status: product.status,
    price: product.price,
    sku: product.sku,
    stock: product.stock,
    images,
    thumbnail: product.image ?? "",
    contentBlocks: product.contentBlocks ?? [],
    weight: product.weight ?? 0,
    collections: product.collections ?? [],
    variantRelation,
  };
}
