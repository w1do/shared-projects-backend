import type { Brand } from "@/lib/admin/mocks/types";
import { formatCurrency } from "@/lib/utils";
import { findStoredBrandDetails } from "@/lib/admin/brands/store";
import { brandDetailsBySlug } from "@/lib/admin/mocks/brands";
import { renderHtmlToPdf } from "@/lib/admin/pdf/load-html2pdf";
import { generateSparklineSvg, generateMarketShareChartSvg } from "./chart";
import { generateReportHtml } from "./template";
import { semanticColors } from "@/lib/theme-colors";
import { siteConfig } from "@/lib/site-config";

export async function exportBrandsToPDF(brands: Brand[]) {
  if (!brands || brands.length === 0) return;

  const totalBrands = brands.length;
  const totalRevenue = brands.reduce((sum, b) => sum + b.revenue, 0);
  const averageRevenue = totalRevenue / totalBrands;

  const sortedByShare = [...brands].sort((a, b) => b.share - a.share);
  const leaderBrand = sortedByShare[0] || { name: "N/A", share: 0 };

  const processedBrands = brands.map((brand) => {
    const key = brand.id.toLowerCase();
    const details = findStoredBrandDetails(brand.id) ?? brandDetailsBySlug[key] ?? {};
    return {
      ...brand,
      origin: details.origin || "Unknown Origin",
      status: details.status || "Active",
    };
  });

  const tableRows = processedBrands
    .map((brand, idx) => {
      const statusClass =
        brand.status === "Active"
          ? `color: ${semanticColors.success}; background-color: ${semanticColors.successBg}; border: 1px solid ${semanticColors.successBg};`
          : brand.status === "Draft"
            ? `color: ${semanticColors.warningDark}; background-color: ${semanticColors.accent}; border: 1px solid ${semanticColors.warning};`
            : `color: ${semanticColors.mutedForeground}; background-color: ${semanticColors.muted}; border: 1px solid ${semanticColors.border};`;

      return `
      <tr>
        <td class="col-rank" style="font-weight: 500; color: ${semanticColors.mutedForeground};">${idx + 1}</td>
        <td class="col-name">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; background-color: ${semanticColors.inputDisabled}; border: 1px solid ${semanticColors.border}; font-family: 'Fraunces', serif; font-weight: 600; font-size: 11px; color: ${semanticColors.brandAccent};">
              ${brand.monogram}
            </div>
            <span style="font-weight: 600; color: ${semanticColors.foreground};">${brand.name}</span>
          </div>
        </td>
        <td class="col-origin" style="color: ${semanticColors.mutedForeground};">${brand.origin}</td>
        <td class="col-status">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; ${statusClass}">
            ${brand.status}
          </span>
        </td>
        <td class="col-share" style="font-weight: 600; color: ${semanticColors.foreground};">${brand.share}%</td>
        <td class="col-revenue" style="font-weight: 600; color: ${semanticColors.foreground};">${formatCurrency(brand.revenue)}</td>
        <td class="col-trend">
          <div style="display: flex; justify-content: center; align-items: center;">
            ${generateSparklineSvg(brand.trend)}
          </div>
        </td>
      </tr>
    `;
    })
    .join("");

  const marketShareChartSvg = generateMarketShareChartSvg(processedBrands);

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const htmlContent = generateReportHtml({
    totalBrands,
    totalRevenueStr: formatCurrency(totalRevenue),
    averageRevenueStr: formatCurrency(averageRevenue),
    leaderBrandName: leaderBrand.name,
    leaderBrandShare: leaderBrand.share,
    marketShareChartSvg,
    tableRows,
    currentYear: new Date().getFullYear(),
    dateStr,
  });

  try {
    await renderHtmlToPdf(
      htmlContent,
      `${siteConfig.pdf.filenamePrefix}_Brands_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  } catch (error) {
    console.error("Failed to load PDF library or render brands report:", error);
  }
}
