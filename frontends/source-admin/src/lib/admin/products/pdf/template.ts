import { pdfReportStyles } from "./styles";
import { semanticColors } from "@/lib/theme-colors";
import { siteConfig } from "@/lib/site-config";

interface ReportParams {
  totalProducts: number;
  totalRevenueStr: string;
  averagePriceStr: string;
  totalStockUnits: number;
  revenueChartSvg: string;
  tableRows: string;
  currentYear: number;
  dateStr: string;
}

export function generateReportHtml(params: ReportParams): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Products Catalog Report · ${siteConfig.brand.name}</title>
    </head>
    <body>
      <style>
        ${pdfReportStyles}
      </style>
      <div class="ae-pdf-report container">
        <!-- Header -->
        <header class="report-header">
          <div class="header-left">
            <div class="brand-logo font-serif">ÆTHERIA</div>
            <div style="font-size: 8.5px; color: ${semanticColors.mutedForeground}; letter-spacing: 0.5px; text-transform: uppercase;">Cosmetics Admin Platform</div>
          </div>
          <div class="header-right">
            <h1 class="report-title font-serif">Products Catalog Report</h1>
            <p class="report-subtitle">Product Performance & Catalog Audit</p>
          </div>
        </header>

        <!-- Metadata Bar -->
        <div class="metadata-bar">
          <div><strong>Report Type:</strong> Catalog Performance & Stock Status</div>
          <div><strong>Generated:</strong> ${params.dateStr}</div>
        </div>

        <!-- Stats Flexbox Grid -->
        <section class="stats-flex">
          <div class="stat-card">
            <div>
              <div class="stat-label">Total SKUs</div>
              <div class="stat-value font-serif">${params.totalProducts}</div>
            </div>
            <div class="stat-desc">Active items in catalog</div>
          </div>
          <div class="stat-card featured">
            <div>
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value font-serif">${params.totalRevenueStr}</div>
            </div>
            <div class="stat-desc">From units sold</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Average Price</div>
              <div class="stat-value font-serif">${params.averagePriceStr}</div>
            </div>
            <div class="stat-desc">Mean listing price</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Stock Units</div>
              <div class="stat-value font-serif">${params.totalStockUnits}</div>
            </div>
            <div class="stat-desc">On-hand warehouse stock</div>
          </div>
        </section>

        <!-- Visual Chart Section -->
        <h2 class="section-title">Top Products by Revenue</h2>
        <section class="visual-section">
          ${params.revenueChartSvg}
        </section>

        <!-- Data Directory Section -->
        <h2 class="section-title">Products Directory</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-sku">SKU</th>
              <th class="col-name">Product Name</th>
              <th class="col-brand">Brand</th>
              <th class="col-category">Category</th>
              <th class="col-stock" style="text-align: center;">Stock Status</th>
              <th class="col-price" style="text-align: right;">Price</th>
              <th class="col-revenue" style="text-align: right;">Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${params.tableRows}
          </tbody>
        </table>

        <!-- Footer -->
        <footer class="report-footer">
          <div>&copy; ${params.currentYear} ${siteConfig.pdf.orgFooter}. All rights reserved.</div>
          <div style="font-weight: 500;">CONFIDENTIAL &amp; PROPRIETARY</div>
        </footer>
      </div>
    </body>
    </html>
  `;
}
