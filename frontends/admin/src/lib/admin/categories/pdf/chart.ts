import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/lib/admin/mocks/types";
import { semanticColors } from "@/lib/theme-colors";

const inkColor = semanticColors.foreground;
const terracottaColor = semanticColors.brandAccent;
const neutralColor = semanticColors.mutedForeground;
const mutedColor = semanticColors.mutedForeground;
const trackColor = semanticColors.inputDisabled;

/**
 * Horizontal bar chart of revenue distribution across the top root categories.
 * Visual language mirrors the brands market-share chart for report consistency.
 */
export function generateCategoryRevenueChartSvg(rootCategories: Category[]): string {
  const ranked = [...rootCategories].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  if (ranked.length === 0) return "";

  const totalRevenue = ranked.reduce((sum, category) => sum + category.revenue, 0) || 1;
  const maxRevenue = Math.max(...ranked.map((category) => category.revenue), 1);

  const chartWidth = 600;
  const rowHeight = 35;
  const chartHeight = ranked.length * rowHeight + 20;

  const rowsSvg = ranked
    .map((category, index) => {
      const y = index * rowHeight + 10;
      const barWidth = (category.revenue / maxRevenue) * 320;
      const sharePct = ((category.revenue / totalRevenue) * 100).toFixed(1);
      const barColor = index === 0 ? terracottaColor : neutralColor;

      return `
      <g transform="translate(0, ${y})">
        <text x="10" y="18" font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="${inkColor}">${category.name}</text>
        <rect x="150" y="6" width="320" height="14" rx="3" fill="${trackColor}" />
        <rect x="150" y="6" width="${barWidth}" height="14" rx="3" fill="${barColor}" />
        <text x="485" y="17" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="${inkColor}">${sharePct}%</text>
        <text x="530" y="17" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="${mutedColor}" text-anchor="start">${formatCurrency(category.revenue)}</text>
      </g>
    `;
    })
    .join("");

  return `
    <svg width="100%" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" style="display: block; margin: 10px 0;">
      <line x1="150" y1="5" x2="150" y2="${chartHeight - 10}" stroke="${semanticColors.border}" stroke-width="1" stroke-dasharray="2,2" />
      <line x1="310" y1="5" x2="310" y2="${chartHeight - 10}" stroke="${semanticColors.border}" stroke-width="1" stroke-dasharray="2,2" />
      <line x1="470" y1="5" x2="470" y2="${chartHeight - 10}" stroke="${semanticColors.border}" stroke-width="1" stroke-dasharray="2,2" />
      ${rowsSvg}
    </svg>
  `;
}

/** Small rounded gradient swatch used as the category glyph in the report table. */
export function generateCategorySwatchSvg(coverGradient: [string, string]): string {
  const [start, end] = coverGradient;
  const gradientId = `swatch-${Math.random().toString(36).slice(2, 9)}`;

  return `
    <svg width="28" height="28" viewBox="0 0 28 28" style="display: block;">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="28" height="28" rx="7" fill="url(#${gradientId})" />
    </svg>
  `;
}
