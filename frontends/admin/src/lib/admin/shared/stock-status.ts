/** Single source of truth for mock/local stock status thresholds. */
export const LOW_STOCK_THRESHOLD = 20;

export type StockStatusLabel = "In Stock" | "Low Stock" | "Out of Stock";

/**
 * Resolve display stock status from an absolute stock quantity.
 * Threshold: stock <= 0 → Out of Stock; stock < LOW_STOCK_THRESHOLD → Low Stock; else In Stock.
 * API mappers that receive server-side status/threshold should keep using API values instead.
 */
export function resolveStockStatus(stock: number): StockStatusLabel {
  if (stock <= 0) return "Out of Stock";
  if (stock < LOW_STOCK_THRESHOLD) return "Low Stock";
  return "In Stock";
}
