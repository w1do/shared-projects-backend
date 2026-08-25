import { sourceProducts, type SourceProduct } from "@/lib/admin/mocks/source/catalog-source";
import { generateSku } from "@/lib/admin/products-helpers";
import {
  brandIdToName,
  categoryIdToName,
  dateForSlug,
  gradientForSlug,
  hashString,
  lowestPrice,
  productThumbnail,
  productGallery,
  slugifyName,
  stockStatusFor,
  totalStock,
} from "@/lib/admin/mocks/source/catalog-source";
import type { ProductFull, InventoryItem, ProductContentBlock } from "@/lib/admin/mocks/types";
import { initialCollections } from "@/lib/admin/mocks/taxonomy/collections-data";

function statusForSlug(slug: string, stock: number): ProductFull["status"] {
  if (stock <= 0) return "Archived";
  return hashString(slug) % 9 === 0 ? "Draft" : "Active";
}

function buildContentBlocks(slug: string, product: SourceProduct): ProductContentBlock[] {
  const blocks: ProductContentBlock[] = [];
  let position = 0;

  const content = product.content;
  if (!content) return blocks;

  if (content.ingredients && content.ingredients.length > 0) {
    blocks.push({
      id: `block-ing-${slug}`,
      title: "Key Ingredients",
      slug: "key-ingredients",
      displayType: "list" as const,
      content: {
        items: content.ingredients,
      },
      isVisible: true,
      position: position++,
    });
  }

  if (content.usage_steps && content.usage_steps.length > 0) {
    blocks.push({
      id: `block-use-${slug}`,
      title: "How to Use",
      slug: "how-to-use",
      displayType: "list" as const,
      content: {
        items: content.usage_steps,
      },
      isVisible: true,
      position: position++,
    });
  }

  if (content.specifications && Object.keys(content.specifications).length > 0) {
    blocks.push({
      id: `block-spec-${slug}`,
      title: "Specifications",
      slug: "specifications",
      displayType: "key_value" as const,
      content: {
        items: Object.entries(content.specifications).map(([key, value]) => ({
          key: key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          value: Array.isArray(value) ? value.join(", ") : String(value),
        })),
      },
      isVisible: true,
      position: position++,
    });
  }

  if (content.faq && content.faq.length > 0) {
    blocks.push({
      id: `block-faq-${slug}`,
      title: "Frequently Asked Questions",
      slug: "faq",
      displayType: "faq_accordion" as const,
      content: {
        items: content.faq.map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
      },
      isVisible: true,
      position: position++,
    });
  }

  return blocks;
}

export const initialProductsCatalog: ProductFull[] = sourceProducts.map((product) => {
  const slug = slugifyName(product.name);
  const brand = brandIdToName[product.brand] ?? "Ætheria";
  const category = categoryIdToName[product.category] ?? "Skincare";
  const price = lowestPrice(product.variant_config.catalog);
  const stock = totalStock(product.variant_config.catalog);
  const discount = Math.round(
    product.variant_config.catalog.reduce((max, v) => Math.max(max, v.discount_percentage ?? 0), 0),
  );

  return {
    id: slug,
    name: product.name,
    brand,
    category,
    sku: generateSku(product.name, brand, category),
    price,
    unitsSold: product.sales_count,
    revenue: Math.round(product.sales_count * price),
    gradient: gradientForSlug(slug),
    image: productThumbnail(slug),
    status: statusForSlug(slug, stock),
    stock,
    stockStatus: stockStatusFor(stock),
    updatedAt: dateForSlug(slug, 30),
    createdAt: dateForSlug(slug),
    variants: product.variant_config.catalog.length,
    discount: discount > 0 ? discount : undefined,
    description: product.description,
    shortDescription: product.slogan,
    images: [productThumbnail(slug), ...productGallery(slug)],
    contentBlocks: buildContentBlocks(slug, product),
    weight: product.weight,
    collections: initialCollections.filter((c) => c.products.includes(slug)).map((c) => c.name),
  };
});

export const initialInventoryItems: InventoryItem[] = initialProductsCatalog.map((product, idx) => {
  const incoming = idx % 3 === 0 ? 50 : idx % 5 === 0 ? 100 : 0;
  const threshold = product.price > 100 ? 10 : product.price > 50 ? 20 : 50;

  const aisles = ["A", "B", "C", "D"];
  const shelf = (idx % 4) + 1;
  const position = (idx % 3) + 1;
  const location = `Aisle ${aisles[idx % 4]}, Shelf ${shelf}-${position}`;

  return {
    id: `inv-${product.id}`,
    productId: product.id,
    name: product.name,
    sku: product.sku,
    brand: product.brand,
    stock: product.stock,
    incoming,
    threshold,
    location,
    stockStatus: product.stockStatus,
    price: product.price,
    image: product.image,
    updatedAt: product.updatedAt,
  };
});
