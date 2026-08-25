import { pdfReportStyles } from "./styles";
import { semanticColors } from "@/lib/theme-colors";
import { siteConfig } from "@/lib/site-config";

interface ReportParams {
  totalBrands: number;
  totalRevenueStr: string;
  averageRevenueStr: string;
  leaderBrandName: string;
  leaderBrandShare: number;
  marketShareChartSvg: string;
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
      <title>Brands Performance Report · ${siteConfig.brand.name}</title>
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
            <h1 class="report-title font-serif">Brands Portfolio Report</h1>
            <p class="report-subtitle">Executive Performance Analysis</p>
          </div>
        </header>

        <!-- Metadata Bar -->
        <div class="metadata-bar">
          <div><strong>Report Type:</strong> Financial & Market Share Overview</div>
          <div><strong>Generated:</strong> ${params.dateStr}</div>
        </div>

        <!-- Stats Flexbox Grid -->
        <section class="stats-flex">
          <div class="stat-card">
            <div>
              <div class="stat-label">Cosmetic Houses</div>
              <div class="stat-value font-serif">${params.totalBrands}</div>
            </div>
            <div class="stat-desc">Total portfolio brands</div>
          </div>
          <div class="stat-card featured">
            <div>
              <div class="stat-label">Combined Revenue</div>
              <div class="stat-value font-serif">${params.totalRevenueStr}</div>
            </div>
            <div class="stat-desc">Total annual revenue</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Average Revenue</div>
              <div class="stat-value font-serif">${params.averageRevenueStr}</div>
            </div>
            <div class="stat-desc">Mean brand productivity</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Market Leader</div>
              <div class="stat-value font-serif">${params.leaderBrandName}</div>
            </div>
            <div class="stat-desc">${params.leaderBrandShare}% market share</div>
          </div>
        </section>

        <!-- Visual Chart Section -->
        <h2 class="section-title">Market Share Distribution</h2>
        <section class="visual-section">
          ${params.marketShareChartSvg}
        </section>

        <!-- Data Directory Section -->
        <h2 class="section-title">Brands Directory Details</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-rank" style="text-align: center;">Rank</th>
              <th class="col-name">Brand Name</th>
              <th class="col-origin">Maison Origin</th>
              <th class="col-status" style="text-align: center;">Status</th>
              <th class="col-share" style="text-align: right;">Market Share</th>
              <th class="col-revenue" style="text-align: right;">Annual Revenue</th>
              <th class="col-trend" style="text-align: center;">Growth Trend</th>
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
