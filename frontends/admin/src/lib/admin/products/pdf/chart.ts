import { formatCurrency } from "@/lib/admin/products-helpers";
import type { ProductFull } from "@/lib/admin/mocks/types";
import { semanticColors } from "@/lib/theme-colors";

export function generateProductRevenueChartSvg(products: ProductFull[]): string {
  const topProducts = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const chartHeight = topProducts.length * 35 + 20;
  const chartWidth = 600;
  const barMaxVal = Math.max(...topProducts.map((p) => p.revenue), 1);

  const chartRowsSvg = topProducts
    .map((product, index) => {
      const y = index * 35 + 10;
      const barWidth = (product.revenue / barMaxVal) * 320;
      const displayName =
        product.name.length > 22 ? `${product.name.substring(0, 22)}...` : product.name;
      return `
      <g transform="translate(0, ${y})">
        <text x="10" y="18" font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="${semanticColors.foreground}">${displayName}</text>
        <rect x="150" y="6" width="320" height="14" rx="3" fill="${semanticColors.inputDisabled}" />
        <rect x="150" y="6" width="${barWidth}" height="14" rx="3" fill="${index === 0 ? semanticColors.brandAccent : semanticColors.mutedForeground}" />
        <text x="485" y="17" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="${semanticColors.foreground}">${formatCurrency(product.revenue)}</text>
        <text x="545" y="17" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="${semanticColors.mutedForeground}" text-anchor="start">${product.unitsSold} sold</text>
      </g>
    `;
    })
    .join("");

  return `
    <svg width="100%" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" style="display: block; margin: 10px 0;">
      <line x1="150" y1="5" x2="150" y2="${chartHeight - 10}" stroke="${semanticColors.border}" stroke-width="1" stroke-dasharray="2,2" />
      <line x1="310" y1="5" x2="310" y2="${chartHeight - 10}" stroke="${semanticColors.border}" stroke-width="1" stroke-dasharray="2,2" />
      <line x1="470" y1="5" x2="470" y2="${chartHeight - 10}" stroke="${semanticColors.border}" stroke-width="1" stroke-dasharray="2,2" />
      ${chartRowsSvg}
    </svg>
  `;
}
