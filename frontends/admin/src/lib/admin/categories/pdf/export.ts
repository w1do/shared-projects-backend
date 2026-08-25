import type { Category } from "@/lib/admin/mocks/types";
import { formatCurrency } from "@/lib/utils";
import { renderHtmlToPdf } from "@/lib/admin/pdf/load-html2pdf";
import { generateCategoryRevenueChartSvg, generateCategorySwatchSvg } from "./chart";
import { generateCategoryReportHtml } from "./template";
import { semanticColors } from "@/lib/theme-colors";
import { siteConfig } from "@/lib/site-config";

const statusStyles: Record<Category["status"], string> = {
  Active: `color: ${semanticColors.success}; background-color: ${semanticColors.successBg}; border: 1px solid ${semanticColors.successBg};`,
  Draft: `color: ${semanticColors.warningDark}; background-color: ${semanticColors.accent}; border: 1px solid ${semanticColors.warning};`,
  Archived: `color: ${semanticColors.mutedForeground}; background-color: ${semanticColors.muted}; border: 1px solid ${semanticColors.border};`,
};

function sortByDefaultOrder(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
}

function formatGrowth(value: number): string {
  const color =
    value > 0
      ? semanticColors.success
      : value < 0
        ? semanticColors.destructive
        : semanticColors.mutedForeground;
  const sign = value > 0 ? "+" : "";
  return `<span style="font-weight: 600; color: ${color};">${sign}${value}%</span>`;
}

function buildTableRows(categories: Category[]): string {
  return sortByDefaultOrder(categories)
    .map((category, index) => {
      return `
      <tr>
        <td class="col-rank" style="font-weight: 500; color: ${semanticColors.mutedForeground};">${index + 1}</td>
        <td class="col-name">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${generateCategorySwatchSvg(category.coverGradient)}
            <div style="min-width: 0;">
              <div style="font-weight: 600; color: ${semanticColors.foreground};">${category.name}</div>
              <div class="cat-slug">/${category.slug}</div>
            </div>
          </div>
        </td>
        <td class="col-status">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; ${statusStyles[category.status]}">
            ${category.status}
          </span>
        </td>
        <td class="col-products" style="font-weight: 500; color: ${semanticColors.foreground};">${category.productCount}</td>
        <td class="col-revenue" style="font-weight: 600; color: ${semanticColors.foreground};">${formatCurrency(category.revenue)}</td>
        <td class="col-growth">${formatGrowth(category.growthYoY)}</td>
      </tr>
    `;
    })
    .join("");
}

export async function exportCategoriesToPDF(categories: Category[]) {
  if (!categories || categories.length === 0) return;

  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0);
  const totalRevenue = categories.reduce((sum, category) => sum + category.revenue, 0);

  const topCategory =
    [...categories].sort((a, b) => b.revenue - a.revenue)[0] ??
    ({ name: "N/A", revenue: 0 } as Category);

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const htmlContent = generateCategoryReportHtml({
    totalCategories: categories.length,
    totalProductsStr: `${totalProducts} Items`,
    totalRevenueStr: formatCurrency(totalRevenue),
    topCategoryName: topCategory.name,
    topCategoryRevenueStr: formatCurrency(topCategory.revenue),
    revenueChartSvg: generateCategoryRevenueChartSvg(categories),
    tableRows: buildTableRows(categories),
    currentYear: new Date().getFullYear(),
    dateStr,
  });

  try {
    await renderHtmlToPdf(
      htmlContent,
      `${siteConfig.pdf.filenamePrefix}_Categories_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  } catch (error) {
    console.error("Failed to load PDF library or render categories report:", error);
  }
}
