import { categoryPdfReportStyles } from "./styles";
import { semanticColors } from "@/lib/theme-colors";
import { siteConfig } from "@/lib/site-config";

export interface CategoryReportParams {
  totalCategories: number;
  rootCategories: number;
  treeDepth: number;
  topCategoryName: string;
  topCategorySubtreeStr: string;
  tableRows: string;
  currentYear: number;
  dateStr: string;
}

/**
 * Отчёт строится только на данных, которыми платформа реально располагает:
 * структура дерева категорий. Долларовых показателей (выручка, рост) в отчёте нет.
 */
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
            <p class="report-subtitle">Catalog Structure Overview</p>
          </div>
        </header>

        <div class="metadata-bar">
          <div><strong>Report Type:</strong> Taxonomy Overview</div>
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
              <div class="stat-label">Root Categories</div>
              <div class="stat-value font-serif">${params.rootCategories}</div>
            </div>
            <div class="stat-desc">Top-level tree branches</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Tree Depth</div>
              <div class="stat-value font-serif">${params.treeDepth}</div>
            </div>
            <div class="stat-desc">Nesting levels</div>
          </div>
          <div class="stat-card featured">
            <div>
              <div class="stat-label">Top Category</div>
              <div class="stat-value font-serif">${params.topCategoryName}</div>
            </div>
            <div class="stat-desc">${params.topCategorySubtreeStr}</div>
          </div>
        </section>

        <h2 class="section-title">Category Directory Details</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-rank" style="text-align: center;">#</th>
              <th class="col-name">Category</th>
              <th class="col-status" style="text-align: center;">Status</th>
              <th class="col-children" style="text-align: center;">Subcategories</th>
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
