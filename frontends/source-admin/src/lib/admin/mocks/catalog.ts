import { initialProductsCatalog } from "../products/initial";
import {
  readStoredProducts,
  saveStoredProducts,
  createStoredProduct,
  updateStoredProduct,
} from "../products/store";

export const productsCatalog = initialProductsCatalog;

if (typeof window !== "undefined") {
  const stored = [...readStoredProducts()];
  productsCatalog.length = 0;
  productsCatalog.push(...stored);
}

export { readStoredProducts, saveStoredProducts, createStoredProduct, updateStoredProduct };
export type { ProductFull } from "./types";
