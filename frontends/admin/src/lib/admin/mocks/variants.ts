import { productThumbnail, slugifyName, sourceProducts } from "./source/catalog-source";

export interface ProductVariantOption {
  name: string; // e.g. "Volume", "Skin Type", "Finish"
  values: string[]; // e.g. ["30ml", "50ml"]
}

export interface ProductVariantItem {
  id: string;
  options: Record<string, string>; // e.g. { "Volume": "30ml", "Skin Type": "Dry" }
  sku: string;
  price: number;
  stock: number;
  image: string;
  status: "Active" | "Draft" | "Out of Stock" | "Disabled";
  isUnlinked?: boolean;
  linkedProductName?: string;
  linkedProductId?: string;
}

export interface ProductVariantConfig {
  productId: string;
  productName: string;
  productImage: string;
  options: ProductVariantOption[];
  items: ProductVariantItem[];
  maxTotalStock?: number;
}

/** Variant matrices for the admin Variants page, derived from the dataset. */
export const mockVariantConfigs: ProductVariantConfig[] = sourceProducts.map((product) => {
  const slug = slugifyName(product.name);
  const image = productThumbnail(slug);

  const options: ProductVariantOption[] = product.variant_config.dimensions.map((dim) => ({
    name: dim.name,
    values: dim.values.map((v) => String(v)),
  }));

  const items: ProductVariantItem[] = product.variant_config.catalog.map((item) => {
    return {
      id: `${slug}-${item.id}`,
      options: item.options as Record<string, string>,
      sku: item.sku,
      price: item.price,
      stock: item.stock_quantity,
      image,
      status: item.status as "Active" | "Draft" | "Out of Stock" | "Disabled",
      isUnlinked: false,
    };
  });

  const maxTotalStock = product.variant_config.catalog.reduce(
    (sum, item) => sum + (item.stock_quantity ?? 0),
    0,
  );

  return {
    productId: slug,
    productName: product.name,
    productImage: image,
    options,
    items,
    maxTotalStock,
  };
});
