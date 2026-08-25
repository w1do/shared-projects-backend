import type { ProductFull, InventoryItem } from "@/lib/admin/mocks/types";
import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import { resolveStockStatus } from "@/lib/admin/shared/stock-status";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { initialProductsCatalog, initialInventoryItems } from "./initial";
import { storageKey } from "@/lib/site-config";

const productStore = createVersionedLocalStore<ProductFull>({
  storageKey: storageKey("products"),
  seedVersionKey: storageKey("products-seed-version"),
  seedVersion: "18",
  seed: initialProductsCatalog,
});

const inventoryStore = createVersionedLocalStore<InventoryItem>({
  storageKey: storageKey("inventory"),
  seedVersionKey: storageKey("inventory-seed-version"),
  seedVersion: "18",
  seed: initialInventoryItems,
});

export const readStoredProducts = (): ProductFull[] => productStore.read();
export const saveStoredProducts = (products: ProductFull[]) => productStore.save(products);
export const readStoredInventory = (): InventoryItem[] => inventoryStore.read();
export const saveStoredInventory = (items: InventoryItem[]) => inventoryStore.save(items);

export function createStoredProduct(values: ProductFormValues) {
  const products = readStoredProducts();
  const inventory = readStoredInventory();
  const id = `mock_prod_${Date.now()}`;

  const brand = values.brand || "Aetheria";
  const category = values.category || "Skincare";
  const sku = values.sku || `MOCK-${Date.now()}`;
  const stock = values.stock ?? 0;

  const newProduct: ProductFull = {
    id,
    name: values.name,
    brand,
    category,
    sku,
    price: values.price,
    stock,
    unitsSold: 0,
    revenue: 0,
    gradient: ["from-accent", "to-brand-accent-hover"],
    image: values.thumbnail || undefined,
    status: values.status as ProductFull["status"],
    stockStatus: resolveStockStatus(stock),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: 0,
    description: values.description,
    shortDescription: values.shortDescription,
    images: values.images,
    contentBlocks: values.contentBlocks,
    weight: values.weight,
    collections: values.collections,
  };

  const newInventoryItem: InventoryItem = {
    id: `inv-${id}`,
    productId: id,
    name: values.name,
    sku,
    brand,
    stock,
    incoming: 0,
    threshold: 10,
    location: "Aisle A, Shelf 1-1",
    stockStatus: resolveStockStatus(stock),
    price: values.price,
    image: values.thumbnail || undefined,
    updatedAt: new Date().toISOString(),
  };

  saveStoredProducts([newProduct, ...products]);
  saveStoredInventory([newInventoryItem, ...inventory]);

  return newProduct;
}

export function updateStoredProduct(id: string, values: ProductFormValues) {
  const products = readStoredProducts();
  const inventory = readStoredInventory();

  const targetIdx = products.findIndex((p) => p.id === id);
  if (targetIdx === -1) return null;

  const target = products[targetIdx];
  const brand = values.brand || target.brand;
  const category = values.category || target.category;
  const sku = values.sku || target.sku;
  const stock = values.stock ?? target.stock;

  const updatedProduct: ProductFull = {
    ...target,
    name: values.name,
    brand,
    category,
    sku,
    price: values.price,
    stock,
    image: values.thumbnail || target.image,
    status: values.status as ProductFull["status"],
    stockStatus: resolveStockStatus(stock),
    updatedAt: new Date().toISOString(),
    description: values.description,
    shortDescription: values.shortDescription,
    images: values.images,
    contentBlocks: values.contentBlocks,
    weight: values.weight,
    collections: values.collections,
  };

  const updatedInventory = inventory.map((item): InventoryItem => {
    if (item.productId === id) {
      return {
        ...item,
        name: values.name,
        sku,
        brand,
        stock,
        price: values.price,
        image: values.thumbnail || item.image,
        stockStatus: resolveStockStatus(stock),
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  products[targetIdx] = updatedProduct;
  saveStoredProducts(products);
  saveStoredInventory(updatedInventory);

  return updatedProduct;
}

export function deleteStoredProduct(id: string) {
  const products = readStoredProducts().filter((product) => product.id !== id);
  const inventory = readStoredInventory().filter((item) => item.productId !== id);

  saveStoredProducts(products);
  saveStoredInventory(inventory);

  return products;
}

export function deleteStoredProducts(ids: string[]) {
  const idSet = new Set(ids);
  const products = readStoredProducts().filter((product) => !idSet.has(product.id));
  const inventory = readStoredInventory().filter((item) => !idSet.has(item.productId));

  saveStoredProducts(products);
  saveStoredInventory(inventory);

  return products;
}

export function archiveStoredProduct(id: string) {
  const products = readStoredProducts();
  const targetIdx = products.findIndex((product) => product.id === id);
  if (targetIdx === -1) return null;

  const target = products[targetIdx];
  if (target.status === "Archived") return target;

  const updatedProduct: ProductFull = {
    ...target,
    status: "Archived",
    updatedAt: new Date().toISOString(),
  };

  products[targetIdx] = updatedProduct;
  saveStoredProducts(products);
  return updatedProduct;
}

export function archiveStoredProducts(ids: string[]) {
  const idSet = new Set(ids);
  const now = new Date().toISOString();
  const products = readStoredProducts().map((product) =>
    idSet.has(product.id) && product.status !== "Archived"
      ? { ...product, status: "Archived" as const, updatedAt: now }
      : product,
  );

  saveStoredProducts(products);
  return products;
}
