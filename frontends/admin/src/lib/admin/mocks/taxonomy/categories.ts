import type { Category } from "../types";
import { initialCategories } from "./categories-data";
import { readStoredCategories } from "@/lib/admin/categories/store";

export const mockCategories: Category[] = initialCategories;

if (typeof window !== "undefined") {
  const stored = [...readStoredCategories()];
  mockCategories.length = 0;
  mockCategories.push(...stored);
}
