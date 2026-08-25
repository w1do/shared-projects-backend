import type { Collection } from "../types";
import { initialCollections } from "./collections-data";
import { readStoredCollections } from "@/lib/admin/collections/store";

export const mockCollections: Collection[] = initialCollections;

if (typeof window !== "undefined") {
  const stored = [...readStoredCollections()];
  mockCollections.length = 0;
  mockCollections.push(...stored);
}
