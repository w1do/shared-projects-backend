import { initialInventoryItems } from "../products/initial";
import { readStoredInventory, saveStoredInventory } from "../products/store";

export const mockInventoryItems = initialInventoryItems;

if (typeof window !== "undefined") {
  const stored = [...readStoredInventory()];
  mockInventoryItems.length = 0;
  mockInventoryItems.push(...stored);
}

export { readStoredInventory, saveStoredInventory };
export type { InventoryItem } from "./types";
