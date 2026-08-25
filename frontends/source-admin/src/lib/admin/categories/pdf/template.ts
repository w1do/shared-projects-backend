import { categoryPdfReportStyles } from "./styles";
import { semanticColors } from "@/lib/theme-colors";
import { siteConfig } from "@/lib/site-config";

export interface CategoryReportParams {
  totalCategories: number;
  totalProductsStr: string;
  totalRevenueStr: string;
  topCategoryName: string;
  topCategoryRevenueStr: string;
  revenueChartSvg: string;
  tableRows: string;
  currentYear: number;
  dateStr: string;
}

export function generateCategoryReportHtml(params: CategoryReportParams): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Categories Taxonomy Report · ${siteConfig.brand.name}</title>
    </head>
    <body>
      <style>
        ${categoryPdfReportStyles}
      </style>
      <div class="ae-pdf-report container">
        <header class="report-header">
          <div class="header-left">
            <div class="brand-logo font-serif">ÆTHERIA</div>
            <div style="font-size: 8.5px; color: ${semanticColors.mutedForeground}; letter-spacing: 0.5px; text-transform: uppercase;">Cosmetics Admin Platform</div>
          </div>
          <div class="header-right">
            <h1 class="report-title font-serif">Categories Taxonomy Report</h1>
            <p class="report-subtitle">Catalog Structure &amp; Revenue Analysis</p>
          </div>
        </header>

        <div class="metadata-bar">
          <div><strong>Report Type:</strong> Taxonomy &amp; Category Revenue Overview</div>
          <div><strong>Generated:</strong> ${params.dateStr}</div>
        </div>

        <section class="stats-flex">
          <div class="stat-card">
            <div>
              <div class="stat-label">Categories</div>
              <div class="stat-value font-serif">${params.totalCategories}</div>
            </div>
            <div class="stat-desc">Active taxonomy nodes</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Catalog Coverage</div>
              <div class="stat-value font-serif">${params.totalProductsStr}</div>
            </div>
            <div class="stat-desc">Products across categories</div>
          </div>
          <div class="stat-card featured">
            <div>
              <div class="stat-label">Combined Revenue</div>
              <div class="stat-value font-serif">${params.totalRevenueStr}</div>
            </div>
            <div class="stat-desc">Total category revenue</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Top Category</div>
              <div class="stat-value font-serif">${params.topCategoryName}</div>
            </div>
            <div class="stat-desc">${params.topCategoryRevenueStr} generated</div>
          </div>
        </section>

        <h2 class="section-title">Revenue Distribution by Root Category</h2>
        <section class="visual-section">
          ${params.revenueChartSvg}
        </section>

        <h2 class="section-title">Category Directory Details</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-rank" style="text-align: center;">#</th>
              <th class="col-name">Category</th>
              <th class="col-status" style="text-align: center;">Status</th>
              <th class="col-products" style="text-align: center;">Products</th>
              <th class="col-revenue" style="text-align: right;">Revenue</th>
              <th class="col-growth" style="text-align: right;">Growth YoY</th>
            </tr>
          </thead>
          <tbody>
            ${params.tableRows}
          </tbody>
        </table>

        <footer class="report-footer">
          <div>&copy; ${params.currentYear} ${siteConfig.pdf.orgFooter}. All rights reserved.</div>
          <div style="font-weight: 500;">CONFIDENTIAL &amp; PROPRIETARY</div>
        </footer>
      </div>
    </body>
    </html>
  `;
}
