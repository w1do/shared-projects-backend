import type { ProductFull } from "@/lib/admin/mocks/types";
import { formatCurrency } from "@/lib/admin/products-helpers";
import { renderHtmlToPdf } from "@/lib/admin/pdf/load-html2pdf";
import { generateProductRevenueChartSvg } from "./chart";
import { generateReportHtml } from "./template";
import { semanticColors } from "@/lib/theme-colors";
import { siteConfig } from "@/lib/site-config";

export async function exportProductsToPDF(products: ProductFull[]) {
  if (!products || products.length === 0) return;

  const totalProducts = products.length;
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const averagePrice = products.reduce((sum, p) => sum + p.price, 0) / totalProducts;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);

  const tableRows = products
    .map((product) => {
      const stockStatusClass =
        product.stockStatus === "In Stock"
          ? `color: ${semanticColors.success}; background-color: ${semanticColors.successBg}; border: 1px solid ${semanticColors.successBg};`
          : product.stockStatus === "Low Stock"
            ? `color: ${semanticColors.warningDark}; background-color: ${semanticColors.accent}; border: 1px solid ${semanticColors.warning};`
            : `color: ${semanticColors.destructive}; background-color: ${semanticColors.accent}; border: 1px solid ${semanticColors.destructive};`;

      return `
      <tr>
        <td class="col-sku">${product.sku}</td>
        <td class="col-name" style="font-weight: 600; color: ${semanticColors.foreground};">${product.name}</td>
        <td class="col-brand" style="color: ${semanticColors.mutedForeground};">${product.brand}</td>
        <td class="col-category" style="color: ${semanticColors.mutedForeground};">${product.category}</td>
        <td class="col-stock">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; ${stockStatusClass}">
            ${product.stockStatus}
          </span>
          <div style="font-size: 9px; color: ${semanticColors.mutedForeground}; margin-top: 2px;">${product.stock} units</div>
        </td>
        <td class="col-price" style="font-weight: 600; color: ${semanticColors.foreground};">${formatCurrency(product.price)}</td>
        <td class="col-revenue" style="font-weight: 600; color: ${semanticColors.foreground};">${formatCurrency(product.revenue)}</td>
      </tr>
    `;
    })
    .join("");

  const revenueChartSvg = generateProductRevenueChartSvg(products);

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const htmlContent = generateReportHtml({
    totalProducts,
    totalRevenueStr: formatCurrency(totalRevenue),
    averagePriceStr: formatCurrency(averagePrice),
    totalStockUnits,
    revenueChartSvg,
    tableRows,
    currentYear: new Date().getFullYear(),
    dateStr,
  });

  try {
    await renderHtmlToPdf(
      htmlContent,
      `${siteConfig.pdf.filenamePrefix}_Products_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  } catch (error) {
    console.error("Failed to load PDF library or render products report:", error);
  }
}
