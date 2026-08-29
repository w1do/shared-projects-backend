import type { Category } from "@/lib/admin/types/catalog";
import { renderHtmlToPdf } from "@/lib/admin/pdf/load-html2pdf";
import { countChildren } from "@/lib/admin/data-source/category-tree";
import { generateCategorySwatchSvg } from "./chart";
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

function buildTableRows(categories: Category[], childCounts: Map<string, number>): string {
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
        <td class="col-children" style="font-weight: 500; color: ${semanticColors.foreground};">${childCounts.get(category.id) ?? 0}</td>
      </tr>
    `;
    })
    .join("");
}

/**
 * PDF-отчёт по категориям: только структура дерева (реальные данные платформы),
 * без долларовых показателей демо-шаблона.
 */
export async function exportCategoriesToPDF(categories: Category[]) {
  if (!categories || categories.length === 0) return;

  const childCounts = countChildren(
    categories.map((category) => ({ id: category.id, parentId: category.parentId ?? null })),
  );
  const rootCategories = categories.filter((category) => !category.parentId).length;
  const treeDepth = categories.reduce((max, category) => Math.max(max, (category.depth ?? 0) + 1), 1);

  const topCategory =
    [...categories].sort(
      (a, b) => (childCounts.get(b.id) ?? 0) - (childCounts.get(a.id) ?? 0),
    )[0] ?? ({ id: "", name: "N/A" } as Category);
  const topSubcount = childCounts.get(topCategory.id) ?? 0;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const htmlContent = generateCategoryReportHtml({
    totalCategories: categories.length,
    rootCategories,
    treeDepth,
    topCategoryName: topCategory.name,
    topCategorySubtreeStr: `${topSubcount} direct subcategories`,
    tableRows: buildTableRows(categories, childCounts),
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
