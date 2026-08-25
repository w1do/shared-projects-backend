import { formatCurrency } from "@/lib/utils";
import type { Brand } from "@/lib/admin/mocks/types";
import { semanticColors } from "@/lib/theme-colors";

export function generateSparklineSvg(trend: number[]): string {
  if (!trend || trend.length === 0) return "";
  const width = 80;
  const height = 20;
  const padding = 2;
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const range = max - min || 1;
  const points = trend
    .map((val, index) => {
      const x = padding + (index / (trend.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible; display: block;">
      <polyline fill="none" stroke="${semanticColors.brandAccent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
    </svg>
  `;
}

export function generateMarketShareChartSvg(brands: Brand[]): string {
  const topBrandsForChart = [...brands].sort((a, b) => b.share - a.share).slice(0, 6);

  const chartHeight = topBrandsForChart.length * 35 + 20;
  const chartWidth = 600;
  const barMaxVal = Math.max(...topBrandsForChart.map((b) => b.share), 1);

  const chartRowsSvg = topBrandsForChart
    .map((brand, index) => {
      const y = index * 35 + 10;
      const barWidth = (brand.share / barMaxVal) * 320;
      return `
      <g transform="translate(0, ${y})">
        <text x="10" y="18" font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="${semanticColors.foreground}">${brand.name}</text>
        <rect x="150" y="6" width="320" height="14" rx="3" fill="${semanticColors.inputDisabled}" />
        <rect x="150" y="6" width="${barWidth}" height="14" rx="3" fill="${index === 0 ? semanticColors.brandAccent : semanticColors.mutedForeground}" />
        <text x="485" y="17" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="${semanticColors.foreground}">${brand.share}%</text>
        <text x="530" y="17" font-family="'Inter', sans-serif" font-size="11" font-weight="400" fill="${semanticColors.mutedForeground}" text-anchor="start">${formatCurrency(brand.revenue)}</text>
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
