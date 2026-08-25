import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import type { InventoryItem, ProductFull } from "@/lib/admin/mocks/types";
import type { ApiInventoryItem, ApiProduct } from "../api-types";
import { semanticColors } from "@/lib/theme-colors";
import {
  money,
  prettifyAttributeName,
  statusMap,
  stockStatusMap,
  variantAttributes,
} from "./shared";

export function mapProduct(product: ApiProduct): ProductFull {
  const variants = product.variants ?? [];
  const stock = variants.reduce(
    (sum, variant) => sum + (variant.inventory?.onHand ?? variant.stockQuantity ?? 0),
    0,
  );
  const threshold = variants.reduce((sum, variant) => sum + (variant.inventory?.threshold ?? 0), 0);
  const stockStatus: ProductFull["stockStatus"] =
    stock === 0 ? "Out of Stock" : threshold > 0 && stock <= threshold ? "Low Stock" : "In Stock";

  return {
    id: product.id,
    name: product.name,
    brand: product.brand?.name ?? "Aetheria",
    category: product.category?.name ?? "Catalog",
    sku: variants[0]?.sku ?? product.slug.toUpperCase(),
    price: money(product.price),
    unitsSold: product.unitsSold,
    revenue: money(product.revenue) || money(product.price) * product.unitsSold,
    gradient: [
      product.gradientStart ?? semanticColors.accent,
      product.gradientEnd ?? semanticColors.brandAccentHover,
    ],
    image: product.imageUrl ?? undefined,
    status: statusMap[product.status],
    stock,
    stockStatus,
    updatedAt: product.updatedAt ?? new Date().toISOString(),
    createdAt: product.createdAt ?? new Date().toISOString(),
    variants: variants.length,
  };
}

type InventoryProductData = {
  brand: string;
  image?: string;
  price: number;
  revenue: number;
};

export type InventoryProductLookup = Map<string, InventoryProductData>;

export function buildInventoryProductLookup(products: ApiProduct[]): InventoryProductLookup {
  const lookup: InventoryProductLookup = new Map();

  for (const product of products) {
    const fallbackPrice = money(product.price);
    const revenue = money(product.revenue) || fallbackPrice * product.unitsSold;
    const productData = {
      brand: product.brand?.name ?? "Aetheria",
      image: product.imageUrl ?? undefined,
      price: fallbackPrice,
      revenue,
    };

    lookup.set(product.id, productData);

    for (const variant of product.variants ?? []) {
      lookup.set(variant.id, {
        ...productData,
        price: money(variant.price) || fallbackPrice,
      });
    }
  }

  return lookup;
}

export function mapVariantConfig(product: ApiProduct): ProductVariantConfig {
  const variants = product.variants ?? [];
  const optionNames = Array.from(
    new Set(variants.flatMap((variant) => Object.keys(variantAttributes(variant)))),
  );
  const optionLabels = new Map(optionNames.map((name) => [name, prettifyAttributeName(name)]));

  return {
    productId: product.id,
    productName: product.name,
    productImage: product.imageUrl ?? "",
    options: optionNames.map((name) => ({
      name: optionLabels.get(name) ?? name,
      values: Array.from(
        new Set(
          variants
            .map((variant) => variantAttributes(variant)[name])
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    })),
    items: variants.map((variant) => {
      const stock = variant.inventory?.onHand ?? variant.stockQuantity;
      return {
        id: variant.id,
        options: Object.fromEntries(
          Object.entries(variantAttributes(variant)).map(([key, value]) => [
            optionLabels.get(key) ?? key,
            value,
          ]),
        ),
        sku: variant.sku,
        price: money(variant.price),
        stock,
        image: product.imageUrl ?? "",
        status: stock > 0 ? "Active" : "Out of Stock",
      };
    }),
  };
}

export function mapInventoryItem(
  item: ApiInventoryItem,
  productLookup?: InventoryProductLookup,
): InventoryItem {
  const productData = productLookup?.get(item.variantId) ?? productLookup?.get(item.productId);
  const price = money(item.price) || productData?.price || 0;

  return {
    id: item.id,
    variantId: item.variantId,
    productId: item.productId,
    name: item.productName,
    sku: item.sku,
    brand: productData?.brand ?? "Aetheria",
    stock: item.onHand,
    incoming: item.incoming,
    threshold: item.threshold,
    location: item.location ?? "Main warehouse",
    stockStatus: stockStatusMap[item.status],
    price,
    revenue: money(item.revenue) || productData?.revenue || 0,
    image: productData?.image,
    updatedAt: new Date().toISOString(),
  } as InventoryItem;
}
