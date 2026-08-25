/** Shared admin number/currency formatters (USD, no decimals) used across all admin tables, cards, and stats. */

export function formatAdminNumber(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US").format(safeValue);
}
